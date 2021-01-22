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
   * @param {!Set<!QueryableNode>} universe The universe of QueryableNodes (akin
   *     to set theory).
   * @param {...(!Query|*)} params The other params for this query.
   */
  constructor(universe, ...params) {
    this.universe_ = universe;
    this.params_ = params;
  }

  /**
   * Runs the query.
   * @return {!Set<!QueryableNode>}
   */
  run() {
    return new Set();
  };
}
