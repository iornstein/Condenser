import {Website, WebsiteWithBlocking} from "./website";
import {produce} from "./helpers";

export const storeWebsiteUnblockedUntil = (website: Website, enabledUntilTimeInMilliseconds: number) => {
    const blockedWebsite: WebsiteWithBlocking = {...website, blockingStatus: {
            blocked: false,
            allowedUntil: enabledUntilTimeInMilliseconds
        }};
    return chrome.storage.local.set({[website.key]: blockedWebsite});
};

export const storeWebsiteBlocked = (website: Website): Promise<Website> => {
    const blockedWebsite: WebsiteWithBlocking = {...website, blockingStatus: {blocked: true}}
    return chrome.storage.local.set({[website.key]: blockedWebsite}).then(produce(website));
};

export const retrieveWebsite = async (websiteKey: string): Promise<WebsiteWithBlocking> =>
    chrome.storage.local.get([websiteKey]).then(data => data[websiteKey]);