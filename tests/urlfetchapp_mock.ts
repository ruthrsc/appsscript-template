/**
 * Class allowing to mock UrlFetchApp.fetch with predefined responses
 *
 * It looks for the best matching path in the urlmap
 * (first tries the full path with search parameters, then without)
 *
 * See tests/examples/urlfetchapp_mock.test.ts for usage examples
 *
 */
export class UrlFetchAppMocker {
  public urlmap: TUrlFetchAppMocker["urlmap"] = {};
  public calls: Array<{ url: string; options: unknown }> = [];
  constructor({ urlmap }: TUrlFetchAppMocker) {
    this.setUrlMap(urlmap);
  }
  setUrlMap(urlmap: TUrlFetchAppMocker["urlmap"]) {
    const oldMap = this.urlmap;
    this.urlmap = urlmap;
    return oldMap;
  }
  reset() {
    this.calls = [];
  }
  fetch(url: string, _options: unknown) {
    const search_paths: string[] = [];
    const parsed_url = new URL(url);
    const path = parsed_url.pathname;
    const search = parsed_url.search;
    search_paths.unshift(path);
    if (search) {
      search_paths.unshift(path + search);
    }
    let response: TUrlFetchAppMockerResponse;
    for (const path of search_paths) {
      if ((response = this.urlmap[path])) {
        this.calls.push({ url, options: _options });
        return {
          getResponseCode: () => response.code,
          getContentText: () => response.body,
          getAllHeaders: () => ({ fake: "header" }),
          getAs: () => {
            throw new Error("Not implemented");
          },
          getBlob: () => {
            throw new Error("Not implemented");
          },
          getContent: () => {
            throw new Error("Not implemented");
          },
          getHeaders: () => {
            throw new Error("Not implemented");
          },
        };
      }
    }
    throw new UrlFetchAppMockingError(
      `No response for path: ${path}. Tried ${search_paths.join(", ")}`
    );
  }
}
export class UrlFetchAppMockingError extends Error {
  constructor(
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "MockingError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UrlFetchAppMockingError);
    }
  }
}

type TUrlFetchAppMockerResponse = { code: number; body: string };
type TUrlFetchAppMocker = {
  urlmap: Record<string, TUrlFetchAppMockerResponse>;
};
