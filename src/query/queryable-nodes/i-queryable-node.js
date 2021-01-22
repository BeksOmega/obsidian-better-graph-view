/**
 * @license
 * Copyright 2020 Obsidian Better Graph View
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Interface for a queryable node.
 * @author bekawestberg@gmail.com (Beka Westberg)
 */
'use strict';


export class QueryableNode {
  /**
   * Returns the id of this node.
   * @return {string} The id of this node.
   */
  getId() {
    return '';
  }

  /**
   * Returns whether this node has a connection from itself to the node with
   * the given node id.
   * @param {!QueryableNode} node The node to check if this node has a
   *     connection to.
   * @return {boolean} True if this node connects to the given node, false
   *     otherwise.
   */
  connectsToNode(node) {
    return false;
  }

  /**
   * Returns true if this node is connected to by the other node. IE if the
   * other node has a connection from itself to this node.
   * @param {!QueryableNode} node The node to check if it has a connection to
   *     this node.
   * @return {boolean} True if the other node connects to this node, false
   *     otherwise.
   */
  isConnectedToBy(node) {
    return node.connectsToNode(this);
  }

  /**
   * Returns true if this node is connected to the other node in either
   * direction.
   * @param {!QueryableNode} node The node to check for a connection.
   * @return {boolean} True if this node is connected to the other node in
   *     either direction, false otherwise.
   */
  hasConnectionWith(node) {
    return this.connectsToNode(node) || this.isConnectedToBy(node);
  }

  /**
   * Returns the set of nodes where this node has a connection from itself to
   * that node.
   * @return {!Set<!QueryableNode>} the set of nodes where this node has a
   *     connection from itself to that node.
   */
  getNodesItConnectsTo() {
    return new Set();
  }

  /**
   * Returns the set of nodes that are connected to this node in either
   * direction.
   * @return {!Set<!QueryableNode>} The set of nodes that are connected to this
   *     node in either direction.
   */
  getConnectedNodes() {
    return new Set();
  }
}
