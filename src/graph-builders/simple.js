/**
 * @license
 * Copyright 2020 Obsidian Better Graph View
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class for a graph builder that constructs a graph very similar
 *     to the default obsidian graph.
 * @author bekawestberg@gmail.com (Beka Westberg)
 */
'use strict';


import {Vault, MetadataCache, TFile, getAllTags} from 'obsidian';
import {GraphBuilder} from './i-graphbuilder';
import {Node} from '../../sigma/src/classes/sigma.classes.node';
import {Edge} from '../../sigma/src/classes/sigma.classes.edge';
import {GraphBuilderRegistry} from './graph-builders-registry';


const TAGS = 'tags';
const ATTACHMENTS = 'attachments';
const EXISTING_FILES_ONLY = 'existingFilesOnly';
const ORPHANS = 'orphans';

export class SimpleGraphBuilder extends GraphBuilder {
  /**
   * Returns the display name of this graph builder.
   * @return {string} The display name of this graph builder.
   */
  getDisplayName() {
    return 'Simple';
  }

  /**
   * Returns the configuration of this graph builder.
   * @return {[]}
   */
  getConfig() {
    return [
      {
        type: 'toggle',
        id: TAGS,
        displayText: 'Tags',
        default: false,
      },
      {
        type: 'toggle',
        id: ATTACHMENTS,
        displayText: 'Attachments',
        default: false,
      },
      {
        type: 'toggle',
        id: EXISTING_FILES_ONLY,
        displayText: 'Existing files only',
        default: false,
      },
      {
        type: 'toggle',
        id: ORPHANS,
        displayText: 'Orphans',
        default: true,
      },
    ]
  };

  /**
   * Generates a simple graph for the given vault. Looks very similar to the
   * default obsidian graph.
   * @param {Map<string, *>} config The current configuration of the graph.
   * @param {Vault} vault The vault to use to generate the graph.
   * @param {MetadataCache} metadataCache The metadata cache used to generate
   *     the graph.
   */
  generateGraph(config, vault, metadataCache) {
    const files = vault.getMarkdownFiles();
    if (!files) {
      return;
    }

    this.addExistingFiles_(files, metadataCache);
    if (config.get(TAGS)) {
      this.addTags_(files, metadataCache);
    }
    if (!config.get(EXISTING_FILES_ONLY)) {
      this.addNonExistingFiles_(files, metadataCache);
    }
  }

  /**
   * Called when the config updates. Adds or removes nodes and edges as
   * necessary.
   * @param {Object} oldConfig The old configuration.
   * @param {Object} newConfig The new configuration.
   * @param {Vault} vault The vault to used to generate the graph.
   * @param {MetadataCache} metadataCache The metadata cache used to generate
   *     the graph.
   */
  onConfigUpdate(oldConfig, newConfig, vault, metadataCache) {
    const files = vault.getMarkdownFiles();
    if (!files) {
      return;
    }

    if (oldConfig.get(TAGS) != newConfig.get(TAGS)) {
      if (newConfig.get(TAGS)) {
        this.addTags_(files, metadataCache);
      } else {
        this.removeTags_(files, metadataCache);
      }
    }
    if (oldConfig.get(EXISTING_FILES_ONLY) != newConfig.get(EXISTING_FILES_ONLY)) {
      if (newConfig.get(EXISTING_FILES_ONLY)) {
        this.removeNonExistingFiles_(files, metadataCache);
      } else {
        this.addNonExistingFiles_(files, metadataCache);
      }
    }
  }

  /**
   * Adds all of the files in 'files' to the graph, and connects them.
   * @param {!Array<!TFile>} files All of the files in the vault.
   * @param {!MetadataCache} metadataCache The metadata cache used to generate
   *     the graph.
   * @private
   */
  addExistingFiles_(files, metadataCache) {
    const existingFileIds = new Set();

    // Create nodes.
    files.forEach((file) => {
      const id = metadataCache.fileToLinktext(file, file.path);
      existingFileIds.add(id);
      this.graph_.addNode(new Node(
          id,
          file.basename,
          200 * Math.random(),
          200 * Math.random(),
          1,
          '#666'
      ));
    });

    // Create edges.
    files.forEach((file) => {
      const fileId = metadataCache.fileToLinktext(file, file.path);
      const cache = metadataCache.getFileCache(file);
      if (!cache.links) {
        return;
      }
      cache.links.forEach((ref) => {
        if (!existingFileIds.has(ref.link)) {
          return;
        }
        this.graph_.addEdge(new Edge(
            fileId + ' to ' + ref.link,
            fileId,
            ref.link,
            1,
            '#ccc',
        ));
      })
    });
  }

  /**
   * Adds all of the files that are linked, but not created, to the graph.
   * @param {!Array<TFile>} files All of the existing files in the vault.
   * @param {!MetadataCache} metadataCache The metadata cache used to generate
   *     the graph.
   * @private
   */
  addNonExistingFiles_(files, metadataCache) {
    const existingFileIds = new Set();
    files.forEach((file) => {
      existingFileIds.add(metadataCache.fileToLinktext(file, file.path));
    });

    const createdNonExistingIds = new Set();
    files.forEach((file) => {
      const fileId = metadataCache.fileToLinktext(file, file.path);
      const cache = metadataCache.getFileCache(file);
      if (!cache.links) {
        return;
      }

      cache.links.forEach((ref) => {
        if (existingFileIds.has(ref.link)) {
          return;
        }
        if (!createdNonExistingIds.has(ref.link)) {
          createdNonExistingIds.add(ref.link);
          this.graph_.addNode(new Node(
              ref.link,
              ref.link,
              200 * Math.random(),
              200 * Math.random(),
              1,
              '#ccc'
          ));
        }
        this.graph_.addEdge(new Edge(
            fileId + ' to ' + ref.link,
            fileId,
            ref.link,
            1,
            '#ccc',
        ));
      })
    });
  }

  /**
   * Removes all of the files that are linked, but not created, from the graph.
   * @param {!Array<TFile>} files All of the existing files in the vault.
   * @param {!MetadataCache} metadataCache The metadata cache used to generate
   *     the graph.
   * @private
   */
  removeNonExistingFiles_(files, metadataCache) {
    const existingFileIds = new Set();
    files.forEach((file) => {
      existingFileIds.add(metadataCache.fileToLinktext(file, file.path));
    });

    for (const node of this.graph_.nodes()) {
      if (!existingFileIds.has(node.id)) {
        this.graph_.dropNode(node.id);
      }
    }
  }

  /**
   * Adds tags to the graph. Tags are only connected to existing file nodes.
   * @param {!Array<TFile>} files All of the existing files in the vault.
   * @param {!MetadataCache} metadataCache The metadata cache used to generate
   *     the graph.
   * @private
   */
  addTags_(files, metadataCache) {
    const createdTagIds = new Set();
    files.forEach((file) => {
      const fileId = metadataCache.fileToLinktext(file, file.path);
      const cache = metadataCache.getFileCache(file);
      const tags = getAllTags(cache);
      tags.forEach((tag) => {
        const tagId = 'tag' + tag;
        if (!createdTagIds.has(tagId)) {
          createdTagIds.add(tagId);
          const node = new Node(
              tagId,
              tag,
              200 * Math.random(),
              200 * Math.random(),
              1,
              '#800080'
          );
          node.isTag = true;
          this.graph_.addNode(node);
        }
        this.graph_.addEdge(new Edge(
            fileId + ' to ' + tagId,
            fileId,
            tagId,
            1,
            '#ccc'
        ));
      })
    })
  }

  /**
   * Removes tags from the graph.
   * @param {!Array<TFile>} files All of the existing files in the vault.
   * @param {!MetadataCache} metadataCache The metadata cache used to generate
   *     the graph.
   * @private
   */
  removeTags_(files, metadataCache) {
    for (const node of this.graph_.nodes()) {
      if (node.isTag) {
        this.graph_.dropNode(node.id);
      }
    }
  }
}

GraphBuilderRegistry.register('simple-graph-builder', SimpleGraphBuilder);
