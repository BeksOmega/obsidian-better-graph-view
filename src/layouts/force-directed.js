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


import {forceSimulation, forceLink, forceManyBody, forceX, forceY} from 'd3-force';
import {Layout} from './i-layout';
import {Graph} from '../graph/graph';


const START_ITERATIONS = 500;

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
        .distance(0);

    this.simulation_
        .force('link', this.linkForce_)
        .force('x', forceX(250).strength(.2))
        .force('y', forceY(450).strength(.2))
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
    this.simulation_.alpha(1).restart();
  }

  /**
   * Called when the simulation updates. Triggers the layout update event.
   */
  onSimulationUpdate() {
    this.trigger('layout-update', this.graph_);
  }
}
