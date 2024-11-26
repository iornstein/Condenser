import {Website} from "./website";
import * as websiteJson from './defaultTimeBlockedWebsites.json';
import {isNumeric, isPresent} from "./helpers";
import {Failable, all, success, attempt} from "./failable";

const RULE_ID_MISSING_ERROR = new Error("Each default blocked website must have specify a rule id!");
const NON_NUMERIC_RULE_ID_ERROR = new Error("Each rule id must be an int!");
const DUPLICATE_RULE_ID_ERROR = new Error("You cannot default multiple websites with the same ruleIds!");
const WEBSITE_KEY_MISSING_ERROR = new Error("Each default blocked website must have a key!");
const DUPLICATE_WEBSITE_KEY_ERROR = new Error("You cannot default multiple websites with the same keys!");
const WEBSITE_URL_MISSING_ERROR = new Error("Each default blocked website must have a url to block!");
const websiteUrlInvalid = (cause: Error) => new Error("Each blocked website must have a valid url. Got an error: " + cause.message)

export const initialTimeBlockedWebsites = (): Failable<Website[]> => {
    const seenRuleIds: Set<number> = new Set();
    const seenWebsiteKeys: Set<string> = new Set();
    return all(websiteJson.map((website => {
        const possibleRuleId = website.ruleId;
        const validatedWebsite: Website = {...website, ruleId: Number(possibleRuleId)};
        return success(validatedWebsite)
            .ensure(isPresent(possibleRuleId)).otherwiseFailWith(RULE_ID_MISSING_ERROR)
            .ensure(isNumeric(possibleRuleId)).otherwiseFailWith(NON_NUMERIC_RULE_ID_ERROR)
            .ensure(isUniquelyAddedTo(possibleRuleId, seenRuleIds)).otherwiseFailWith(DUPLICATE_RULE_ID_ERROR)
            .ensure(isPresent(website.key)).otherwiseFailWith(WEBSITE_KEY_MISSING_ERROR)
            .ensure(isUniquelyAddedTo(website.key, seenWebsiteKeys)).otherwiseFailWith(DUPLICATE_WEBSITE_KEY_ERROR)
            .ensure(isPresent(website.url)).otherwiseFailWith(WEBSITE_URL_MISSING_ERROR)
            .and(website => attempt(() => new URL(website.url)).mapFailure(errors => errors.flatMap(websiteUrlInvalid)));
    })));
};

const isUniquelyAddedTo = <T> (value: T, set: Set<T>) => {
    const previousSize = set.size;
    set.add(value);
    return previousSize != set.size;
};
