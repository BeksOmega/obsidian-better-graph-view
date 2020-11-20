import {App, Modal, Notice, Plugin, PluginSettingTab, Setting, WorkspaceLeaf} from 'obsidian';
import TestView from "./view";

export default class MyPlugin extends Plugin {
  onload() {
    console.log('loading plugin');

    this.addRibbonIcon('dice', 'Sample Plugin', () => {
      this.initLeaf();
    });

    this.addStatusBarItem().setText('Status Bar Text');

    this.addCommand({
      id: 'open-sample-modal',
      name: 'Open Sample Modal',
      // callback: () => {
      // 	console.log('Simple Callback');
      // },
      checkCallback: (checking) => {
        let leaf = this.app.workspace.activeLeaf;
        if (leaf) {
          if (!checking) {
            new SampleModal(this.app).open();
          }
          return true;
        }
        return false;
      }
    });

    this.addSettingTab(new SampleSettingTab(this.app, this));

    this.registerEvent(this.app.on('codemirror', (cm) => {
      console.log('codemirror', cm);
    }));

    this.registerDomEvent(document, 'click', (evt) => {
      console.log('click', evt);
    });

    this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));

    this.registerView('testview', (leaf) => new TestView(leaf));
  }

  initLeaf() {
    if (this.app.workspace.getLeavesOfType('testview').length) {
      return;
    }
    this.app.workspace.getRightLeaf(false).setViewState({
      type: 'testview',
    });
  }

  onunload() {
    console.log('unloading plugin');
  }
}

class SampleModal extends Modal {
  constructor(app) {
    super(app);
  }

  onOpen() {
    let {contentEl} = this;
    contentEl.setText('Woah!');
  }

  onClose() {
    let {contentEl} = this;
    contentEl.empty();
  }
}

class SampleSettingTab extends PluginSettingTab {
  display() {
    let {containerEl} = this;

    containerEl.empty();

    containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});

    new Setting(containerEl)
        .setName('Setting #1')
        .setDesc('It\'s a secret')
        .addText(text => text.setPlaceholder('Enter your secret')
            .setValue('')
            .onChange((value) => {
              console.log('Secret: ' + value);
            }));

  }
}
