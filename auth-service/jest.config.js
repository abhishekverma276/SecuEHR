/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  clearMocks: true,
  verbose: true,
  detectOpenHandles: true,
  transform: {
    "^.+\.tsx?$": ["ts-jest",{}],
  },
};