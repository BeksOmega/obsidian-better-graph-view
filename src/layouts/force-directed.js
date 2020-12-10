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
     * A map of nodes to objects storing the listeners to those nodes.
     * @type {!WeakMap<!Node, !Object>}
     * @private
     */
    this.nodeWatchers_ = new WeakMap();

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
        .force('x', forceX(0).strength(.2))
        .force('y', forceY(0).strength(.2))
        .force('repel', forceManyBody().strength(-50))
        .on('tick', this.onSimulationUpdate_.bind(this));
  }

  /**
   * Called when the structure of the graph updates. Passes the new structure
   * to the simulation.
   * @param {Graph} graph The graph that has been updated.
   */
  onGraphUpdate(graph) {
    this.graph_ = graph;
    graph.forEachNode((node) => {
      if (!this.nodeWatchers_.has(node)) {
        const mouseDown = this.createMouseDown_(node);
        this.nodeWatchers_.set(node, new Map().set('down', mouseDown));
        node.getContainer().on('mousedown', mouseDown);
      }
    });

    // Nodes must be updated before links.
    this.simulation_.nodes(graph.getNodes());
    this.linkForce_.links(this.graph_.getEdges());
    this.simulation_.alpha(1).restart();
  }

  /**
   * Called when the simulation updates. Triggers the layout update event.
   * @private
   */
  onSimulationUpdate_() {
    this.trigger('layout-update', this.graph_);
  }

  /**
   * Creates a mouse down event listener for the given node.
   * @param {!Node} node The node to create the listener for.
   * @return {function(!PIXI.InteractionEvent)} The created event listener.
   * @private
   */
  createMouseDown_(node) {
    return (e) => {
      const mouseMove = this.createMouseMove_(node);
      const endDrag = this.createEndDrag_(node);
      this.nodeWatchers_.get(node)
          .set('mousemove', mouseMove)
          .set('mouseup', endDrag)
          .set('mouseupoutside', endDrag);
      const container = node.getContainer();
      container.on('mousemove', mouseMove);
      container.on('mouseup', endDrag);
      container.on('mouseupoutside', endDrag);

      this.simulation_.alphaTarget(.3).alpha(.3).restart();

      e.stopPropagation();
    }
  }

  /**
   * Creates a mouse move event listener for the given node.
   * @param {!Node} node The node to create the listener for.
   * @return {function(!PIXI.InteractionEvent)} The created event listener.
   * @private
   */
  createMouseMove_(node) {
    return (e) => {
      const parent = node.getContainer().parent;
      const point = parent.toLocal(e.data.global);
      node.fx = point.x;
      node.fy = point.y;
    }
  }

  /**
   * Creates an event listener for end drag events (eg mouseup) for the given
   * node.
   * @param {!Node} node The node to create the listener for.
   * @return {function(!PIXI.InteractionEvent)} The created event listener.
   * @private
   */
  createEndDrag_(node) {
    return (e) => {
      node.fx = null;
      node.fy = null;

      const map = this.nodeWatchers_.get(node);
      const container = node.getContainer();
      container.off('mousemove', map.get('mousemove'));
      container.off('mouseup', map.get('mouseup'));
      container.off('mouseupoutside', map.get('mouseupoutside'));
      map.delete('mousemove');
      map.delete('mouseup');
      map.delete('mouseupoutside');

      this.simulation_.alphaTarget(0);
    }
  }
}
