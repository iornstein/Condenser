import {Website} from "../src/website";
import {getFailureFrom, getValueFrom} from "./failableHelpers";

describe('initialTimeBlockedWebsites', () => {
    it('should return the validated websites from the initial json', () => {
        jest.mock("../src/defaultTimeBlockedWebsites.json", () => ([{"key": "YouTube", "url": "https://www.youtube.com"}]));

        const {initialTimeBlockedWebsites} = require("../src/defaultTimeBlockedWebsites");

        const websites: Website[] = getValueFrom(initialTimeBlockedWebsites());

        expect(websites).toEqual([{key: "YouTube", url: "https://www.youtube.com"}]);
    });
});

describe('validatedTimeBlockedWebsites', () => {
    const errorMessagesWhenValidating = (websiteJson: any) => {
        const {validatedTimeBlockedWebsites} = require("../src/defaultTimeBlockedWebsites");
        return getFailureFrom(validatedTimeBlockedWebsites(websiteJson)).map(error => error.message);
    }

    it('should validate multiple correctly formatted websites', () => {
        const {validatedTimeBlockedWebsites} = require("../src/defaultTimeBlockedWebsites");

        const websites = validatedTimeBlockedWebsites([
            {"key": "YouTube", "url": "https://www.youtube.com"},
            {"key": "Reddit", "url": "https://www.reddit.com"},
            {"key": "Chess.com", "url": "https://www.chess.com"},
            {"key": "Facebook", "url": "https://www.facebook.com"}
        ]);

        expect(getValueFrom(websites)).toEqual([
            {"key": "YouTube", "url": "https://www.youtube.com"},
            {"key": "Reddit", "url": "https://www.reddit.com"},
            {"key": "Chess.com", "url": "https://www.chess.com"},
            {"key": "Facebook", "url": "https://www.facebook.com"}
        ])
    });

    it('should fail if any website is missing a key', () => {
        const errors = errorMessagesWhenValidating([{"url": "https://www.youtube.com"}]);
        expect(errors).toHaveLength(1);
        expect(errors[0]).toContain("Each default blocked website must have a key!")
    });

    it('should fail if any website rule ids are not unique', () => {
        const errors = errorMessagesWhenValidating([{"key": "YouTube", "url": "https://www.youtube.com"},
            {"key": "YouTube", "url": "https://www.reddit.com"},]);
        expect(errors).toHaveLength(1);
        expect(errors[0]).toContain("You cannot default multiple websites with the same keys!")
    });

    it('should fail if any website is missing its url key', () => {
        const errors = errorMessagesWhenValidating([{"key": "YouTube"}]);
        expect(errors).toHaveLength(1);
        expect(errors[0]).toContain("Each default blocked website must have a url to block!")
    });

    it('should fail if any website has an invalid url specified', () => {
        const errors = errorMessagesWhenValidating([{"key": "YouTube", "url": "abcddf"}]);
        expect(errors).toHaveLength(1);
        expect(errors[0]).toContain("Each blocked website must have a valid url. Got an error: TypeError: Invalid URL");
    });
});