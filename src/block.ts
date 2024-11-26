import {Website} from "./website";
import {matches, produce} from "./helpers";
import RuleActionType = chrome.declarativeNetRequest.RuleActionType;
import ResourceType = chrome.declarativeNetRequest.ResourceType;
import Rule = chrome.declarativeNetRequest.Rule;

export const blockWebsite = async (website: Website): Promise<Website> => {
    return removeDuplicateRulesFor(website.ruleId)
        .then(() =>
            chrome.declarativeNetRequest.updateDynamicRules({addRules: [timeLimitedBlockingRuleFor(website)]}))
        .then(produce(website));
};

export const unblockWebsite = async (website: Website): Promise<Website> => {
    return unblockWebsiteByRuleId(website.ruleId).then(produce(website));
};

const unblockWebsiteByRuleId = async (websiteRuleId: number): Promise<void> =>
    chrome.declarativeNetRequest.updateDynamicRules({removeRuleIds: [websiteRuleId]});

const timeLimitedBlockingRuleFor = (website: Website): Rule => {
    return {
        id: website.ruleId,
        action: {
            type: RuleActionType.REDIRECT,
            redirect: {
                "extensionPath": `/timeLimitedWebsite.html?website=${website.key}`
            }
        },
        condition: {
            regexFilter: `^${(website.url)}/?(.*)`,
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

const removeDuplicateRulesFor = async (websiteRuleId: number): Promise<void> => {
    return chrome.declarativeNetRequest.getDynamicRules().then(async currentRules => {
        const duplicatedRuleIds = currentRules.map(rule => rule.id).filter(matches(websiteRuleId));
        return Promise.all(duplicatedRuleIds.map(unblockWebsiteByRuleId)).then(produce(null));
    });
};