import MockableFunction = jest.MockableFunction;

export const mockedType = <T extends MockableFunction> (functionToMock: T): jest.MockedFn<T> => {
    return functionToMock as jest.MockedFn<T>
}