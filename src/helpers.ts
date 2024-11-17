import {Website, WebsiteWithBlocking} from "./website";
import {retrieveWebsite, storeWebsiteUnblockedUntil} from "./storage";

const millisecondsPerMinute = 1000*60;
export const storeTimeToBlockAgain = (enabledDurationInMinutes: number ) => {
    return (website: Website) => storeWebsiteUnblockedUntil(website, new Date().getTime() + enabledDurationInMinutes*millisecondsPerMinute);
};

export const when = (websiteKey: string) => {
    return {
        shouldNoLongerBeEnabled: (block: (website: Website) => void) => {
            retrieveWebsite(websiteKey).then((website: WebsiteWithBlocking) => {
                if (website.blockingStatus.blocked == false) {
                    const allowedUntil = website.blockingStatus.allowedUntil;
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

export const produce = <T> (value: T) => () => value;

export const matches = <T>(value: T) => (otherValue: T) => value === otherValue;