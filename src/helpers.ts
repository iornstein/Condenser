type StoredValue = string | number | boolean;

export function storeData(key: string, value: StoredValue, action?: () => void ) {
    chrome.storage.local.set({[key]: value}).then(() => {
        if (action) {
            action()
        }
    });
}

export function retrieveData(key: string, onDataRead: (data: any) => void) {
    chrome.storage.local.get(key).then(data => onDataRead(data[key]))
}

const SHOULD_ENABLE = "SHOULD_ENABLE";
const SHOULD_DISABLE = "SHOULD_DISABLE";
const DISABLED = "DISABLED";
const ENABLED = "IS_ENABLED";

type WebsiteDisableStatus = typeof SHOULD_ENABLE | typeof SHOULD_DISABLE | typeof  DISABLED | typeof ENABLED
type Website = "youtube";

const enableKey = (website: Website) => {
    //TODO: generify
    return "youtubeStatus";
};


const allowedUntilKey = (website: Website) => {
    //TODO: generify
    return "youtubeAllowedUntil";
};

const rulesetIdFor = (website: Website) => {
    //TODO: generify
    return "youtubeReroute"
};

const triggerEnabled = (website: Website, enabledDurationInMilliseconds: number) => {
    storeData(enableKey(website), SHOULD_ENABLE,
        () => storeData(allowedUntilKey(website), new Date().getTime() + enabledDurationInMilliseconds)
    );
};

const triggerDisabled = (website: Website) => {
    storeData(enableKey(website), SHOULD_DISABLE,
        () => storeData(allowedUntilKey(website), false)
    );
};


const ifWebsite = (website: Website) => {
    return {
        shouldNoLongerBeEnabled: (block: () => void) => {
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

export function listenToUpdateRedirectsFor(website: Website) {
    watchForWebsiteAccessChanges(website,(oldStatus: WebsiteDisableStatus | null, newStatus: WebsiteDisableStatus) => {
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

export function watchForWebsiteAccessChanges(website: Website, callback: (oldStoredValue: StoredValue, newStoredValue: StoredValue) => void) {
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

export function triggerYoutubeToBeEnabled(enabledDurationInMilliseconds: number) {
    triggerEnabled("youtube", enabledDurationInMilliseconds);
}

export function triggerYoutubeToBeDisabled() {
    triggerDisabled("youtube");
}

export function ifYoutubeShouldNoLongerBeEnabled(block: () => void) {
    ifWebsite("youtube").shouldNoLongerBeEnabled(block);
}

export function watchForYoutubeBeingEnabled(callback: () => void) {
    watchForWebsiteAccessChanges("youtube", (oldStatus: WebsiteDisableStatus, newStatus: WebsiteDisableStatus) => {
        if (newStatus === ENABLED) {
            callback();
        }
    });
}

export function allowYoutubeAccessToAdjust() {
    listenToUpdateRedirectsFor("youtube");
}
