export type KeyHandler = (event: KeyboardEvent) => void; 

export enum KeyboardModifiers {
   NONE = 0,
   CTRL = 1,
   SHIFT = 2,
}

export interface KeyPress {
   key: string,
   modifiers: KeyboardModifiers,
}

export class Keyboard {
   handlers: Map<string, KeyHandler> = new Map();
   constructor(window: Window) {
      window.addEventListener('keypress', event => this.handleEvent(event));
   }

   private handleEvent(event: KeyboardEvent) {
      let modifiers = KeyboardModifiers.NONE;
      if(event.shiftKey) modifiers |= KeyboardModifiers.SHIFT;
      if(event.ctrlKey)  modifiers |= KeyboardModifiers.CTRL;
      const keyPress = {key: event.key, modifiers},
         handler = this.handlers.get(event.key);
      if(!handler) return;
      event.preventDefault();
      handler(event);
   }

   listen(key: string, handler: KeyHandler, modifiers=KeyboardModifiers.NONE) {
      this.handlers.set(key, handler)
   }

}

export const keyboard = new Keyboard(window);