import {Website} from "./website";
import {produce} from "./helpers";

export type Message = ReBlockWebsiteMessage | UnknownMessage;
type UnknownMessage = { type: "Unknown" };
type ReBlockWebsiteMessage = { type: "Reblock website", website: Website, minutesUntilReblock: number };

export const addMessageListener = (onMessageReceived: (message: Message) => void) => {
    chrome.runtime.onMessage.addListener((message: any) => onMessageReceived(messageFrom(message)));
};

export const sendMessageToReblockAfterMinutes = (minutesUntilReblock: number) =>
    (website: Website) =>
        sendMessage({type: "Reblock website", website, minutesUntilReblock})
        .then(produce(website));

const messageFrom = (message: any): Message => {
    if (message && message.type === "Reblock website") {
        return message as ReBlockWebsiteMessage;
    }
    return {type: "Unknown"};
};

const sendMessage = (message: Message) => {
    return chrome.runtime.sendMessage(message);
};