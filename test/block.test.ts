import {blockWebsite, unblockWebsite} from "../src/block";
import {Website} from "../src/website";
import {anId, aRuleId, aWebsite} from "./generators.test";
import Rule = chrome.declarativeNetRequest.Rule;
import RuleActionType = chrome.declarativeNetRequest.RuleActionType;

jest.mock("../src/logger");

describe('block', () => {
    const mockUpdateSessionRules = jest.fn();
    const mockGetSessionRules = jest.fn();
    beforeEach(() => {
        chrome.declarativeNetRequest.updateSessionRules = mockUpdateSessionRules;
        chrome.declarativeNetRequest.getSessionRules = mockGetSessionRules;
        mockUpdateSessionRules.mockRestore();
        mockGetSessionRules.mockRestore();
    });
    describe('unblockWebsite', () => {
        it('should unblock a blocked website', async () => {
            const website: Website = aWebsite.new();
            const idToRemove = aRuleId.new();
            const rule: Rule = {
                action: {type: RuleActionType.REDIRECT},
                condition: {regexFilter: `^(${website.url})/?(.*)`},
                id: idToRemove
            };
            mockGetSessionRules.mockResolvedValue([rule]);
            mockUpdateSessionRules.mockResolvedValue(null);
            await unblockWebsite(website);

            expect(mockUpdateSessionRules).toHaveBeenCalledTimes(1);
            expect(mockUpdateSessionRules.mock.calls[0][0]).toEqual({removeRuleIds: [idToRemove]});
        });

        it('should unblock the correct website', async () => {
            const websiteToBlock: Website = aWebsite.new();
            const idToRemove = aRuleId.new();
            const ruleToRemove: Rule = {
                action: {type: RuleActionType.REDIRECT},
                condition: {regexFilter: `^(${websiteToBlock.url})/?(.*)`},
                id: idToRemove
            };
            const otherRule1 = {
                action: {type: RuleActionType.REDIRECT},
                condition: {regexFilter: `someFilter`},
                id: aRuleId.besides(idToRemove)
            };
            const otherRule2 = {
                action: {type: RuleActionType.REDIRECT},
                condition: {regexFilter: `otherFilter`},
                id: aRuleId.besides(idToRemove)
            }
            mockGetSessionRules.mockResolvedValue([otherRule1, ruleToRemove, otherRule2]);
            mockUpdateSessionRules.mockResolvedValue(null);
            await unblockWebsite(websiteToBlock);

            expect(mockUpdateSessionRules).toHaveBeenCalledTimes(1);
            expect(mockUpdateSessionRules.mock.calls[0][0].removeRuleIds).toEqual([idToRemove]);
        });

        it('should unblock website if it has redundant blocking rules', async () => {
            const websiteToBlock: Website = aWebsite.new();
            const idToRemove = 4355;
            const otherIdToRemove = 8490;
            const ruleToRemove: Rule = {
                action: {type: RuleActionType.REDIRECT},
                condition: {regexFilter: `^(${websiteToBlock.url})/?(.*)`},
                id: idToRemove
            };
            const otherRule = {
                action: {type: RuleActionType.REDIRECT},
                condition: {regexFilter: `someFilter`},
                id: aRuleId.besides(idToRemove, otherIdToRemove)
            };
            const redundantRule = {
                action: {type: RuleActionType.REDIRECT},
                condition: {regexFilter: `^(${websiteToBlock.url})/?(.*)`},
                id: otherIdToRemove
            }
            mockGetSessionRules.mockResolvedValue([ruleToRemove, redundantRule, otherRule]);
            mockUpdateSessionRules.mockResolvedValue(null);
            await unblockWebsite(websiteToBlock);

            expect(mockUpdateSessionRules).toHaveBeenCalledTimes(1);
            expect(mockUpdateSessionRules.mock.calls[0][0].removeRuleIds).toEqual([idToRemove, otherIdToRemove]);
        });
    });

    describe('blockWebsite', () => {
        beforeEach(() => {
            mockGetSessionRules.mockResolvedValue([]);
            mockUpdateSessionRules.mockResolvedValue(null);
        });

        it('should add a new blocking rule for the given website', async () => {
            await blockWebsite(aWebsite.new());

            expect(mockUpdateSessionRules).toHaveBeenCalledTimes(1);
            const addedRules = mockUpdateSessionRules.mock.calls[0][0].addRules;
            expect(addedRules).toHaveLength(1);
        });

        it('should capture any requests to that website', async () => {
            const websiteToBlock: Website = {...aWebsite.new(), url: "https://api.github.com"};

            await blockWebsite(websiteToBlock);

            const newRule =  mockUpdateSessionRules.mock.calls[0][0].addRules[0];
            const regexFilter = RegExp(newRule.condition.regexFilter);
            expect(regexFilter.test("https://api.github.com")).toBeTruthy();
            expect(regexFilter.test("https://api.github.com/some/path")).toBeTruthy();
            expect(regexFilter.test("https://api.github.com?withQuery=value")).toBeTruthy();
        });

        it('should redirect any requests to instead go to a custom html page', async () => {
            const pluginId = `${anId.new()}`;
            chrome.runtime.id = pluginId

            await blockWebsite(aWebsite.new());

            const newRule =  mockUpdateSessionRules.mock.calls[0][0].addRules[0];
            expect(newRule.action.type).toEqual(RuleActionType.REDIRECT);
            expect(newRule.action.redirect.regexSubstitution).toMatch(`chrome-extension://${pluginId}/timeLimitedWebsite.html`)
        });

        const queryParamsOfRedirectRegexSubstitution = (rule: Rule) => {
            const regexSubstitution: string = rule.action.redirect.regexSubstitution;
            const [ignored, query] = regexSubstitution.split("?");
            const queryParams = {};
            query.split("&").forEach((queryParam: string) => {
                const [key, value] = queryParam.split("=");
                queryParams[key] = value;
            });
            return queryParams;
        };

        it('should redirect informing the custom html page which website was blocked so it can display properly', async () => {
            const blockedWebsite = aWebsite.new();
            await blockWebsite(blockedWebsite);

            const newRule =  mockUpdateSessionRules.mock.calls[0][0].addRules[0];
            const queryParams = queryParamsOfRedirectRegexSubstitution(newRule);

            expect(queryParams["website"]).toEqual(blockedWebsite.key);
        });

        it('should redirect informing the custom html page what url was attempted to go to', async () => {
            const blockedWebsite = {...aWebsite.new(), url: "https://api.github.com"};
            await blockWebsite(blockedWebsite);

            const newRule =  mockUpdateSessionRules.mock.calls[0][0].addRules[0];

            const regexFilter = RegExp(newRule.condition.regexFilter);
            const fullUrl = "https://api.github.com/morePathsHere";
            const matchedRequest = regexFilter.exec(fullUrl)

            const queryParams = queryParamsOfRedirectRegexSubstitution(newRule);
            const targetUrlRegex = queryParams["targetUrl"];

            expect(matchedRequest[0].replace(".*", targetUrlRegex)).toEqual(fullUrl);
            expect(targetUrlRegex).toEqual("\\0");
        });
    });
});