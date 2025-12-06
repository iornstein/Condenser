import {Website} from "./website";

export const showInitializationErrorPopup = async (errorMessage: string) => {
    await chrome.action.openPopup();
    throw new Error(errorMessage);
};

export const showWebsiteReblockedPopup = async (website: Website) => {
    return chrome.windows.create({ url: `websiteReblocked.html?website=${website.key}`, type: "popup" });
};