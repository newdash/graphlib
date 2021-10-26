import _ from "../utils";
import { Edge, Graph } from "../graph";
import PriorityQueue from "../data/priority-queue";

/**
 * Prim's algorithm takes a connected undirected graph and generates a minimum spanning tree. This
 * function returns the minimum spanning tree as an undirected graph. This algorithm is derived
 * from the description in "Introduction to Algorithms", Third Edition, Cormen, et al., Pg 634.
 * Complexity: O(|E| * log |V|);
 *
 * @argument graph - graph to generate a minimum spanning tree of.
 * @argument weightFn - function which takes edge e and returns the weight of it. It throws an Error if
 *           the graph is not connected.
 * @returns minimum spanning tree of graph.
 */
export function prim(graph: Graph, weightFn: (e: Edge) => number): Graph;
export function prim(g, weightFunc) {
  const result = new Graph();
  const parents = {};
  const pq = new PriorityQueue();
  let v;

  function updateNeighbors(edge) {
    const w = edge.v === v ? edge.w : edge.v;
    const pri = pq.priority(w);
    if (pri !== undefined) {
      const edgeWeight = weightFunc(edge);
      if (edgeWeight < pri) {
        parents[w] = v;
        pq.decrease(w, edgeWeight);
      }
    }
  }

  if (g.nodeCount() === 0) {
    return result;
  }

  _.each(g.nodes(), function (node: any) {
    pq.add(node, Number.POSITIVE_INFINITY);
    result.setNode(node);
  });

  // Start from an arbitrary node
  pq.decrease(g.nodes()[0], 0);

  let init = false;
  while (pq.size() > 0) {
    v = pq.removeMin();
    if (_.has(parents, v)) {
      result.setEdge(v, parents[v]);
    } else if (init) {
      throw new Error("Input graph is not connected: " + g);
    } else {
      init = true;
    }

    g.nodeEdges(v).forEach(updateNeighbors);
  }

  return result;
}

export default prim;
