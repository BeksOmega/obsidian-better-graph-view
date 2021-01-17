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


import * as PIXI from 'pixi.js';


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

    /**
     * The pixi container holding all of the edge's rendered elements.
     * The edge must own the container to allow for the builder and layout to
     * bind mouse events to it.
     * @type {PIXI.Container}
     * @private
     */
    this.container_ = new PIXI.Container();
    this.container_.sortableChildren = true;
    this.container_.interactive = true;

    /**
     * Css classes associated with this edge.
     * @type {!Array<string>}
     * @protected
     */
    this.classes_ = ['edge'];
  }

  /**
   * Returns the id of the source node for this edge.
   * @return {string} The id of the source node.
   */
  getSourceId() {
    return this.source.id || this.source;
  }

  /**
   * Returns the id of the target node for this edge.
   * @return {string} The id of the target node.
   */
  getTargetId() {
    return this.target.id || this.target;
  }

  /**
   * Returns the container which holds all of this edge's rendered elements.
   * @return {!PIXI.Container} The id container holding this edge's rendered
   *     elements
   */
  getContainer() {
    return this.container_;
  }

  /**
   * Returns the css class names associated with this edge.
   * @return {!Array<string>} The css class names associated with this edge.
   */
  getClasses() {
    return this.classes_;
  }

  /**
   * Returns true if this edge is connected to the given node id.
   * @param {string} nodeId The node id to check if this edge is connected to.
   */
  isConnectedToNode(nodeId) {
    return this.getSourceId() == nodeId || this.getTargetId() == nodeId;
  }

  /**
   * Disposes of this edge.
   */
  destroy() {
    this.container_.parent && this.container_.parent.removeChild(this.container_);
    this.container_.destroy({children: true});
  }
}
