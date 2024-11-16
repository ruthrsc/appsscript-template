import { mylog, simpleLogger } from "../src/utils/simple_logger";

// mock Logger.log
const mockLogger = jest.fn().mockImplementation(() => {});
// @ts-expect-error mocking with type mismatch
global.Logger = {
  log: mockLogger,
};
const consoleLogSpy = jest
  .spyOn(global.console, "log")
  // leaving console.log as is was logging to stderr in tests
  .mockImplementation(() => {});

describe("SimpleLogger/mylog", () => {
  it("should return two lines", () => {
    expect(mylog("line1")).toBe("line1\n");
    expect(mylog("line2")).toBe("line1\nline2\n");
    expect(mockLogger).toHaveBeenCalledTimes(2);
    expect(mockLogger).toHaveBeenCalledWith("line1");
    expect(mockLogger).toHaveBeenCalledWith("line2");
  });
  it("should return all logs when mylog called empty", () => {
    mylog("line3");
    expect(mylog()).toBe("line1\nline2\nline3\n");
  });
  it("should reset logs", () => {
    simpleLogger.reset();
    expect(mylog()).toBe("");
  });
  it("should log to console", () => {
    simpleLogger.setConsoleLogging(true);
    mylog("line4");
    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith("line4");
  });
});
