

//copy from ./storage
export const fullStorage = async () => {
    const allValuesKey: string = null;
    return chrome.storage.local.get(allValuesKey);
};

//copy from ./website
type BlockingStatus = ({ blocked: true} | { blocked:false, allowedUntil: number});
type WebsiteWithBlocking = {
    key: string,
    url: string
} & {blockingStatus: BlockingStatus};


export const getAllSessionRules = async () => {
    return chrome.declarativeNetRequest.getSessionRules();
}

const loadData = () => {
    getAllStoredWebsites().then(storage => {
        document.getElementById("storedWebsites").innerText = JSON.stringify(storage, null, 2);
    });

    getAllSessionRules().then(rules => {
        document.getElementById("rules").innerText = JSON.stringify(rules, null, 2);
    });

    getDiscrepancies().then(discrepancy => {
        document.getElementById("discrepancy").innerText = discrepancy;
    });

    chrome.storage.local.get("info-logs").then(data => {
        const infoLogs = data["info-logs"];
        if (!infoLogs) {
            return;
        }
        document.getElementById("info-logs").innerHTML = infoLogs.map(log => `<div>${log}</div>`).join("");
    });

    chrome.storage.local.get("error-logs").then(data => {
        const errorLogs = data["error-logs"];
        if (!errorLogs) {
            return;
        }
        document.getElementById("error-logs").innerHTML = errorLogs.map(log => `<div>${log}</div>`).join("");
    });
};


const getAllStoredWebsites = async () => {
    return fullStorage().then(storage => {
        return Object.entries(storage).map((entry) => {
           const [key, value] = entry;
           if (key === "desiredUrl" || key === "info-logs" || key === "error-logs") {
               return null;
           }
           return value as WebsiteWithBlocking;
        }).filter( x => x !== null);
    });
}

const getDiscrepancies = async () => {
    return Promise.all([getAllSessionRules(), getAllStoredWebsites()]).then(values => {
        const [rules, websiteStorage] = values;
        const allBlockedUrls = rules.map(rule => {
            return /\^\((.*)\)\/\?\(\.\*\)/.exec(rule.condition.regexFilter)[1]; // get the url
        });
        const blockedWebsitesStored = websiteStorage.filter(website => website.blockingStatus.blocked)
        if (allBlockedUrls.length > blockedWebsitesStored.length) {
            return "DISCREPANCY. We are blocking MORE websites than we should be."
        }
        if (allBlockedUrls.length < blockedWebsitesStored.length) {
            return "DISCREPANCY. We are blocking LESS websites than we should be."
        }
        return "all good";
    });
}

loadData();

document.getElementById("reload").onclick = () => {
    console.log("~~~ reloading~~~~");
    loadData();
}
