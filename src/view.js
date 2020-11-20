import { ItemView, WorkspaceLeaf} from 'obsidian';
//import "../sigma/src/sigma.export";
import '../sigma/src/sigma.core';
import '../sigma/src/conrad';
import '../sigma/src/utils/sigma.utils';
import '../sigma/src/utils/sigma.polyfills';
import '../sigma/src/sigma.settings'
import '../sigma/src/classes/sigma.classes.dispatcher';
import '../sigma/src/classes/sigma.classes.configurable';
import '../sigma/src/classes/sigma.classes.graph';
import '../sigma/src/classes/sigma.classes.camera';
import '../sigma/src/classes/sigma.classes.quad';
import '../sigma/src/classes/sigma.classes.edgequad';
import '../sigma/src/captors/sigma.captors.mouse';
import '../sigma/src/captors/sigma.captors.touch';
import '../sigma/src/renderers/sigma.renderers.webgl';
import '../sigma/src/renderers/sigma.renderers.canvas';
import '../sigma/src/renderers/sigma.renderers.def';
import '../sigma/src/renderers/webgl/sigma.webgl.nodes.def';
import '../sigma/src/renderers/webgl/sigma.webgl.nodes.fast';
import '../sigma/src/renderers/webgl/sigma.webgl.edges.def';
import '../sigma/src/renderers/webgl/sigma.webgl.edges.fast';
import '../sigma/src/renderers/webgl/sigma.webgl.edges.arrow';
import '../sigma/src/renderers/canvas/sigma.canvas.labels.def';
import '../sigma/src/renderers/canvas/sigma.canvas.hovers.def';
import '../sigma/src/renderers/canvas/sigma.canvas.nodes.def';
import '../sigma/src/renderers/canvas/sigma.canvas.edges.def';
import '../sigma/src/renderers/canvas/sigma.canvas.edges.curve';
import '../sigma/src/renderers/canvas/sigma.canvas.edges.arrow';
import '../sigma/src/renderers/canvas/sigma.canvas.edges.curvedArrow';
import '../sigma/src/renderers/canvas/sigma.canvas.edgehovers.def';
import '../sigma/src/renderers/canvas/sigma.canvas.edgehovers.arrow';
import '../sigma/src/renderers/canvas/sigma.canvas.edgehovers.curvedArrow';
import '../sigma/src/renderers/canvas/sigma.canvas.extremities.def';
/*
import '../sigma/src/renderers/svg/sigma.svg.utils';
import '../sigma/src/renderers/svg/sigma.svg.nodes.def';
import '../sigma/src/renderers/svg/sigma.svg.edges.def';
import '../sigma/src/renderers/svg/sigma.svg.edges.curve';
import '../sigma/src/renderers/svg/sigma.svg.labels.def';
import '../sigma/src/renderers/svg/sigma.svg.hovers.def';
*/
import '../sigma/src/middlewares/sigma.middlewares.rescale';
import '../sigma/src/middlewares/sigma.middlewares.copy';
import '../sigma/src/misc/sigma.misc.animation';
import '../sigma/src/misc/sigma.misc.bindEvents';
import '../sigma/src/misc/sigma.misc.bindDOMEvents';
import '../sigma/src/misc/sigma.misc.drawHovers';

import '../sigma/plugins/sigma.layout.forceAtlas2/worker'
import '../sigma/plugins/sigma.layout.forceAtlas2/supervisor'

export default class TestView extends ItemView {
  /**
   * @param {WorkspaceLeaf} leaf
   */
  constructor(leaf) {
    super(leaf);
  }

  getViewType() {
    return 'testview';
  }

  getDisplayText() {
    return 'a test view';
  }

  async onOpen() {
    const div = document.createElement('div');
    div.setAttribute('id', 'graph-container');
    this.contentEl.appendChild(div);

    var i,
        s,
        o,
        N = 100,
        E = 500,
        C = 5,
        d = 0.5,
        cs = [],
        g = {
          nodes: [],
          edges: []
        };

    // Generate the graph:
    for (i = 0; i < C; i++)
      cs.push({
        id: i,
        nodes: [],
        color: '#' + (
            Math.floor(Math.random() * 16777215).toString(16) + '000000'
        ).substr(0, 6)
      });

    for (i = 0; i < N; i++) {
      o = cs[(Math.random() * C) | 0];
      g.nodes.push({
        id: 'n' + i,
        label: 'Node' + i,
        x: 100 * Math.cos(2 * i * Math.PI / N),
        y: 100 * Math.sin(2 * i * Math.PI / N),
        size: Math.random(),
        color: o.color
      });
      o.nodes.push('n' + i);
    }

    for (i = 0; i < E; i++) {
      if (Math.random() < 1 - d)
        g.edges.push({
          id: 'e' + i,
          source: 'n' + ((Math.random() * N) | 0),
          target: 'n' + ((Math.random() * N) | 0)
        });
      else {
        o = cs[(Math.random() * C) | 0];
        g.edges.push({
          id: 'e' + i,
          source: o.nodes[(Math.random() * o.nodes.length) | 0],
          target: o.nodes[(Math.random() * o.nodes.length) | 0]
        });
      }
    }

    s = new sigma({
      graph: g,
      container: div,
      //renderer: 'canvas',
    });

    s.startForceAtlas2({worker: true, barnesHutOptimize: false});
  }
}
