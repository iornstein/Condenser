import WebNavigationParentedCallbackDetails = chrome.webNavigation.WebNavigationParentedCallbackDetails;
import {addMessageListener, Message} from "./message";
import {Website} from "./website";
import {storeDesiredUrl, storeWebsiteBlocked} from "./storage";
import {blockWebsite} from "./block";
import {initialTimeBlockedWebsites} from "./defaultTimeBlockedWebsites";
import {logError} from "./logger";

chrome.webNavigation.onBeforeNavigate.addListener((details: WebNavigationParentedCallbackDetails) => {
    return storeDesiredUrl(details.url);
});

const blockWebsiteWithPersistence = async (website: Website) =>
    blockWebsite(website).then(storeWebsiteBlocked)

addMessageListener((message: Message) => {
    switch (message.type) {
        case "Reblock website":
            setTimeout(() => blockWebsiteWithPersistence(message.website), message.minutesUntilReblock*60*1000);
            break;
        case "Unknown":
            logError("unknown message sent!").then();
    }
});

initialTimeBlockedWebsites()
    .mapSuccess(websites => websites.forEach(websiteToLimitTimeTo =>
        blockWebsiteWithPersistence(websiteToLimitTimeTo)
    ))
    .handleFailure(error =>
        chrome.action.openPopup().then(() => {
            const errorMessages = error.map((error: Error) => error.message).join("\n");
            throw new Error(errorMessages);
        }));
