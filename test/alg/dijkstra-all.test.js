var Graph = require("../../src").Graph;
var dijkstraAll = require("../../src").alg.dijkstraAll;
var allShortestPathsTest = require("./utils");

describe("alg.dijkstraAll", function() {
  allShortestPathsTest.tests(dijkstraAll);

  it("throws an Error if it encounters a negative edge weight", function() {
    var g = new Graph();
    g.setEdge("a", "b",  1);
    g.setEdge("a", "c", -2);
    g.setEdge("b", "d",  3);
    g.setEdge("c", "d",  3);

    expect(function() { dijkstraAll(g, weight(g)); }).toThrow();
  });
});

function weight(g) {
  return function(e) {
    return g.edge(e);
  };
}
