import WebNavigationParentedCallbackDetails = chrome.webNavigation.WebNavigationParentedCallbackDetails;
import {
    storeData,
    allowYoutubeAccessToAdjust,
    ifYoutubeShouldNoLongerBeEnabled,
    triggerYoutubeToBeDisabled
} from "./helpers";

allowYoutubeAccessToAdjust();

chrome.webNavigation.onBeforeNavigate.addListener((details: WebNavigationParentedCallbackDetails) => {
    storeData("desiredUrl", details.url);
});

chrome.webRequest.onBeforeRequest.addListener(
    () => ifYoutubeShouldNoLongerBeEnabled(triggerYoutubeToBeDisabled),
    {urls: ["*://www.youtube.com/*"]},
    []
);