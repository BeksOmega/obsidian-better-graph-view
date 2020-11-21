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


import {Vault} from "obsidian";
import {Node} from "../../sigma/src/classes/sigma.classes.node";
import {Edge} from "../../sigma/src/classes/sigma.classes.edge";


/**
 * Interface for a graph builder, which is an object that builds a graph that
 * sigma.js will accept.
 * @interface
 */
export class GraphBuilder {
  /**
   * Generates a graph for the given vault.
   * @param {Vault} vault The vault to use to generate the graph.
   * @return {{nodes: !Array<Node>, edges: !Array<Edge>}} A valid graph which
   *     sigma.js will accept.
   */
  generateGraph(vault) {
    return {
      nodes: [],
      edges: [],
    }
  }
}
