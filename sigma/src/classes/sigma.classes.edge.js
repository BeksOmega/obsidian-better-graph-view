/**
 * @license
 * Copyright 2020 Obsidian Better Graph View
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class for an edge in a graph.
 * @author bekawestberg@gmail.com (Beka Westberg)
 */
'use strict';


export class Edge {
  /**
   * Constructs an edge with the folowing properties.
   * @param {string} id The identifier for the edge.
   * @param {string} sourceId The identifier of the source node.
   * @param {string} targetId The identifier of the target node.
   * @param {number} size The size of the edge.
   * @param {string} color The color of the edge as a '#rgb' or '#rrggbb' string.
   */
  constructor(id, sourceId, targetId, size, color) {
    this.id = id;
    this.source = sourceId;
    this.target = targetId;
    this.size = size;
    this.color = color;
  }
}
