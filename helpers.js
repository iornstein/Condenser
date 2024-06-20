export function storeData(key, value, action) {
    chrome.storage.local.set({[key]: value}).then(() => {
        if (action) {
            action()
        }
    });
}

export function retrieveData(key, onDataRead) {
    chrome.storage.local.get(key).then(data => onDataRead(data[key]))
}


const SHOULD_ENABLE = "SHOULD_ENABLE";
const SHOULD_DISABLE = "SHOULD_DISABLE";
const DISABLED = "DISABLED";
const ENABLED = "IS_ENABLED";

export function triggerYoutubeToBeEnabled(enabledDurationInMilliseconds) {
    storeData("youtubeStatus", SHOULD_ENABLE,
        () => storeData("youtubeAllowedUntil", new Date().getTime() + enabledDurationInMilliseconds)
    );
}

export function triggerYoutubeToBeDisabled() {
    storeData("youtubeStatus", SHOULD_DISABLE,
        () => storeData("youtubeAllowedUntil", false)
    );
}

export function ifYoutubeShouldNoLongerBeEnabled(block) {
    retrieveData("youtubeStatus", (state) => {
        if(state === ENABLED){
            retrieveData("youtubeAllowedUntil", (allowedUntil) => {
                if (allowedUntil && new Date(allowedUntil) <= new Date()) {
                    console.log("running block to no longer enable youtube");
                    block();
                }
            })
        }
    });
}

export function watchForYoutubeBeingEnabled(callback) {
    watchForYoutubeAccessChanges((oldStatus, newStatus) => {
        if (newStatus === ENABLED) {
            callback();
        }
    });
}

export function allowYoutubeAccessToAdjust() {
    watchForYoutubeAccessChanges((oldStatus, newStatus) => {
        console.log("youtube access did change!");
        if (oldStatus === DISABLED || !oldStatus) {
            if (newStatus === SHOULD_ENABLE) {
                // need to enable access to youtube...
                chrome.declarativeNetRequest.updateEnabledRulesets({disableRulesetIds: ["youtubeReroute"]})
                    .then(() => storeData("youtubeStatus", ENABLED));
            }
        }
        if (oldStatus === ENABLED) {
            if (newStatus === SHOULD_DISABLE) {
                console.log("we are updating declarative net request to FORBID YOUTUBE");
                chrome.declarativeNetRequest.updateEnabledRulesets({enableRulesetIds: ["youtubeReroute"]})
                    .then( () => storeData("youtubeStatus", DISABLED));
            }
        }
    });
}

export function watchForYoutubeAccessChanges(callback) {
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== "local") {
            return;
        }
        if (!changes["youtubeStatus"]) {
            return;
        }

        callback(changes["youtubeStatus"].oldValue, changes["youtubeStatus"].newValue);
    });
}
