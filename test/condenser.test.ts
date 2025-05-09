import {fail, success} from "../src/failable";
import {initialTimeBlockedWebsites} from "../src/defaultTimeBlockedWebsites";
import {Website} from "../src/website";
import {anError, anUnblockedWebsite, aWebsite} from "./generators.test";
import {blockWebsite} from "../src/block";
import {mockedType} from "./mockHelpers";
import {initialize} from "../src/condenser";
import {showInitializationErrorPopup} from "../src/popup";
import {retrieveWebsite, storeWebsiteBlocked} from "../src/storage";
import {addScheduledMessagedListener, ScheduledMessage} from "../src/message";

jest.mock("../src/defaultTimeBlockedWebsites");
jest.mock("../src/message");
jest.mock("../src/block");
jest.mock("../src/popup");
jest.mock("../src/storage");

const mockInitialTimeBlockedWebsites = mockedType(initialTimeBlockedWebsites);
const mockBlockWebsite = mockedType(blockWebsite);
const mockStoreWebsiteIsBlocked = mockedType(storeWebsiteBlocked);
const mockShowInitializationErrorPopup = mockedType(showInitializationErrorPopup);
const mockRetrieveWebsite = mockedType(retrieveWebsite);
const mockAddScheduledMessagedListener = mockedType(addScheduledMessagedListener);

describe('Service Worker', () => {

    let messageListeners: ((message: ScheduledMessage) => void)[] = [];

    beforeEach(() => {
        jest.clearAllMocks();
        mockBlockWebsite.mockImplementation((website) => Promise.resolve(website));
        mockStoreWebsiteIsBlocked.mockImplementation((website) => Promise.resolve(website));
        mockShowInitializationErrorPopup.mockResolvedValue(null);
        messageListeners = [];
        mockAddScheduledMessagedListener.mockImplementation(messageListener => {
            if (messageListeners.length > 1) {
                throw new Error("test only expected one listener for messages per test!");
            }
            messageListeners.push(messageListener);
        })
        mockInitialTimeBlockedWebsites.mockReturnValue(success([]));
        jest.useFakeTimers();
    });

    describe('Loading initially time-blocked websites', () => {
        beforeEach(() => {
            mockInitialTimeBlockedWebsites.mockReturnValue(success([]));
        });

        it('attempts to retrieve initial time-blocked websites', () => {
            initialize();
            expect(mockInitialTimeBlockedWebsites).toHaveBeenCalled();
        });

        describe('when initial time-blocked websites fail to load', () => {
            beforeEach(() => {
                mockInitialTimeBlockedWebsites.mockReturnValue(fail([anError()]))
            });

            it('should not block any websites', async () => {
                initialize();
                await jest.runAllTimersAsync();
                expect(mockBlockWebsite).not.toHaveBeenCalled();
            });

            it('should display the initialization error popup with all initialization errors', async () => {
                const error1 = anError();
                const error2 = anError();
                const initializationErrors = [error1, error2];
                mockInitialTimeBlockedWebsites.mockReturnValue(fail(initializationErrors))

                mockShowInitializationErrorPopup.mockResolvedValue(null);
                expect(mockShowInitializationErrorPopup).not.toHaveBeenCalled();
                initialize();

                await jest.runAllTimersAsync();
                expect(mockShowInitializationErrorPopup).toHaveBeenCalledWith(`${error1.message}\n${error2.message}`);
            });
        });

        describe('when initial time-blocked websites are successfully retrieved', () => {
            beforeEach(() => {
                mockBlockWebsite.mockImplementation((website: Website) => Promise.resolve(website));
            });

            it('should block each website and store they are blocked', async () => {
                const websites = aWebsite.smallUniqueList();
                mockInitialTimeBlockedWebsites.mockReturnValue(success(websites));
                initialize();
                await jest.runAllTimersAsync();
                expect(mockBlockWebsite).toHaveBeenCalledTimes(websites.length);
                websites.forEach((website) => {
                    expect(mockBlockWebsite).toHaveBeenCalledWith(website);
                    expect(mockStoreWebsiteIsBlocked).toHaveBeenCalledWith(website);
                });
            });

            describe('when a website fails to block', () => {
                beforeEach(() => {
                    mockBlockWebsite.mockRejectedValue("error!");
                    mockInitialTimeBlockedWebsites.mockReturnValue(success([aWebsite.new()]));
                });

                it('should not store that it is blocked', async () => {
                    const website = aWebsite.new();
                    mockInitialTimeBlockedWebsites.mockReturnValue(success([website, aWebsite.new()]));

                    initialize();
                    await jest.runAllTimersAsync();

                    expect(mockBlockWebsite).toHaveBeenCalledWith(website);
                    expect(mockStoreWebsiteIsBlocked).not.toHaveBeenCalled();
                });

                it('should display the initialization error popup', async () => {
                    const website = aWebsite.new();
                    mockBlockWebsite.mockImplementation((website) => Promise.reject("failed to block website: " + JSON.stringify(website)));
                    mockInitialTimeBlockedWebsites.mockReturnValue(success([website]));
                    mockShowInitializationErrorPopup.mockResolvedValue(null);

                    expect(mockShowInitializationErrorPopup).not.toHaveBeenCalled();
                    initialize();
                    await jest.runAllTimersAsync();

                    expect(mockShowInitializationErrorPopup).toHaveBeenCalledWith("failed to block website: " + JSON.stringify(website));
                });
            });
        });
    });

    describe('When a Re-blocking website message is received', () => {
        let messageListener: (message: ScheduledMessage) => void = () => null;
        beforeEach(() => {
           //handle the initialization properly
            expect(messageListeners.length).toEqual(0);
            initialize();
            mockBlockWebsite.mockClear();
            mockStoreWebsiteIsBlocked.mockClear();
            messageListener = messageListeners[0];
        });

        it('should block that website and store that it is blocked', async () => {
            const website = anUnblockedWebsite.new();
            mockRetrieveWebsite.mockResolvedValue(website);

            const blockWebsiteMessage: ScheduledMessage = {type: "Re-block website", websiteKey: website.key};
            messageListener(blockWebsiteMessage);

            expect(mockRetrieveWebsite).toHaveBeenCalledWith(blockWebsiteMessage.websiteKey);
            await jest.runAllTimersAsync(); //wait for all promises to resolve
            expect(mockBlockWebsite).toHaveBeenCalledWith(website);
            expect(mockStoreWebsiteIsBlocked).toHaveBeenCalledWith(website);
        });

        describe('when the website to re-block fails to be retrieved from storage', () => {
            beforeEach(() => {
                mockRetrieveWebsite.mockRejectedValue("error retrieving website!");
            });

            it('should not block the website', async () => {
                const blockWebsiteMessage: ScheduledMessage = {type: "Re-block website", websiteKey: ""};
                messageListener(blockWebsiteMessage);

                expect(mockRetrieveWebsite).toHaveBeenCalledWith(blockWebsiteMessage.websiteKey);
                await jest.runAllTimersAsync();
                expect(mockBlockWebsite).not.toHaveBeenCalled();
            });

            xit("should display an error", () => {});
        });

        describe('when the website fails to be re-blocked', () => {
            beforeEach(() => {
                mockRetrieveWebsite.mockResolvedValue(anUnblockedWebsite.new());
                mockStoreWebsiteIsBlocked.mockRejectedValue("Error!");
            });

            xit("should display an error", () => {});
        });
    });
});