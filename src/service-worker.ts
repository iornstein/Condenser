import WebNavigationParentedCallbackDetails = chrome.webNavigation.WebNavigationParentedCallbackDetails;
import {when} from "./helpers";
import {Website, YouTube} from "./website";
import {storeDesiredUrl, storeWebsiteBlocked} from "./storage";
import {blockWebsite} from "./block";

const websiteToLimitTimeTo : Website = YouTube;

chrome.webNavigation.onBeforeNavigate.addListener((details: WebNavigationParentedCallbackDetails) => {
    return storeDesiredUrl(details.url);
});

const addListenerToReBlockWebsiteAfterElapsedTime = (website: Website) =>
    chrome.webRequest.onBeforeRequest.addListener(
        () => when(website.key).shouldNoLongerBeEnabled((website: Website) =>
            blockWebsite(website).then(storeWebsiteBlocked)),
        {urls: [`*://${(website.url)}/*`]},
        []
    );

blockWebsite(websiteToLimitTimeTo)
    .then(storeWebsiteBlocked)
    .then(addListenerToReBlockWebsiteAfterElapsedTime);