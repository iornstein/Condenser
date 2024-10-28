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

const enableKey = (website) => {
    //TODO: generify
    return "youtubeStatus";
};

const allowedUntilKey = (website) => {
    //TODO: generify
    return "youtubeAllowedUntil";
};

const rulesetIdFor = (website) => {
    //TODO: generify
    return "youtubeReroute"
};

const triggerEnabled = (website, enabledDurationInMilliseconds) => {
    storeData(enableKey(website), SHOULD_ENABLE,
        () => storeData(allowedUntilKey(website), new Date().getTime() + enabledDurationInMilliseconds)
    );
};

const triggerDisabled = (website) => {
    storeData(enableKey(website), SHOULD_DISABLE,
        () => storeData(allowedUntilKey(website), false)
    );
};


const ifWebsite = (website) => {
    return {
        shouldNoLongerBeEnabled: (block) => {
            retrieveData(enableKey(website), (state) => {
                if(state === ENABLED){
                    retrieveData(allowedUntilKey(website), (allowedUntil) => {
                        if (allowedUntil && new Date(allowedUntil) <= new Date()) {
                            block();
                        }
                    })
                }
            });
        }
    }
};

export function listenToUpdateRedirectsFor(website) {
    watchForWebsiteAccessChanges(website,(oldStatus, newStatus) => {
        if (oldStatus === DISABLED || !oldStatus) {
            if (newStatus === SHOULD_ENABLE) {
                // enable access to website
                chrome.declarativeNetRequest.updateEnabledRulesets({disableRulesetIds: [rulesetIdFor(website)]})
                    .then(() => storeData(enableKey(website), ENABLED));
            }
        }
        if (oldStatus === ENABLED) {
            if (newStatus === SHOULD_DISABLE) {
                // forbidding website
                chrome.declarativeNetRequest.updateEnabledRulesets({enableRulesetIds: [rulesetIdFor(website)]})
                    .then( () => storeData(enableKey(website), DISABLED));
            }
        }
    });
}

export function watchForWebsiteAccessChanges(website, callback) {
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== "local") {
            return;
        }
        if (!changes[enableKey(website)]) {
            return;
        }

        callback(changes[enableKey(website)].oldValue, changes[enableKey(website)].newValue);
    });
}

export function triggerYoutubeToBeEnabled(enabledDurationInMilliseconds) {
    triggerEnabled("youtube", enabledDurationInMilliseconds);
}

export function triggerYoutubeToBeDisabled() {
    triggerDisabled("youtube");
}

export function ifYoutubeShouldNoLongerBeEnabled(block) {
    ifWebsite("youtube").shouldNoLongerBeEnabled(block);
}

export function watchForYoutubeBeingEnabled(callback) {
    watchForWebsiteAccessChanges("youtube", (oldStatus, newStatus) => {
        if (newStatus === ENABLED) {
            callback();
        }
    });
}

export function allowYoutubeAccessToAdjust() {
    listenToUpdateRedirectsFor("youtube");
}
