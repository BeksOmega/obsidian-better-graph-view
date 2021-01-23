/**
 * @license
 * Copyright 2020 Obsidian Better Graph View
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A query that returns all nodes within a given folder
 * @author bekawestberg@gmail.com (Beka Westberg)
 */
'use strict';


import {QueryableNoteNode} from '../queryable-nodes/queryable-note-node';
import {Query} from '../queries/i-query';

export class InFolder extends Query {
  /**
   * Constructs a InFolder query.
   * @param {?string} title The folder the note must be in.
   */
  constructor(folder) {
    super();

    /**
     * The string the note's title must contain.
     * @type {string}
     * @private
     */
    this.folder_ = folder || '';
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
      if (node instanceof QueryableNoteNode) {
        if (node.getFolderPath().contains(this.folder_)) {
          set.add(node);
        }
      } else {  // Let all other types of nodes pass.
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
    return query instanceof InFolder && query.folder_ == this.folder_;
  }
}
