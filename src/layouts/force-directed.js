/**
 * @license
 * Copyright 2020 Obsidian Better Graph View
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class for the first force-directed layout algorithm.
 * @author bekawestberg@gmail.com (Beka Westberg)
 */
'use strict';

import {forceSimulation, forceCenter, forceLink, forceManyBody} from 'd3-force';
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

    /**
     * The link force associated with this layout.
     * @type {force}
     */
    this.linkForce_ = forceLink();

    this.linkForce_
        .id(node => node.id)
        .distance(0)
        .strength(1);

    this.simulation_
        .force('link', this.linkForce_)
        .force('center', forceCenter(250, 450))
        .force('repel', forceManyBody().strength(-50))
        .on('tick', this.onSimulationUpdate.bind(this));
  }

  /**
   * Called when the structure of the graph updates. Passes the new structure
   * to the simulation.
   * @param {Graph} graph The graph that has been updated.
   */
  onGraphUpdate(graph) {
    this.graph_ = graph;
    this.simulation_.nodes(graph.getNodes());
    this.linkForce_.links(this.graph_.getEdges());
    this.simulation_.restart();
  }

  /**
   * Called when the simulation updates. Triggers the layout update event.
   */
  onSimulationUpdate() {
    this.trigger('layout-update', this.graph_);
  }
}
