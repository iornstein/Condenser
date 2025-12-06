import {showInitializationErrorPopup, showWebsiteReblockedPopup} from "../src/popup";
import {anError, aWebsite} from "./generators.test";

describe("showInitializationErrorPopup", () => {
    beforeEach(() => {
        chrome.action.openPopup = jest.fn();
    });

    it('should open up the initialization error popup that informs user to check the plugin errors', async () => {
        try {await showInitializationErrorPopup("");} catch (e) {}
        expect(chrome.action.openPopup).toHaveBeenCalled();
    });

    it('should throw an error such that it will be displayed in the plugin errors', async () => {
        const errorMessage = anError().message;
        await expect(showInitializationErrorPopup(errorMessage)).rejects.toThrow(errorMessage);
    });
});

describe("showWebsiteReblockedPopup", () => {
    beforeEach(() => {
        chrome.windows.create = jest.fn();
    });

    it('should open up the popup that informs user that the website was re-blocked', async () => {
        const website = aWebsite.new();
        await showWebsiteReblockedPopup(website);
        expect(chrome.windows.create).toHaveBeenCalledWith({
            url: `websiteReblocked.html?website=${website.key}`,
            type: "popup"
        });
    });
});