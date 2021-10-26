import { Graph } from "./graph";
import { map } from "@newdash/newdash/map";
import { each } from "@newdash/newdash/each";
import { clone } from "@newdash/newdash/clone";

export function write(g: Graph): Object {
  const json: any = {
    options: {
      directed: g.isDirected(),
      multigraph: g.isMultigraph(),
      compound: g.isCompound()
    },
    nodes: writeNodes(g),
    edges: writeEdges(g)
  };
  if (g.graph() !== undefined) {
    json.value = clone(g.graph());
  }
  return json;
}

function writeNodes(g: Graph) {
  return map(g.nodes(), (v) => {
    const nodeValue = g.node(v);
    const parent = g.parent(v);
    const node: any = { v: v };
    if (nodeValue !== undefined) {
      node.value = nodeValue;
    }
    if (parent !== undefined) {
      node.parent = parent;
    }
    return node;
  });
}

function writeEdges(g: Graph) {
  return map(g.edges(), (e: any) => {
    const edgeValue = g.edge(e);
    const edge: any = { v: e.v, w: e.w };
    if (e.name !== undefined) {
      edge.name = e.name;
    }
    if (edgeValue !== undefined) {
      edge.value = edgeValue;
    }
    return edge;
  });
}

export function read(json: any): Graph {
  const g = new Graph(json.options).setGraph(json.value);
  each(json.nodes, function (entry: any) {
    g.setNode(entry.v, entry.value);
    if (entry.parent) {
      g.setParent(entry.v, entry.parent);
    }
  });
  each(json.edges, function (entry: any) {
    g.setEdge({ v: entry.v, w: entry.w, name: entry.name }, entry.value);
  });
  return g;
}
