/**
 * @license
 * Copyright 2020 Obsidian Better Graph View
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class for the better graph view plugin.
 * @author bekawestberg@gmail.com (Beka Westberg)
 */
'use strict';


import {Plugin} from 'obsidian';
import {BetterGraphView} from './views/better-graph';
import {GraphSettingsView} from './views/graph-settings';
import {VIEW_TYPE_BETTER_GRAPH, VIEW_TYPE_GRAPH_SETTINGS} from './utils/constants';


export default class BetterGraphPlugin extends Plugin {

  /**
   * Called when the plugin is first loaded. Handles registering things like
   * views, commands, etc.
   */
  onload() {
    this.registerView(
        VIEW_TYPE_BETTER_GRAPH,
        (leaf) => new BetterGraphView(leaf));
    this.registerView(
        VIEW_TYPE_GRAPH_SETTINGS,
        (leaf) => new GraphSettingsView(leaf));

    this.addCommand({
      id: 'open-better-graph',
      name: 'Open better graph view',
      /**
       * Either returns whether the command is enabled (no better graph exists),
       * or opens the better graph, depending on the value of checking.
       * @param {boolean} checking True if this command is being called to check
       *     if it is enabled.
       * @return {boolean} True if checking and no better graph exists, false
       *     otherwise.
       */
      checkCallback: (checking) => {
        if (checking) {
          return !this.betterGraphExists() || !this.graphSettingsExists();
        }
        this.createBetterGraph();
      },
    });
  }

  /**
   * Called when the plugin is unloaded. Handles any cleanup like detaching
   * existing graph views.
   */
  onunload() {
    this.app.workspace
        .getLeavesOfType(VIEW_TYPE_BETTER_GRAPH)
        .forEach((leaf) => leaf.detach());
  }

  /**
   * Creates the better graph view in place of the focused leaf, if no better
   * graph view already exists.
   */
  async createBetterGraph() {
    // TODO: Actually, we should tightly couple these.

    if (!this.graphSettingsExists()) {
      await this.app.workspace.getRightLeaf(true).setViewState({
        type: VIEW_TYPE_GRAPH_SETTINGS,
      });
    }
    // TODO: Might want to allow multiple instances in the future.
    if (!this.betterGraphExists()) {
      this.app.workspace.getMostRecentLeaf().setViewState({
        type: VIEW_TYPE_BETTER_GRAPH,
      });
    }
  }

  /**
   * Returns true if there is an existing better graph view, false otherwise.
   * @return {boolean} Whether there is an existing better graph view or not.
   */
  betterGraphExists() {
    return !!this.app.workspace.getLeavesOfType(VIEW_TYPE_BETTER_GRAPH).length;
  }

  /**
   * Returns true if there is an existing graph settings view, false otherwise.
   * @return {boolean} Whether there is an existing graph settings view or not.
   */
  graphSettingsExists() {
    return !!this.app.workspace
        .getLeavesOfType(VIEW_TYPE_GRAPH_SETTINGS).length;
  }

}
