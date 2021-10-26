import { Graph } from "../graph";
import _ from "../utils";

export class CycleException extends Error {}

topsort.CycleException = CycleException;

/**
 * Given a Graph graph this function applies topological sorting to it.
 * If the graph has a cycle it is impossible to generate such a list and CycleException is thrown.
 * Complexity: O(|V| + |E|).
 *
 * @argument graph - graph to apply topological sorting to.
 * @returns an array of nodes such that for each edge u -> v, u appears before v in the array.
 */
export function topsort(graph: Graph): string[];
export function topsort(g) {
  const visited = {};
  const stack = {};
  const results = [];

  function visit(node) {
    if (_.has(stack, node)) {
      throw new CycleException();
    }

    if (!_.has(visited, node)) {
      stack[node] = true;
      visited[node] = true;
      _.each(g.predecessors(node), visit);
      delete stack[node];
      results.push(node);
    }
  }

  _.each(g.sinks(), visit);

  if (_.size(visited) !== g.nodeCount()) {
    throw new CycleException();
  }

  return results;
}

export default topsort;
