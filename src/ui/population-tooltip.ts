import Tooltip from "./tooltip";

export interface TooltipInfo {
   maxFitness: number,
   averageFitness: number,
   generation: number,
}

export default class PopulationTooltip extends Tooltip {
   private info: TooltipInfo = {
      maxFitness: 0,
      averageFitness: 0,
      generation: 0,
   }

   maxLabel: HTMLElement;
   averageLabel: HTMLElement;
   generationLabel: HTMLElement;

   public constructor(element: HTMLElement) {
      super(element);
      this.maxLabel = element.querySelector('.max-fit')!;
      this.averageLabel = element.querySelector('.avg-fit')!;
      this.generationLabel = element.querySelector('.generation')!;
   }

   protected write() {
      const {maxFitness, averageFitness, generation} = this.info;
      this.maxLabel.innerHTML = maxFitness.toString(); 
      this.averageLabel.innerHTML = averageFitness.toString();
      this.generationLabel.innerHTML = generation.toString();
   }

   
   update(newInfo: Partial<TooltipInfo>) {
      this.info = {...this.info, ...newInfo};
      this.write();
   }

   reset() {
      this.update({
         maxFitness: 0,
         averageFitness: 0,
         generation: 0,
      });
   }
}