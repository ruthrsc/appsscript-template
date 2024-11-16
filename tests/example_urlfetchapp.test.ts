import { UrlFetchAppMocker, UrlFetchAppMockingError } from "./urlfetchapp_mock";
import { exampleFetch } from "../src/utils/examples";

const urlfetchappMocker = new UrlFetchAppMocker({
  urlmap: {
    "/example": {
      code: 200,
      body: "Hello, world!",
    },
    "/notfound": {
      code: 404,
      body: "Not found",
    },
    "/catchall": {
      code: 200,
      body: "General Catch all example",
    },
    "/catchall?but_more_specific": {
      code: 403,
      body: "specific url",
    },
  },
});

/**
 * There is probably better way to mock it
 */
// @ts-expect-error mocking with type mismatch
global.UrlFetchApp = {
  fetch: (url: string, options?: unknown) => {
    return urlfetchappMocker.fetch(url, options);
  },
};

describe("Example UrlFetchApp mock", () => {
  it("should return the body", () => {
    expect(exampleFetch("https://www.noexist/example").getContentText()).toBe(
      "Hello, world!"
    );
  });
  it("should throw an error", () => {
    expect(() => exampleFetch("http://err.no/meh")).toThrow(
      UrlFetchAppMockingError
    );
  });
  it("should return 404", () => {
    const response = exampleFetch("https://www.noexist/notfound");
    expect(response.getResponseCode()).toBe(404);
  });
  it("should try to find best matching path", () => {
    expect(
      exampleFetch(
        "https://www.noexist/catchall?random_parameter=12"
      ).getContentText()
    ).toBe("General Catch all example");
    expect(
      exampleFetch(
        "https://www.noexist/catchall?but_more_specific"
      ).getContentText()
    ).toBe("specific url");
  });
});
