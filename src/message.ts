import {Website} from "./website";
import {produce} from "./helpers";
import Alarm = chrome.alarms.Alarm;
import AlarmCreateInfo = chrome.alarms.AlarmCreateInfo;

export type ScheduledMessage = ReBlockWebsiteMessage | UnknownMessage;
type UnknownMessage = { type: "Unknown" };
const ReBlockWebsite = "Re-block website";
type ReBlockWebsiteMessage = { type: typeof ReBlockWebsite, websiteKey: string};

const ReBlockWebsitePrefix = `${ReBlockWebsite}*`;
type EncodedScheduledMessage = `${typeof ReBlockWebsitePrefix}${string}` | "Unknown";

export const addScheduledMessagedListener = (onMessageReceived: (message: ScheduledMessage) => void) => {
    chrome.alarms.onAlarm.addListener((alarm: Alarm) => onMessageReceived(scheduledMessageFrom(alarm)));
};

export const sendMessageToReBlockAfterMinutes = (minutesUntilReblock: number) =>
    (website: Website) =>
        sendScheduledMessage(`${ReBlockWebsitePrefix}${website.key}`, {delayInMinutes: minutesUntilReblock})
            .then(produce(website));

const scheduledMessageFrom = (alarm: any): ScheduledMessage => {
    if (alarm && alarm.name.startsWith(ReBlockWebsite)) {
        return {type: ReBlockWebsite, websiteKey: alarm.name.split(ReBlockWebsitePrefix)[1]}
    }
    return {type: "Unknown"};
};

const sendScheduledMessage = (encodedScheduledMessage: EncodedScheduledMessage, alarmInfo: AlarmCreateInfo) => {
    return chrome.alarms.create(encodedScheduledMessage, alarmInfo)
};