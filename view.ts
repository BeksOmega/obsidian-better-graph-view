import { ItemView, WorkspaceLeaf} from 'obsidian';

export default class TestView extends ItemView {
     constructor(leaf: WorkspaceLeaf) {
         super(leaf);
     }

     getViewType(): string {
         return 'testview';
     }

     getDisplayText(): string {
         return 'a test view';
     }

     async onOpen() {
         const div = document.createElement('div');
         div.setAttribute('style', 'background-color: green;');
         (this as any).contentEl.appendChild(div);
     }
}
