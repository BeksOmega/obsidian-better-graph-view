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
 * @constant
 */
const MIN_TEXT_SCALE = 1.8;

/**
 * The text scale at and beyond which text is at full opacity.
 * @type {number}
 * @constant
 */
const MAX_TEXT_SCALE = 2.2;

/**
 * The text font size (not related to screen size).
 * @type {number}
 * @constant
 */
const TEXT_SIZE = 25;

/**
 * The number of characters to start word wrapping at.
 * @type {number}
 * @constant
 */
const WORD_WRAP = 200;

/**
 * The minimum radius of a node in the graph.
 * @type {number}
 * @constant
 */
const MIN_RADIUS = 4;

/**
 * The number of connections to ignore before we start scaling the node based
 * on the number of connections.
 * @type {number}
 * @constant
 */
const IGNORED_CONNECTIONS = 5;

/**
 * The duration in seconds for the short part of the hover animation.
 * @type {number}
 * @constant
 */
const HOVER_SHORT_DURATION = .1;

/**
 * The duration in seconds for the long part of the hover animation.
 * @type {number}
 * @constant
 */
const HOVER_LONG_DURATION = .2;

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

    /**
     * A map of nodes to maps of strings to event listeners on those nodes.
     * @type {!WeakMap<!Node, !Map<string, !Function>>}
     * @private
     */
    this.nodeWatchers_ = new WeakMap();

    /**
     * The node that is currently being hovered.
     * @type {Node|null}
     * @private
     */
    this.hoveredNode_ = null;

    /**
     * Weakmap of edges to the positions of their source and target points.
     * Used for resizing the edges when zooming.
     * @type {!WeakMap<!Edge, !Map<string, number>>}
     * @private
     */
    this.edgePositions_ = new WeakMap();

    /**
     * The main layer that all of the node and edge containers should live on.
     * @type {!PIXI.Container}
     * @private
     */
    this.mainLayer_ = new PIXI.Container();
    this.mainLayer_.sortableChildren = true;
    this.viewport_.addChild(this.mainLayer_);

    /**
     * The highlight layer than any nodes which are currently being selected
     * live on.
     * @type {!PIXI.Container}
     * @private
     */
    this.highlightedLayer_ = new PIXI.Container();
    this.highlightedLayer_.sortableChildren = true;
    this.highlightedLayer_.zIndex = 1;
    this.viewport_.addChild(this.highlightedLayer_);

    this.viewport_.on('zoomed', this.onZoom_.bind(this));
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
        const hoverStart = this.createHoverStart_(node);
        this.nodeWatchers_.set(node, new Map().set('mouseover', hoverStart));
        this.nodeWatchers_.set(node, new Map().set('mousedown', hoverStart));
        node.getContainer().on('mouseover', hoverStart);
        node.getContainer().on('mousedown', hoverStart);
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
    text.scale.set(this.calcNonSelectedScale_());
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

        container.hitArea = new PIXI.Circle(0, 0, radius);

        const circle = this.getNodeGraphic_(node);
        circle.clear();
        circle.beginFill(fillColor);
        circle.lineStyle(borderWidth, borderColor, 1, 0);
        circle.drawCircle(0, 0, radius);
        circle.endFill();

        const text = this.getNodeText_(node);
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

      const line = this.getEdgeGraphic_(edge);
      line.clear();
      line.lineStyle(this.calcEdgeWidth_(), fillColor, 1);
      line.moveTo(sourceNode.x, sourceNode.y);
      line.lineTo(targetNode.x, targetNode.y);

      this.edgePositions_.set(edge, new Map()
          .set('sourceX', sourceNode.x)
          .set('sourceY', sourceNode.y)
          .set('targetX', targetNode.x)
          .set('targetY', targetNode.y));
    });
  }

  /**
   * Updates text elements and edges so that they have constant size wrt zoom.
   * Also modifies the text's opacity.
   * @private
   */
  onZoom_() {
    if (!this.graph_) {
      return;
    }

    this.graph_.forEachNode((node) => {
      const text = this.getNodeText_(node);
      if (this.hoveredNode_ == node) {
        text.scale.set(this.calcSelectedScale_());
      } else {
        text.scale.set(this.calcNonSelectedScale_());
        text.alpha = this.calcCurrentAlpha_();
      }
    });

    this.graph_.forEachEdge((edge) => {
      const positions = this.edgePositions_.get(edge);
      const line = this.getEdgeGraphic_(edge);
      const color = line.line.color;
      line.clear();
      line.lineStyle(this.calcEdgeWidth_(), color, 1);
      line.moveTo(positions.get('sourceX'), positions.get('sourceY'));
      line.lineTo(positions.get('targetX'), positions.get('targetY'));
    })
  }

  /**
   * Creates an event listener for mouse over events on the given node.
   * @param {!Node} node The node to create the listener for.
   * @return {function(!PIXI.InteractionEvent)} The created event listener.
   * @private
   */
  createHoverStart_(node) {
    return (e) => {
      if (this.hoveredNode_) {
        return;  // Already highlighted. Don't mess with it.
      }

      const {tweens, edges} = this.startMouseOverAnimation_(node);

      const mouseOut = this.createHoverEnd_(node, edges, tweens, true);
      const mouseUp = this.createHoverEnd_(node, edges, tweens, false);
      this.nodeWatchers_.get(node).set('mouseout', mouseOut);
      this.nodeWatchers_.get(node).set('mouseupoutside', mouseUp);
      node.getContainer().on('mouseout', mouseOut);
      node.getContainer().on('mouseupoutside', mouseUp);

      this.hoveredNode_ = node;
    }
  }

  /**
   * Creates an event listener for mouse out events on the given node.
   * @param {!Node} node The node to create the listener for.
   * @param {!Array<!Edge>} edges Edges connected to the given node.
   * @param {!Array<!Tween>} tweens All of the tweens that are currently running.
   * @param {boolean} keepHover True if we should keep hovering while nodes are
   *     being dragged. False otherwise.
   * @return {function(!PIXI.InteractionEvent)} The created event listener.
   * @private
   */
  createHoverEnd_(node, edges, tweens, keepHover) {
    return (e) => {
      if (keepHover && (node.fx || node.fy)) {
        return;  // Node is being dragged. Don't mess with it.
      }
      tweens.forEach(tween => tween.kill());

      this.startMouseOutAnimation_(node, edges);

      const hoverEnd = this.nodeWatchers_.get(node).get('mouseout');
      node.getContainer().off('mouseout', hoverEnd);
      node.getContainer().off('mouseupoutside', hoverEnd);
      this.nodeWatchers_.get(node).delete('mouseout');
      this.nodeWatchers_.get(node).delete('mouseupoutside');

      this.hoveredNode_ = null;
    }
  }

  /**
   * Starts all of the mouse over animations.
   * @param {!Node} node The node being moused over.
   * @return {{tweens: !Array<!Tween>, edges: !Array<!Edge>}}
   * @private
   */
  startMouseOverAnimation_(node) {
    const tweens = [];
    const edges = [];

    const scale = this.calcSelectedScale_();
    const nodeContainer = node.getContainer();
    nodeContainer.setParent(this.highlightedLayer_);

    const nodeText = this.getNodeText_(node);
    const textAnimation = {
      pixi: {
        alpha: 1,
        scaleX: scale,
        scaleY: scale
      },
      duration: HOVER_LONG_DURATION,
    };
    tweens.push(gsap.to(nodeText, textAnimation));

    this.graph_.getConnectedEdges(node.id).forEach((edgeId) => {
      const edge = this.graph_.getEdge(edgeId);
      edges.push(edge);

      const edgeContainer = edge.getContainer();
      edgeContainer.setParent(this.highlightedLayer_);

      const edgeGraphic = this.getEdgeGraphic_(edge);
      const animation = {pixi: {tint: 0x666666}, duration: HOVER_SHORT_DURATION};
      tweens.push(gsap.to(edgeGraphic, animation));

      this.graph_.getNode(edge.getSourceId()).getContainer()
          .setParent(this.highlightedLayer_);
      this.graph_.getNode(edge.getTargetId()).getContainer()
          .setParent(this.highlightedLayer_);
    });

    const fadeAnimation = {pixi: {alpha: .5}, duration: HOVER_LONG_DURATION};
    tweens.push(gsap.to(this.mainLayer_, fadeAnimation));

    return {tweens: tweens, edges: edges};
  }

  /**
   * Starts all of the mouse out animations.
   * @param {!Node} node the node that the mouse just left.
   * @param {!Array<!Edge>} edges All of the edges attached to the node.
   * @private
   */
  startMouseOutAnimation_(node, edges) {
    const scale = this.calcNonSelectedScale_();
    const alpha = this.calcCurrentAlpha_();
    const nodeText = this.getNodeText_(node);
    const animation = {
      pixi: {
        alpha: alpha,
        scaleX: scale,
        scaleY: scale
      },
      duration: HOVER_SHORT_DURATION,
    };
    gsap.to(nodeText, animation);

    edges.forEach((edge) => {
      const edgeGraphic = this.getEdgeGraphic_(edge);
      const animation = {pixi: {tint: 0xFFFFFF}, duration: HOVER_SHORT_DURATION};
      gsap.to(edgeGraphic, animation);
    });

    // Reset all of the containers' parents.
    const onComplete = () => {
      edges.forEach((edge) => {
        const edgeContainer = edge.getContainer();
        edgeContainer.setParent(this.mainLayer_);

        this.graph_.getNode(edge.getSourceId()).getContainer()
            .setParent(this.mainLayer_);
        this.graph_.getNode(edge.getTargetId()).getContainer()
            .setParent(this.mainLayer_);
      });
      node.getContainer().setParent(this.mainLayer_);
    };

    const unfadeAnimation = {
      pixi: {alpha: 1},
      duration: HOVER_LONG_DURATION,
      onComplete: onComplete,
    };
    gsap.to(this.mainLayer_, unfadeAnimation);
  }

  /**
   * Returns the graphic element associated with the given node.
   * @param {!Node} node The node to get the graphic element of.
   * @return {!PIXI.DisplayObject} the graphic element of the node.
   * @private
   */
  getNodeGraphic_(node) {
    return node.getContainer().getChildAt(0);
  }

  /**
   * Returns the text element associated with the given node.
   * @param {!Node} node The node to get the text element of.
   * @return {!PIXI.DisplayObject} the text element of the node.
   * @private
   */
  getNodeText_(node) {
    return node.getContainer().getChildAt(1);
  }

  /**
   * Returns the graphic element associated with the given edge.
   * @param {!Edge} edge The node to get the graphic element of.
   * @return {!PIXI.DisplayObject} the graphic element of the edge.
   * @private
   */
  getEdgeGraphic_(edge) {
    return edge.getContainer().getChildAt(0);
  }

  /**
   * Calculates the current alpha value that text should have based on the zoom.
   * @return {number} The current alpha value.
   * @private
   */
  calcCurrentAlpha_() {
    return Math.min(
        Math.max(this.viewport_.scaled - MIN_TEXT_SCALE, 0) /
        (MAX_TEXT_SCALE - MIN_TEXT_SCALE),
        1);
  }

  /**
   * Calculates the current scale a piece of selected text should have based on
   * the zoom.
   * @return {number} The selected scale.
   * @private
   */
  calcSelectedScale_() {
    return .75 / this.viewport_.scaled;
  }

  /**
   * Calculates the current scale a piece of unselected text should have based
   * on the zoom.
   * @return {number} The unselected scale.
   * @private
   */
  calcNonSelectedScale_() {
    return .5 / this.viewport_.scaled;
  }

  calcEdgeWidth_() {
    const scale = this.viewport_.scaled;
    return Math.min(Math.max(scale, .7), 1 / scale);
  }
}
