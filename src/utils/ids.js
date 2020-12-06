/**
 * @license
 * Copyright 2020 Obsidian Better Graph View
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview File holds a bunch of utility functions for creating ids.
 * @author bekawestberg@gmail.com (Beka Westberg)
 */
'use strict';


/**
 * Returns an id for the given file.
 * @param {!TFile} file The file to get an id for.
 * @param {!MetadataCache} metadataCache The metadata cache.
 * @return {string} The created id.
 */
export function fileToId(file, metadataCache) {
  return metadataCache.fileToLinktext(file, file.path);
}

/**
 * Returns an id for the given link.
 * @param {!LinkCache} linkCache The given link to get an id for.
 * @return {string} The created id.
 */
export function linkCacheToId(linkCache) {
  return linkCache.link;
}

/**
 * Returns an id for the given tag.
 * @param {string} tag The tag to get an id for.
 * @return {string} The created id.
 */
export function tagToId(tag) {
  return 'tag' + tag.substring(1);
}

/**
 * Returns an id for the given attachment.
 * @param {!EmbedCache} attachment The attachment to get an id for.
 * @return {string} The created id.
 */
export function attachmentToId(attachment) {
  return 'attachment' + attachment.link;
}

/**
 * Returns an id for the given edge.
 * @param {string} sourceId The id of the source node for the edge.
 * @param {string} targetId The id of the target node for the edge.
 * @return {string} The created id.
 */
export function getEdgeId(sourceId, targetId) {
  return sourceId + '-to-' + targetId;
}
