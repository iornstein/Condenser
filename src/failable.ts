export interface Failable<T> {
    mapSuccess: <S> (mapper: (input: T) => S) => Failable<S>
    mapFailure: (mapper: (error: Error[]) => Error[]) => Failable<T>
    handleFailure: (handler: (input: Error[]) => void) => void
    ensure: (invariant: Invariant) => {
        otherwiseFailWith: (errorProducer: ErrorProducer) => Failable<T>
    }
}

type Invariant = (() => boolean) | boolean;
type ErrorProducer = (errorCause?: Error, source?: string) => Error;

export const success = <T>(value: T): Failable<T> => {
    return new Successful(value);
};

export const fail = <T>(errors: Error[]): Failable<T> => {
    return new Failed(errors);
};

const test = (invariant: Invariant) : "successful" | undefined | Error => {
    try {
        if (check(invariant)) {
            return "successful";
        }
    } catch (error: any) {
        return error;
    }
}

const check = (invariant: Invariant) =>
    typeof invariant === "function" ? invariant() : invariant


const ifFailedThen = (failureHandler : () => void)  => {
    return <T> (failable: Failable<T>) => {
        failable.handleFailure(failureHandler);
    };
};

export const all = <T>(failables: Failable<T>[]): Failable<T[]> => {
    let atLeastOneErrored = false;
    failables.forEach(ifFailedThen(() => atLeastOneErrored = true));
    if (atLeastOneErrored) {
        return new Failed(failables.flatMap(getErrors));
    }

    const getSuccessValue = <T>(failable: Failable<T>) => {
        let successValue: T;
        failable.mapSuccess(success => successValue = success);
        return successValue;
    }

    return success(failables.map(getSuccessValue));
};

class Successful<T> implements Failable<T> {
    value: T

    constructor(value: T) {
        this.value = value;
    }

    mapSuccess<S>(mapper: (input: T) => S) {
        return new Successful(mapper(this.value));
    }

    mapFailure() {
        return this;
    }

    handleFailure() {
        return;
    }

    ensure(invariant: Invariant) {
        return {
            otherwiseFailWith: (errorProducer: ErrorProducer) => {
                const trial = test(invariant);
                if (trial === "successful") {
                    return this;
                }
                return fail([errorProducer(trial, JSON.stringify(this.value))]);
            }
        }
    }
}

class Failed implements Failable<unknown> {
    errors: Error[]

    constructor(errors: Error[]) {
        this.errors = errors;
    }

    mapSuccess() {
        return this;
    }

    mapFailure(mapper: (error: Error[]) => Error[]) {
        return new Failed(mapper(this.errors));
    }

    handleFailure(handler: (input: Error[]) => void) {
        handler(this.errors);
    }

    ensure<T>(invariant: Invariant) {
        return {
            otherwiseFailWith: (errorProducer: ErrorProducer) => {
                const trial = test(invariant);
                if (trial === "successful") {
                    return this;
                }
                return fail(this.errors.concat([errorProducer(trial)]));
            }
        }
    }
}

//do not export, breaks Result convention
const getErrors = <T>(failable: Failable<T>) => {
    let errors: Error[] = [];
    failable.handleFailure(actualErrors => errors = actualErrors)
    return errors;
}