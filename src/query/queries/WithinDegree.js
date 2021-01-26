/**
 * @license
 * Copyright 2020 Obsidian Better Graph View
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A query that returns all nodes within X degree of the given
 *     set of nodes.
 * @author bekawestberg@gmail.com (Beka Westberg)
 */
'use strict';


import {Query} from '../queries/i-query';

export class WithinDegree extends Query {
  /**
   * Constructs a WithTitle query.
   * @param {number} degree The degree to return nodes within.
   * @param {!Query} query The query returning a set of nodes to get related
   *     nodes for.
   */
  constructor(degree, query) {
    super();

    /**
     * The degree to return nodes within.
     * @type {number}
     * @private
     */
    this.degree_ = degree;

    /**
     * The query returning a set of nodes to get related nodes for.
     * @type {!Query}
     * @private
     */
    this.query_ = query;
  }

  /**
   * Runs the query.
   * @param {!Set<!QueryableNode>} universe The universe of QueryableNodes (akin
   *     to set theory).
   * @return {!Set<!QueryableNode>}
   */
  run(universe) {
    if (this.degree < 1 || !this.query_) {
      return universe;
    }
    const queryNodes = this.query_.run(universe);
    const queryNodeIds = new Set();
    queryNodes.forEach((node) => {
      queryNodeIds.add(node.getId());
    });
    const filteredNodes = new Set();
    const filteredNodeIds = new Set();


    // Add first degree nodes.
    queryNodes.forEach((node) => {
      node.getConnectedNodes().forEach((cNode) => {
        if (!queryNodeIds.has(cNode.getId())) {
          filteredNodes.add(cNode);
          filteredNodeIds.add(cNode.getId());
        }
      });
    });

    // Add other degree nodes.
    for (let i = 1; i < this.degree_; i++) {
      const nodes = new Set(filteredNodes);
      nodes.forEach((node) => {
        node.getConnectedNodes().forEach((cNode) => {
          const id = cNode.getId();
          if (!queryNodeIds.has(id) && !filteredNodeIds.has(id)) {
            filteredNodes.add(cNode);
            filteredNodeIds.add(id);
          }
        })
      });
    }

    return filteredNodes;
  };

  /**
   * Returns true if the two queries are equal, false otherwise.
   * @param {!Query} query The query to compare against.
   */
  equals(query) {
    return query instanceof WithinDegree && query.degree_ == this.degree_ &&
        (!query.query_ && !this.query_ ||
            this.query_ && this.query_.equals(query.query_));
  }

  /**
   * Returns true if any element of the set returns true for the given fn.
   * Always returns false if the set is the empty set.
   * @param {!Set} set The set to check for a match.
   * @param {!Function} fn The function used to test the set.
   * @return {boolean} True if the function returns true for any element of the
   *     set.
   */
  some_(set, fn) {
    let returnVal = false;
    set.forEach((elem) => {
      returnVal = returnVal || fn(elem);
    });
    return returnVal;
  }
}
