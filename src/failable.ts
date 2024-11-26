export interface Failable<T> {
    mapSuccess: <S> (mapper: (input: T) => S) => Failable<S>
    mapFailure: (mapper: (error: Error[]) => Error[]) => Failable<T>
    handleFailure: (handler: (input: Error[]) => void) => void
    ensure: (invariant: boolean) => {
        otherwiseFailWith: (error: Error) => Failable<T>
    }
    and: (additionalRequirement: (value: T) => Failable<any>) => Failable<T>
}

export const success = <T> (value: T): Failable<T> => {
    return new Successful(value);
};

export const fail = <T> (errors: Error[]): Failable<T> => {
    return new Failed(errors);
};

export const attempt = <T> (failableProcess: () => T) => {
    try{
        const result = failableProcess();
        return success(result);
    } catch (error: any) {
        if(error instanceof Error){
            return fail([error]);
        }
        return fail([new Error(error + "")]);
    }
}

export const all = <T> (failables: Failable<T>[]): Failable<T[]> => {
    const errors = failables.flatMap(getErrors)
    if (errors.length !== 0) {
        return new Failed(errors);
    }

    return success(failables.map(getSuccess));
};

class Successful<T> implements Failable<T> {
    value: T

    constructor(value: T) {
        this.value = value;
    }

    mapSuccess<S>(mapper: (input: T) => S) {
        return new Successful(mapper(this.value));
    }

    mapFailure<S>(mapper: (error: Error[]) => Error[]) {
        return this;
    }

    handleFailure(){
        return;
    }

    ensure(invariant: boolean) {
        return {
            otherwiseFailWith: (error: Error) => {
                if(invariant) {
                    return this;
                }
                return fail([error]);
            }
        }
    }

    and(additionalRequirement: (value: T) => Failable<any>) {
        const errors = getErrors(additionalRequirement(this.value));
        if (errors.length != 0) {
            return fail(errors);
        }
        return this;
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

    mapFailure<S>(mapper: (error: Error[]) => Error[]) {
        return new Failed(mapper(this.errors));
    }

    handleFailure(handler: (input: Error[]) => void){
        handler(this.errors);
    }

    ensure<T>(invariant: boolean) {
        return {
            otherwiseFailWith: (error: Error) => {
                if(invariant) {
                    return this;
                }
                return fail(this.errors.concat([error]));
            }
        }
    }

    and<T>(additionalRequirement: (value: T) => Failable<any>) {
        return this;
    }
}

//do not export, breaks Result convention
const getErrors = <T> (failable: Failable<T>) => {
    let errors: Error[] = [];
    failable.handleFailure(actualErrors => errors = actualErrors)
    return errors;
}

//DO NOT EXPORT. Guarantees no type safety. Only can be used when we know failable is a Success
const getSuccess = <T> (failable: Failable<T>) => {
    let successValue: T;
    failable.mapSuccess(success => successValue = success);
    return successValue;
}