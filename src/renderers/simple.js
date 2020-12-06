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
import {getStyle} from '../utils/css-cache';
import {rgbStringToHex} from '../utils/color';


/**
 * The minimum scale where we start being able to see the text.
 * @type {number}
 */
const MIN_TEXT_SCALE = 1.8;

/**
 * The text scale at and beyond which text is at full opacity.
 * @type {number}
 */
const MAX_TEXT_SCALE = 2.2;

/**
 * The text font size (not related to screen size).
 * @type {number}
 */
const TEXT_SIZE = 14;

/**
 * The number of characters to start word wrapping at.
 * @type {number}
 */
const WORD_WRAP = 200;

/**
 * The minimum radius of a node in the graph.
 * @type {number}
 */
const MIN_RADIUS = 4;

/**
 * The number of connections to ignore before we start scaling the node based
 * on the number of connections.
 * @type {number}
 */
const IGNORED_CONNECTIONS = 5;

export class SimpleRenderer extends Renderer {
  /**
   * Constructs a renderer instance given the PIXI Application instance.
   * @param {!PIXI.Application} pixiApp The pixi application handling our
   *     render.
   * @param {!Viewport} viewport The viewport this renderer will render to.
   */
  constructor(pixiApp, viewport) {
    super(pixiApp, viewport);


    /**
     * The graph being rendered.
     * @type {Graph|null}
     * @private
     */
    this.graph_ = null;

    /**
     * The most recent scale value for the viewport.
     * @type {number}
     * @private
     */
    this.oldScale_ = this.viewport_.scaled;

    this.viewport_.on('zoomed', this.updateTexts_.bind(this));
  }

  /**
   * Called when the layout of the graph changes. Redraws all of the positions
   * of the nodes and edges.
   * @param {!Graph} graph The graph to render.
   */
  onLayoutUpdate(graph) {
    this.graph_ = graph;
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
    graph.getNodes().forEach((node) => {
      const container = node.getContainer();
      if (!container.parent) {
        this.viewport_.addChild(container);
        container.addChild(new PIXI.Graphics());
        const text = new PIXI.Text('', {
          fontSize: TEXT_SIZE,
          align: 'center',
          wordWrap: true,
          wordWrapWidth: WORD_WRAP,
        });
        text.anchor.set(.5, 0);
        this.updateText_(text);
        container.addChild(text);
      }
    });
    graph.getEdges().forEach((edge) => {
      const container = edge.getContainer();
      if (!container.parent) {
        this.viewport_.addChild(container);
        container.addChild(new PIXI.Graphics());
      }
    });
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
        const radius = MIN_RADIUS * (1 + Math.log10(
            Math.max(degree - IGNORED_CONNECTIONS, 1)));
        const cssStyle = getStyle(node.getClasses());
        const fillColor = rgbStringToHex(cssStyle.backgroundColor);
        const borderColor = rgbStringToHex(cssStyle.borderColor);
        const borderWidth = parseInt(cssStyle.borderWidth.substring(
            0, cssStyle.borderWidth.length - 2));

        const circle = container.getChildAt(0);
        circle.clear();
        circle.beginFill(fillColor);
        circle.lineStyle(borderWidth, borderColor, 1, 0);
        circle.drawCircle(0, 0, radius);
        circle.endFill();
        node.data.set('degree', degree);

        const text = container.getChildAt(1);
        text.text = node.displayText;
        text.setTransform(0, radius);
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

  /**
   * Updates the size and opacity of all of the text elements.
   * @private
   */
  updateTexts_() {
    if (!this.graph_) {
      return;
    }

    this.graph_.getNodes().forEach((node) => {
      const container = node.getContainer();
      this.updateText_(container.getChildAt(1));
    });
    this.oldScale_ = this.viewport_.scaled;
  }

  /**
   * Updates the size an opacity of the given text element.
   * @param {!PIXI.Text} text The text element to update.
   * @private
   */
  updateText_(text) {
    const scale = this.viewport_.scaled;
    const xScale = text.scale.x * this.oldScale_ / scale;
    const yScale = text.scale.y * this.oldScale_ / scale;
    text.setTransform(text.x, text.y, xScale, yScale);

    text.alpha = Math.min(
        Math.max(scale - MIN_TEXT_SCALE, 0) /
        (MAX_TEXT_SCALE - MIN_TEXT_SCALE), 100);
  }
}
