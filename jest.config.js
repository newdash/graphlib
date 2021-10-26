
/**
 * @type {import("@jest/types").Config.ProjectConfig}
 */
module.exports = {
  testTimeout: 30 * 3000, // 30s
  transform: {
    ".(ts|tsx)": "ts-jest"
  },
  collectCoverageFrom: [
    "ts/**/*.ts",
    "!**/node_modules/**"
  ],
  coveragePathIgnorePatterns: [
    "node_modules/",
  ],
  testEnvironment: "node",
  testRegex: "/test/.*\\.test\\.[tj]s$",
  moduleFileExtensions: [
    "ts",
    "js",
    "json"
  ]
};