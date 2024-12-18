import {Website} from "./website";
import websiteJson from './defaultTimeBlockedWebsites.json';
import {ifPresentThen, isNumeric, isPresent} from "./helpers";
import {Failable, all, success} from "./failable";

const withDetails = (message: string, cause: Error | undefined, source?: string): string => {
    return `${message}${cause ? ` Got an error: ${cause}` : ''}${source ? ` in: ${source}` : ''}`;
}

const ruleIdMissingError = (cause: Error | undefined, source?: string) => new Error(withDetails("Each default blocked website must have a rule id!", cause, source));
const nonNumericRuleIdError = (cause: Error | undefined, source?: string) => new Error(withDetails("Each rule id must be an int!", cause, source));
const duplicateRuleIdError = (cause: Error | undefined, source?: string) => new Error(withDetails("You cannot default multiple websites with the same ruleIds!", cause, source));
const websiteKeyMissingError = (cause: Error | undefined, source?: string) => new Error(withDetails("Each default blocked website must have a key!", cause, source));
const duplicateWebsiteKeyError = (cause: Error | undefined, source?: string) => new Error(withDetails("You cannot default multiple websites with the same keys!", cause, source));
const websiteUrlMissingError = (cause: Error | undefined, source?: string) => new Error(withDetails("Each default blocked website must have a url to block!", cause, source));
const websiteUrlInvalid = (cause: Error | undefined, source?: string) => new Error(withDetails("Each blocked website must have a valid url.", cause, source));

export const initialTimeBlockedWebsites = (): Failable<Website[]> => {
    return validatedTimeBlockedWebsites(websiteJson);
}

type WebsiteJson = { key: string, ruleId: number, url: string }[]

export const validatedTimeBlockedWebsites = (websiteJson: WebsiteJson): Failable<Website[]> => {
    const seenRuleIds: Set<number> = new Set();
    const seenWebsiteKeys: Set<string> = new Set();
    return all(websiteJson.map((website => {
        const possibleRuleId = website.ruleId;
        const validatedWebsite: Website = {...website, ruleId: Number(possibleRuleId)};
        return success(validatedWebsite)
            .ensure(isPresent(possibleRuleId)).otherwiseFailWith(ruleIdMissingError)
            .ensure(ifPresentThen(isNumeric, possibleRuleId)).otherwiseFailWith(nonNumericRuleIdError)
            .ensure(isUniquelyAddedTo(possibleRuleId, seenRuleIds)).otherwiseFailWith(duplicateRuleIdError)
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
