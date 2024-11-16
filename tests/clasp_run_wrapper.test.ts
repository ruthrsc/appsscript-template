import { claspRunWrapper } from "../src/utils/clasp_run_wrapper";
import { mylog } from "../src/utils/simple_logger";
const mockLogger = jest.fn().mockImplementation(() => {});

// @ts-expect-error mocking with type mismatch
global.Logger = {
  log: mockLogger,
};
describe("Clasp run wrapper", () => {
  it("should log error and the stack trace", () => {
    const fn = () => {
      throw new Error("rorre");
    };
    claspRunWrapper(fn);
    expect(mylog()).toMatch(/^Error: rorre/);
    expect(mylog()).toMatch(/tests\/clasp_run_wrapper.test.ts:[0-9]+:[0-9]+/);
  });
});
