var expect = require("./chai").expect;

describe("version", function() {
  it("should match the version from package.json", function() {
    expect(require("../src/version").version).to.equal("unknown");
  });
});
