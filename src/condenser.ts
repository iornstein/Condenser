import {Website} from "./website";
import {retrieveWebsite, storeWebsiteBlocked} from "./storage";
import {blockWebsite} from "./block";
import {initialTimeBlockedWebsites} from "./defaultTimeBlockedWebsites";
import {forEach} from "./helpers";
import {showInitializationErrorPopup} from "./popup";
import {addScheduledMessagedListener, ScheduledMessage} from "./message";
import {logError} from "./logger";

const blockWebsiteWithPersistence = async (website: Website) =>
    blockWebsite(website).then(storeWebsiteBlocked);

export const initialize = () => {
    addScheduledMessagedListener((message: ScheduledMessage) => {
        switch (message.type) {
            case "Re-block website":
                retrieveWebsite(message.websiteKey).then(blockWebsiteWithPersistence).catch(() => {});
                break;
            case "Unknown":
                logError("unknown scheduled message sent!").then();
        }
    });

    return initialTimeBlockedWebsites()
        .mapSuccess(websites => forEach(websites).afterAnotherDo(blockWebsiteWithPersistence).catch(async (reason: string) => {
            await showInitializationErrorPopup(reason);
        }))
        .handleFailure(error => {
            const errorMessages = error.map((error: Error) => error.message).join("\n");
            return showInitializationErrorPopup(errorMessages)
        });
};
