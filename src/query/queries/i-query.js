/**
 * @license
 * Copyright 2020 Obsidian Better Graph View
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Interface for a query.
 * @author bekawestberg@gmail.com (Beka Westberg)
 */
'use strict';


export class Query {
  /**
   * Constructs a query given the universe of QueryableNodes.
   */
  constructor() {}

  /**
   * Runs the query.
   * @param {!Set<!QueryableNode>} universe The universe of QueryableNodes (akin
   *     to set theory).
   * @return {!Set<!QueryableNode>}
   */
  run(universe) {
    return new Set();
  };

  /**
   * Returns true if the two queries are equal, false otherwise.
   * @param {!Query} query The query to compare against.
   */
  equals(query) { }
}
