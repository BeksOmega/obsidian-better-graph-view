/**
 * @license
 * Copyright 2020 Obsidian Better Graph View
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class for a model of a non-existing note node in a graph.
 * @author bekawestberg@gmail.com (Beka Westberg)
 */
'use strict';

import {Node} from './node';
import {FOLDERS_PREFIX} from '../utils/constants';
import {linkCacheToId} from '../utils/ids';

export class NonExistingNoteNode extends Node {
  /**
   * Constructs a node representing a non-existing note.
   * @param {LinkCache}linkCache The link cache representing the link.
   */
  constructor(linkCache) {
    super(linkCacheToId(linkCache), linkCache.link);

    this.classes_.push('non-existing-note');

    const folders = linkCache.link.split('/');
    for (let i = 0; i < folders.length - 1; i++) {
      this.classes_.push(FOLDERS_PREFIX + folders[i]);
    }
  }
}
