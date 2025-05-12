import {showInitializationErrorPopup} from "../src/popup";
import {mockedType} from "./mockHelpers";
import {anError} from "./generators.test";

describe("showInitializationErrorPopup", () => {
    let mockOpenPopup = mockedType(chrome.action.openPopup);
    beforeEach(() => {
        const temp = jest.fn();
        mockOpenPopup = temp;
        chrome.action.openPopup = temp;
    });

    it('should open up the initialization error popup that informs user to check the plugin errors', async () => {
        try {await showInitializationErrorPopup("");} catch (e) {}
        expect(mockOpenPopup).toHaveBeenCalled();
    });

    it('should throw an error such that it will be displayed in the plugin errors', async () => {
        const errorMessage = anError().message;
        await expect(showInitializationErrorPopup(errorMessage)).rejects.toThrow(errorMessage);
    });
});