import {Failable} from "../src/failable";

//Never move this into src, it violates the failable convention
export const getFailureFrom = <T>(failable: Failable<T>): Error[] => {
    failable.mapSuccess((success: T) => {
        throw new Error("Attempted to get an error from failable, that succeeded with value: " + JSON.stringify(success));});

    let errorsToExtract: Error[];
    failable.handleFailure((errors: Error[]) => {
        errorsToExtract = errors;
    });
    return errorsToExtract;
};

//Never move this into src, it violates the failable convention
export const getValueFrom = <T>(failable: Failable<T>): T => {
    failable.handleFailure(() => {
        expect("error").toEqual("it should not have failed");
    });

    let valueToExtract: T;
    failable.mapSuccess((value : T) => {
        valueToExtract = value;
    })
    return valueToExtract;
};