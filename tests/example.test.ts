import { deepExample } from "../src/utils/example_deep_dependency";

describe("Example", () => {
  it('should return "deepExample"', () => {
    expect(deepExample()).toBe("deepExample");
  });
});
