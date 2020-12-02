/**
 * @license
 * Copyright 2020 Obsidian Better Graph View
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class for the better graph view.
 * @author bekawestberg@gmail.com (Beka Westberg)
 */
'use strict';


// Obsidian imports
import {ItemView, WorkspaceLeaf, Vault} from 'obsidian';
import {VIEW_TYPE_BETTER_GRAPH, VIEW_TYPE_GRAPH_SETTINGS} from '../constants';
import * as PIXI from 'pixi.js';

// Sigma imports
import '../../sigma/src/sigma.core';
import '../../sigma/src/conrad';
import '../../sigma/src/utils/sigma.utils';
import '../../sigma/src/utils/sigma.polyfills';
import '../../sigma/src/sigma.settings'
import '../../sigma/src/classes/sigma.classes.dispatcher';
import '../../sigma/src/classes/sigma.classes.configurable';
import '../../sigma/src/classes/sigma.classes.graph';
import '../../sigma/src/classes/sigma.classes.camera';
import '../../sigma/src/classes/sigma.classes.quad';
import '../../sigma/src/classes/sigma.classes.edgequad';
import '../../sigma/src/captors/sigma.captors.mouse';
import '../../sigma/src/captors/sigma.captors.touch';
import '../../sigma/src/renderers/sigma.renderers.canvas';
import '../../sigma/src/renderers/sigma.renderers.def';
import '../../sigma/src/renderers/canvas/sigma.canvas.labels.def';
import '../../sigma/src/renderers/canvas/sigma.canvas.hovers.def';
import '../../sigma/src/renderers/canvas/sigma.canvas.nodes.def';
import '../../sigma/src/renderers/canvas/sigma.canvas.edges.def';
import '../../sigma/src/renderers/canvas/sigma.canvas.edges.curve';
import '../../sigma/src/renderers/canvas/sigma.canvas.edges.arrow';
import '../../sigma/src/renderers/canvas/sigma.canvas.edges.curvedArrow';
import '../../sigma/src/renderers/canvas/sigma.canvas.edgehovers.def';
import '../../sigma/src/renderers/canvas/sigma.canvas.edgehovers.arrow';
import '../../sigma/src/renderers/canvas/sigma.canvas.edgehovers.curvedArrow';
import '../../sigma/src/renderers/canvas/sigma.canvas.extremities.def';
import '../../sigma/src/middlewares/sigma.middlewares.rescale';
import '../../sigma/src/middlewares/sigma.middlewares.copy';
import '../../sigma/src/misc/sigma.misc.animation';
import '../../sigma/src/misc/sigma.misc.bindEvents';
import '../../sigma/src/misc/sigma.misc.bindDOMEvents';
import '../../sigma/src/misc/sigma.misc.drawHovers';

// Sigma force atlas imports.
import '../../sigma/plugins/sigma.layout.forceAtlas2/worker';
import '../../sigma/plugins/sigma.layout.forceAtlas2/supervisor';

// Sigma drag imports.
import '../../sigma/plugins/sigma.plugins.dragNodes/sigma.plugins.dragNodes';

import {NotesGraphBuilder} from '../graph-builders/notes';
import {ForceDirectedLayout} from '../layouts/force-directed';
import {Graph} from '../graph/graph';
import {Simple} from '../renderers/simple';
import {Node} from '../graph/node';
import {Edge} from '../graph/edge';


export class BetterGraphView extends ItemView {

  /**
   * Constructs the new leaf (but not any DOM). Registers any necessary events.
   * @param {WorkspaceLeaf} leaf
   */
  constructor(leaf) {
    super(leaf);

    /**
     * The div that contains the graph view.
     * @type {HTMLElement|null}
     * @private
     */
    this.graphContainer_ = null;
  }

  /**
   * Returns the type of the view for use in accessing views of a given type.
   * @return {string} The type of this view.
   */
  getViewType() {
    return VIEW_TYPE_BETTER_GRAPH;
  }

  /**
   * Returns the text to be displayed  on the view.
   * @return {string} The text to be displayed at the top of the view.
   */
  getDisplayText() {
    return 'Better graph';
  }

  /**
   * Initializes the better graph view, in particular, DOM.
   * @return {Promise<void>} A promise to create the view.
   */
  async onOpen() {
    const {workspace} = this.app;

    this.graphContainer_ = document.createElement('div');
    this.graphContainer_.setAttribute('id', 'graph-container');
    this.contentEl.appendChild(this.graphContainer_);
    this.contentEl.setAttribute('id', 'graph-container-container');

    this.settingsView_ = workspace.getLeavesOfType(VIEW_TYPE_GRAPH_SETTINGS)[0];
    if (this.settingsView_) {
      this.settingsView_.view.setGraphView(this);
    }

    // For testing PIXI!
    this.pixi_ = new PIXI.Application({
      antialias: true,
      transparent: true,
    });
    this.graphContainer_.appendChild(this.pixi_.view);
    this.onResize();

    // let circle = new PIXI.Graphics();
    // circle.beginFill(0x66ccff);
    // circle.lineStyle(4, 0xffee00, 1);
    // circle.drawCircle(0, 0, 32);
    // circle.endFill();
    // circle.x = 100;
    // circle.y = 100;
    // this.pixi_.stage.addChild(circle);

    // For testing d3!
    const graph = new Graph();
    graph.addNode(new Node('test'));
    graph.addNode(new Node('test2'));
    graph.addEdge(new Edge('test to test2', 'test', 'test2'));
    const builder = new NotesGraphBuilder();
    const renderer = new Simple(this.pixi_);
    const layout = new ForceDirectedLayout();
    renderer.setLayout(layout);
    builder.setGraph(graph);
    layout.setGraphBuilder(builder);
  }

  onResize() {
    const rect = this.graphContainer_.getBoundingClientRect();
    const container = this.graphContainer_;
    this.pixi_.renderer.resize(container.offsetWidth, container.offsetHeight);
  }

  /**
   * Return the graph container for the better graph view.
   * @return {HTMLElement} The graph container.
   */
  getGraphContainer() {
    return this.graphContainer_;
  }
}
