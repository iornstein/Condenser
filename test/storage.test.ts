import {retrieveWebsite, storeWebsiteBlocked, storeWebsiteUnblockedUntil} from "../src/storage";

describe('storage', () => {
    let storage = {};
    beforeEach(() => {
        chrome.storage.local.set = (items: any) => {
            Object.keys(items).forEach((key) => {
                storage[key] = items[key];
            })
            return Promise.resolve();
        };

        chrome.storage.local.get = (input: any) => {
            const keys  = input as string[];
            const returnObject = {};
            keys.forEach(key => {
                returnObject[key] = storage[key];
            });
            return Promise.resolve(returnObject);
        };
    });

    it('Should successfully store blocked websites', async () => {
        const key1 = "123";
        const key2 = "456";
        await storeWebsiteBlocked({key: key1, url: "https://api.github.com"});
        await storeWebsiteBlocked({key: key2, url: "https://api.zoom.com"});
        const storedWebsiteKey1 = await retrieveWebsite(key1);
        const storedWebsiteKey2 = await retrieveWebsite(key2);

        expect(storedWebsiteKey1).toEqual({key: key1, url: "https://api.github.com", blockingStatus: {blocked: true}});
        expect(storedWebsiteKey2).toEqual({key: key2, url: "https://api.zoom.com", blockingStatus: {blocked: true}});
    });

    it('Should successfully store unblocked websites', async () => {
        const key1 = "123";
        const website = {key: key1, url: "https://api.github.com"};
        await storeWebsiteBlocked(website);
        const enabledUntilTimeInMilliseconds = 1800000000000;
        await storeWebsiteUnblockedUntil(website, enabledUntilTimeInMilliseconds);
        const storedWebsiteKey1 = await retrieveWebsite(key1);
        expect(storedWebsiteKey1).toEqual({
           ...website,
            blockingStatus: {blocked: false, allowedUntil: enabledUntilTimeInMilliseconds}
        });
    });
});