import { constant, isFunction, filter, isEmpty, keys, values, union, each, has, reduce } from "./utils";

export interface GraphOptions {
  directed?: boolean | undefined; // default: true.
  multigraph?: boolean | undefined; // default: false.
  compound?: boolean | undefined; // default: false.
}

export interface Edge {
  v: string;
  w: string;
  /** The name that uniquely identifies a multi-edge. */
  name?: string | undefined;
}

const DEFAULT_EDGE_NAME = "\x00";
const GRAPH_NODE = "\x00";
const EDGE_KEY_DELIM = "\x01";

// Implementation notes:
//
//  * Node id query functions should return string ids for the nodes
//  * Edge id query functions should return an "edgeObj", edge object, that is
//    composed of enough information to uniquely identify an edge: {v, w, name}.
//  * Internally we use an "edgeId", a stringified form of the edgeObj, to
//    reference edges. This is because we need a performant way to look these
//    edges up and, object properties, which have string keys, are the closest
//    we're going to get to a performant hashtable in JavaScript.

export class Graph {
  private _isDirected: boolean;
  private _isMultigraph: boolean;
  private _isCompound: boolean;
  private _label: any;
  private _defaultNodeLabelFn: (value: any) => any;
  private _defaultEdgeLabelFn: (value: any, w?: any, label?: any) => any;
  private _nodes: {};
  private _parent: {};
  private _children: {};
  private _in: {};
  private _preds: {};
  private _out: {};
  private _sucs: {};
  private _edgeObjs: {};
  private _edgeLabels: {};
  private _nodeCount: number;
  private _edgeCount: number;
  constructor(opts?: GraphOptions) {
    this._isDirected = has(opts, "directed") ? opts.directed : true;
    this._isMultigraph = has(opts, "multigraph") ? opts.multigraph : false;
    this._isCompound = has(opts, "compound") ? opts.compound : false;

    // Label for the graph itself
    this._label = undefined;

    // Defaults to be set when creating a new node
    this._defaultNodeLabelFn = constant(undefined);

    // Defaults to be set when creating a new edge
    this._defaultEdgeLabelFn = constant(undefined);

    // v -> label
    this._nodes = {};

    if (this._isCompound) {
      // v -> parent
      this._parent = {};

      // v -> children
      this._children = {};
      this._children[GRAPH_NODE] = {};
    }

    // v -> edgeObj
    this._in = {};

    // u -> v -> Number
    this._preds = {};

    // v -> edgeObj
    this._out = {};

    // v -> w -> Number
    this._sucs = {};

    // e -> edgeObj
    this._edgeObjs = {};

    // e -> label
    this._edgeLabels = {};

    /* Number of nodes in the graph. Should only be changed by the implementation. */
    this._nodeCount = 0;

    /* Number of edges in the graph. Should only be changed by the implementation. */
    this._edgeCount = 0;
  }

  /* === Graph functions ========= */

  /**
   * Whether graph was created with 'directed' flag set to true or not.
   *
   * @returns whether the graph edges have an orientation.
   */
  isDirected(): boolean {
    return this._isDirected;
  }

  /**
   * Whether graph was created with 'multigraph' flag set to true or not.
   *
   * @returns whether the pair of nodes of the graph can have multiple edges.
   */
  isMultigraph() {
    return this._isMultigraph;
  }
  /**
   * Whether graph was created with 'compound' flag set to true or not.
   *
   * @returns whether a node of the graph can have subnodes.
   */
  isCompound() {
    return this._isCompound;
  }
  /**
   * Sets the label of the graph.
   *
   * @argument label - label value.
   * @returns the graph, allowing this to be chained with other functions.
   */
  setGraph(label: any) {
    this._label = label;
    return this;
  }
  /**
   * Gets the graph label.
   *
   * @returns currently assigned label for the graph or undefined if no label assigned.
   */
  graph() {
    return this._label;
  }

  /* === Node functions ========== */

  /**
   * Sets the default node label. This label will be assigned as default label
   * in case if no label was specified while setting a node.
   * Complexity: O(1).
   *
   * @argument label - default node label.
   * @returns the graph, allowing this to be chained with other functions.
   */
  setDefaultNodeLabel(newDefault: any) {
    if (!isFunction(newDefault)) {
      newDefault = constant(newDefault);
    }
    this._defaultNodeLabelFn = newDefault;
    return this;
  }
  /**
   * Gets the number of nodes in the graph.
   * Complexity: O(1).
   *
   * @returns nodes count.
   */
  nodeCount() {
    return this._nodeCount;
  }
  /**
   * Gets all nodes of the graph. Note, the in case of compound graph subnodes are
   * not included in list.
   * Complexity: O(1).
   *
   * @returns list of graph nodes.
   */
  nodes() {
    return keys(this._nodes);
  }
  /**
   * Gets list of nodes without in-edges.
   * Complexity: O(|V|).
   *
   * @returns the graph source nodes.
   */
  sources() {
    const self = this;
    return filter(this.nodes(), function (v) {
      return isEmpty(self._in[v]);
    });
  }
  /**
   * Gets list of nodes without out-edges.
   * Complexity: O(|V|).
   *
   * @returns the graph source nodes.
   */
  sinks() {
    const self = this;
    return filter(this.nodes(), function (v) {
      return isEmpty(self._out[v]);
    });
  }
  /**
   * Invokes setNode method for each node in names list.
   * Complexity: O(|names|).
   *
   * @argument names - list of nodes names to be set.
   * @argument label - value to set for each node in list.
   * @returns the graph, allowing this to be chained with other functions.
   */
  setNodes(names: string[], label?: any): Graph;
  setNodes(...args: any[]) {
    const [names, label] = args;
    each(names, (v: string) => {
      if (args.length > 1) {
        this.setNode(v, label);
      } else {
        this.setNode(v);
      }
    });
    return this;
  }
  /**
   * Creates or updates the value for the node v in the graph. If label is supplied
   * it is set as the value for the node. If label is not supplied and the node was
   * created by this call then the default node label will be assigned.
   * Complexity: O(1).
   *
   * @argument name - node name.
   * @argument label - value to set for node.
   * @returns the graph, allowing this to be chained with other functions.
   */
  setNode(name: string, label?: any): Graph {
    if (has(this._nodes, name)) {
      if (arguments.length > 1) {
        this._nodes[name] = label;
      }
      return this;
    }

    this._nodes[name] = arguments.length > 1 ? label : this._defaultNodeLabelFn(name);
    if (this._isCompound) {
      this._parent[name] = GRAPH_NODE;
      this._children[name] = {};
      this._children[GRAPH_NODE][name] = true;
    }
    this._in[name] = {};
    this._preds[name] = {};
    this._out[name] = {};
    this._sucs[name] = {};
    ++this._nodeCount;
    return this;
  }
  /**
   * Gets the label of node with specified name.
   * Complexity: O(|V|).
   *
   * @returns label value of the node.
   */
  node(name: string) {
    return this._nodes[name];
  }

  /**
   * Detects whether graph has a node with specified name or not.
   
   * 
   * @argument name - name of the node.
   * @returns true if graph has node with specified name, false - otherwise.
   */
  hasNode(name: string): boolean {
    return has(this._nodes, name);
  }
  /**
   * Remove the node with the name from the graph or do nothing if the node is not in
   * the graph. If the node was removed this function also removes any incident
   * edges.
   * Complexity: O(1).
   *
   * @argument name - name of the node.
   * @returns the graph, allowing this to be chained with other functions.
   */
  removeNode(name: string): Graph {
    if (has(this._nodes, name)) {
      const removeEdge = (e) => this.removeEdge(this._edgeObjs[e]);
      delete this._nodes[name];
      if (this._isCompound) {
        this._removeFromParentsChildList(name);
        delete this._parent[name];
        each(this.children(name), (child) => {
          this.setParent(child);
        });
        delete this._children[name];
      }
      each(keys(this._in[name]), removeEdge);
      delete this._in[name];
      delete this._preds[name];
      each(keys(this._out[name]), removeEdge);
      delete this._out[name];
      delete this._sucs[name];
      --this._nodeCount;
    }
    return this;
  }
  /**
   * Sets node p as a parent for node v if it is defined, or removes the
   * parent for v if p is undefined. Method throws an exception in case of
   * invoking it in context of noncompound graph.
   * Average-case complexity: O(1).
   *
   * @argument v - node to be child for p.
   * @argument parent - node to be parent for v.
   * @returns the graph, allowing this to be chained with other functions.
   */
  setParent(v: string, parent?: string): Graph {
    if (!this._isCompound) {
      throw new Error("Cannot set parent in a non-compound graph");
    }

    if (parent === undefined) {
      parent = GRAPH_NODE;
    } else {
      // Coerce parent to string
      parent += "";
      for (let ancestor = parent; ancestor !== undefined; ancestor = this.parent(ancestor) as string) {
        if (ancestor === v) {
          throw new Error("Setting " + parent + " as parent of " + v + " would create a cycle");
        }
      }

      this.setNode(parent);
    }

    this.setNode(v);
    this._removeFromParentsChildList(v);
    this._parent[v] = parent;
    this._children[parent][v] = true;
    return this;
  }

  private _removeFromParentsChildList(v) {
    delete this._children[this._parent[v]][v];
  }

  /**
   * Gets parent node for node v.
   * Complexity: O(1).
   *
   * @argument v - node to get parent of.
   * @returns parent node name or void if v has no parent.
   */
  parent(v: string): string | void {
    if (this._isCompound) {
      const parent = this._parent[v];
      if (parent !== GRAPH_NODE) {
        return parent;
      }
    }
  }

  /**
   * Gets list of direct children of node v.
   * Complexity: O(1).
   *
   * @argument v - node to get children of.
   * @returns children nodes names list.
   */
  children(v?: string): string[] {
    if (v === undefined) {
      v = GRAPH_NODE;
    }

    if (this._isCompound) {
      const children = this._children[v];
      if (children) {
        return keys(children);
      }
    } else if (v === GRAPH_NODE) {
      return this.nodes();
    } else if (this.hasNode(v)) {
      return [];
    }
  }
  /**
   * Return all nodes that are predecessors of the specified node or undefined if node v is not in
   * the graph. Behavior is undefined for undirected graphs - use neighbors instead.
   * Complexity: O(|V|).
   *
   * @argument v - node identifier.
   * @returns node identifiers list or undefined if v is not in the graph.
   */
  predecessors(v: string): void | string[] {
    const predsV = this._preds[v];
    if (predsV) {
      return keys(predsV);
    }
  }
  /**
   * Return all nodes that are successors of the specified node or undefined if node v is not in
   * the graph. Behavior is undefined for undirected graphs - use neighbors instead.
   * Complexity: O(|V|).
   *
   * @argument v - node identifier.
   * @returns node identifiers list or undefined if v is not in the graph.
   */
  successors(v: string): void | string[] {
    const sucsV = this._sucs[v];
    if (sucsV) {
      return keys(sucsV);
    }
  }
  /**
   * Return all nodes that are predecessors or successors of the specified node or undefined if
   * node v is not in the graph.
   * Complexity: O(|V|).
   *
   * @argument v - node identifier.
   * @returns node identifiers list or undefined if v is not in the graph.
   */
  neighbors(v: string): void | string[] {
    const preds = this.predecessors(v);
    if (preds) {
      return union(preds, this.successors(v) as string[]);
    }
  }
  /**
   *
   * @argument v - node identifier.
   * @returns if v is a leaf node
   */
  isLeaf(v: string): boolean {
    let neighbors: string[];
    if (this.isDirected()) {
      neighbors = this.successors(v) as string[];
    } else {
      neighbors = this.neighbors(v) as string[];
    }
    return neighbors?.length === 0;
  }

  /**
   * Creates new graph with nodes filtered via filter. Edges incident to rejected node
   * are also removed. In case of compound graph, if parent is rejected by filter,
   * than all its children are rejected too.
   * Average-case complexity: O(|E|+|V|).
   *
   * @argument filter - filtration function detecting whether the node should stay or not.
   * @returns new graph made from current and nodes filtered.
   */
  filterNodes(filter: (v: string) => boolean) {
    const copy = new Graph({
      directed: this._isDirected,
      multigraph: this._isMultigraph,
      compound: this._isCompound
    });

    copy.setGraph(this.graph());

    each(this._nodes, (value, v) => {
      if (filter(v)) {
        copy.setNode(v, value);
      }
    });

    each(this._edgeObjs, (e: Edge) => {
      if (copy.hasNode(e.v) && copy.hasNode(e.w)) {
        copy.setEdge(e, this.edge(e));
      }
    });

    const parents = {};
    const findParent = (v) => {
      const parent = this.parent(v) as string;
      if (parent === undefined || copy.hasNode(parent)) {
        parents[v] = parent;
        return parent;
      } else if (parent in parents) {
        return parents[parent];
      } else {
        return findParent(parent);
      }
    };

    if (this._isCompound) {
      each(copy.nodes(), (v) => {
        copy.setParent(v, findParent(v));
      });
    }

    return copy;
  }

  /* === Edge functions ========== */
  setDefaultEdgeLabel(newDefault) {
    if (!isFunction(newDefault)) {
      newDefault = constant(newDefault);
    }
    this._defaultEdgeLabelFn = newDefault;
    return this;
  }
  edgeCount() {
    return this._edgeCount;
  }
  edges() {
    return values(this._edgeObjs);
  }
  /**
   * Establish an edges path over the nodes in nodes list. If some edge is already
   * exists, it will update its label, otherwise it will create an edge between pair
   * of nodes with label provided or default label if no label provided.
   * Complexity: O(|nodes|).
   *
   * @argument nodes - list of nodes to be connected in series.
   * @argument label - value to set for each edge between pairs of nodes.
   * @returns the graph, allowing this to be chained with other functions.
   */
  setPath(nodes: string[], label?: any): Graph;
  setPath(...args: any[]) {
    const [vs, value] = args;
    reduce(vs, (v: string, w: any) => {
      if (args.length > 1) {
        this.setEdge(v, w, value);
      } else {
        this.setEdge(v, w);
      }
      return w;
    });
    return this;
  }
  /**
   * Creates or updates the label for the edge (v, w) with the optionally supplied
   * name. If label is supplied it is set as the value for the edge. If label is not
   * supplied and the edge was created by this call then the default edge label will
   * be assigned. The name parameter is only useful with multigraphs.
   * Complexity: O(1).
   *
   * @argument v - edge source node.
   * @argument w - edge sink node.
   * @argument label - value to associate with the edge.
   * @argument name - unique name of the edge in order to identify it in multigraph.
   * @returns the graph, allowing this to be chained with other functions.
   */
  setEdge(v: string, w: string, label?: any, name?: string): Graph;
  /**
   * Creates or updates the label for the specified edge. If label is supplied it is
   * set as the value for the edge. If label is not supplied and the edge was created
   * by this call then the default edge label will be assigned. The name parameter is
   * only useful with multi graphs.
   * Complexity: O(1).
   *
   * @argument edge - edge descriptor.
   * @argument label - value to associate with the edge.
   * @returns the graph, allowing this to be chained with other functions.
   */
  setEdge(edge: Edge, label?: any): Graph;
  setEdge(...args: any[]) {
    let v, w, name, value;
    let valueSpecified = false;
    const arg0 = args[0];

    if (typeof arg0 === "object" && arg0 !== null && "v" in arg0) {
      v = arg0.v;
      w = arg0.w;
      name = arg0.name;
      if (args.length === 2) {
        value = args[1];
        valueSpecified = true;
      }
    } else {
      v = arg0;
      w = args[1];
      name = args[3];
      if (args.length > 2) {
        value = args[2];
        valueSpecified = true;
      }
    }

    v = "" + v;
    w = "" + w;
    if (name !== undefined) {
      name = "" + name;
    }

    const e = edgeArgsToId(this._isDirected, v, w, name);
    if (has(this._edgeLabels, e)) {
      if (valueSpecified) {
        this._edgeLabels[e] = value;
      }
      return this;
    }

    if (name !== undefined && !this._isMultigraph) {
      throw new Error("Cannot set a named edge when isMultigraph = false");
    }

    // It didn't exist, so we need to create it.
    // First ensure the nodes exist.
    this.setNode(v);
    this.setNode(w);

    this._edgeLabels[e] = valueSpecified ? value : this._defaultEdgeLabelFn(v, w, name);

    const edgeObj = edgeArgsToObj(this._isDirected, v, w, name);
    // Ensure we add undirected edges in a consistent way.
    v = edgeObj.v;
    w = edgeObj.w;

    Object.freeze(edgeObj);
    this._edgeObjs[e] = edgeObj;
    incrementOrInitEntry(this._preds[w], v);
    incrementOrInitEntry(this._sucs[v], w);
    this._in[w][e] = edgeObj;
    this._out[v][e] = edgeObj;
    this._edgeCount++;
    return this;
  }
  /**
   * Gets edges of the graph. In case of compound graph subgraphs are not considered.
   * Complexity: O(|E|).
   *
   * @return graph edges list.
   */
  /**
   * Gets the label for the specified edge.
   * Complexity: O(1).
   *
   * @argument v - edge source node.
   * @argument w - edge sink node.
   * @argument name - name of the edge (actual for multigraph).
   * @returns value associated with specified edge.
   */
  edge(v: string, w: string, name?: string): any;
  /**
   * Gets the label for the specified edge.
   * Complexity: O(1).
   *
   * @argument edge - edge descriptor.
   * @returns value associated with specified edge.
   */
  edge(e: Edge): any;
  edge(...args: any[]) {
    const [v, w, name] = args;
    const e = args.length === 1 ? edgeObjToId(this._isDirected, args[0]) : edgeArgsToId(this._isDirected, v, w, name);
    return this._edgeLabels[e];
  }

  /**
   * Detects whether the graph contains specified edge or not. No subgraphs are considered.
   * Complexity: O(1).
   *
   * @argument v - edge source node.
   * @argument w - edge sink node.
   * @argument name - name of the edge (actual for multigraph).
   * @returns whether the graph contains the specified edge or not.
   */
  hasEdge(v: string, w: string, name?: string): boolean;
  /**
   * Detects whether the graph contains specified edge or not. No subgraphs are considered.
   * Complexity: O(1).
   *
   * @argument edge - edge descriptor.
   * @returns whether the graph contains the specified edge or not.
   */
  hasEdge(edge: Edge): boolean;
  hasEdge(...args: any[]) {
    const [v, w, name] = args;
    const e =
      arguments.length === 1 ? edgeObjToId(this._isDirected, args[0]) : edgeArgsToId(this._isDirected, v, w, name);
    return has(this._edgeLabels, e);
  }
  /**
   * Removes the specified edge from the graph. No subgraphs are considered.
   * Complexity: O(1).
   *
   * @argument edge - edge descriptor.
   * @returns the graph, allowing this to be chained with other functions.
   */
  removeEdge(edge: Edge): Graph;

  /**
   * Removes the specified edge from the graph. No subgraphs are considered.
   * Complexity: O(1).
   *
   * @argument v - edge source node.
   * @argument w - edge sink node.
   * @argument name - name of the edge (actual for multigraph).
   * @returns the graph, allowing this to be chained with other functions.
   */
  removeEdge(v: string, w: string, name?: string): Graph;
  removeEdge(...args: any[]) {
    // eslint-disable-next-line prefer-const
    let [v, w, name] = args;
    const e =
      arguments.length === 1 ? edgeObjToId(this._isDirected, args[0]) : edgeArgsToId(this._isDirected, v, w, name);
    const edge = this._edgeObjs[e];
    if (edge) {
      v = edge.v;
      w = edge.w;
      delete this._edgeLabels[e];
      delete this._edgeObjs[e];
      decrementOrRemoveEntry(this._preds[w], v);
      decrementOrRemoveEntry(this._sucs[v], w);
      delete this._in[w][e];
      delete this._out[v][e];
      this._edgeCount--;
    }
    return this;
  }
  /**
   * Return all edges that point to the node v. Optionally filters those edges down to just those
   * coming from node u. Behavior is undefined for undirected graphs - use nodeEdges instead.
   * Complexity: O(|E|).
   *
   * @argument v - edge sink node.
   * @argument u - edge source node.
   * @returns edges descriptors list if v is in the graph, or undefined otherwise.
   */
  inEdges(v: string, u?: string): void | Edge[] {
    const inV = this._in[v];
    if (inV) {
      const edges = values(inV);
      if (!u) {
        return edges;
      }
      return filter(edges, function (edge) {
        return edge.v === u;
      });
    }
  }
  /**
   * Return all edges that are pointed at by node v. Optionally filters those edges down to just
   * those point to w. Behavior is undefined for undirected graphs - use nodeEdges instead.
   * Complexity: O(|E|).
   *
   * @argument v - edge source node.
   * @argument w - edge sink node.
   * @returns edges descriptors list if v is in the graph, or undefined otherwise.
   */
  outEdges(v: string, w?: string): void | Edge[] {
    const outV = this._out[v];
    if (outV) {
      const edges = values(outV);
      if (!w) {
        return edges;
      }
      return filter(edges, function (edge) {
        return edge.w === w;
      });
    }
  }

  /**
   * Returns all edges to or from node v regardless of direction. Optionally filters those edges
   * down to just those between nodes v and w regardless of direction.
   * Complexity: O(|E|).
   *
   * @argument v - edge adjacent node.
   * @argument w - edge adjacent node.
   * @returns edges descriptors list if v is in the graph, or undefined otherwise.
   */
  nodeEdges(v: string, w?: string): void | Edge[] {
    const inEdges = this.inEdges(v, w);
    if (inEdges) {
      return inEdges.concat(this.outEdges(v, w) as Edge[]);
    }
  }
}

function incrementOrInitEntry(map, k) {
  if (map[k]) {
    map[k]++;
  } else {
    map[k] = 1;
  }
}

function decrementOrRemoveEntry(map, k) {
  if (!--map[k]) {
    delete map[k];
  }
}

function edgeArgsToId(isDirected, v_, w_, name) {
  let v = "" + v_;
  let w = "" + w_;
  if (!isDirected && v > w) {
    const tmp = v;
    v = w;
    w = tmp;
  }
  return v + EDGE_KEY_DELIM + w + EDGE_KEY_DELIM + (name === undefined ? DEFAULT_EDGE_NAME : name);
}

function edgeArgsToObj(isDirected, v_, w_, name) {
  let v = "" + v_;
  let w = "" + w_;
  if (!isDirected && v > w) {
    const tmp = v;
    v = w;
    w = tmp;
  }
  const edgeObj: Edge = { v: v, w: w };
  if (name) {
    edgeObj.name = name;
  }
  return edgeObj;
}

function edgeObjToId(isDirected, edgeObj) {
  return edgeArgsToId(isDirected, edgeObj.v, edgeObj.w, edgeObj.name);
}

export default Graph;