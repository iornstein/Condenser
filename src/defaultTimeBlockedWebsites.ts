import {Website} from "./website";
import websiteJson from './defaultTimeBlockedWebsites.json';
import {ifPresentThen, isPresent} from "./helpers";
import {Failable, all, success} from "./failable";

const errorProducerWithPrefix = (details: string) => (cause: Error | undefined, source?: string) => {
    const message = `${details}${cause ? ` Got an error: ${cause}` : ''}${source ? ` in: ${source}` : ''}`;
    return new Error(message);
};

const websiteKeyMissingError = errorProducerWithPrefix("Each default blocked website must have a key!");
const duplicateWebsiteKeyError = errorProducerWithPrefix("You cannot default multiple websites with the same keys!");
const websiteUrlMissingError = errorProducerWithPrefix("Each default blocked website must have a url to block!");
const websiteUrlInvalid = errorProducerWithPrefix("Each blocked website must have a valid url.");

export const initialTimeBlockedWebsites = (): Failable<Website[]> => {
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
