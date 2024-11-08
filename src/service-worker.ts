import WebNavigationParentedCallbackDetails = chrome.webNavigation.WebNavigationParentedCallbackDetails;
import {
    when,
    triggerDisabled,
    storeDesiredUrl
} from "./helpers";
import {urlToBlock, Website} from "./website";

const websiteToLimitTimeTo : Website = "YouTube";

chrome.webNavigation.onBeforeNavigate.addListener((details: WebNavigationParentedCallbackDetails) => {
    return storeDesiredUrl(details.url);
});

chrome.webRequest.onBeforeRequest.addListener(
    () => when(websiteToLimitTimeTo).shouldNoLongerBeEnabled(triggerDisabled),
    {urls: [`*://${urlToBlock(websiteToLimitTimeTo)}/*`]},
    []
);