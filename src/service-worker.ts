import WebNavigationParentedCallbackDetails = chrome.webNavigation.WebNavigationParentedCallbackDetails;
import {when} from "./helpers";
import {urlToBlock, Website} from "./website";
import {storeDesiredUrl, storeWebsiteBlocked} from "./storage";
import {blockWebsite} from "./block";

const websiteToLimitTimeTo : Website = "YouTube";

chrome.webNavigation.onBeforeNavigate.addListener((details: WebNavigationParentedCallbackDetails) => {
    return storeDesiredUrl(details.url);
});

blockWebsite(websiteToLimitTimeTo).then( async website => {
    console.info(`blocked: ${website}`);
});

chrome.webRequest.onBeforeRequest.addListener(
    () => when(websiteToLimitTimeTo).shouldNoLongerBeEnabled((website: Website) =>
        blockWebsite(website).then(storeWebsiteBlocked)),
    {urls: [`*://${urlToBlock(websiteToLimitTimeTo)}/*`]},
    []
);