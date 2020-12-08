/**
 * @license
 * Copyright 2020 Obsidian Better Graph View
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class for a model of a tag node in a graph.
 * @author bekawestberg@gmail.com (Beka Westberg)
 */
'use strict';


import {Node} from './node';
import {TAGS_PREFIX} from '../utils/constants';
import {tagToId} from '../utils/ids';


export class TagNode extends Node {
  /**
   * Constructs a node representing a tag.
   * @param {string} tag The tag this node is representing.
   */
  constructor(tag) {
    super(tagToId(tag), tag);

    this.classes_.push('tag');
    this.classes_.push(TAGS_PREFIX + tag.substring(1));
  }
}
