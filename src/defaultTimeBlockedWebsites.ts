import {Website} from "./website";
import websiteJson from './defaultTimeBlockedWebsites.json';
import {ifPresentThen, isPresent} from "./helpers";
import {Failable, all, success} from "./failable";
import {logInfo} from "./logger";

const withDetails = (message: string, cause: Error | undefined, source?: string): string => {
    return `${message}${cause ? ` Got an error: ${cause}` : ''}${source ? ` in: ${source}` : ''}`;
}

const websiteKeyMissingError = (cause: Error | undefined, source?: string) => new Error(withDetails("Each default blocked website must have a key!", cause, source));
const duplicateWebsiteKeyError = (cause: Error | undefined, source?: string) => new Error(withDetails("You cannot default multiple websites with the same keys!", cause, source));
const websiteUrlMissingError = (cause: Error | undefined, source?: string) => new Error(withDetails("Each default blocked website must have a url to block!", cause, source));
const websiteUrlInvalid = (cause: Error | undefined, source?: string) => new Error(withDetails("Each blocked website must have a valid url.", cause, source));

export const initialTimeBlockedWebsites = (): Failable<Website[]> => {
    logInfo("fetching initial time blocked websites");
    return validatedTimeBlockedWebsites(websiteJson);
}

type WebsiteJson = { key: string, url: string }[]

export const validatedTimeBlockedWebsites = (websiteJson: WebsiteJson): Failable<Website[]> => {
    const seenWebsiteKeys: Set<string> = new Set();
    return all(websiteJson.map((website => {
        return success(website)
            .ensure(isPresent(website.key)).otherwiseFailWith(websiteKeyMissingError)
            .ensure(isUniquelyAddedTo(website.key, seenWebsiteKeys)).otherwiseFailWith(duplicateWebsiteKeyError)
            .ensure(isPresent(website.url)).otherwiseFailWith(websiteUrlMissingError)
            .ensure(ifPresentThen(isValidURL, website.url)).otherwiseFailWith(websiteUrlInvalid)
    })));
};

const isValidURL = (urlString: string) => {
    return () => {
        const url = new URL(urlString);
        return url.protocol === "http:" || url.protocol === "https:";
    };
};

const isUniquelyAddedTo = <T>(value: T, set: Set<T>) => {
    const previousSize = set.size;
    set.add(value);
    return previousSize != set.size;
};
