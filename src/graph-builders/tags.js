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


import {GraphBuilder} from './i-graphbuilder';
import {Node} from '../graph/node';
import {Edge} from '../graph/edge';
import {GraphBuilderRegistry} from './graph-builders-registry';


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
      if (!cache.tags) {
        return;
      }

      // Create nodes.
      cache.tags.forEach((tagCache) => {
        if (!createdTagIds.has(tagCache.tag)) {
          createdTagIds.add(tagCache.tag);
          this.graph_.addNode(new Node(tagCache.tag, tagCache.tag));
        }
      });

      // Create edges.
      cache.tags.forEach((tagCache1) => {
        cache.tags.forEach((tagCache2) => {
          if (tagCache1.tag == tagCache2.tag) {
            return;
          }
          const edgeId1 = tagCache1.tag + ' to ' + tagCache2.tag;
          const edgeId2 = tagCache2.tag + ' to ' + tagCache1.tag;
          if (createdEdgeIds.has(edgeId1) || createdEdgeIds.has(edgeId2)) {
            return;
          }
          createdEdgeIds.add(edgeId1);
          createdEdgeIds.add(edgeId2);
          this.graph_.addEdge(new Edge(edgeId1, tagCache1.tag, tagCache2.tag));
          this.graph_.addEdge(new Edge(edgeId2, tagCache2.tag, tagCache1.tag));
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

      const fileId = metadataCache.fileToLinktext(file, file.path);
      const node = new Node(fileId, file.basename);
      node.isNote = true;
      this.graph_.addNode(node);

      cache.tags.forEach((tagCache) => {
        const edgeId = fileId + ' to ' + tagCache.tag;
        if (createdEdgeIds.has(edgeId)) {
          return;
        }
        createdEdgeIds.add(edgeId);
        this.graph_.addEdge(new Edge(edgeId, fileId, tagCache.tag));
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
      if (node.isNote) {
        this.graph_.removeNode(node.id);
      }
    })
  }
}

GraphBuilderRegistry.register('tags-graph-builder', TagsGraphBuilder);
