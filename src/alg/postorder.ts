import { Graph } from "../graph";
import dfs from "./dfs";

/**
 * Performs post-order depth first traversal on the input graph. If the graph is
 * undirected then this algorithm will navigate using neighbors. If the graph
 * is directed then this algorithm will navigate using successors.
 *
 * @argument graph - depth first traversal target.
 * @argument vs - nodes list to traverse.
 * @returns the nodes in the order they were visited as a list of their names.
 */
export function postorder(graph: Graph, vs: string[]): string[] {
  return dfs(graph, vs, "post");
}

export default postorder;
