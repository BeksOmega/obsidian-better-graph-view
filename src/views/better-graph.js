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
import {SimpleGraphBuilder} from '../graph-builders/simple';
import {GraphSettingsView} from './graph-settings';

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


export class BetterGraphView extends ItemView {

  /**
   * Constructs the new leaf (but not any DOM). Registers any necessary event.s
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

    /**
     * The sigmajs instance currently being used by this view, or null.
     * @type {sigma|null}
     * @private
     */
    this.sigma_ = null;

    /**
     * The graph settings view associated withthis graph, or null.
     * @type {GraphSettingsView|null}
     * @private
     */
    this.settingsView_ = null;
  }

  /**
   * Returns the type of the view for use in accessing views of a given type.
   * @return {string} The type of this view.
   */
  getViewType() {
    return VIEW_TYPE_BETTER_GRAPH;
  }

  /**
   * Returns the text to be displayed at the top of the view (depending on your
   * theme anyway).
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
      this.initGraph_();
    }
  }

  /**
   * Cleans up any references to facilitate garbage collection.
   * @returns {Promise<void>}
   */
  async onClose() {
    if (this.sigma_) {
      this.sigma_.kill();
    }
    return Promise.resolve();
  }

  /**
   * Sets the settingsView and triggers initializing the graph. Necessary if
   * both views exist on load, but the settings view is created second.
   * Should only be called by the GraphSettingsView.
   * @param {GraphSettingsView} settingsView The settings view.
   * @private
   */
  setSettingsView_(settingsView) {
    this.settingsView_ = settingsView;
    this.initGraph_();
  }

  /**
   * Initializes the the graph builder, sigma, renderer, etc.
   * @private
   */
  initGraph_() {
    const {vault, metadataCache} = this.app;

    const graphBuilder = new SimpleGraphBuilder();
    this.sigma_ = new sigma({
      graph: graphBuilder.generateGraph(vault, metadataCache),
      renderer: {
        container: this.graphContainer_,
        type: 'canvas',
      }
    });

    const atlasObj = this.sigma_.startForceAtlas2({
      worker: true,
      barnesHutOptimize: false,
      startingIterations: 500,
      scalingRatio: .025,
      slowDown: 10,
    });

    const dragListener = sigma.plugins.dragNodes(
        this.sigma_, this.sigma_.renderers[0]);
    dragListener.bind('startdrag', function(event) {
      atlasObj.supervisor.setDraggingNode(event.data.node);
    });
    dragListener.bind('dragend', function (event) {
      atlasObj.supervisor.setDraggingNode(null);
    });
  }
}
