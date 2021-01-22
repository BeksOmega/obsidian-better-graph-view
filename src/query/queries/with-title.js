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

export class WithTitle extends Query{
  /**
   * Constructs a WithTitle query given the universe of QueryableNodes.
   * @param {!Set<!QueryableNode>} universe The universe of QueryableNodes (akin
   *     to set theory).
   * @param {string} title The title the note's title must contain.
   */
  constructor(universe, title) {
    super(universe, undefined);

    this.title_ = title;
  }

  /**
   * Runs the query.
   * @return {!Set<!QueryableNode>}
   */
  run() {
    const set = new Set();
    this.universe_.forEach((node) => {
      if (node instanceof QueryableNoteNode &&
          node.getTitle().contains(this.title_)) {
        set.add(node);
      }
    });
    return set;
  };
}
