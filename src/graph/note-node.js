/**
 * @license
 * Copyright 2020 Obsidian Better Graph View
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class for a model of a node in a graph.
 * @author bekawestberg@gmail.com (Beka Westberg)
 */
'use strict';


import {Node} from "./node";
import {TFile} from 'obsidian';
import {MetadataCache} from 'obsidian';
import {TAGS_PREFIX, FOLDERS_PREFIX} from '../utils/constants';


export class NoteNode extends Node {
  /**
   * Constructs a node representing an existing note.
   * @param {!TFile} file The note.
   * @param {!MetadataCache} metadataCache The metadata cache.
   */
  constructor(file, metadataCache) {
    const id = metadataCache.fileToLinktext(file, file.path);
    super(id, file.basename);

    /**
     * Css classes associated with this note node. Includes tags and folders.
     * @type {!Array<string>}
     * @private
     */
    this.classes_ = [];

    const cache = metadataCache.getFileCache(file);
    if (cache.tags) {
      cache.tags.forEach(tagCache =>
          this.classes_.push(TAGS_PREFIX + tagCache.tag.substring(1)));
    }

    const folders = file.path.split('/');
    for (let i = 0; i < folders.length - 1; i++) {
      this.classes_.push(FOLDERS_PREFIX + folders[i]);
    }
  }

  /**
   * Returns the css class names associated with this node.
   * @return {!Array<string>} The css class names associated with this node.
   */
  getClasses() {
    return [...super.getClasses(), ...this.classes_];
  }
}
