import {ruleIdFor, urlToBlock, Website} from "./website";
import RuleActionType = chrome.declarativeNetRequest.RuleActionType;
import ResourceType = chrome.declarativeNetRequest.ResourceType;
import Rule = chrome.declarativeNetRequest.Rule;

export const blockWebsite = async (website: Website): Promise<Website> => {
    return chrome.declarativeNetRequest.updateDynamicRules({
        addRules: [timeLimitedBlockingRuleFor(website, ruleIdFor(website))]
    }).then(_ignored => website);
};

export const unblockWebsite = async (website: Website): Promise<Website> => {
    return chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [ruleIdFor(website)],
    }).then( _ignored => website);
};

const timeLimitedBlockingRuleFor = (website: Website, ruleId: number): Rule => {
    return {
        id: ruleId,
        action: {
            type: RuleActionType.REDIRECT,
            redirect: {
                "extensionPath": `/timeLimitedWebsite.html?website=${website}`
            }
        },
        condition: {
            regexFilter: `^https?://${urlToBlock(website)}/?(.*)`,
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
}