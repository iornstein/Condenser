export interface Failable<T> {
    mapSuccess: <S> (mapper: (input: T) => S) => Failable<S>
    handleFailure: (handler: (input: Error[]) => void) => void
    failed: boolean
}

export const success = <T> (value: T): Failable<T> => {
    return new Successful(value);
};

export const fail = <T> (errors: Error): Failable<T> => {
    return new Failed([errors]);
};

export const join = <T> (entries: Failable<T>[]): Failable<T[]> => {
    let failures: Error[] = [];
    entries.forEach(failable => failable.handleFailure(errors => failures = failures.concat(errors)));
    if (failures.length !== 0) {
        return new Failed(failures);
    }

    let successes: T[] = [];
    entries.forEach(failable => failable.mapSuccess(success => successes = successes.concat(success)));
    return success(successes);
};

class Successful<T> implements Failable<T> {
    failed =false;
    value: T

    constructor(value: T) {
        this.value = value;
    }

    mapSuccess<S>(mapper: (input: T) => S) {
        return new Successful(mapper(this.value));
    }

    handleFailure(){
        return;
    }
}

class Failed implements Failable<unknown> {
    failed =true;
    errors: Error[]

    constructor(errors: Error[]) {
        this.errors = errors;
    }

    mapSuccess() {
        return this;
    }

    handleFailure(handler: (input: Error[]) => void){
        handler(this.errors);
    }
}