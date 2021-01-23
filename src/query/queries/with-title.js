/**
 * @license
 * Copyright 2020 Obsidian Better Graph View
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A query that returns all nodes with a matching title.
 * @author bekawestberg@gmail.com (Beka Westberg)
 */
'use strict';


import {QueryableNoteNode} from '../queryable-nodes/queryable-note-node';
import {Query} from '../queries/i-query';

export class WithTitle extends Query {
  /**
   * Constructs a WithTitle query given the universe of QueryableNodes.
   * @param {string} title The title the note's title must contain.
   */
  constructor(title) {
    super();

    this.title_ = title || '';
  }

  /**
   * Runs the query.
   * @param {!Set<!QueryableNode>} universe The universe of QueryableNodes (akin
   *     to set theory).
   * @return {!Set<!QueryableNode>}
   */
  run(universe) {
    const set = new Set();
    universe.forEach((node) => {
      if (node instanceof QueryableNoteNode &&
          node.getTitle().contains(this.title_)) {
        set.add(node);
      }
    });
    return set;
  };

  /**
   * Returns true if the two queries are equal, false otherwise.
   * @param {!Query} query The query to compare against.
   */
  equals(query) {
    return query instanceof WithTitle && query.title_ == this.title_;
  }
}
