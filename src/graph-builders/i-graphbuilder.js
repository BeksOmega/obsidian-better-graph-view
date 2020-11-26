/**
 * @license
 * Copyright 2020 Obsidian Better Graph View
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Interface for a graph builder, which is an object that builds
 *     a graph that sigma.js will accept.
 * @author bekawestberg@gmail.com (Beka Westberg)
 */
'use strict';


import {Vault, MetadataCache} from "obsidian";
import {Node} from "../../sigma/src/classes/sigma.classes.node";
import {Edge} from "../../sigma/src/classes/sigma.classes.edge";


/**
 * Interface for a graph builder, which is an object that builds a graph that
 * sigma.js will accept.
 * @interface
 */
export class GraphBuilder {

  /**
   * Sets the graph we will build.
   * @param {Object} graph The graph we will build.
   */
  setGraph(graph) {
    this.graph_ = graph;
  }

  /**
   * Generates a graph for the given vault.
   * @param {Vault} vault The vault to used to generate the graph.
   * @param {MetadataCache} metadataCache The metadata cache used to generate
   *     the graph.
   */
  generateGraph(config, vault, metadataCache) {}

  /**
   * Returns the display name of this graph builder.
   * @return {string} The display name of this graph builder.
   */
  getDisplayName() {
    return 'Graph builder';
  }

  /**
   * Returns all of the configuration options for the graph builder. When the
   * config gets passed back to the builder the ids will be the property names.
   *
   * Toggleable option:
   * {
   *   type: 'toggle',
   *   displayText: string,
   *   id: string,
   *   default: boolean? (defaults to false)
   * }
   *
   * Slider option:
   * {
   *   type: 'slider',
   *   displayText: string,
   *   id: string,
   *   min: number?, (defaults to 0)
   *   max: number?, (defaults to 10)
   *   step: number? (defaults to 1)
   *   default: number? (defaults to 0)
   * }
   *
   * Dropdown option:
   * {
   *   type: 'dropdown',
   *   displayText: string,
   *   id: string,
   *   optionList: [
   *     {
   *       id: string,
   *       displayText: string
   *     }
   *   ],
   *   default: string? (defaults to id of first option.)
   * }
   * @returns {!Array}
   */
  getConfig() {
    return [];
  }

  /**
   * Called when the configuration updates. Graph should be modified
   * accordingly.
   * @param {!Object} oldConfig The old configuration.
   * @param {!Object} newConfig The new configuration.
   */
  onConfigUpdate(oldConfig, newConfig) {}
}
