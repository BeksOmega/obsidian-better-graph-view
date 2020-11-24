/**
 * @license
 * Copyright 2020 Obsidian Better Graph View
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class for a node in a graph.
 * @author bekawestberg@gmail.com (Beka Westberg)
 */
'use strict';


export class Node {
  /**
   * Constructs a node with the following properties.
   * @param {string} id The identifier for the node.
   * @param {string} label The display text for the node.
   * @param {number} x The x position of the node.
   * @param {number} y The y position of the node.
   * @param {number} size The size of the node.
   * @param {string} color The color of the node as a '#rgb' or '#rrggbb' string.
   */
  constructor(id, label, x, y, size, color) {
    this.id = id;
    this.label = label;
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
  }
}
