import { Graph } from "../graph";
import _ from "../utils";

/**
 * Finds all connected components in a graph and returns an array of these components.
 * Each component is itself an array that contains the ids of nodes in the component.
 * Complexity: O(|V|).
 *
 * @argument graph - graph to find components in.
 * @returns array of nodes list representing components
 */
export function components(graph: Graph): string[][];
export function components(g: Graph) {
  const visited = {};
  const componentsList = [];
  let cmpt;

  function dfs(v) {
    if (_.has(visited, v)) return;
    visited[v] = true;
    cmpt.push(v);
    _.each(g.successors(v) as string[], dfs);
    _.each(g.predecessors(v) as string[], dfs);
  }

  _.each(g.nodes(), function (v) {
    cmpt = [];
    dfs(v);
    if (cmpt.length) {
      componentsList.push(cmpt);
    }
  });

  return componentsList;
}

export default components;
