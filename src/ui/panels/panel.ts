import { keyboard, KeyHandler, KeyboardModifiers } from "../../keyboard";

export default abstract class Panel {
   protected active: boolean = false;

   run() {
      this.active = true;
   }

   close() {
      this.active = false;
   }

   abstract initialize();

   abstract render(context: CanvasRenderingContext2D, dt: number);

   addShortcut(key: string, handler: KeyHandler, modifiers=KeyboardModifiers.NONE) {
      const wrapper = event => {
         if(!this.active) return;
         handler(event);
      };
      keyboard.listen(key, wrapper, modifiers);
   }
}