module.exports = {
  transform: {
    "^.+\\.ts?$": ["ts-jest", { diagnostics: { ignoreCodes: ["TS151001"] } }],
  },
  testEnvironment: "node",
  testRegex: "/tests/.*\\.(test|spec)?\\.(ts|tsx)$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  globals: {},
};
