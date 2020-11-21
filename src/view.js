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
import { ItemView, WorkspaceLeaf} from 'obsidian';
import { VIEW_TYPE_BETTER_GRAPH, BETTER_GRAPH_TITLE } from "./constants";

// Sigma imports
import '../sigma/src/sigma.core';
import '../sigma/src/conrad';
import '../sigma/src/utils/sigma.utils';
import '../sigma/src/utils/sigma.polyfills';
import '../sigma/src/sigma.settings'
import '../sigma/src/classes/sigma.classes.dispatcher';
import '../sigma/src/classes/sigma.classes.configurable';
import '../sigma/src/classes/sigma.classes.graph';
import '../sigma/src/classes/sigma.classes.camera';
import '../sigma/src/classes/sigma.classes.quad';
import '../sigma/src/classes/sigma.classes.edgequad';
import '../sigma/src/captors/sigma.captors.mouse';
import '../sigma/src/captors/sigma.captors.touch';
import '../sigma/src/renderers/sigma.renderers.canvas';
import '../sigma/src/renderers/sigma.renderers.def';
import '../sigma/src/renderers/canvas/sigma.canvas.labels.def';
import '../sigma/src/renderers/canvas/sigma.canvas.hovers.def';
import '../sigma/src/renderers/canvas/sigma.canvas.nodes.def';
import '../sigma/src/renderers/canvas/sigma.canvas.edges.def';
import '../sigma/src/renderers/canvas/sigma.canvas.edges.curve';
import '../sigma/src/renderers/canvas/sigma.canvas.edges.arrow';
import '../sigma/src/renderers/canvas/sigma.canvas.edges.curvedArrow';
import '../sigma/src/renderers/canvas/sigma.canvas.edgehovers.def';
import '../sigma/src/renderers/canvas/sigma.canvas.edgehovers.arrow';
import '../sigma/src/renderers/canvas/sigma.canvas.edgehovers.curvedArrow';
import '../sigma/src/renderers/canvas/sigma.canvas.extremities.def';
import '../sigma/src/middlewares/sigma.middlewares.rescale';
import '../sigma/src/middlewares/sigma.middlewares.copy';
import '../sigma/src/misc/sigma.misc.animation';
import '../sigma/src/misc/sigma.misc.bindEvents';
import '../sigma/src/misc/sigma.misc.bindDOMEvents';
import '../sigma/src/misc/sigma.misc.drawHovers';

// Sigma force atlas imports.
import '../sigma/plugins/sigma.layout.forceAtlas2/worker';
import '../sigma/plugins/sigma.layout.forceAtlas2/supervisor';

// Sigma drag imports.
import '../sigma/plugins/sigma.plugins.dragNodes/sigma.plugins.dragNodes';


export default class BetterGraphView extends ItemView {

  /**
   * Constructs the new leaf (but not any DOM). Registers any necessary event.s
   * @param {WorkspaceLeaf} leaf
   */
  constructor(leaf) {
    super(leaf);
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
   * Initializes the better graph view, including DOM and sigma.
   * @return {Promise<void>} A promise to create the view.
   */
  async onOpen() {
    const div = document.createElement('div');
    div.setAttribute('id', 'graph-container');
    this.contentEl.appendChild(div);

    const N = 100,
        E = 100;

    const g = {
      nodes: [],
      edges: [],
    };

    for (let i = 0; i < N; i++) {
      g.nodes.push({
        id: 'n' + i,
        label: 'Node' + i,
        x: 100 * Math.cos(2 * i * Math.PI / N),
        y: 100 * Math.sin(2 * i * Math.PI / N),
        size: 1,
        color: '#666'

      })
    }
    for (let i = 1; i < N; i++) {
      g.edges.push({
        id: 'e' + i,
        source: 'n' + (i-1),
        target: 'n' + i,
        size: Math.random(),
        colour: '#ccc'
      })
    }

    const s = new sigma({
      graph: g,
      renderer: {
        container: div,
        type: 'canvas',
      }
    });
    const atlasObj = s.startForceAtlas2(
      {
        linLogMode: false,
        outboundAttractionDistribution: false,
        adjustSizes: false,
        edgeWeightInfluence: 0,
        scalingRatio: 1,
        strongGravityMode: false,
        gravity: 1,
        barnesHutOptimize: true,
        barnesHutTheta: 0.5,
        slowDown: 10,
        startingIterations: 1,
        iterationsPerRender: 1,
        worker: false
      }
    );

    const dragListener = sigma.plugins.dragNodes(s, s.renderers[0]);
    dragListener.bind('startdrag', function(event) {
      atlasObj.supervisor.setDraggingNode(event.data.node);
    });
    dragListener.bind('dragend', function (event) {
      atlasObj.supervisor.setDraggingNode(null);
    })
  }
}
