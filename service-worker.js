import {
    storeData,
    allowYoutubeAccessToAdjust,
    ifYoutubeShouldNoLongerBeEnabled,
    triggerYoutubeToBeDisabled
} from "./helpers.js";


allowYoutubeAccessToAdjust();


chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    storeData("desiredUrl", details.url);

});

chrome.webRequest.onBeforeRequest.addListener(
    () => ifYoutubeShouldNoLongerBeEnabled(triggerYoutubeToBeDisabled),
    {urls: ["*://www.youtube.com/*"]},
    []
);