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
   * Constructs the simple renderer. This render is meant to emulate obsidian's
   * default renderer.
   * @param {!PIXI.Application} pixiApp The pixi application handling our render.
   * @param {!Viewport} viewport The viewport this renderer will render to.
   */
  constructor(pixiApp, viewport) {
    super(pixiApp, viewport);

    /**
     * Map of node ids to containers (which render the nodes).
     * @type {!Map<string, PIXI.Container>}
     * @private
     */
    this.nodeContainersMap_ = new Map();

    this.nodeDataMap_ = new Map();

    /**
     * Map of edge ids to containers (which render the edge).
     * @type {!Map<string, PIXI.Container>}
     * @private
     */
    this.edgeContainersMap_ = new Map();
  }

  /**
   * Called when the layout of the graph changes. Redraws all of the positions
   * of the nodes and edges.
   * @param {!Graph} graph The graph to render.
   */
  onLayoutUpdate(graph) {
    this.clearOldNodes_(graph);
    this.addNodes_(graph);
    this.updateNodes_(graph);
    this.clearOldEdges_(graph);
    this.updateEdges_(graph);
  }

  /**
   * Removes any rendered nodes that are not in the nodes list.
   * @param {!Graph} graph The current graph.
   * @private
   */
  clearOldNodes_(graph) {
    const nodesInGraph = new Set();
    graph.getNodes().forEach(node => nodesInGraph.add(node.id));
    for (const [id, container] of this.nodeContainersMap_) {
      if (!nodesInGraph.has(id)) {
        this.viewport_.removeChild(container);
        container.destroy({children: true});
        this.nodeContainersMap_.delete(id);
        this.nodeDataMap_.delete(id);
      }
    }
  }

  /**
   * Adds any nodes in the nodes list that are not currently rendered.
   * @param {!Graph} graph The current graph.
   * @private
   */
  addNodes_(graph) {
    graph.getNodes().forEach((node) => {
      if (this.nodeContainersMap_.has(node.id)) {
        return;
      }
      const container = new PIXI.Container();
      container.zIndex = 1;
      const degree = graph.degree(node.id);
      const radius = 4 * (1 + Math.log10(Math.max(degree - 5, 1)));
      const circle = new PIXI.Graphics();
      circle.beginFill(0x666666);
      circle.drawCircle(0, 0, radius);
      circle.endFill();

      this.viewport_.addChild(container);
      container.addChild(circle);
      this.nodeContainersMap_.set(node.id, container);
      this.nodeDataMap_.set(node.id, {degree: degree});
    })
  }

  /**
   * Updates the positions and colors of all of the rendered nodes to match the
   * data in the graph model.
   * @param {!Graph} graph The current graph.
   * @private
   */
  updateNodes_(graph) {
    graph.getNodes().forEach((node) => {
      const container = this.nodeContainersMap_.get(node.id);
      container.setTransform(node.x, node.y);

      const degree = graph.degree(node.id);
      const data = this.nodeDataMap_.get(node.id);
      if (data.degree != degree) {
        const radius = 4 * (1 + Math.log10(Math.max(degree - 5, 1)));
        const circle = container.getChildAt(0);
        circle.clear();
        circle.beginFill(0x666666);
        circle.drawCircle(0, 0, radius);
        circle.endFill();
        data.degree = degree;
      }
    })
  }

  /**
   * Removes any rendered edges that are not in the edges list.
   * @param {!Graph} graph The current graph.
   * @private
   */
  clearOldEdges_(graph) {
    const edgesInGraph = new Set();
    graph.getEdges().forEach(edge => edgesInGraph.add(edge.id));
    for (const [id, container] of this.edgeContainersMap_) {
      if (!edgesInGraph.has(id)) {
        this.viewport_.removeChild(container);
        container.destroy({children: true});
        this.edgeContainersMap_.delete(id);
      }
    }
  }

  /**
   * Adds any edges in the edge list that are not currently rendered, and
   * updates all of the rendered edges to match the data in the graph model.
   * @param {!Graph} graph The current graph.
   * @private
   */
  updateEdges_(graph) {
    graph.getEdges().forEach((edge) => {
      if (!this.edgeContainersMap_.has(edge.id)) {
        this.addEdge_(edge);
      }
      this.layoutEdge_(edge, this.edgeContainersMap_.get(edge.id), graph);
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
    this.edgeContainersMap_.set(edge.id, container);
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
    const sourceNode = graph.getNode(edge.getSourceId());
    const targetNode = graph.getNode(edge.getTargetId());

    const line = container.getChildAt(0);
    line.clear();
    line.lineStyle(1, 0xcccccc, 1);
    line.moveTo(sourceNode.x, sourceNode.y);
    line.lineTo(targetNode.x, targetNode.y);
  }
}
