import { Vec2 } from "./core";

const sensors = [new Vec2(30, 30), new Vec2(30, -30), new Vec2(45, 30), new Vec2(45, -30), new Vec2(50, 15), new Vec2(50, -15), new Vec2(50, 0)];

export const environment = {
   colors: {
      sensor: '#ff000088',
      car: '#00ffff88',
      deadCar: '#aaaaaa44',
      checkpoint: 'green',
      wall: 'black',
      goal: 'red',
      spawnPoint: 'blue',
      lifespanBar: 'red',
   },

   crossover: 'uniform', // split-point | intermediate | uniform
   mutation: 'discrete', // discrete | explicit
   mutationRate: 0.03, // for each gene
   score: {
      base: 10,
      onGoal: 50,
      deadPenality: 0,
   },
   
   lifespan: 800,
   population: {
      size: 30,
   },
   car: {
      sensors,
      genes: sensors.length,
      maxMagnitude: 0.2,
   }
};