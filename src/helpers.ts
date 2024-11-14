import {Website} from "./website";
import {BlockingStatus, retrieveWebsiteBlockedStatus, storeWebsiteUnblockedUntil} from "./storage";

const millisecondsPerMinute = 1000*60;
export const storeTimeToBlockAgain = (enabledDurationInMinutes: number ) => {
    return (website: Website) => storeWebsiteUnblockedUntil(website, new Date().getTime() + enabledDurationInMinutes*millisecondsPerMinute);
}

export const when = (website: Website) => {
    return {
        shouldNoLongerBeEnabled: (block: (website: Website) => void) => {
            retrieveWebsiteBlockedStatus(website).then((blockedStatus: BlockingStatus) => {
                if (blockedStatus.blocked == false) {
                    const allowedUntil = blockedStatus.allowedUntil;
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