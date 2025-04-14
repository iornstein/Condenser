import {Website} from "./website";
import {produce} from "./helpers";
import RuleActionType = chrome.declarativeNetRequest.RuleActionType;
import ResourceType = chrome.declarativeNetRequest.ResourceType;
import Rule = chrome.declarativeNetRequest.Rule;

export const blockWebsite = async (website: Website): Promise<Website> => {
    return ruleIdsMatching(website.url)
        .then(removeRuleIds =>
            chrome.declarativeNetRequest.updateSessionRules({
                addRules: [blockingRuleFor(website)],
                removeRuleIds
            })
        ).then(produce(website),
            (error: Error) => {
                if (isDuplicatedIdError(error)) {
                    return blockWebsite(website); //try again, the id will increment again
                }
                throw error;
            }
        );
};

export const unblockWebsite = async (website: Website): Promise<Website> => {
    return unblockWebsiteByWebsiteUrl(website.url).then(produce(website));
};


const ruleIdsMatching = async (websiteUrl: string): Promise<number[]> => {
    return chrome.declarativeNetRequest.getSessionRules().then(rules =>
        rules.filter(rule => rule.condition.regexFilter === regexFilterFor(websiteUrl))
            .map(rule => rule.id));
}

const unblockWebsiteByWebsiteUrl = async (websiteUrl: string): Promise<void> =>
    chrome.declarativeNetRequest.getSessionRules().then(rules => {
        const ruleIdsToRemove = rules.filter(rule => rule.condition.regexFilter === regexFilterFor(websiteUrl))
            .map(rule => rule.id);
        return chrome.declarativeNetRequest.updateSessionRules({removeRuleIds: ruleIdsToRemove});
    })

const regexFilterFor = (websiteUrl: string) => `^(${websiteUrl})/?(.*)`

let counter = 1;
const nextRuleId = () => {
    return counter++;
}

const blockingRuleFor = (website: Website): Rule => {
    return {
        id: nextRuleId(),
        action: {
            type: RuleActionType.REDIRECT,
            redirect: {
                regexSubstitution: `chrome-extension://${chrome.runtime.id}/timeLimitedWebsite.html?website=${website.key}&targetUrl=\\0`,
            }
        },
        condition: {
            regexFilter: regexFilterFor(website.url),
            resourceTypes: [
                ResourceType.MAIN_FRAME,
                ResourceType.SUB_FRAME,
                ResourceType.MEDIA,
                ResourceType.OBJECT,
                ResourceType.PING,
                ResourceType.OTHER,
                ResourceType.XMLHTTPREQUEST,
                ResourceType.OTHER
            ]
        }
    };
};

const isDuplicatedIdError = (error: Error) => {
    return error.message.includes("unique ID");
};