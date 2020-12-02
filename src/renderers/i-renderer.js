/**
 * @license
 * Copyright 2020 Obsidian Better Graph View
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Interface for a graph renderer. Renderers draw a graph which
 *     has been built and laid out to a PIXI stage.
 * @author bekawestberg@gmail.com (Beka Westberg)
 */
'use strict';


import * as PIXI from 'pixi.js';
import {Layout} from '../layouts/i-layout';
import {Graph} from '../graph/graph';


export class Renderer {
  /**
   * Constructs a renderer instance given the PIXI Application instance.
   * @param {!PIXI.Application} pixiApp The pixi application this renderer
   *     will render to.
   */
  constructor(pixiApp) {
    this.pixi_ = pixiApp;
  }

  /**
   * Subscribes this renderer to the given graph layout.
   * @param {Layout} layout
   */
  setLayout(layout) {
    layout.on('layout-update', this.onLayoutUpdate, this);
  }

  /**
   * Called when the layout of the graph changes.
   * @param {Graph} graph The graph that has just been updated.
   */
  onLayoutUpdate(graph) {}
}
