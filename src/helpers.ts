import {rulesetIdFor, Website} from "./website";

const storeWebsiteIsEnabled = (website: Website, enabledUntilTimeInMilliseconds: number) => {
    return chrome.storage.local.set({
        [enableKey(website)]: true,
        [allowedUntilKey(website)]: enabledUntilTimeInMilliseconds
    });
};

const storeWebsiteIsDisabled = (website: Website) => {
    return chrome.storage.local.set({[enableKey(website)]: false, [allowedUntilKey(website)]: false});
};

export const retrieveDesiredUrl = async (): Promise<string> => {
    return chrome.storage.local.get("desiredUrl").then(data => data["desiredUrl"]);
};

export const storeDesiredUrl = (url: string) => {
    return chrome.storage.local.set({desiredUrl: url});
};

type EnableableWebsite = { enabled: false } | { enabled: true, allowedUntil: number };
const retrieveWebsiteIsEnabled = async (website: Website): Promise<EnableableWebsite> => {
    return chrome.storage.local.get([enableKey(website), allowedUntilKey(website)])
        .then(data => {
            const enabled: boolean = data[enableKey(website)];
            if (!enabled) {
                return {enabled: false};
            }
            return {enabled, allowedUntil: data[allowedUntilKey(website)]};
        });
}

const enableKey = (website: Website) => `${website}Enabled`;

const allowedUntilKey = (website: Website) => `${website}AllowedUntil`;

export const triggerEnabled = async (website: Website, enabledDurationInMilliseconds: number) => {
    return chrome.declarativeNetRequest.updateEnabledRulesets({disableRulesetIds: [rulesetIdFor(website)]})
        .then(() => storeWebsiteIsEnabled(website, new Date().getTime() + enabledDurationInMilliseconds));
};

export const triggerDisabled = async (website: Website) => {
    return chrome.declarativeNetRequest.updateEnabledRulesets({enableRulesetIds: [rulesetIdFor(website)]})
        .then(() => storeWebsiteIsDisabled(website));
};

export const when = (website: Website) => {
    return {
        shouldNoLongerBeEnabled: (block: (website: Website) => void) => {
            retrieveWebsiteIsEnabled(website).then((enableableWebsite: EnableableWebsite) => {
                if (enableableWebsite.enabled) {
                    const allowedUntil = enableableWebsite.allowedUntil;
                    if (!allowedUntil) {
                        throw new Error("woops! this shouldn't happen. Putting this error to debug later");
                    }
                    if (new Date(allowedUntil) <= new Date()) {
                        block(website);
                    }
                }
            });
        }
    }
};