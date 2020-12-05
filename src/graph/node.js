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


import * as PIXI from "pixi.js";

export class Node {
  /**
   * Constructs a node with the given id.
   * @param {string} id The id of the node. Must be unique within graph.
   * @param {string} displayText The display text associated with this node.
   */
  constructor(id, displayText) {
    /**
     * The id of the node.
     * @type {string}
     */
    this.id = id;

    /**
     * The display text of the node.
     * @types {string}
     */
    this.displayText = displayText;

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

    /**
     * The pixi container holding all of the node's rendered elements.
     * @type {PIXI.Container}
     * @private
     */
    this.container_ = new PIXI.Container();
    this.container_.zIndex = 1;

    /**
     * A data object that can be used to store extra data about a node.
     * @type {Map<string, *>}
     */
    this.data = new Map();
  }


  /**
   * Returns the container which holds all of this node's rendered elements.
   */
  getContainer() {
    return this.container_;
  }

  /**
   * Disposes of this node.
   */
  destroy() {
    this.container_.parent && this.container_.parent.removeChild(this.container_);
    this.container_.destroy({children: true});
  }
}
