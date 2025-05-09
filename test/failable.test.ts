import {all, fail, Failable, success} from "../src/failable";
import {aBoolean, anError, anId} from "./generators.test";

describe('failable', () => {
    describe('mapSuccess', () => {
        let failable: Failable<number>
        describe('on a success', () => {
            beforeEach(() => {
                failable = success(anId.new());
            });

            it('should transform using the given mapper', () => {
                const successMapper = jest.fn();
                const transformedValue = anId.new();
                successMapper.mockReturnValue(transformedValue);
                const newFailable = failable.mapSuccess(successMapper);
                expect(successMapper).toHaveBeenCalledTimes(1);
                newFailable.mapSuccess(successMapper);
                expect(successMapper).toHaveBeenCalledWith(transformedValue);
            });

            it('should return an error if the mapper fails', () => {
                const successMapper = jest.fn();
                const thrownError = anError();
                successMapper.mockImplementation(() => {throw thrownError});
                const newFailable = failable.mapSuccess(successMapper);
                const failureHandler = jest.fn();
                newFailable.handleFailure(failureHandler);
                expect(failureHandler).toHaveBeenCalledWith([thrownError]);
            });
        });

        describe('on a failure', () => {
            beforeEach(() => {
                failable = fail([anError()]);
            });

            it('should do nothing with the passed in mapper', () => {
                const successMapper = jest.fn();
                failable.mapSuccess(successMapper);
                expect(successMapper).not.toHaveBeenCalled();
            });
        });
    });

    describe('mapFailure', () => {
        let failable: Failable<number>
        describe('on a success', () => {
            beforeEach(() => {
                failable = success(anId.new());
            });

            it('should do nothing with the passed in mapper', () => {
                const failureMapper = jest.fn();
                failable.mapFailure(failureMapper);
                expect(failureMapper).not.toHaveBeenCalled();
            });
        });

        describe('on a failure', () => {
            beforeEach(() => {
                failable = fail([anError()]);
            });

            it('should transform using the given mapper', () => {
                const failureMapper = jest.fn();
                const transformedFailure = anError();
                failureMapper.mockReturnValue(transformedFailure);
                const newFailable = failable.mapFailure(failureMapper);
                expect(failureMapper).toHaveBeenCalledTimes(1);
                newFailable.mapFailure(failureMapper);
                expect(failureMapper).toHaveBeenCalledWith(transformedFailure);
            });
        });
    });

    describe('handleFailure', () => {
        let failable: Failable<number>
        describe('on a success', () => {
            beforeEach(() => {
                failable = success(anId.new());
            });

            it('should do nothing with the handler', () => {
                const failureHandler = jest.fn();
                failable.handleFailure(failureHandler);
                expect(failureHandler).not.toHaveBeenCalled();
            });

        });

        describe('on a failure', () => {
            it('should do send all the errors to the handler', () => {
                const errors = [anError(), anError(), anError()];
                const failable = fail(errors);
                const failureHandler = jest.fn();
                failable.handleFailure(failureHandler);
                expect(failureHandler).toHaveBeenCalledWith(errors);
            });

        });
    });

    describe('ensure', () => {
        let failable: Failable<{id: number}>
        let invariant: (() => boolean) | boolean;
        let successValue: {id: number};
        describe('on a success', () => {
            beforeEach(() => {
                successValue = {id: anId.new()};
                failable = success(successValue);
            });

            describe('when the invariant holds', () => {
                beforeEach(() => {
                    invariant = aBoolean ? true : () => true;
                });

                it('should return the failable unchanged and not use the error produer', () => {
                    const errorProducer = jest.fn();
                    const newFailable = failable.ensure(invariant).otherwiseFailWith(errorProducer);
                    expect(errorProducer).not.toHaveBeenCalled();
                    expect(failable).toEqual(newFailable);
                });
            });

            describe('when the invariant fails', () => {
                beforeEach(() => {
                    invariant = aBoolean ? false : () => false;
                });

                it('should use the error producer to return a new failure with the success value as the source', () => {
                    const errorProducer = jest.fn();
                    const newError = anError();
                    errorProducer.mockReturnValue(newError);

                    const newFailable = failable.ensure(invariant).otherwiseFailWith(errorProducer);

                    const errorFromInvariant = undefined;
                    expect(errorProducer).toHaveBeenCalledWith(errorFromInvariant, JSON.stringify(successValue));
                    const failureHandler = jest.fn();
                    newFailable.handleFailure(failureHandler);
                    expect(failureHandler).toHaveBeenCalledWith([newError]);
                });
            });

            describe('when the invariant throws an error', () => {
                let invariantError: Error;
                beforeEach(() => {
                    invariantError = anError();
                    invariant = () => {
                        throw invariantError;
                    };
                });

                it('should use the error producer to return a new failure with the invariant error as the cause and the success value as the source', () => {
                    const errorProducer = jest.fn();
                    const newError = anError();
                    errorProducer.mockReturnValue(newError);

                    const newFailable = failable.ensure(invariant).otherwiseFailWith(errorProducer);

                    expect(errorProducer).toHaveBeenCalledWith(invariantError, JSON.stringify(successValue));
                    const failureHandler = jest.fn();
                    newFailable.handleFailure(failureHandler);
                    expect(failureHandler).toHaveBeenCalledWith([newError]);
                });
            });
        });

        describe('on a failure', () => {
            let previousErrors: Error[];
            beforeEach(() => {
                previousErrors = [anError(), anError()];
                failable = fail(previousErrors);
            });

            describe('when the invariant holds', () => {
                beforeEach(() => {
                    invariant = aBoolean ? true : () => true;
                });

                it('should return the failable unchanged and not use the error produer', () => {
                    const errorProducer = jest.fn();
                    const newFailable = failable.ensure(invariant).otherwiseFailWith(errorProducer);
                    expect(errorProducer).not.toHaveBeenCalled();
                    expect(failable).toEqual(newFailable);
                });

            });

            describe('when the invariant fails', () => {
                beforeEach(() => {
                    invariant = aBoolean ? false : () => false;
                });

                it('should use the error producer to add a new Error', () => {
                    const errorProducer = jest.fn();
                    const newError = anError();
                    errorProducer.mockReturnValue(newError);

                    const newFailable = failable.ensure(invariant).otherwiseFailWith(errorProducer);

                    const errorFromInvariant = undefined;
                    expect(errorProducer).toHaveBeenCalledWith(errorFromInvariant);
                    const failureHandler = jest.fn();
                    newFailable.handleFailure(failureHandler);
                    expect(failureHandler).toHaveBeenCalledWith([...previousErrors, newError]);
                })
            });

            describe('when the invariant throws an error', () => {
                let invariantError: Error;
                beforeEach(() => {
                    invariantError = anError();
                    invariant = () => {
                        throw invariantError;
                    };
                });

                it('should use the error producer to add a new failure with the invariant error as the cause', () => {
                    const errorProducer = jest.fn();
                    const newError = anError();
                    errorProducer.mockReturnValue(newError);

                    const newFailable = failable.ensure(invariant).otherwiseFailWith(errorProducer);

                    expect(errorProducer).toHaveBeenCalledWith(invariantError);
                    const failureHandler = jest.fn();
                    newFailable.handleFailure(failureHandler);
                    expect(failureHandler).toHaveBeenCalledWith([...previousErrors, newError]);
                });
            });

        });
    });

    describe('all', () => {
       describe('when given a list of successes', () => {
           it('should return a single success with a list of those success values', () => {
               const success1 = anId.new();
               const success2 = anId.new();
               const success3 = anId.new();
               const failable1 = success(success1);
               const failable2 = success(success2);
               const failable3 = success(success3);
               const result = all([failable1, failable2, failable3]);
               const successMapper = jest.fn();
               result.mapSuccess(successMapper);
               expect(successMapper).toHaveBeenCalledWith([success1, success2, success3]);
           });
       });

        describe('when given a list of successes and failures', () => {
            it('should return a failure with all errors combined', () => {
                const success2 = anId.new();
                const success4 = anId.new();
                const failure1Errors = [anError(), anError()];
                const failure3Errors = [anError()];
                const failable1 = fail(failure1Errors);
                const failable2 = success(success2);
                const failable3 = fail(failure3Errors);
                const failable4 = success(success4);
                const result = all([failable1, failable2, failable3, failable4]);
                const failureMapper = jest.fn();
                result.mapFailure(failureMapper);
                expect(failureMapper).toHaveBeenCalledWith([...failure1Errors, ...failure3Errors]);
            });
        });
    });
});