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
   * Called when the layout of the graph changes. Redraws all of the positions
   * of the nodes and edges.
   * @param {!Graph} graph The graph to render.
   */
  onLayoutUpdate(graph) {
    this.attachNodesAndEdges_(graph);
    this.updateNodes_(graph);
    this.updateEdges_(graph);
  }

  /**
   * Adds any node/edge containers to the viewport that haven't been added.
   * @param {!Graph} graph The current graph.
   * @private
   */
  attachNodesAndEdges_(graph) {
    const addContainer = (elem) => {
      const container = elem.getContainer();
      if (!container.parent) {
        this.viewport_.addChild(container);
        const graphics = new PIXI.Graphics();
        container.addChild(graphics);
      }
    };
    graph.getNodes().forEach(addContainer);
    graph.getEdges().forEach(addContainer);
  }

  /**
   * Redraws any nodes that need to be redrawn, and updates their positions.
   * @param {!Graph} graph The current graph.
   * @private
   */
  updateNodes_(graph) {
    graph.getNodes().forEach((node) => {
      const container = node.getContainer();
      container.setTransform(node.x, node.y);

      const degree = graph.degree(node.id);
      if (node.data.get('degree') != degree) {
        const radius = 4 * (1 + Math.log10(Math.max(degree - 5, 1)));
        const circle = container.getChildAt(0);
        circle.clear();
        circle.beginFill(0x666666);
        circle.drawCircle(0, 0, radius);
        circle.endFill();
        node.data.set('degree', degree);
      }
    });
  }

  /**
   * Redraws edges to properly connect the updated nodes.
   * @param {!Graph} graph The current graph.
   * @private
   */
  updateEdges_(graph) {
    graph.getEdges().forEach((edge) => {
      const sourceNode = graph.getNode(edge.getSourceId());
      const targetNode = graph.getNode(edge.getTargetId());

      const line = edge.getContainer().getChildAt(0);
      line.clear();
      line.lineStyle(1, 0xcccccc, 1);
      line.moveTo(sourceNode.x, sourceNode.y);
      line.lineTo(targetNode.x, targetNode.y);
    });
  }
}
