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


import {Layout} from '../i-layout';
import {Graph} from '../../graph/graph';
import WebWorker from 'web-worker:./worker';


export class ForceDirectedLayout extends Layout {
  /**
   * Constructs a ForceDirectedLayout instance given the viewport.
   * @param {!Viewport} viewport The viewport used for subscribing to move
   *     events.
   */
  constructor(viewport) {
    super(viewport);
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

    this.worker_ = new WebWorker();
    this.worker_.onmessage = function(event) {
      for (const nodeData of event.data.nodes) {
        const node = this.graph_.getNode(nodeData.id);
        node.id = nodeData.id;
        node.x = nodeData.x;
        node.y = nodeData.y;
        node.vx = nodeData.vx;
        node.vy = nodeData.vy;
        node.fx = nodeData.fx;
        node.fy = nodeData.fy;
      }
      this.onSimulationUpdate_();
    }.bind(this);

    // TODO:
    //viewport.on('zoomed', () => this.simulation_.stop());
    //viewport.on('drag-start', () => this.simulation_.stop());
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

    const nodes = [];
    graph.forEachNode((node) => {
      nodes.push({
        id: node.id,
        x: node.x,
        y: node.y,
        vx: node.vx,
        vy: node.vy,
        fx: node.fx,
        fy: node.fy,
      })
    });
    const links = [];
    graph.forEachEdge((edge) => {
      links.push({
        id: edge.id,
        source: edge.source,
        target: edge.target,
      })
    });

    this.worker_.postMessage({
      type: 'reset',
      nodes: nodes,
      links: links,
    })
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

      console.log('down');
      this.worker_.postMessage({
        type: 'fixed',
        node: {
          id: node.id,
          fx: node.x,
          fy: node.y,
        }
      });
      // TODO:
      //node.fx = node.x;
      //node.fy = node.y;

      // alphaTarget keeps the simulation "hot", matching the alpha keeps the
      // sim from being jumpy, and restart restarts it.
      //this.simulation_.alphaTarget(.8).alpha(.8).restart();

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
      // TODO:
      //node.fx = point.x;
      //node.fy = point.y;
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

      // TODO:
      // Resetting the alphaTarget allows the simulation to cool down & stop.
      //this.simulation_.alphaTarget(0);
    }
  }

  /**
   * Disposes of this layout.
   */
  dispose() {
    super.dispose();
    // TODO:
    //this.simulation_.stop();
  }
}
