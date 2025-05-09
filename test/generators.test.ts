import {Website, WebsiteWithBlocking} from "../src/website";

const generateUsing = <T> (generator: () => T): Generator<T> => {
    const valueBesides = (excludeList: T[]) => {
        let possibleValue = generator();
        while (excludeList.includes(possibleValue)) {
            possibleValue = generator();
        }
        return possibleValue;
    }
    return {
        new: generator,
        besides: (...excludeList: T[]) => valueBesides(excludeList),
        smallUniqueList: () => {
            const listSize = randomIntBetween(1, 4);
            const listToReturn: T[] = [];
            while (listToReturn.length < listSize) {
                listToReturn.push(valueBesides(listToReturn));
            }
            return listToReturn;
        }
    }
};

export const aRuleId = generateUsing(() => randomIntBetween(1, 100));
export const aWebsite: Generator<Website> = generateUsing(() => {
   return {key: randomShortString(), url: aUrl.new()}
});

export const anUnblockedWebsite: Generator<WebsiteWithBlocking> = generateUsing(() => {
    return {...aWebsite.new(), blockingStatus: {blocked: false, allowedUntil: 2000000000000}}
})

export const anId = generateUsing(() => randomIntBetween(10000000, 99999999));

export const aSmallPositiveInteger = () => randomIntBetween(1, 10)

export const anError = () => new Error(randomShortString())

export const aBoolean = () => Math.random() < 0.5;

const aUrl = generateUsing(() => `https://wwww.${aDomain()}.${aSubDomain()}`)


const randomShortString = () => {
    return (Math.random() + 1).toString(36).substring(10);
}
const aDomain = randomShortString;
const aSubDomain = () => randomChoiceFrom(["org", "com", "net", "io"]);

const randomChoiceFrom = <T> (list: T[]) : T => {
    return list[randomIntBetween(0, list.length-1)];
}

const randomIntBetween = (minInclusive: number, maxInclusive: number) => {
    return Math.floor(Math.random() * (maxInclusive - minInclusive + 1) + minInclusive);
};

type Generator<T> =
    {
        new: () => T,
        besides: (...excludeList: T[]) => T,
        smallUniqueList: () => T[]
    };

describe('', () => { it('', () => {})});

