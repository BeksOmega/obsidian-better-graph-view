/**
 * @license
 * Copyright 2020 Obsidian Better Graph View
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class for a model of a note node in a graph.
 * @author bekawestberg@gmail.com (Beka Westberg)
 */
'use strict';


import {Node} from './node';
import {TFile} from 'obsidian';
import {MetadataCache} from 'obsidian';
import {TAGS_PREFIX, FOLDERS_PREFIX} from '../utils/constants';
import {fileToId} from '../utils/ids';


export class NoteNode extends Node {
  /**
   * Constructs a node representing an existing note.
   * @param {!TFile} file The note.
   * @param {!MetadataCache} metadataCache The metadata cache.
   */
  constructor(file, metadataCache) {
    super(fileToId(file, metadataCache), file.basename);

    this.name_ = file.name;

    this.path_ = file.path;

    this.tags_ = [];

    this.classes_.push('existing-note');

    const cache = metadataCache.getFileCache(file);
    if (cache.tags) {
      cache.tags.forEach(tagCache => {
        // Cut off octothorpe.
        const tag = tagCache.tag.substring(1);
        this.tags_.push(tag);
        this.classes_.push(TAGS_PREFIX + tag);
      });
    }

    const folders = file.path.split('/');
    for (let i = 0; i < folders.length - 1; i++) {
      this.classes_.push(FOLDERS_PREFIX + folders[i]);
    }
  }

  /**
   * Returns the title of this note.
   * @return {string} The title of this note.
   */
  getTitle() {
    return this.name_;
  }

  /**
   * Returns the folder path of this note.
   * @return {string} The folder path of this note.
   */
  getFolderPath() {
    const match = this.path_.match(/(.+)\//);
    return match ? match[1] : '';
  }

  /**
   * Returns an array of the tags of this note.
   * @return {!Array<!String>} An array of the tags of this note.
   */
  getTags() {
    return this.tags_;
  }
}
