import {Website} from "../src/website";

const generateUsing = <T> (generator: () => T): Generator<T> => {
    return {
        new: generator,
        besides: (...excludeList: T[]) => {
            let possibleValue = generator();
            while (excludeList.includes(possibleValue)) {
                possibleValue = generator();
            }
            return possibleValue;
        }
    }
};

export const aRuleId = generateUsing(() => randomIntBetween(1, 100));
export const aWebsite: Generator<Website> = generateUsing(() => {
   return {key: randomShortString(), url: aUrl.new()}
});

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
        besides: (...excludeList: T[]) => T
    };

describe('', () => { it('', () => {})});

