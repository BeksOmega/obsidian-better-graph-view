/**
 * @license
 * Copyright 2020 Obsidian Better Graph View
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A query that returns all nodes that have the given tag.
 * @author bekawestberg@gmail.com (Beka Westberg)
 */
'use strict';


import {Query} from '../queries/i-query';
import {QueryableNoteNode} from "../queryable-nodes/queryable-note-node";

export class WithTag extends Query {
  /**
   * Constructs a WithTag query.
   * @param {?string} tag The tag the note must contain.
   */
  constructor(tag) {
    super();

    /**
     * The tag the note must contain.
     * @type {string}
     * @private
     */
    this.tag_ = tag || '';
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
      // TODO: Add support for tag nodes.
      if (node instanceof QueryableNoteNode) {
        if (node.getTags().some((tag) => tag == this.tag_)) {
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
    return query instanceof WithTag && query.tag_ == this.tag_;
  }
}
