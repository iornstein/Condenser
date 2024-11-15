import {Website} from "./website";

export const storeDesiredUrl = (url: string) =>
    chrome.storage.local.set({desiredUrl: url});

export const retrieveDesiredUrl = async (): Promise<string> =>
    chrome.storage.local.get("desiredUrl").then(data => data["desiredUrl"]);

export type BlockingStatus = { blocked: true } | { blocked:false, allowedUntil: number };

export const storeWebsiteUnblockedUntil = (website: Website, enabledUntilTimeInMilliseconds: number) => {
    const unblockedUntil: BlockingStatus = {blocked: false, allowedUntil: enabledUntilTimeInMilliseconds};
    return chrome.storage.local.set({[website]: unblockedUntil});
};

const blocked: BlockingStatus = {blocked: true};
export const storeWebsiteBlocked = (website: Website) => {
    return chrome.storage.local.set({[website]: blocked});
};

export const retrieveWebsiteBlockedStatus = async (website: Website): Promise<BlockingStatus> =>
    chrome.storage.local.get([website]).then(data => data[website]);