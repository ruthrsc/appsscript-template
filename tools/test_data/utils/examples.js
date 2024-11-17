import { deepExample } from "./example_deep_dependency";
export function example1() {
    return deepExample();
}
export function exampleFetch(url) {
    return UrlFetchApp.fetch(url);
}
