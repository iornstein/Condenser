export const showInitializationErrorPopup = async (errorMessage: string) => {
    await chrome.action.openPopup();
    throw new Error(errorMessage);
}