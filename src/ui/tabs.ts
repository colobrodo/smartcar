export interface Tab {
   name: string;
   open(): void;
}

export class TabGroup {
   private activeTab: Tab = null;
   private buttons = new Map<string, HTMLElement>();
   private tabs = new Map<string, Tab>();
   private bindedElements = new Map<string, HTMLElement[]>(); 

   constructor() {}

   open(name: string) {
      const tab = this.tabs.get(name);
      if(!tab) {
         throw new Error('Error: cannot find a tab named \'' + name + '\'' );
      }

      if(this.activeTab) {
         const tabButton = this.buttons.get(this.activeTab.name);
         tabButton?.classList.remove('active');
         const elements = this.bindedElements.get(this.activeTab.name) || [];
         for(const bindedElement of elements) {
            bindedElement.classList.remove('active');
         }
      }
      const newButton = this.buttons.get(tab.name);
      newButton?.classList.add('active');
      this.activeTab = tab;
      const elements = this.bindedElements.get(name) || [];
      for(const bindedElement of elements) {
         bindedElement.classList.add('active');
      }
      tab.open();
   }

   attach(button: HTMLElement, tab: Tab) {
      this.buttons.set(tab.name, button);
      this.tabs.set(tab.name, tab);
      button.onclick = () => this.open(tab.name);
   }

   bind(name: string, ...elements: HTMLElement[]) {
      const tab = this.tabs.get(name);
      if(!tab) {
         throw new Error('Error: cannot find a tab named \'' + name + '\'' );
      }
      this.bindedElements.set(name, elements);
   }
}
