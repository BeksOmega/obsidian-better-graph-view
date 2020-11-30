/**
 * @license
 * Copyright 2020 Obsidian Better Graph View
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class for a model of a node in a graph.
 * @author bekawestberg@gmail.com (Beka Westberg)
 */
'use strict';


export class Node {
  /**
   * Constructs a node with the given id.
   * @param {string} id The id of the node. Must be unique within graph.
   */
  constructor(id) {
    /**
     * The id of the node.
     * @type {string}
     */
    this.id = id;

    /**
     * The x position of the node.
     * @type {?number}
     */
    this.x = undefined;

    /**
     * The y position of the node.
     * @type {?number}
     */
    this.y = undefined;

    /**
     * The horizontal velocity of the node.
     * @type {number}
     */
    this.vx = 0;

    /**
     * The vertical velocity of the node.
     * @type {number}
     */
    this.vy = 0;

    /**
     * The fixed x position of the node (or null).
     * @type {number|null}
     */
    this.fx = null;

    /**
     * The fixed y position of the node (or null).
     * @type {number|null}
     */
    this.fy = null;
  }
}
