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


import {QueryableNode} from './i-queryable-node';
import {Graph} from '../../graph/graph';
import {NoteNode} from '../../graph/note-node';


export class QueryableNoteNode extends QueryableNode{
  /**
   * Constructs the QueryableNode
   * @param {!Graph} graph The graph containing the given node.
   * @param {!NoteNode} node The node this QueryableNoteNode wraps.
   */
  constructor(graph, node) {
    super();
    this.graph_ = graph;
    this.node_ = node;
  }

  /**
   * Returns the id of this node.
   * @return {string} The id of this node.
   */
  getId() {
    return this.node_.id;
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
    return this.graph_.getConnectedEdges(this.node_.id).filter((edgeId) => {
      // Only care about outgoing edges.
      return this.graph_.getEdge(edgeId).getSourceId() == this.node_.id;
    }).some((edgeId) => {
      return this.graph_.getEdge(edgeId).getTargetId() == node.getId();
    })
  }

  /**
   * Returns the set of nodes where this node has a connection from itself to
   * that node.
   * @return {!Set<!QueryableNode>} the set of nodes where this node has a
   *     connection from itself to that node.
   */
  getNodesItConnectsTo() {
    return new Set(this.graph_.getConnectedEdges(this.node_.id)
        .map((edgeId) => {
          return this.graph_.getEdge(edgeId);
        }).filter((edge) => {
          // Only care about outgoing edges.
          return edge.getSourceId() == this.node_.id;
        }).map((edge) => {
          return new QueryableNoteNode(
              this.graph_, this.graph_.getNode(edge.getTargetId()));
        }));
  }

  /**
   * Returns the set of nodes that are connected to this node in either
   * direction.
   * @return {!Set<!QueryableNode>} The set of nodes that are connected to this
   *     node in either direction.
   */
  getConnectedNodes() {
    return new Set(this.graph_.getConnectedEdges(this.node_.id)
        .map((edgeId) => {
          const edge = this.graph_.getEdge(edgeId);
          if (edge.getSourceId() == this.node_.id) {
            return this.graph_.getNode(edge.getTargetId());
          } else {
            return new QueryableNoteNode(
                this.graph_, this.graph_.getNode(edge.getSourceId()));
          }
        }));
  }

  /**
   * Returns the title of this note node.
   * @return {string} The title of this note node.
   */
  getTitle() {
    return this.node_.getTitle();
  }

  /**
   * Returns the folder path of this note node.
   * @return {string} The folder path of this note node.
   */
  getFolderPath() {
    return this.node_.getTitle();
  }

  /**
   * Returns an array of the tags of this note node.
   * @return {!Array<!String>} An array of the tags of this note node.
   */
  getTags() {
    return this.node_.getTags();
  }
}
