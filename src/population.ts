import Circuit from "./circuit";
import Car, { randomGene } from "./car";
import { Vec2 } from "./core";
import { environment } from "./environment";
import { tooltip } from "./ui";

export default class Population {
   readonly size: number;

   constructor(public items: Car[]) {
      this.size = this.items.length;
   }
      
   private splitPointCrossover(parentA: Car, parentB: Car): Vec2[] {
      let aGenes = parentA.genes,
         bGenes = parentB.genes,
         dnaLength = aGenes.length;
      const splitPoint = Math.floor(Math.random() * dnaLength);
      return aGenes.slice(0, splitPoint)
         .concat(bGenes.slice(splitPoint));
   }
   
   private uniformCrossover(parentA: Car, parentB: Car): Vec2[] {
      let aGenes = parentA.genes,
         bGenes = parentB.genes,
         dnaLength = aGenes.length,
         newDNA = [];
      for(let i = 0; i < dnaLength; i += 1) {
         // choose the gene randomly from first or second parent 
         const chooseFirst = Math.random() > .5,
            geneA = aGenes[i],
            geneB = bGenes[i],
            newGene = chooseFirst ? geneA : geneB;
         newDNA.push(newGene);
      }
      return newDNA;
   }

   private intermediateCrossover(parentA: Car, parentB: Car): Vec2[] {
      let aGenes = parentA.genes,
         bGenes = parentB.genes,
         dnaLength = aGenes.length,
         newDNA = [];
      for(let i = 0; i < dnaLength; i += 1) {
         // interpolate each gene of the parent by a random factor
         const alpha = Math.random(),
            geneA = aGenes[i],
            geneB = bGenes[i],
            newGene = geneA.sum(geneB.minus(geneA).mul(alpha));
         newDNA.push(newGene);
      }
      return newDNA;
   }

   private discreteMutation(dna: Vec2[]) {
      for(let i = 0; i < dna.length; i += 1) {
         if(Math.random() < environment.mutationRate)
         dna[i] = randomGene();
      }
   }
   
   private explicitMutation(dna: Vec2[]) {
      for(let i = 0; i < dna.length; i += 1) {
         const gene = dna[i];
         if(Math.random() < environment.mutationRate) {
            const perturbation = Vec2.random(.05);
            // TODO: clamp magnitude
            gene.add(perturbation);
         }
      }
   }

   evaluate(circuit: Circuit) {
      const {lifespan} = environment,
         matingPool = this.items;

      const crossover = {
         'split-point':  this.splitPointCrossover,
         'intermediate': this.intermediateCrossover,
         'uniform':      this.uniformCrossover,
      }[environment.crossover];
      const mutate = {
         'discrete': this.discreteMutation,
         'explicit': this.explicitMutation,
      }[environment.mutation];


      function fitness(car: Car): number {
         if(car.state.kind == 'completed') {
            return environment.score.base + (1 - car.state.completitionTime / lifespan) * environment.score.onGoal;
         }
         const totalCheckpoints = circuit.checkpoints.length || 1,
         hitted = car.hittedCheckpoints.size;
         let score = hitted / (totalCheckpoints + 1) * environment.score.base;
         if(car.state.kind == 'dead') score -= environment.score.deadPenality;
         return Math.max(0, score);
      }

      const fitnesses = matingPool.map(fitness),
         totalFitness = fitnesses.reduce((a, b) => a + b),
         probabilities = fitnesses.map(fit => fit / totalFitness);
      
      function select() {
         let p = Math.random();
         for(let i = 0; i < matingPool.length; i += 1) {
            const probability = probabilities[i],
               element = matingPool[i];
            if(p > probability)
               p -= probability;
            else
               return element;
         }
      }

      // elithism: include the best element in the next population
      let bestFit = 0,
         elite = null;
      for(let i = 0; i < this.size; i += 1) {
         const fit = fitnesses[i];
         if(fit > bestFit) {
            bestFit = fit;
            elite = matingPool[i];
         }
      }

      const averageFit = totalFitness / matingPool.length;
      tooltip.update({
         maxFitness: bestFit,
         averageFitness: averageFit,
      })

      const nextGeneration: Car[] = [elite];
      for(let i = 0; i < this.size - 1; i += 1) {
         const firstParent = select(),
            secondParent = select(),
            newDNA = crossover(firstParent, secondParent);
         mutate(newDNA);
         nextGeneration.push(new Car(newDNA))
      }
      this.items = nextGeneration;
   }
   
   static random(size: number): Population {
      return new Population(
         new Array(size)
            .fill(0)
            .map(() => Car.random())
         );
   }
}
