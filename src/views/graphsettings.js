/**
 * @license
 * Copyright 2020 Obsidian Better Graph View
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class for the graph settings view.
 * @author bekawestberg@gmail.com (Beka Westberg)
 */
'use strict';


import {ItemView} from "obsidian";
import {VIEW_TYPE_BETTER_GRAPH, VIEW_TYPE_GRAPH_SETTINGS} from "../constants";


export class GraphSettingsView extends ItemView {
  constructor(leaf) {
    super(leaf);
  }

  getViewType() {
    return VIEW_TYPE_GRAPH_SETTINGS;
  }

  getDisplayText() {
    return 'Graph settings';
  }

  onOpen() {
    this.contentEl.setAttribute('style', 'background: red');

    const betterGraph = this.app.workspace
        .getLeavesOfType(VIEW_TYPE_BETTER_GRAPH)[0];
    if (betterGraph) {
      betterGraph.view.setSettingsView_(this);
    }
  }
}
