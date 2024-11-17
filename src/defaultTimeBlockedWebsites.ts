import {Website} from "./website";
import * as websiteJson from './defaultTimeBlockedWebsites.json';
import {isNotPresent} from "./helpers";
import {fail, Failable, join, success} from "./failable";

export const initialTimeBlockedWebsites = (): Failable<Website[]> => {
    const seenRuleIds: Set<number> = new Set();
    const seenWebsiteKeys: Set<string> = new Set();
    return join(websiteJson.map(((website, index) => {
        const websiteProcessedCount = index + 1;
        const possibleRuleId = website.ruleId;
        if (isNotPresent(possibleRuleId)){
            return fail(new Error("Each default blocked website must have specify a rule id!"))
        }
        if(isNaN(Number(possibleRuleId))) {
            return fail(new Error("Each rule id must be an int!"));
        }
        seenRuleIds.add(possibleRuleId);
        if (seenRuleIds.size !== websiteProcessedCount) {
            return fail(new Error("You cannot default multiple websites with the same ruleIds!"));
        }
        if (isNotPresent(website.key)){
            return fail(new Error("Each default blocked website must have a key!"));
        }
        seenWebsiteKeys.add(website.key);
        if (seenWebsiteKeys.size !== websiteProcessedCount) {
            return fail(new Error("You cannot default multiple websites with the same keys!"));
        }

        return success({...website, ruleId: Number(possibleRuleId)});
    })));
}
