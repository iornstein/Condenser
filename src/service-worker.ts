import {addScheduledMessagedListener, ScheduledMessage} from "./message";
import {Website} from "./website";
import {retrieveWebsite, storeWebsiteBlocked} from "./storage";
import {blockWebsite} from "./block";
import {initialTimeBlockedWebsites} from "./defaultTimeBlockedWebsites";
import {logError} from "./logger";
import {forEach} from "./helpers";

const blockWebsiteWithPersistence = async (website: Website) =>
    blockWebsite(website).then(storeWebsiteBlocked)

addScheduledMessagedListener((message: ScheduledMessage) => {
    switch (message.type) {
        case "Re-block website":
            retrieveWebsite(message.websiteKey).then(blockWebsiteWithPersistence);
            break;
        case "Unknown":
            logError("unknown scheduled message sent!").then();
    }
});

initialTimeBlockedWebsites()
    .mapSuccess(websites => forEach(websites).afterAnotherDo(blockWebsiteWithPersistence))
    .handleFailure(error =>
        chrome.action.openPopup().then(() => {
            const errorMessages = error.map((error: Error) => error.message).join("\n");
            throw new Error(errorMessages);
        }));