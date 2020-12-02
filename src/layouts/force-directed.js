/**
 * @license
 * Copyright 2020 Obsidian Better Graph View
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class for the first force-directed layout algorithm. Layout
 *     algorithms define where the nodes are positioned in the. They do *not*
 *     define which nodes are connected to other nodes (that is the job of a
 *     graph builder).
 * @author bekawestberg@gmail.com (Beka Westberg)
 */
'use strict';

import {forceSimulation, forceCenter, forceCollide} from 'd3-force';
import {Layout} from './i-layout';
import {Graph} from '../graph/graph';

export class ForceDirectedLayout extends Layout {
  constructor() {
    super();
    /**
     * The current graph being operated on by this layout.
     * @type {Graph}
     * @private
     */
    this.graph_ = null;

    /**
     * The force simulation associated with this layout.
     * @type {!Object}
     */
    this.simulation_ = forceSimulation();

    this.simulation_
        .force('collide', forceCollide(32))
        .force('center', forceCenter(250, 450));

    this.simulation_.on('tick', this.onSimulationUpdate.bind(this));
  }

  /**
   * Called when the structure of the graph updates.
   * @param {Graph} graph The graph that has been updated.
   */
  onGraphUpdate(graph) {
    this.graph_ = graph;
    this.simulation_
        .nodes(graph.getNodes())
        .restart();
  }

  /**
   * Called when the simulation updates.
   */
  onSimulationUpdate() {
    this.trigger('layout-update', this.graph_);
  }
}
