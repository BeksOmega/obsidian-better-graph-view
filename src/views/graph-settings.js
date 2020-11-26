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
  ToggleComponent,
  ValueComponent
} from 'obsidian';
import {VIEW_TYPE_BETTER_GRAPH, VIEW_TYPE_GRAPH_SETTINGS} from "../constants";
import {GraphBuilderRegistry} from '../graph-builders/graph-builders-registry';
import {GraphBuilder} from '../graph-builders/i-graphbuilder';


export class GraphSettingsView extends ItemView {
  constructor(leaf) {
    super(leaf);

    /**
     * Map of ids to graph builder instances.
     * @type {!Map<string, GraphBuilder>}
     * @private
     */
    this.builders_ = new Map();

    /**
     * The currently selected graph builder.
     * @type {GraphBuilder|null}
     * @private
     */
    this.selectedBuilder_ = null;

    /**
     * A map of config option ids to value components which represent those
     * config options
     * @type {!Map<string, ValueComponent>}
     * @private
     */
    this.settings_ = new Map();

    /**
     * The current configuration of the graph builder.
     * @type {Map|null}
     * @private
     */
    this.currentBuilderConfig_ = null;

    /**
     * The sigma instance running the better graph view.
     * @type {Object|null}
     * @private
     */
    this.sigma_ = null;
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

    this.selectedBuilder_ = this.builders_.values().next().value;
    this.createConfigUI_(this.selectedBuilder_);

    const betterGraph = this.app.workspace
        .getLeavesOfType(VIEW_TYPE_BETTER_GRAPH)[0];
    if (betterGraph) {
      this.setGraphView(betterGraph.view);
    }
  }

  /**
   * Cleans up any references to facilitate garbage collection.
   * @return {Promise<void>}
   */
  async onClose() {
    if (this.sigma_) {
      this.sigma_.kill();
    }
    return Promise.resolve();
  }

  /**
   * Sets the graph associated with this graph settings view.
   * @param {BetterGraphView} graphView The better graph view.
   */
  setGraphView(graphView) {
    this.sigma_ = new sigma({
      renderer: {
        container: graphView.getGraphContainer(),
        type: 'canvas',
      }
    });

    this.selectedBuilder_.setGraph(this.sigma_.graph);
    this.currentBuilderConfig_ = this.generateConfig_();
    this.selectedBuilder_.generateGraph(
        this.currentBuilderConfig_, this.app.vault, this.app.metadataCache);

    this.forceAtlas_ = this.sigma_.startForceAtlas2({
      worker: true,
      barnesHutOptimize: false,
      startingIterations: 500,
      scalingRatio: .025,
      slowDown: 10,
    });

    const dragListener = sigma.plugins.dragNodes(
        this.sigma_, this.sigma_.renderers[0]);
    dragListener.bind('startdrag', function(event) {
      this.forceAtlas_.supervisor.setDraggingNode(event.data.node);
    }.bind(this));
    dragListener.bind('dragend', function (event) {
      this.forceAtlas_.supervisor.setDraggingNode(null);
    }.bind(this));
  }

  /**
   * Creates the UI to configure a given graph builder.
   * @param {GraphBuilder} builder The builder to create the config UI for.
   * @private
   */
  createConfigUI_(builder) {
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

  /**
   * Creates a toggle ui representing a config option.
   * @param {!Setting} setting The setting to add the toggle to.
   * @param {Object} option The option parameters.
   * @private
   */
  createConfigToggle_(setting, option) {
    const toggle = new ToggleComponent(setting.controlEl);
    toggle.setValue(!!option.default);
    this.subscribeToComponentChanges_(option.id, toggle);
  }

  /**
   * Creates a slider ui representing a config option.
   * @param {!Setting} setting The setting to add the toggle to.
   * @param {Object} option The option parameters.
   * @private
   */
  createConfigSlider_(setting, option) {
    const slider = new SliderComponent(setting.controlEl);
    slider.setDynamicTooltip();
    slider.setLimits(
        option.min || 0,
        option.max || 10,
        option.step || 1
    );
    slider.setValue(option.default || 0);
    this.subscribeToComponentChanges_(option.id, slider);
  }

  /**
   * Creates a dropdown ui representing a config option.
   * @param {!Setting} setting The setting to add the toggle to.
   * @param {Object} option The option parameters.
   * @private
   */
  createConfigDropdown_(setting, option) {
    if (!option.optionList) {
      throw 'Dropdown "' + option.id + '" must have optionList';
    }

    const dropdown = new DropdownComponent(setting.controlEl);
    for (const opt of option.optionList) {
      dropdown.addOption(opt.id, opt.displayText);
    }
    dropdown.setValue(option.default || option.optionList[0].id);
    this.subscribeToComponentChanges_(option.id, dropdown);
  }

  /**
   * Adds the value component to the map of settings, and adds a change listener
   * to the value component.
   * @param {string} id The id of the component.
   * @param {ValueComponent} valueComponent The component to listen to.
   * @private
   */
  subscribeToComponentChanges_(id, valueComponent) {
    this.settings_.set(id, valueComponent);
    valueComponent.onChange(this.updateConfig_.bind(this));
  }

  /**
   * Generates a new config and passes it to the selected builder.
   * @private
   */
  updateConfig_() {
    this.sigma_.killForceAtlas2();

    const newConfig = this.generateConfig_();
    this.selectedBuilder_.onConfigUpdate(
        this.currentBuilderConfig_,
        newConfig,
        this.app.vault,
        this.app.metadataCache);
    this.currentBuilderConfig_ = newConfig;

    //this.forceAtlas_.supervisor.graphToByteArrays();
    this.sigma_.startForceAtlas2({
      worker: true,
      barnesHutOptimize: false,
      startingIterations: 500,
      scalingRatio: .025,
      slowDown: 10,
    });
  }

  /**
   * Generates the current configuration for the graph.
   * @return {Map<string, *>} The current configuration for the graph.
   * @private
   */
  generateConfig_() {
    const config = new Map();
    for (const [id, valueComponent] of this.settings_) {
      config.set(id, valueComponent.getValue());
    }
    return config;
  }
}
