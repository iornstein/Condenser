import {Website} from "./website";
import {storeWebsiteUnblockedUntil} from "./storage";

const millisecondsPerMinute = 1000*60;
export const storeTimeToBlockAgain = (enabledDurationInMinutes: number ) => {
    return (website: Website) => storeWebsiteUnblockedUntil(website, new Date().getTime() + enabledDurationInMinutes*millisecondsPerMinute);
};

export const produce = <T> (value: T) => () => value;

export const isPresent = <T> (value: T) => {
    return value !== null && value !== undefined && value !== "";
};

export const ifPresentThen = <T,R> (condition: (value: T) => R, value: T) => {
    return !isPresent(value) || condition(value);
};

export const pickOneFrom = <T> (list: T[]) => {
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex];
}

export const forEach = <T>(list: T[]) => {
    return {
        afterAnotherDo: <S>(process: (item: T) => Promise<S>) => {
            let nextPromise: Promise<S| void> = Promise.resolve();
            list.forEach(item => {
                nextPromise = nextPromise.then(() => process(item));
            });
            return nextPromise;
        }
    }
};

export const now = () => now();