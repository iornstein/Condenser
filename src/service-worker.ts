import WebNavigationParentedCallbackDetails = chrome.webNavigation.WebNavigationParentedCallbackDetails;
import {
    storeData,
    when,
    triggerDisabled,
    allowWebsiteAccessToChange
} from "./helpers";

allowWebsiteAccessToChange("YouTube");

chrome.webNavigation.onBeforeNavigate.addListener((details: WebNavigationParentedCallbackDetails) => {
    storeData("desiredUrl", details.url);
});

chrome.webRequest.onBeforeRequest.addListener(
    () => when("YouTube").shouldNoLongerBeEnabled(triggerDisabled),
    {urls: ["*://www.youtube.com/*"]},
    []
);