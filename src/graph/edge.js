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
     * @type {string}
     */
    this.source = sourceId;

    /**
     * The id of the target node.
     * @type {string}
     */
    this.target = targetId;
  }
}
