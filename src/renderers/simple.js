/**
 * @license
 * Copyright 2020 Obsidian Better Graph View
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class for the default graph renderer. Uses simple circles and
 *     lines to draw the graph.
 * @author bekawestberg@gmail.com (Beka Westberg)
 */
'use strict';


import {Renderer} from './i-renderer';
import {Graph} from '../graph/graph';
import * as PIXI from 'pixi.js';


export class SimpleRenderer extends Renderer {
  /**
   * Constructs the simple renderer.
   * @param {!PIXI.Application} pixiApp The pixi application this renderer
   *     will render to.
   */
  constructor(pixiApp, viewport) {
    super(pixiApp, viewport);

    /**
     * Map of node ids to containers (which render the nodes).
     * @type {!Map<string, PIXI.Container>}
     * @private
     */
    this.nodesMap_ = new Map();

    /**
     * Map of edge ids to containers (which render the edge).
     * @type {!Map<string, PIXI.Container>}
     * @private
     */
    this.edgesMap_ = new Map();
  }

  /**
   * Called when the layout of the graph changes. Redraws all of the positions
   * of the nodes and edges.
   * @param {!Graph} graph The graph to render.
   */
  onLayoutUpdate(graph) {
    const nodes = graph.getNodes();
    this.clearOldNodes_(nodes);
    this.addNodes_(nodes);
    this.layoutNodes_(nodes);

    const edges = graph.getEdges();
    this.clearOldEdges_(edges);
    this.updateEdges_(edges, graph);
  }

  /**
   * Removes any rendered nodes that are not in the nodes list.
   * @param {!Array<!Node>} nodes The current nodes in the graph.
   * @private
   */
  clearOldNodes_(nodes) {
    const nodesInGraph = new Set();
    nodes.forEach(node => nodesInGraph.add(node.id));
    for (const [id, container] of this.nodesMap_) {
      if (!nodesInGraph.has(id)) {
        this.viewport_.removeChild(container);
        container.destroy({children: true});
        this.nodesMap_.delete(id);
      }
    }
  }

  /**
   * Adds any nodes in the nodes list that are not currently rendered.
   * @param {!Array<!Node>} nodes The current nodes in the graph.
   * @private
   */
  addNodes_(nodes) {
    nodes.forEach((node) => {
      if (this.nodesMap_.has(node.id)) {
        return;
      }
      const container = new PIXI.Container();
      container.zIndex = 1;
      const circle = new PIXI.Graphics();
      circle.beginFill(0x666666);
      circle.drawCircle(0, 0, 4);
      circle.endFill();

      this.viewport_.addChild(container);
      container.addChild(circle);
      this.nodesMap_.set(node.id, container);
    })
  }

  /**
   * Updates the positions of all of the rendered nodes to match the postions
   * in the graph model.
   * @param {!Array<!Node>} nodes The current nodes in the graph.
   * @private
   */
  layoutNodes_(nodes) {
    nodes.forEach((node) => {
      this.nodesMap_.get(node.id).setTransform(node.x, node.y);
    })
  }

  /**
   * Removes any rendered edges that are not in the edges list.
   * @param {!Array<!Edge>} edges The current edges in the graph.
   * @private
   */
  clearOldEdges_(edges) {
    const edgesInGraph = new Set();
    edges.forEach(edge => edgesInGraph.add(edge.id));
    for (const [id, container] of this.edgesMap_) {
      if (!edgesInGraph.has(id)) {
        this.viewport_.removeChild(container);
        container.destroy({children: true});
        this.edgesMap_.delete(id);
      }
    }
  }

  /**
   * Adds any edges in the edge list that are not currently rendered, and
   * updates all of the rendered edges to match the data in the graph model.
   * @param {!Array<!Edge>} edges The current edges in teh graph.
   * @param {!Graph} graph The current graph.
   * @private
   */
  updateEdges_(edges, graph) {
    edges.forEach((edge) => {
      if (!this.edgesMap_.has(edge.id)) {
        this.addEdge_(edge);
      }
      this.layoutEdge_(edge, this.edgesMap_.get(edge.id), graph);
    })
  }

  /**
   * Creates a container and graphics element for the given edge.
   * @param {!Edge} edge The edge to create a PIXI element for.
   * @private
   */
  addEdge_(edge) {
    const container = new PIXI.Container();
    const line = new PIXI.Graphics();
    this.viewport_.addChild(container);
    container.addChild(line);
    this.edgesMap_.set(edge.id, container);
  }

  /**
   * Updates the given container to draw a line between the two nodes identified
   * by the given edge.
   * @param {!Edge} edge The model of the edge to layout.
   * @param {!PIXI.Container} container The container to layout.
   * @param {!Graph} graph The current graph.
   * @private
   */
  layoutEdge_(edge, container, graph) {
    const sourceNode = edge.source;
    const targetNode = edge.target;

    const line = container.getChildAt(0);
    line.clear();
    line.lineStyle(1, 0xcccccc, 1);
    line.moveTo(sourceNode.x, sourceNode.y);
    line.lineTo(targetNode.x, targetNode.y);
  }
}
