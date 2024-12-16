import {Website} from "./website";
import websiteJson from './defaultTimeBlockedWebsites.json';
import {isNumericIfPresent, isPresent} from "./helpers";
import {Failable, all, success} from "./failable";

const ruleIdMissingError = () => new Error("Each default blocked website must have a rule id!");
const nonNumericRuleIdError = () => new Error("Each rule id must be an int!");
const duplicateRuleIdError = () => new Error("You cannot default multiple websites with the same ruleIds!");
const websiteKeyMissingError = () => new Error("Each default blocked website must have a key!");
const duplicateWebsiteKeyError = () => new Error("You cannot default multiple websites with the same keys!");
const websiteUrlMissingError = () => new Error("Each default blocked website must have a url to block!");
const websiteUrlInvalid = (cause: Error | undefined) => new Error("Each blocked website must have a valid url. Got an error: " + (cause ? cause.message : ''))

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
            .ensure(isNumericIfPresent(possibleRuleId)).otherwiseFailWith(nonNumericRuleIdError)
            .ensure(isUniquelyAddedTo(possibleRuleId, seenRuleIds)).otherwiseFailWith(duplicateRuleIdError)
            .ensure(isPresent(website.key)).otherwiseFailWith(websiteKeyMissingError)
            .ensure(isUniquelyAddedTo(website.key, seenWebsiteKeys)).otherwiseFailWith(duplicateWebsiteKeyError)
            .ensure(isPresent(website.url)).otherwiseFailWith(websiteUrlMissingError)
            .ensure(isValidURLIfPresent(website.url)).otherwiseFailWith(websiteUrlInvalid)
    })));
};

const isValidURLIfPresent = (urlString: string) => {
    return () => {
        if (!isPresent(urlString)) {
            return true;
        }
        const url = new URL(urlString);
        return url.protocol === "http:" || url.protocol === "https:";
    };
};

const isUniquelyAddedTo = <T>(value: T, set: Set<T>) => {
    const previousSize = set.size;
    set.add(value);
    return previousSize != set.size;
};
