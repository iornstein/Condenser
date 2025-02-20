import {addMessageListener, Message} from "./message";
import {Website} from "./website";
import {storeWebsiteBlocked} from "./storage";
import {blockWebsite} from "./block";
import {initialTimeBlockedWebsites} from "./defaultTimeBlockedWebsites";
import {logError} from "./logger";
import {forEach} from "./helpers";

const blockWebsiteWithPersistence = async (website: Website) =>
    blockWebsite(website).then(storeWebsiteBlocked)

addMessageListener((message: Message) => {
    switch (message.type) {
        case "Reblock website":
            setTimeout(() => blockWebsiteWithPersistence(message.website), message.minutesUntilReblock * 60 * 1000);
            break;
        case "Unknown":
            logError("unknown message sent!").then();
    }
});

initialTimeBlockedWebsites()
    .mapSuccess(websites => forEach(websites).afterAnotherDo(websiteToLimitTimeTo => {
            return blockWebsiteWithPersistence(websiteToLimitTimeTo);
        }))
    .handleFailure(error =>
        chrome.action.openPopup().then(() => {
            const errorMessages = error.map((error: Error) => error.message).join("\n");
            throw new Error(errorMessages);
        }));
