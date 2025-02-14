import {addScheduledMessagedListener, ScheduledMessage, sendMessageToReBlockAfterMinutes} from "../src/message";
import {aSmallPositiveInteger, aWebsite} from "./generators.test";
import AlarmCreateInfo = chrome.alarms.AlarmCreateInfo;
import Alarm = chrome.alarms.Alarm;
import {logInfo} from "../src/logger";

jest.mock("../src/logger");

const mockLogInfo = logInfo as jest.MockedFn<typeof logInfo>;

describe('message', () => {
    let mockAlarmCreate: jest.Mock;
    beforeEach(() => {
        mockAlarmCreate = jest.fn();
        mockAlarmCreate.mockResolvedValue(null);
        chrome.alarms.create = mockAlarmCreate;
        mockLogInfo.mockResolvedValue(null);
    });

    describe('sendMessageToReBlockAfterMinutes', () => {
        it('should schedule the blocking message after the specified minutes', async () => {
            const minutesLater = aSmallPositiveInteger();

            await sendMessageToReBlockAfterMinutes(minutesLater)(aWebsite.new());

            expect(mockAlarmCreate).toHaveBeenCalledTimes(1);
            const alarmInfo = mockAlarmCreate.mock.calls[0][1] as AlarmCreateInfo;
            expect(alarmInfo).toEqual({delayInMinutes: minutesLater});
        });

        it('should return the website for easier promise chaining interface', async () => {
            const website = aWebsite.new();
            const actualWebsite = await sendMessageToReBlockAfterMinutes(aSmallPositiveInteger())(website);
            expect(actualWebsite).toEqual(website);
        });
    });

    describe('sendMessageToReBlockAfterMinutes and addScheduledMessagedListener', () => {
        beforeEach(() => {
            mockAlarmCreate = jest.fn();
            let listeners = [];
            chrome.alarms.onAlarm.addListener = jest.fn().mockImplementation(listener => listeners.push(listener));
            chrome.alarms.create = jest.fn().mockImplementation((alarmName: string) => {
                const newAlarm: Alarm = {name: alarmName, scheduledTime: new Date().getTime()}
                listeners.forEach(listener => listener(newAlarm));
                return Promise.resolve();
            });
        });

        it('should encode the websiteKey to be re-blocked upon listening for the message', async () => {
            let messagedCaptured = false;
            const website = aWebsite.new();
            addScheduledMessagedListener((messageReceived: ScheduledMessage) => {
                if (messageReceived.type != "Re-block website"){
                    fail("wrong message received!");
                }
                expect(messageReceived.websiteKey).toEqual(website.key);
                messagedCaptured = true;
            });

            await sendMessageToReBlockAfterMinutes(aSmallPositiveInteger())(website);

            expect(messagedCaptured).toBeTruthy();
        });
    })
});