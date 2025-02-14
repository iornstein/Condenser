import {addScheduledMessagedListener, ScheduledMessage} from "./message";
import {Website} from "./website";
import {retrieveWebsite, storeWebsiteBlocked} from "./storage";
import {blockWebsite} from "./block";
import {initialTimeBlockedWebsites} from "./defaultTimeBlockedWebsites";
import {logError, logInfo} from "./logger";
import {forEach} from "./helpers";

const blockWebsiteWithPersistence = async (website: Website) =>
    blockWebsite(website).then(storeWebsiteBlocked)

addScheduledMessagedListener((message: ScheduledMessage) => {
    switch (message.type) {
        case "Re-block website":
            return logInfo(`time elapsed. Now blocking ${message.websiteKey}`).then(() => {
                return retrieveWebsite(message.websiteKey).then(blockWebsiteWithPersistence);
            });
            break;
        case "Unknown":
            logError("unknown scheduled message sent!").then();
    }
});

initialTimeBlockedWebsites()
    .mapSuccess(websites =>  forEach(websites)
        .afterAnotherDo(websiteToLimitTimeTo => {
            console.log("about to block website: " + websiteToLimitTimeTo.key);
            const temp =  blockWebsiteWithPersistence(websiteToLimitTimeTo);
            console.log("finished blocking website: " + websiteToLimitTimeTo.key + " any interleaving?");
            return temp;
        }))
    .handleFailure(error =>
        chrome.action.openPopup().then(() => {
            const errorMessages = error.map((error: Error) => error.message).join("\n");
            throw new Error(errorMessages);
        }));
