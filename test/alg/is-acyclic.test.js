
var Graph = require("../../src").Graph;
var isAcyclic = require("../../src").alg.isAcyclic;

describe("alg.isAcyclic", function() {
  it("returns true if the graph has no cycles", function() {
    var g = new Graph();
    g.setPath(["a", "b", "c"]);
    expect(isAcyclic(g)).toBeTruthy();
  });

  it("returns false if the graph has at least one cycle", function() {
    var g = new Graph();
    g.setPath(["a", "b", "c", "a"]);
    expect(isAcyclic(g)).toBeFalsy();
  });

  it("returns false if the graph has a cycle of 1 node", function() {
    var g = new Graph();
    g.setPath(["a", "a"]);
    expect(isAcyclic(g)).toBeFalsy();
  });

  it("rethrows non-CycleException errors", function() {
    expect(function() { isAcyclic(undefined); }).toThrow();
  });
});
