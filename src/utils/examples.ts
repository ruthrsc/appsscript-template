import { deepExample } from "./example_deep_dependency";

export function example1(): string {
  return deepExample();
}
export function exampleFetch(url: string) {
  return UrlFetchApp.fetch(url);
}
