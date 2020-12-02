/**
 * @license
 * Copyright 2020 Obsidian Better Graph View
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class for the default graph renderer. Uses simple circles and
 *     lines to draw the graph.
 * @author bekawestberg@gmail.com (Beka Westberg)
 */
'use strict';


import {Renderer} from './i-renderer';
import * as PIXI from 'pixi.js';


export class Simple extends Renderer {
  constructor(pixiApp) {
    super(pixiApp);

    /**
     * Map of node ids to particle containers (which render the nodes).
     * @type {Map<string, PIXI.Container>}
     * @private
     */
    this.nodesMap_ = new Map();
  }

  onLayoutUpdate(graph) {
    graph.getNodes().forEach((node) => {
      let container;
      if (this.nodesMap_.has(node.id)) {
        container = this.nodesMap_.get(node.id);
      } else {
        container = new PIXI.Container();
        let circle = new PIXI.Graphics();
        circle.beginFill(0x666666);
        circle.drawCircle(0, 0, 32);
        circle.endFill();

        this.pixi_.stage.addChild(container);
        container.addChild(circle);
        this.nodesMap_.set(node.id, container);
      }
      container.setTransform(node.x, node.y);
    })
  }
}
