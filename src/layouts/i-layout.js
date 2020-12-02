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
   * Subscribes this layout to the given graph builder.
   * @param {GraphBuilder} graphBuilder The graph builder to subscribe to.
   */
  setGraphBuilder(graphBuilder) {
    graphBuilder.on('structure-update', this.onGraphUpdate, this);
    this.onGraphUpdate(graphBuilder.getGraph());
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
}
