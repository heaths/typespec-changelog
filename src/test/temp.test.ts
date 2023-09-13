import assert from "assert";

function sayHello(): string {
  return "Hello, world!";
}

describe("project", () => {
  it("says hello", () => {
    assert.strictEqual(sayHello(), "Hello, world!");
  })
});
