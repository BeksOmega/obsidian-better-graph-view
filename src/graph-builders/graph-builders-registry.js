/**
 * @license
 * Copyright 2020 Obsidian Better Graph View
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class for a graph builders registry.
 * @author bekawestberg@gmail.com (Beka Westberg)
 */
'use strict';


import {GraphBuilder} from './i-graphbuilder';


export const GraphBuilderRegistry = {};

/**
 * Map of string ids to graph builder constructors.
 * @type {!Map<string, function(new:GraphBuilder)>}
 */
GraphBuilderRegistry.graphBuilders = new Map();

/**
 * Registers a graph builder.
 * @param {string} id The id of the graph builder.
 * @param {function(new:GraphBuilder)} graphBuilderFn The constructor for the
 *     graph builder.
 */
GraphBuilderRegistry.register = function(id, graphBuilderFn) {
  if (GraphBuilderRegistry.graphBuilders.has(id)) {
    return;
  }
  GraphBuilderRegistry.graphBuilders.set(id, graphBuilderFn);
};
