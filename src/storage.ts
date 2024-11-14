import {Website} from "./website";

const enableKey = (website: Website) => `${website}Enabled`;
const allowedUntilKey = (website: Website) => `${website}AllowedUntil`;

export const storeDesiredUrl = (url: string) =>
    chrome.storage.local.set({desiredUrl: url});

export const retrieveDesiredUrl = async (): Promise<string> =>
    chrome.storage.local.get("desiredUrl").then(data => data["desiredUrl"]);

export const storeWebsiteUnblockedUntil = (website: Website, enabledUntilTimeInMilliseconds: number) => {
    return chrome.storage.local.set({
        [enableKey(website)]: true,
        [allowedUntilKey(website)]: enabledUntilTimeInMilliseconds
    });
};

export const storeWebsiteBlocked = (website: Website) => {
    return chrome.storage.local.set({
        [enableKey(website)]: false,
        [allowedUntilKey(website)]: false
    });
};

export type BlockingStatus = { blocked: true } | { blocked:false, allowedUntil: number };
export const retrieveWebsiteBlockedStatus = async (website: Website): Promise<BlockingStatus> => {
    return chrome.storage.local.get([enableKey(website), allowedUntilKey(website)])
        .then(data => {
            const enabled: boolean = data[enableKey(website)];
            if (!enabled) {
                return {blocked: true};
            }
            return {blocked: false, allowedUntil: data[allowedUntilKey(website)]};
        });
};