import {mockedType} from "./mockHelpers";

jest.mock("../src/condenser");
import {initialize} from "../src/condenser";

const mockInitialize = mockedType(initialize);

describe('Service Worker ', () => {

    it('should setup the plugin when file loads', () => {
        expect(mockInitialize).not.toHaveBeenCalled();
        require("../src/service-worker");
        expect(mockInitialize).toHaveBeenCalled();
    });
});