import { Vec2, Line } from './core';
import { environment } from './environment';
import { drawLine } from './graphics';

export default class Circuit {
   goal: Line;
   checkpoints: Line[] = [];
   spawnPoint: Vec2;
   startVelocity = new Vec2(2, 1.6);

   constructor(public walls: Line[]) {}

   draw(context: CanvasRenderingContext2D) {
      const {colors} = environment;
      context.strokeStyle = colors.wall;
      for(let wall of this.walls) 
         drawLine(context, wall);
      context.strokeStyle = colors.goal;
      if(this.goal) 
         drawLine(context, this.goal);
      context.strokeStyle = colors.checkpoint;
      for(let checkpoint of this.checkpoints)
         drawLine(context, checkpoint);

      context.closePath();
      context.fillStyle = colors.spawnPoint;
      context.arc(this.spawnPoint.x, this.spawnPoint.y, 5, 0, 2 * Math.PI);
      context.fill();
      
      context.beginPath();
      context.strokeStyle = colors.spawnPoint;
      context.moveTo(this.spawnPoint.x, this.spawnPoint.y);
      const zoomFactor = 10,
         velocityArrow = this.spawnPoint.sum(this.startVelocity.mul(zoomFactor));
      context.lineTo(velocityArrow.x, velocityArrow.y);
      context.stroke();
      context.closePath();
   }

   static from(data: any): Circuit {
      function lineFrom(object: any): Line {
         const start = Object.assign(new Vec2(0, 0), object['start']),
            end = Object.assign(new Vec2(0, 0), object['end']);
         return {start, end};
      }
      let walls = data['walls'].map(lineFrom),
         goal = lineFrom(data['goal']),
         checkpoints = data['checkpoints'].map(lineFrom),
         spawnPoint = Object.assign(new Vec2(0, 0), data['spawnPoint']),
         startVelocity = Object.assign(new Vec2(0, 0), data['startVelocity']);
      return Object.assign(new Circuit([]), {
         walls, 
         goal, 
         checkpoints, 
         spawnPoint,
         startVelocity,
      });
   }

}