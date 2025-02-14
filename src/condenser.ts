import {Website} from "./website";
import {retrieveWebsite, storeWebsiteBlocked} from "./storage";
import {blockWebsite} from "./block";
import {initialTimeBlockedWebsites} from "./defaultTimeBlockedWebsites";
import {forEach} from "./helpers";
import {showInitializationErrorPopup, showWebsiteReblockedPopup} from "./popup";
import {addScheduledMessagedListener, ScheduledMessage} from "./message";
import {logError, logInfo} from "./logger";

const blockWebsiteWithPersistence = async (website: Website) =>
    blockWebsite(website).then(storeWebsiteBlocked);

export const initialize = async () => {
    addScheduledMessagedListener(async (message: ScheduledMessage) => {
        switch (message.type) {
            case "Re-block website":
                await logInfo(`time elapsed. Now blocking ${message.websiteKey}`)
                    retrieveWebsite(message.websiteKey)
                    .then(blockWebsiteWithPersistence)
                    .then(showWebsiteReblockedPopup)
                    .catch(() => {});
                break;
            case "Unknown":
                logError("unknown scheduled message sent!").then();
        }
    });

    return initialTimeBlockedWebsites()
        .mapSuccess(websites => forEach(websites)
            .afterAnotherDo(websiteToLimitTimeTo => {
                return logInfo("about to block website: " + websiteToLimitTimeTo.key)
                    .then(() => blockWebsiteWithPersistence(websiteToLimitTimeTo))
                    .then(() => logInfo("finished blocking website: " + websiteToLimitTimeTo.key + " any interleaving?"));
            }).catch(async (reason: string) => {
                await showInitializationErrorPopup(reason);
            }))
        .handleFailure(error => {
            const errorMessages = error.map((error: Error) => error.message).join("\n");
            return showInitializationErrorPopup(errorMessages)
        });
};
