var Graph = require("../src").Graph;
var read = require("../src").json.read;
var write = require("../src").json.write;

describe("json", function () {
  it("preserves the graph options", function () {
    expect(rw(new Graph({ directed: true })).isDirected()).toBeTruthy();
    expect(rw(new Graph({ directed: false })).isDirected()).toBeFalsy();
    expect(rw(new Graph({ multigraph: true })).isMultigraph()).toBeTruthy();
    expect(rw(new Graph({ multigraph: false })).isMultigraph()).toBeFalsy();
    expect(rw(new Graph({ compound: true })).isCompound()).toBeTruthy();
    expect(rw(new Graph({ compound: false })).isCompound()).toBeFalsy();
  });

  it("preserves the graph value, if any", function () {
    expect(rw(new Graph().setGraph(1)).graph()).toEqual(1);
    expect(rw(new Graph().setGraph({ foo: "bar" })).graph()).toEqual({ foo: "bar" });
    expect(rw(new Graph()).graph()).toBeUndefined();
  });

  it("preserves nodes", function () {
    expect(rw(new Graph().setNode("a")).hasNode("a")).toBeTruthy();
    expect(rw(new Graph().setNode("a")).node("a")).toBeUndefined();
    expect(rw(new Graph().setNode("a", 1)).node("a")).toEqual(1);
    expect(rw(new Graph().setNode("a", { foo: "bar" })).node("a"))
      .toEqual({ foo: "bar" });
  });

  it("preserves simple edges", function () {
    expect(rw(new Graph().setEdge("a", "b")).hasEdge("a", "b")).toBeTruthy();
    expect(rw(new Graph().setEdge("a", "b")).edge("a", "b")).toBeUndefined();
    expect(rw(new Graph().setEdge("a", "b", 1)).edge("a", "b")).toEqual(1);
    expect(rw(new Graph().setEdge("a", "b", { foo: "bar" })).edge("a", "b"))
      .toEqual({ foo: "bar" });
  });

  it("preserves multi-edges", function () {
    var g = new Graph({ multigraph: true });

    g.setEdge({ v: "a", w: "b", name: "foo" });
    expect(rw(g).hasEdge("a", "b", "foo")).toBeTruthy();

    g.setEdge({ v: "a", w: "b", name: "foo" });
    expect(rw(g).edge("a", "b", "foo")).toBeUndefined();

    g.setEdge({ v: "a", w: "b", name: "foo" }, 1);
    expect(rw(g).edge("a", "b", "foo")).toEqual(1);

    g.setEdge({ v: "a", w: "b", name: "foo" }, { foo: "bar" });
    expect(rw(g).edge("a", "b", "foo")).toEqual({ foo: "bar" });
  });

  it("preserves parent / child relationships", function () {
    expect(rw(new Graph({ compound: true }).setNode("a")).parent("a"))
      .toBeUndefined();
    expect(rw(new Graph({ compound: true }).setParent("a", "parent")).parent("a"))
      .toEqual("parent");
  });
});

function rw(g) {
  return read(write(g));
}
