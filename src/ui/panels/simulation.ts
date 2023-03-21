import Circuit from "../../circuit";
import Panel from "./panel";
import Population from "../../population";
import { environment } from "../../environment";
import { tooltip } from "..";

export default class SimulationPanel extends Panel {
   population: Population = null;

   private readonly lifespan = environment.lifespan;
   private time = 0;
   private generation = 0;
   paused = false;

   readonly populationSize: number = environment.population.size;

   constructor(public circuit: Circuit) {
      super();
   }

   private reset() {
      this.time = 0;
      for(const car of this.population.items) {
         car.reset(this.circuit.spawnPoint, this.circuit.startVelocity);
      }
      this.generation += 1;
      tooltip.update({generation: this.generation})
   }

   initialize() {
      // initialize population
      tooltip.reset();
      this.generation = 0;
      this.population = Population.random(this.populationSize);
      this.reset();
   }

   run() {
      super.run();
      tooltip.show();
      this.initialize();
   }
   
   close() {
      super.close();
      tooltip.hide();
   }
   
   update(dt: number) {
      const timeExpired = this.time >= this.lifespan,
         endedGeneration = !this.population.items.some(car => car.stillRunning());
      if(timeExpired || endedGeneration) {
         // no car alive evaluate next generation of cars
         this.population.evaluate(this.circuit);
         // reset car positions
         this.reset();
      }

      for(let car of this.population.items) {
         car.update(this.circuit, this.time);
      }

      this.time += 1;
   }

   render(context: CanvasRenderingContext2D, dt: number) {
      if(!this.paused) {
         this.update(dt);
      }

      this.circuit.draw(context);

      for(let car of this.population.items) {
         car.draw(context);
      }

      // draw time line
      context.fillStyle = environment.colors.lifespanBar;
      const w = context.canvas.width,
         h = context.canvas.height,
         bar = w * (1 - this.time / this.lifespan),
         barHeight = 5;
      context.fillRect(0, h - barHeight, bar, barHeight)
   } 
}