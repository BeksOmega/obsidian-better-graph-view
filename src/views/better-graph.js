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
import {ItemView, WorkspaceLeaf} from 'obsidian';
import {VIEW_TYPE_BETTER_GRAPH, VIEW_TYPE_GRAPH_SETTINGS} from '../constants';


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
  }

  /**
   * Return the graph container for the better graph view.
   * @return {HTMLElement} The graph container.
   */
  getGraphContainer() {
    return this.graphContainer_;
  }
}
