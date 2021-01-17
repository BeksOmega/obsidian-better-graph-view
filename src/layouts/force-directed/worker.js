/**
 * @license
 * Copyright 2020 Obsidian Better Graph View
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The webworker that wraps the force simulation.
 * @author bekawestberg@gmail.com (Beka Westberg)
 */
'use strict';


import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceX,
  forceY,
} from 'd3-force';


const START_ITERATIONS = 500;

/**
 * TODO:
 * The force simulation associated with this layout.
 * @type {!Object}
 */
const simulation = forceSimulation();

/**
 * TODO:
 * The link force associated with this layout.
 * @type {force}
 */
const linkForce = forceLink();

let index = 0;

const post = function() {
  console.log(simulation.nodes()[index]);
  self.postMessage({nodes: simulation.nodes()});
};

linkForce
    .id(node => node.id)
    .distance(30)
    .strength(1);

simulation
    .force('link', linkForce)
    .force('x', forceX(0).strength(.05))
    .force('y', forceY(0).strength(.06))
    .force('repel', forceManyBody().strength(-50))
    .on('tick', post);

self.onmessage = function(event) {
  switch (event.data.type) {
    case 'reset':
      simulation.nodes(event.data.nodes);
      linkForce.links(event.data.links);
      //simulation.tick(100);
      simulation.alpha(1).restart();
      break;
    case 'fixed':
      console.log('got fixed');

      simulation.nodes().forEach((node) => {
        if (node.id == event.data.node.id) {
          index = node.index;
          console.log(index);
          node.fx = event.data.node.fx;
          node.fy = event.data.node.fy;
          node.x = node.fx;
          node.y = node.fy;
        }
      });
      break;
  }


  // console.log('data from outside', event.data);
  // self.postMessage('hi back!');
};


