var _ = require("@newdash/newdash");

var Graph = require("../../src").Graph;
var prim = require("../../src").alg.prim;

describe("alg.prim", function() {
  it("returns an empty graph for an empty input", function() {
    var source = new Graph();

    var g = prim(source, weightFn(source));
    expect(g.nodeCount()).toEqual(0);
    expect(g.edgeCount()).toEqual(0);
  });

  it("returns a single node graph for a graph with a single node", function() {
    var source = new Graph();
    source.setNode("a");

    var g = prim(source, weightFn(source));
    expect(g.nodes()).toStrictEqual(["a"]);
    expect(g.edgeCount()).toEqual(0);
  });

  it("returns a deterministic result given an optimal solution", function() {
    var source = new Graph();
    source.setEdge("a", "b",  1);
    source.setEdge("b", "c",  2);
    source.setEdge("b", "d",  3);
    // This edge should not be in the min spanning tree
    source.setEdge("c", "d", 20);
    // This edge should not be in the min spanning tree
    source.setEdge("c", "e", 60);
    source.setEdge("d", "e",  1);

    var g = prim(source, weightFn(source));
    expect(_.sortBy(g.neighbors("a"))).toStrictEqual(["b"]);
    expect(_.sortBy(g.neighbors("b"))).toStrictEqual(["a", "c", "d"]);
    expect(_.sortBy(g.neighbors("c"))).toStrictEqual(["b"]);
    expect(_.sortBy(g.neighbors("d"))).toStrictEqual(["b", "e"]);
    expect(_.sortBy(g.neighbors("e"))).toStrictEqual(["d"]);
  });

  it("throws an Error for unconnected graphs", function() {
    var source = new Graph();
    source.setNode("a");
    source.setNode("b");

    expect(function() { prim(source, weightFn(source)); }).toThrow();
  });
});

function weightFn(g) {
  return function(edge) {
    return g.edge(edge);
  };
}
