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
import {getStyle} from '../utils/css-cache';
import {rgbStringToHex} from '../utils/color';
import * as PIXI from 'pixi.js';
import {gsap} from 'gsap';
import PixiPlugin from 'gsap/PixiPlugin';

gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI(PIXI);


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
   * Constructs a renderer instance given the PIXI Application and viewport.
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
     * A map of nodes to their latest degree measurements.
     * @type {!WeakMap<!Node, number>}
     * @private
     */
    this.nodeDegrees_ = new WeakMap();

    this.nodeWatchers_ = new WeakMap();

    this.hoveredNodes_ = new WeakSet();

    /**
     * The most recent scale value for the viewport.
     * @type {number}
     * @private
     */
    this.oldScale_ = this.viewport_.scaled;

    this.mainLayer_ = new PIXI.Container();
    this.mainLayer_.sortableChildren = true;
    this.viewport_.addChild(this.mainLayer_);

    this.highlightedLayer_ = new PIXI.Container();
    this.highlightedLayer_.sortableChildren = true;
    this.highlightedLayer_.zIndex = 1;
    this.viewport_.addChild(this.highlightedLayer_);

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
    graph.forEachNode((node) => {
      const container = node.getContainer();
      if (!container.parent) {
        this.mainLayer_.addChild(container);
        container.addChild(new PIXI.Graphics());
        container.addChild(this.makeText_());
      }
      if (!this.nodeWatchers_.has(node)) {
        const mouseOver = this.createMouseOver_(node);
        this.nodeWatchers_.set(node, new Map().set('mouseover', mouseOver));
        node.getContainer().on('mouseover', mouseOver);
      }
    });
    graph.forEachEdge((edge) => {
      const container = edge.getContainer();
      if (!container.parent) {
        this.mainLayer_.addChild(container);
        container.addChild(new PIXI.Graphics());
      }
    });
  }

  /**
   * Creates a PIXI.text element, initializes it and returns it.
   * @return {!PIXI.Text} The text element that has been created.
   * @private
   */
  makeText_() {
    const cssStyle = getStyle(['node']);
    const color = rgbStringToHex(cssStyle.color);

    const text = new PIXI.Text('', {
      fontSize: TEXT_SIZE,
      align: 'center',
      wordWrap: true,
      wordWrapWidth: WORD_WRAP,
      fill: color,
    });
    text.zIndex = 1;
    text.anchor.set(.5, 0);
    text.scale.set(1 / this.viewport_.scaled);
    text.alpha = this.calcCurrentAlpha_();

    return text;
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
      if (this.nodeDegrees_.get(node) != degree) {
        this.nodeDegrees_.set(node, degree);

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

        container.hitArea = new PIXI.Circle(0, 0, radius);

        const text = container.getChildAt(1);
        text.text = node.displayText;
        text.position.set(0, radius);
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

      const cssStyle = getStyle(edge.getClasses());
      const fillColor = rgbStringToHex(cssStyle.backgroundColor);

      const line = edge.getContainer().getChildAt(0);
      line.clear();
      line.lineStyle(1, fillColor, 1);
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

    this.graph_.forEachNode((node) => {
      const text = node.getContainer().getChildAt(1);
      if (this.hoveredNodes_.has(node)) {
        text.scale.set(1.5 / this.viewport_.scaled);
      } else {
        text.scale.set(1 / this.viewport_.scaled);
        text.alpha = this.calcCurrentAlpha_();
      }
    });
    this.oldScale_ = this.viewport_.scaled;
  }

  calcCurrentAlpha_() {
    return Math.min(Math.max(this.viewport_.scaled - MIN_TEXT_SCALE, 0) /
        (MAX_TEXT_SCALE - MIN_TEXT_SCALE), 1);
  }

  createMouseOver_(node) {
    return (e) => {
      if (this.hoveredNodes_.has(node)) {
        return;  // Already highlighted. Don't mess with it.
      }
      const tweens = [];
      const edges = [];

      const scale = 1.5 / this.viewport_.scaled;
      const nodeContainer = node.getContainer();
      nodeContainer.setParent(this.highlightedLayer_);

      const nodeGraphic = nodeContainer.getChildAt(1);
      const animation = {
        pixi: {alpha: 1, scaleX: scale, scaleY: scale},
        duration: .1
      };
      tweens.push(gsap.to(nodeGraphic, animation));

      this.graph_.getConnectedEdges(node.id).forEach((edgeId) => {
        const edge = this.graph_.getEdge(edgeId);
        edges.push(edge);

        const edgeContainer = edge.getContainer();
        edgeContainer.setParent(this.highlightedLayer_);

        const edgeGraphic = this.getEdgeGraphic_(edge);
        const animation = {pixi: {tint: 0x666666}, duration: .1};
        tweens.push(gsap.to(edgeGraphic, animation));

        this.graph_.getNode(edge.getSourceId()).getContainer()
            .setParent(this.highlightedLayer_);
        this.graph_.getNode(edge.getTargetId()).getContainer()
            .setParent(this.highlightedLayer_);
      });

      const fadeAnimation = {pixi: {alpha: .5}, duration: .2};
      tweens.push(gsap.to(this.mainLayer_, fadeAnimation));

      const mouseOut = this.createMouseOut_(node, edges, tweens);
      this.nodeWatchers_.get(node).set('mouseout', mouseOut);
      node.getContainer().on('mouseout', mouseOut);

      this.hoveredNodes_.add(node);
    }
  }

  createMouseOut_(node, edges, tweens) {
    return (e) => {
      if (node.fx) {
        return;  // Node is being dragged. Don't mess with it.
      }
      tweens.forEach(tween => tween.kill());

      const scale = 1 / this.viewport_.scaled;
      const alpha = this.calcCurrentAlpha_();
      const nodeText = this.getNodeText_(node);
      const animation = {
        pixi: {alpha: alpha, scaleX: scale, scaleY: scale},
        duration: .1
      };
      gsap.to(nodeText, animation);

      edges.forEach((edge) => {
        const edgeContainer = edge.getContainer();
        edgeContainer.setParent(this.mainLayer_);

        const edgeGraphic = this.getEdgeGraphic_(edge);
        const animation = {pixi: {tint: 0xFFFFFF}, duration: .1};
        gsap.to(edgeGraphic, animation);

        this.graph_.getNode(edge.getSourceId()).getContainer()
            .setParent(this.mainLayer_);
        this.graph_.getNode(edge.getTargetId()).getContainer()
            .setParent(this.mainLayer_);
      });

      const unfadeAnimation = {pixi: {alpha: 1}, duration: .2};
      gsap.to(this.mainLayer_, unfadeAnimation);

      const mouseOut = this.nodeWatchers_.get(node).get('mouseout');
      node.getContainer().off('mouseout', mouseOut);
      this.nodeWatchers_.get(node).delete('mouseout');

      this.hoveredNodes_.delete(node);
    }
  }

  getEdgeGraphic_(edge) {
    return edge.getContainer().getChildAt(0);
  }
  getNodeText_(node) {
    return node.getContainer().getChildAt(1);
  }
}
