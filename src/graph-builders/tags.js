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
import {Node} from "../../sigma/src/classes/sigma.classes.node";
import {Edge} from "../../sigma/src/classes/sigma.classes.edge";
import {GraphBuilderRegistry} from "./graph-builders-registry";


const NOTES = 'notes';
const MULT = 5;

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
   * Generates a graph that shows the connections between tags. Tags are
   * connected if they appear together.
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
  }

  /**
   * Adds nodes representing tags to the graph, and connects them.
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
          this.graph_.addNode(new Node(
              tagCache.tag,
              tagCache.tag,
              MULT * Math.random(),
              MULT * Math.random(),
              1,
              '#666'
          ));
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
          this.graph_.addEdge(new Edge(
              edgeId1,
              tagCache1.tag,
              tagCache2.tag,
              1,
              '#ccc'
          ));
          this.graph_.addEdge(new Edge(
              edgeId2,
              tagCache2.tag,
              tagCache1.tag,
              1,
              '#ccc'
          ));
        })
      })
    });
  }
}

GraphBuilderRegistry.register('tags-graph-builder', TagsGraphBuilder);
