export default abstract class Tooltip {
   public constructor(public element: HTMLElement) {}

   protected abstract write();

   show() {
      this.element.style.display = 'block';
   }

   hide() {
      this.element.style.display = 'none';
   }

}