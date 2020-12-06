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
import {EmbedCache} from 'obsidian';
import {attachmentToId} from '../utils/ids';
import {ATTACHMENTS_PREFIX} from '../utils/constants';

export class AttachmentNode extends Node {
  /**
   * Constructs a node representing an attachment.
   * @param {!EmbedCache} attachment The attachment.
   */
  constructor(attachment) {
    super(attachmentToId(attachment), attachment.link);

    this.classes_.push('attachment');

    const types = attachment.link.split('.');
    for (let i = 1; i < types.length; i++) {
      this.classes_.push(ATTACHMENTS_PREFIX + types[i]);
    }
  }
}
