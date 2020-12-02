/**
 * @license
 * Copyright 2020 Obsidian Better Graph View
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class for a model of a graph.
 * @author bekawestberg@gmail.com (Beka Westberg)
 */
'use strict';


import {Node} from './node';
import {Edge} from './edge';


export class Graph {
  /**
   * Constructs a new graph instance.
   */
  constructor() {
    /**
     * An array of all of the nodes in the graph.
     * @type {!Array<!Node>}
     * @private
     */
    this.nodes_ = [];

    /**
     * An array of all of the edges in the graph.
     * @type {!Array<!Edge>}
     * @private
     */
    this.edges_ = [];
  }

  /**
   * Adds the given node to the graph.
   * @param {!Node} node The node to add to the graph.
   */
  addNode(node) {
    if (this.hasNode(node.id)) {
      throw 'The graph already contains a node with the id "' + node.id + '".';
    }
    this.nodes_.push(node);
  }

  /**
   * Removes the node with the given node id from the graph. Also removes all
   * connected edges.
   * @param {string} nodeId The id of the node to remove from the graph.
   */
  removeNode(nodeId) {
    this.getConnectedEdges(nodeId).forEach(edgeId => this.removeEdge(edgeId));
    this.nodes_.splice(this.nodes_.findIndex(n => n.id == nodeId), 1);
  }

  /**
   * Returns whether the graph contains a node with the given node id.
   * @param {string} nodeId The id of the node to check for membership.
   * @return {boolean} True if the graph contains a node with the given node id,
   *     false otherwise.
   */
  hasNode(nodeId) {
    return this.nodes_.some(node => node.id == nodeId)
  }

  /**
   * Returns the node with the specified id (if it exists).
   * @param {string} nodeId The node id of the node we want to find.
   * @return {?Node} The node with the specified id, or undefined if it does
   *     not exist.
   */
  getNode(nodeId) {
    return this.nodes_.find(node => node.id == nodeId);
  }

  /**
   * Returns a shallow copied array of all of the nodes in the graph.
   * @return {!Array<!Node>} All of the nodes in the graph.
   */
  getNodes() {
    return [...this.nodes_];
  }

  /**
   * Adds the given edge to the graph.
   * @param {!Edge} edge The edge to add to the graph.
   */
  addEdge(edge) {
    if (this.hasEdge(edge.id)) {
      throw 'The graph already contains an edge with the id "' + edge.id + '".';
    }
    this.edges_.push(edge);
  }

  /**
   * Removes the edge with the given edge id from the graph.
   * @param {string} edgeId The id of the edge to remove from the graph.
   */
  removeEdge(edgeId) {
    this.edges_.splice(this.edges_.findIndex(e => e.id == edgeId), 1);
  }

  /**
   * Returns whether the graph contains an edge with the given edge id.
   * @param {string} edgeId The id of the edge to check for membership.
   * @return {boolean} True if the graph contains an edge with the given edge id,
   *     false otherwise.
   */
  hasEdge(edgeId) {
    return this.edges_.some(edge => edge.id == edgeId)
  }

  /**
   * Returns the edge with the specified id (if it exists).
   * @param {string} edgeId The edge id of the edge we want to find.
   * @return {?Edge} The edge with the specified id, or undefined if it does
   *     not exist.
   */
  getEdge(edgeId) {
    return this.edges_.find(edge => edge.id == edgeId);
  }

  /**
   * Returns a shallow copied array of all of the edges in the graph.
   * @return {!Array<!Edge>} All of the edges in the graph.
   */
  getEdges() {
    return [...this.edges_];
  }

  /**
   * Clears all of the nodes and edges from the graph.
   */
  clear() {
    this.nodes_.length = 0;
    this.edges_.length = 0;
  }

  /**
   * Returns the ids of all of the edges with the given node id as the source
   * or target id.
   * @param {string} nodeId The id of the node to find the associated edges of.
   * @return {!Array<string>} An array of the ids of all of the edges with the
   *     given node id as the source or target id.
   */
  getConnectedEdges(nodeId) {
    return edges.filter(e => e.source == nodeId || e.target == nodeId)
        .map(e => e.id);
  }
}
