import {addMessageListener, Message} from "./message";
import {Website} from "./website";
import {storeWebsiteBlocked} from "./storage";
import {blockWebsite} from "./block";
import {initialTimeBlockedWebsites} from "./defaultTimeBlockedWebsites";
import {logError, logInfo} from "./logger";
import {forEach} from "./helpers";

const blockWebsiteWithPersistence = async (website: Website) =>
    blockWebsite(website).then(storeWebsiteBlocked)

addMessageListener((message: Message) => {
    switch (message.type) {
        case "Reblock website":
            const date = new Date();
            date.setMinutes(date.getMinutes() + message.minutesUntilReblock);
            logInfo(`setting timeout to block website ${message.website.key} at ${date}`);
            setTimeout(() => {
                return logInfo(`time elapsed. Now blocking ${message.website.key}`).then(() => {
                    return blockWebsiteWithPersistence(message.website);
                });
            }, message.minutesUntilReblock*60*1000);
            break;
        case "Unknown":
            logError("unknown message sent!").then();
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
