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

    this.classes_.push('existing-note');

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
}
