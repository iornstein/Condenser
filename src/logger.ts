export const logError = async (message: string) => {
    console.error(message);
    return chrome.storage.local.get("error-logs").then((data) => {
        let errorLogs = data["error-logs"];
        if (!errorLogs) {
            errorLogs = [];
        }
        errorLogs.push(message);
        return chrome.storage.local.set({"error-logs": errorLogs});
    });
};

export const logInfo = async (message: string) => {
    console.info(message);
    return chrome.storage.local.get("info-logs").then((data) => {
        let infoLogs = data["info-logs"];
        if (!infoLogs) {
            infoLogs = [];
        }
        infoLogs.push(message);
        return chrome.storage.local.set({"info-logs": infoLogs});
    });
};