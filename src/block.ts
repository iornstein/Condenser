import {rulesetIdFor, Website} from "./website";

export const blockWebsite = async (website: Website): Promise<Website> => {
    return chrome.declarativeNetRequest.updateEnabledRulesets({enableRulesetIds: [rulesetIdFor(website)]})
        .then(_ignored => website);
}

export const unblockWebsite = async (website: Website): Promise<Website> => {
    return chrome.declarativeNetRequest.updateEnabledRulesets({disableRulesetIds: [rulesetIdFor(website)]})
        .then( _ignored => website);
}