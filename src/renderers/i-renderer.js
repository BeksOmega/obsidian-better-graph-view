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
import {Viewport} from 'pixi-viewport';
import {Layout} from '../layouts/i-layout';
import {Graph} from '../graph/graph';


export class Renderer {
  /**
   * Constructs a renderer instance given the PIXI Application instance.
   * @param {!PIXI.Application} pixiApp The pixi application handling our render.
   * @param {!Viewport} viewport The viewport this renderer will render to.
   */
  constructor(pixiApp, viewport) {
    /**
     * The pixi application that will handle rendering our graph.
     * @type {!PIXI.Application}
     * @protected
     */
    this.pixi_ = pixiApp;

    /**
     * The viewport that all children created by the renderer should be added
     * to. This allows for scrolling and zooming.
     * @type {!Viewport}
     * @protected
     */
    this.viewport_ = viewport;

    /**
     * The layout associated with this renderer.
     * @type {Layout|null}
     * @private
     */
    this.layout_ = null;

    /**
     * The event ref associated with the layout update event.
     * @type {EventRef|null}
     * @private
     */
    this.updateRef_ = null;
  }

  /**
   * Subscribes this renderer to the given graph layout.
   * @param {!Layout} layout The layout associated with this renderer.
   */
  setLayout(layout) {
    if (this.layout_ && this.updateRef_) {
      this.layout_.offref(this.updateRef_);
    }
    this.layout_ = layout;
    this.updateRef_ = layout.on('layout-update', this.onLayoutUpdate, this);
  }

  /**
   * Called when the layout of the graph changes.
   * @param {Graph} graph The graph that has just been updated.
   */
  onLayoutUpdate(graph) {}

  /**
   * Disposes of this renderer. Gets rid of any references (ie for events) that
   * might keep this from being disposed.
   */
  dispose() {
    this.layout_.offref(this.updateRef_);
  }
}
