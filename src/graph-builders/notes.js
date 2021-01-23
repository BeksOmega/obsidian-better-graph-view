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
import {Node} from '../graph/node';
import {Edge} from '../graph/edge';
import {GraphBuilderRegistry} from './graph-builders-registry';
import {NoteNode} from '../graph/note-node';
import {NonExistingNoteNode} from '../graph/nonexisting-note-node';
import {TagNode} from '../graph/tag-node';
import {
  getEdgeId,
  fileToId,
  linkCacheToId,
  tagToId,
  attachmentToId
} from '../utils/ids';
import {AttachmentNode} from '../graph/attachment-node';
import {QueryableNoteNode} from '../query/queryable-nodes/queryable-note-node';


const TAGS = 'tags';
const ATTACHMENTS = 'attachments';
const EXISTING_FILES_ONLY = 'existingFilesOnly';
const ORPHANS = 'orphans';
const QUERY = 'query';

export class NotesGraphBuilder extends GraphBuilder {
  /**
   * Returns the display name of this graph builder.
   * @return {string} The display name of this graph builder.
   */
  getDisplayName() {
    return 'Notes';
  }

  /**
   * Returns the configuration of this graph builder.
   * @return {[]}
   */
  getConfig() {
    return [
      {
        type: 'query',
        id: QUERY,
        displayText: 'Query',
      },
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

    this.addExistingFiles_(files, metadataCache);
    if (config.get(TAGS)) {
      this.addTags_(files, metadataCache);
    }
    if (config.get(ATTACHMENTS)) {
      this.addAttachments_(files, metadataCache);
    }
    if (!config.get(EXISTING_FILES_ONLY)) {
      this.addNonExistingFiles_(files, metadataCache);
    }
    if (!config.get(ORPHANS)) {
      this.removeOrphans_(files, metadataCache);
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

    let triggerUpdate = oldConfig.get(ORPHANS) != newConfig.get(ORPHANS);

    this.addExistingFiles_(files, metadataCache);
    // We should add orphans just in case the other config options need them
    // available.
    this.addOrphans_(files, metadataCache);

    if (oldConfig.get(TAGS) != newConfig.get(TAGS)) {
      triggerUpdate = true;
      if (newConfig.get(TAGS)) {
        this.addTags_(files, metadataCache);
      } else {
        this.removeTags_(files, metadataCache);
      }
    }
    if (oldConfig.get(ATTACHMENTS) != newConfig.get(ATTACHMENTS)) {
      triggerUpdate = true;
      if (newConfig.get(ATTACHMENTS)) {
        this.addAttachments_(files, metadataCache);
      } else {
        this.removeAttachments_(files, metadataCache);
      }
    }
    if (oldConfig.get(EXISTING_FILES_ONLY) != newConfig.get(EXISTING_FILES_ONLY)) {
      triggerUpdate = true;
      if (newConfig.get(EXISTING_FILES_ONLY)) {
        this.removeNonExistingFiles_(files, metadataCache);
      } else {
        this.addNonExistingFiles_(files, metadataCache);
      }
    }
    if (oldConfig.get(QUERY) &&
        !oldConfig.get(QUERY).equals(newConfig.get(QUERY))) {
      triggerUpdate = true;
    }
    if (newConfig.get(QUERY)) {
      this.filterForQuery_(newConfig.get(QUERY));
    }

    // And remove any orphans once again (if orphans are disabled).
    if (!newConfig.get(ORPHANS)) {
      this.removeOrphans_(files, metadataCache)
    }

    if (triggerUpdate) {
      this.trigger('structure-update', this.graph_);
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
    const createdFileIds = new Set(this.graph_.getNodes().map(node => node.id));
    const createdEdgeIds = new Set(this.graph_.getEdges().map(edge => edge.id));

    // Create nodes.
    files.forEach((file) => {
      const id = fileToId(file, metadataCache);
      if (!createdFileIds.has(id)) {
        createdFileIds.add(id);
        this.graph_.addNode(new NoteNode(file, metadataCache));
      }
    });

    // Create edges.
    files.forEach((file) => {
      const fileId = fileToId(file, metadataCache);
      const cache = metadataCache.getFileCache(file);
      if (!cache.links) {
        return;
      }
      cache.links.forEach((ref) => {
        const linkId = linkCacheToId(ref);
        if (!createdFileIds.has(linkId)) {
          return;
        }
        const edgeId = getEdgeId(fileId, linkId);
        if (createdEdgeIds.has(edgeId)) {
          return;
        }
        createdEdgeIds.add(edgeId);
        this.graph_.addEdge(new Edge(edgeId, fileId, linkId));
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
    const createdNonExistingIds = new Set();
    const createdEdgeIds = new Set(this.graph_.getEdges().map(edge => edge.id));

    files.forEach((file) => {
      existingFileIds.add(metadataCache.fileToLinktext(file, file.path));
    });

    files.forEach((file) => {
      const fileId = fileToId(file, metadataCache);
      const cache = metadataCache.getFileCache(file);
      if (!cache.links) {
        return;
      }

      cache.links.forEach((ref) => {
        const linkId = linkCacheToId(ref);
        if (existingFileIds.has(linkId)) {
          return;
        }
        if (!createdNonExistingIds.has(linkId)) {
          createdNonExistingIds.add(linkId);
          this.graph_.addNode(new NonExistingNoteNode(ref));
        }
        const edgeId = getEdgeId(fileId, linkId);
        if (createdEdgeIds.has(edgeId)) {
          return;
        }
        createdEdgeIds.add(edgeId);
        this.graph_.addEdge(new Edge(edgeId, fileId, linkId));
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
    this.graph_.forEachNode((node) => {
      if (node instanceof NonExistingNoteNode) {
        this.graph_.removeNode(node.id);
      }
    });
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
    const createdEdgeIds = new Set();

    files.forEach((file) => {
      const fileId = metadataCache.fileToLinktext(file, file.path);
      const cache = metadataCache.getFileCache(file);
      const tags = getAllTags(cache);
      tags.forEach((tag) => {
        const tagId = tagToId(tag);
        if (!createdTagIds.has(tagId)) {
          createdTagIds.add(tagId);
          this.graph_.addNode(new TagNode(tag));
        }
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
   * Removes tags from the graph.
   * @param {!Array<TFile>} files All of the existing files in the vault.
   * @param {!MetadataCache} metadataCache The metadata cache used to generate
   *     the graph.
   * @private
   */
  removeTags_(files, metadataCache) {
    this.graph_.forEachNode((node) => {
      if (node instanceof TagNode) {
        this.graph_.removeNode(node.id);
      }
    });
  }

  /**
   * Adds attachments to the graph. Attachments are only connected to existing
   * file nodes.
   * @param {!Array<TFile>} files All of the existing files in the vault.
   * @param {!MetadataCache} metadataCache The metadata cache used to generate
   *     the graph.
   * @private
   */
  addAttachments_(files, metadataCache) {
    const createdAttachmentIds = new Set();
    const createdEdgeIds = new Set();
    files.forEach((file) => {
      const fileId = metadataCache.fileToLinktext(file, file.path);
      const cache = metadataCache.getFileCache(file);
      if (!cache.embeds) {
        return;
      }

      cache.embeds.forEach((attachment) => {
        const attachmentId = attachmentToId(attachment);
        if (!createdAttachmentIds.has(attachmentId)) {
          createdAttachmentIds.add(attachmentId);
          this.graph_.addNode(new AttachmentNode(attachment));
        }
        const edgeId = getEdgeId(fileId, attachmentId);
        if (createdEdgeIds.has(edgeId)) {
          return;
        }
        createdEdgeIds.add(edgeId);
        this.graph_.addEdge(new Edge(edgeId, fileId, attachmentId));
      });
    })
  }

  /**
   * Removes attachments from the graph.
   * @param {!Array<TFile>} files All of the existing files in the vault.
   * @param {!MetadataCache} metadataCache The metadata cache used to generate
   *     the graph.
   * @private
   */
  removeAttachments_(files, metadataCache) {
    this.graph_.forEachNode((node) => {
      if (node instanceof AttachmentNode) {
        this.graph_.removeNode(node.id);
      }
    });
  }

  /**
   * Removes any nodes from the graph that do not fulfill the query. This should
   * be run after other config options (eg existing files only).
   * @param {!Query} query The query used to filter the graph.
   * @private
   */
  filterForQuery_(query) {
    const nodes = new Set();
    this.graph_.getNodes().forEach((node) => {
      if (node instanceof NoteNode) {
        nodes.add(new QueryableNoteNode(this.graph_, node));
      }
    });
    const newNodes = new Set();
    query.run(nodes).forEach((node) => {
      newNodes.add(node.getNode());
    });
    console.log('before', nodes, 'after', newNodes);
    this.graph_.forEachNode((node) => {
      if (node instanceof  NoteNode && !newNodes.has(node)) {
        this.graph_.removeNode(node.id);
      }
    })
  }

  /**
   * Adds notes that have no connections to the graph.
   * @param {!Array<TFile>} files All of the existing files in the vault.
   * @param {!MetadataCache} metadataCache The metadata cache used to generate
   *     the graph.
   * @private
   */
  addOrphans_(files, metadataCache) {
    const existingNodeIds = new Set();
    this.graph_.forEachNode((node) => {
      existingNodeIds.add(node.id);
    });

    files.forEach((file) => {
      const id = metadataCache.fileToLinktext(file, file.path);
      if (!existingNodeIds.has(id)) {
        this.graph_.addNode(new Node(id, file.basename));
      }
    });
  }

  /**
   * Removes notes that have no connections from the graph.
   * @param {!Array<TFile>} files All of the existing files in the vault.
   * @param {!MetadataCache} metadataCache The metadata cache used to generate
   *     the graph.
   * @private
   */
  removeOrphans_(files, metadataCache) {
    const referencedNodeIds = new Set();

    this.graph_.forEachEdge((edge) => {
      referencedNodeIds.add(
          typeof edge.source == 'object' ? edge.source.id : edge.source);
      referencedNodeIds.add(
          typeof edge.target == 'object' ? edge.target.id : edge.target);

    });

    this.graph_.forEachNode((node) => {
      if (!referencedNodeIds.has(node.id)) {
        this.graph_.removeNode(node.id);
      }
    })
  }
}

GraphBuilderRegistry.register('notes-graph-builder', NotesGraphBuilder);
