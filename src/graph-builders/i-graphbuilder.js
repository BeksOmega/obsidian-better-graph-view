/**
 * @license
 * Copyright 2020 Obsidian Better Graph View
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Interface for a graph builder, which is an object that builds
 *     a model of a graph.
 * @author bekawestberg@gmail.com (Beka Westberg)
 */
'use strict';


import {Vault, MetadataCache, Events, EventRef} from 'obsidian';
import {Graph} from '../graph/graph';


/**
 * Interface for a graph builder, which is an object that builds a model of a
 * graph.
 * @interface
 */
export class GraphBuilder extends Events {
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
   * Sets the graph we will build.
   * @param {Graph} graph The graph we will build.
   */
  setGraph(graph) {
    this.graph_ = graph;
  }

  /**
   * Returns the graph of the graph builder.
   * @return {Graph} The graph of the graph builder.
   */
  getGraph() {
    return this.graph_;
  }

  /**
   * Generates a graph for the given vault.
   * @param {!Map<string, *>} config The current configuration of the graph
   *     builder.
   * @param {!Vault} vault The vault to used to generate the graph.
   * @param {!MetadataCache} metadataCache The metadata cache used to generate
   *     the graph.
   */
  generateGraph(config, vault, metadataCache) {}

  /**
   * Called when the configuration updates. Graph should be modified
   * accordingly.
   * @param {!Map<string, *>} oldConfig The old configuration.
   * @param {!Map<string, *>} newConfig The new configuration.
   * @param {!Vault} vault The vault to used to generate the graph.
   * @param {!MetadataCache} metadataCache The metadata cache used to generate
   *     the graph.
   */
  onConfigUpdate(oldConfig, newConfig, vault, metadataCache) {}

  /**
   * Adds a listener to events from this graph builder.
   * @param {string} name The name of the event to listen to. Currently supports:
   *   - 'structure-update'
   * @param {function(*): *} callback The listener to call.
   * @param {?Object} ctx The context to call the event in.
   * @return {!EventRef} The reference to the subscribed event.
   * @throws If the passed name is not a valid event name.
   */
  on(name, callback, ctx) {
    if (name == 'structure-update') {
      return super.on(name, callback, ctx);
    } else {
      throw 'Unknown graph builder event: "' + name + '".';
    }
  }
}
