/**
 * @license
 * Copyright 2020 Obsidian Better Graph View
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Interface for a layout algorithm. Layout algorithms define
 *     where the nodes are positioned. They do *not* define which nodes are
 *     connected to other nodes (that is the job of a graph builder).
 * @author bekawestberg@gmail.com (Beka Westberg)
 */
'use strict';


import {Events, EventRef} from 'obsidian';
import {GraphBuilder} from '../graph-builders/i-graphbuilder';
import {Graph} from '../graph/graph';


/**
 * @interface
 */
export class Layout extends Events {
  /**
   * Constructs a Layout instance given the viewport.
   * @param {!Viewport} viewport The viewport used for subscribing to move
   *     events.
   */
  constructor(viewport) {
    super();

    /**
     * The graph builder associated with this layout.
     * @type {GraphBuilder|null}
     * @private
     */
    this.graphBuilder_ = null;

    /**
     * The event ref associated with the grpah builder structure update event.
     * @type {EventRef|null}
     * @private
     */
    this.updateRef_ = null;
  }
  /**
   * Subscribes this layout to the given graph builder.
   * @param {!GraphBuilder} graphBuilder The graph builder to subscribe to.
   */
  setGraphBuilder(graphBuilder) {
    if (this.graphBuilder_ && this.updateRef_) {
      this.graphBuilder_.offref(this.updateRef_);
    }
    this.graphBuilder_ = graphBuilder;
    this.updateRef_ =
        graphBuilder.on('structure-update', this.onGraphUpdate, this);
  }

  /**
   * Called when the structure of the graph changes.
   * @param {Graph} graph The graph that has just been updated.
   */
  onGraphUpdate(graph) {}

  /**
   * Adds a listener to events from this layout.
   * @param {string} name The name of the event to listen to. Currently supports:
   *   - 'layout-update'
   * @param {function(*): *} callback The listener to call.
   * @param {?Object} ctx The context to call the event in.
   * @return {!EventRef} The reference to the subscribed event.
   * @throws If the passed name is not a valid event name.
   */
  on(name, callback, ctx) {
    if (name == 'layout-update') {
      return super.on(name, callback, ctx);
    } else {
      throw 'Unknown layout event: "' + name + '".';
    }
  }

  /**
   * Disposes of this layout. Gets rid of any references (ie for events) that
   * might keep this from being disposed.
   */
  dispose() {
    this.graphBuilder_.offref(this.updateRef_);
  }
}
