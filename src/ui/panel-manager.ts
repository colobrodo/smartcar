import Panel from "./panels/panel";

export default class PanelManager {
   private panels: Map<string, Panel> = new Map();
   activePanel: Panel = null;

   add(name: string, panel: Panel) {
      panel.initialize();
      this.panels.set(name, panel);
   }

   run(name: string) {
      if(!this.panels.has(name))
         throw new Error('no panel of name ' + name + ' available');
      const panel = this.panels.get(name);
      this.activePanel?.close();
      panel.run();
      this.activePanel = panel;
   }

   render(context: CanvasRenderingContext2D, dt: number) {
      this.activePanel?.render(context, dt);
   }

}