import WebNavigationParentedCallbackDetails = chrome.webNavigation.WebNavigationParentedCallbackDetails;
import {when} from "./helpers";
import {Website} from "./website";
import {storeDesiredUrl, storeWebsiteBlocked} from "./storage";
import {blockWebsite} from "./block";
import {initialTimeBlockedWebsites} from "./defaultTimeBlockedWebsites";

chrome.webNavigation.onBeforeNavigate.addListener((details: WebNavigationParentedCallbackDetails) => {
    return storeDesiredUrl(details.url);
});

const blockWebsiteWithPersistence = async (website: Website) =>
    blockWebsite(website).then(storeWebsiteBlocked)

const addListenerToReBlockWebsiteAfterElapsedTime = (website: Website) =>
    chrome.webRequest.onBeforeRequest.addListener(
        () => when(website.key).shouldNoLongerBeEnabled(blockWebsiteWithPersistence),
        {urls: [`${(website.url)}/*`]},
        []
    );

initialTimeBlockedWebsites()
    .mapSuccess(websites => websites.forEach(websiteToLimitTimeTo =>
        blockWebsiteWithPersistence(websiteToLimitTimeTo)
            .then(addListenerToReBlockWebsiteAfterElapsedTime)
    ))
    .handleFailure(error =>
        chrome.action.openPopup().then(() => {
            const errorMessages = error.map((error: Error) => error.message).join("\n");
            throw new Error(errorMessages);
        }));
