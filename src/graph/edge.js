/**
 * @license
 * Copyright 2020 Obsidian Better Graph View
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class for a model of an edge in a graph.
 * @author bekawestberg@gmail.com (Beka Westberg)
 */
'use strict';


export class Edge {
  /**
   * Constructs an edge with the given id, source id, and target id.
   * @param {string} id The id of the edge. Must be unique within graph.
   * @param {string} sourceId The id of the source node.
   * @param {string} targetId The id of the target node.
   */
  constructor(id, sourceId, targetId) {
    /**
     * The id of the edge.
     * @type {string}
     */
    this.id = id;

    /**
     * The id of the source node.
     * @type {string|Node}
     */
    this.source = sourceId;

    /**
     * The id of the target node.
     * @type {string|Node}
     */
    this.target = targetId;
  }

  /**
   * Returns the id of the source node for this edge.
   */
  getSourceId() {
    return typeof this.source == 'string' ? this.source : this.source.id;
  }

  /**
   * Returns the id of the target node for this edge.
   */
  getTargetId() {
    return typeof this.target == 'string' ? this.target : this.target.id;
  }

  /**
   * Returns true if this edge is connected to the given node id.
   * @param {string} nodeId The node id to check if this edge is connected to.
   */
  isConnectedToNode(nodeId) {
    return this.getSourceId() == nodeId || this.getTargetId() == nodeId;
  }

}
