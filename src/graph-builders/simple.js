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


import {Vault, MetadataCache} from "obsidian";
import {GraphBuilder} from "./i-graphbuilder";
import {Node} from "../../sigma/src/classes/sigma.classes.node";
import {Edge} from "../../sigma/src/classes/sigma.classes.edge";
import {GraphBuilderRegistry} from './graph-builders-registry';


export class SimpleGraphBuilder extends GraphBuilder {
  /**
   * Generates a simple graph for the given vault. Looks very similar to the
   * default obsidian graph.
   * @param {Vault} vault The vault to use to generate the graph.
   * @param {MetadataCache} metadataCache The metadata cache used to generate
   *     the graph.
   * @return {{nodes: !Array<Node>, edges: !Array<Edge>}} A simple graph very
   *     similar to the default obsidian graph.
   */
  generateGraph(vault, metadataCache) {
    const g = {
      nodes: [],
      edges: [],
    };
    const nodeIds = new Set();
    const files = vault.getMarkdownFiles();
    if (!files) {
      return;
    }
    const numFiles = files.length;

    // Add existing files as nodes.
    files.forEach((file) => {
      const id = metadataCache.fileToLinktext(file, file.path);
      nodeIds.add(id);
      g.nodes.push(new Node(
          id,
          file.basename,
          numFiles * 10 * Math.random(),
          numFiles * 10 * Math.random(),
          1,
          '#666'
      ));
    });

    // Add links as edges and not-yet-created files as nodes.
    files.forEach((file) => {
      const fileId = metadataCache.fileToLinktext(file, file.path);
      const cache = metadataCache.getFileCache(file);
      if (!cache.links) {
        return;
      }

      cache.links.forEach((ref) => {
        if (!nodeIds.has(ref.link)) {  // Ref must not exist yet. Create node.
          nodeIds.add(ref.link);
          g.nodes.push(new Node(
              ref.link,
              ref.link,
              numFiles * 10 * Math.random(),
              numFiles * 10 * Math.random(),
              1,
              '#ccc'
          ));
        }
        g.edges.push(new Edge(
            fileId + ' to ' + ref.link,
            fileId,
            ref.link,
            1,
            '#ccc',
        ));
      })
    });

    return g;
  }

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
        id: 'tags',
        displayText: 'Tags',
      },
    ]
  };
}

GraphBuilderRegistry.register('simple-graph-builder', SimpleGraphBuilder);
