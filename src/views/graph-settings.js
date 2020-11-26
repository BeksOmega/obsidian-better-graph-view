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


import {
  DropdownComponent,
  ItemView, Setting,
  SliderComponent,
  ToggleComponent
} from 'obsidian';
import {VIEW_TYPE_BETTER_GRAPH, VIEW_TYPE_GRAPH_SETTINGS} from "../constants";
import {GraphBuilderRegistry} from '../graph-builders/graph-builders-registry';
import {GraphBuilder} from '../graph-builders/i-graphbuilder';


export class GraphSettingsView extends ItemView {
  constructor(leaf) {
    super(leaf);

    /**
     * Map of ids to graph builder instances.
     * @type {Map<string, GraphBuilder>}
     * @private
     */
    this.builders_ = new Map();
  }

  getViewType() {
    return VIEW_TYPE_GRAPH_SETTINGS;
  }

  getDisplayText() {
    return 'Graph settings';
  }

  onOpen() {
    const setting = new Setting(this.contentEl);
    setting.nameEl.appendChild(document.createTextNode('Graph builder'));
    const buildersDropdown = new DropdownComponent(setting.controlEl);
    for (const [id, builderFn] of GraphBuilderRegistry.graphBuilders) {
      const builder = new builderFn();
      this.builders_.set(id, builder);
      buildersDropdown.addOption(id, builder.getDisplayName());
    }

    this.createConfigUI_(this.builders_.values().next().value);

    const betterGraph = this.app.workspace
        .getLeavesOfType(VIEW_TYPE_BETTER_GRAPH)[0];
    if (betterGraph) {
      betterGraph.view.setSettingsView_(this);
    }
  }

  /**
   * Creates the UI to configure a given graph builder.
   * @param {GraphBuilder} builder The builder to create the config UI for.
   * @private
   */
  createConfigUI_(builder) {
    console.log(builder);
    const config = builder.getConfig();
    for (const opt of config) {
      const setting = new Setting(this.contentEl);
      setting.nameEl.appendChild(document.createTextNode(opt.displayText));
      switch(opt.type) {
        case 'toggle':
          this.createConfigToggle_(setting, opt);
          break;
        case 'slider':
          this.createConfigSlider_(setting, opt);
          break;
        case 'dropdown':
          this.createConfigDropdown_(setting, opt);
          break;
        default:
          throw 'Unknown config option type: ' + opt.type;
      }
    }
  }

  createConfigToggle_(setting, option) {
    const toggle = new ToggleComponent(setting.controlEl);
    toggle.setValue(!!option.default);
  }

  createConfigSlider_(setting, option) {
    const slider = new SliderComponent(setting.controlEl);
    slider.setDynamicTooltip();
    slider.setLimits(
        option.min || 0,
        option.max || 10,
        option.step || 1
    );
    slider.setValue(option.default || 0);
  }

  createConfigDropdown_(setting, option) {
    const dropdown = new DropdownComponent(setting.controlEl);
    if (!option.optionList) {
      throw 'Dropdown "' + option.id + '" must have optionList';
    }
    for (const opt of option.optionList) {
      dropdown.addOption(opt.id, opt.displayText);
    }
    dropdown.setValue(option.default || option.optionList[0].id);
  }
}
