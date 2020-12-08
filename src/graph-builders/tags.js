/**
 * @license
 * Copyright 2020 Obsidian Better Graph View
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class for a graph builder that shows connections between tags.
 * @author bekawestberg@gmail.com (Beka Westberg)
 */
'use strict';


import {getAllTags} from 'obsidian';
import {GraphBuilder} from './i-graphbuilder';
import {Edge} from '../graph/edge';
import {GraphBuilderRegistry} from './graph-builders-registry';
import {fileToId, getEdgeId, tagToId} from '../utils/ids';
import {TagNode} from '../graph/tag-node';
import {NoteNode} from '../graph/note-node';


const NOTES = 'notes';

export class TagsGraphBuilder extends GraphBuilder {
  /**
   * Returns the display name of this graph builder.
   * @return {string} The display name of this graph builder.
   */
  getDisplayName() {
    return 'Tags';
  }

  /**
   * Returns the configuration of this graph builder.
   * @return {!Array}
   */
  getConfig() {
    return [
      {
        type: 'toggle',
        id: NOTES,
        displayText: 'Notes',
        default: false,
      },
    ]
  };

  /**
   * Generates a graph that shows the connections between tags. Two tags are
   * connected if there are one or more notes containing both tags.
   * @param {!Map<string, *>} config The current configuration of the graph.
   * @param {!Vault} vault The vault to use to generate the graph.
   * @param {!MetadataCache} metadataCache The metadata cache used to generate
   *     the graph.
   */
  generateGraph(config, vault, metadataCache) {
    const files = vault.getMarkdownFiles();
    if (!files) {
      return;
    }

    this.addTags_(files, metadataCache);
    if (config.get(NOTES)) {
      this.addNotes_(files, metadataCache);
    }

    this.trigger('structure-update', this.graph_);
  }

  /**
   * Called when the config updates. Adds or removes nodes and edges as
   * necessary.
   * @param {!Map<string, *>} oldConfig The old configuration.
   * @param {!Map<string, *>} newConfig The new configuration.
   * @param {!Vault} vault The vault to used to generate the graph.
   * @param {!MetadataCache} metadataCache The metadata cache used to generate
   *     the graph.
   */
  onConfigUpdate(oldConfig, newConfig, vault, metadataCache) {
    const files = vault.getMarkdownFiles();
    if (!files) {
      return;
    }

    if (oldConfig.get(NOTES) != newConfig.get(NOTES)) {
      if (newConfig.get(NOTES)) {
        this.addNotes_(files, metadataCache);
      } else {
        this.removeNotes_(files, metadataCache);
      }
    }

    this.trigger('structure-update', this.graph_);
  }

  /**
   * Adds nodes representing tags to the graph, and connects them. Two tags are
   * connected if there are one or more notes containing both tags.
   * @param {!Array<!TFile>} files All of the files in the vault.
   * @param {!MetadataCache} metadataCache The metadata cache used to generate
   *     the graph.
   * @private
   */
  addTags_(files, metadataCache) {
    const createdTagIds = new Set();
    const createdEdgeIds = new Set();

    files.forEach((file) => {
      const cache = metadataCache.getFileCache(file);
      const tags = getAllTags(cache);

      // Create nodes.
      tags.forEach((tag) => {
        const tagId = tagToId(tag);
        if (!createdTagIds.has(tagId)) {
          createdTagIds.add(tagId);
          this.graph_.addNode(new TagNode(tag));
        }
      });

      // Create edges.
      tags.forEach((tag1) => {
        tags.forEach((tag2) => {
          if (tag1 == tag2) {
            return;
          }
          const tag1Id = tagToId(tag1);
          const tag2Id = tagToId(tag2);
          const edge1Id = getEdgeId(tag1Id, tag2Id);
          const edge2Id = getEdgeId(tag2Id, tag1Id);
          if (createdEdgeIds.has(edge1Id) || createdEdgeIds.has(edge2Id)) {
            return;
          }
          createdEdgeIds.add(edge1Id);
          createdEdgeIds.add(edge2Id);
          this.graph_.addEdge(new Edge(edge1Id, tag1Id, tag2Id));
          this.graph_.addEdge(new Edge(edge2Id, tag2Id, tag1Id));
        })
      })
    });
  }

  /**
   * Adds nodes representing existing notes to the graph. Only adds notes which
   * include tags.
   * @param {!Array<!TFile>} files All of the files in the vault.
   * @param {!MetadataCache} metadataCache The metadata cache used to generate
   *     the graph.
   * @private
   */
  addNotes_(files, metadataCache) {
    const createdEdgeIds = new Set();

    files.forEach((file) => {
      const cache = metadataCache.getFileCache(file);
      if (!cache.tags) {
        return;
      }

      this.graph_.addNode(new NoteNode(file, metadataCache));

      const fileId = fileToId(file, metadataCache);
      getAllTags(cache).forEach((tag) => {
        const tagId = tagToId(tag);
        const edgeId = getEdgeId(fileId, tagId);
        if (createdEdgeIds.has(edgeId)) {
          return;
        }
        createdEdgeIds.add(edgeId);
        this.graph_.addEdge(new Edge(edgeId, fileId, tagId));
      })
    })
  }

  /**
   * Removes nodes representing notes from the graph.
   * @param {!Array<!TFile>} files All of the files in the vault.
   * @param {!MetadataCache} metadataCache The metadata cache used to generate
   *     the graph.
   * @private
   */
  removeNotes_(files, metadataCache) {
    this.graph_.forEachNode((node) => {
      if (node instanceof NoteNode) {
        this.graph_.removeNode(node.id);
      }
    })
  }
}

GraphBuilderRegistry.register('tags-graph-builder', TagsGraphBuilder);
