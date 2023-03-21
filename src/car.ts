import Circuit from "./circuit";
import { Line, lineIntersect, Reference2D, Vec2 } from "./core";
import { environment } from "./environment";
import { drawLine } from "./graphics";

export function randomGene(): Vec2 {
   const magnitude = environment.car.maxMagnitude;
   return Vec2.random(magnitude);
}

function randomGenes(size: number): Vec2[] {
   return new Array(size)
      .fill(0)
      .map(() => randomGene());
}

interface DeadState {
   kind: 'dead',
}

interface AliveState {
   kind: 'alive',
}

interface CompletedState {
   kind: 'completed',
   completitionTime: number,
}

type CarState = DeadState | AliveState | CompletedState;

const deadState: DeadState = {kind: 'dead'}; 
const aliveState: AliveState = {kind: 'alive'}; 

export default class Car {
   position = new Vec2(0, 0);
   velocity = new Vec2(0, 0);
   state: CarState = aliveState;
   hittedCheckpoints: Set<Line> = new Set();
   
   private sensors: Vec2[];

   readonly width  = 20;
   readonly height = 40;

   constructor(public genes: Vec2[]) {
      this.sensors = environment.car.sensors;
   }

   static random(): Car {
      return new Car(randomGenes(environment.car.genes));
   }

   private reference() {
      return new Reference2D(this.position, this.velocity.angle())
   }

   update(circuit: Circuit, time: number) {
      if(this.state.kind != 'alive') return;

      if(this.position.x < 0 || this.position.x > window.innerWidth)
         this.state = deadState;
      if(this.position.y < 0 || this.position.y > window.innerHeight)
         this.state = deadState;
      
      for(let wall of circuit.walls) {
         if(this.collide(wall)) {
            this.state = deadState;
            break;
         }
      }

      for(const checkpoint of circuit.checkpoints) {
         if(this.collide(checkpoint)) {
            this.hittedCheckpoints.add(checkpoint);
         }
      }

      if(this.collide(circuit.goal)) {
         this.state = {
            kind: 'completed',
            completitionTime: time,
         }
      }
      
      if(this.state.kind != 'alive') return;

      // TODO: refactor this!
      const checkWalls = (sensor: Vec2) => {
         const endSensor = this.reference().getGlobal(sensor); 
         return circuit.walls.some(wall => {
            return lineIntersect({
               start: this.position, 
               end: endSensor,
            }, wall)
         })
      }
            
      const acceleration = new Vec2(0, 0);
      for(let i = 0; i < this.sensors.length; i += 1) {
         const sensor = this.sensors[i],
            gene = this.genes[i];
         if (checkWalls(sensor)) {
            acceleration.add(gene);
         }
      }

      this.position.add(this.velocity);
      this.velocity.add(acceleration.rotate(this.velocity.angle()));
   }

   stillRunning(): boolean {
      return this.state == aliveState;
   }

   draw(context: CanvasRenderingContext2D) {
      const {colors} = environment;
      
      context.save()
      
      context.translate(this.position.x, this.position.y)
      context.rotate(this.velocity.angle())
      
      // draw sensors
      if(this.stillRunning()) {
         context.strokeStyle = colors.sensor;
         for(const sensor of this.sensors)
            drawLine(context, {
               start: new Vec2(0, 0),
               end: sensor,
            })
      }
      
      // draw car
      context.fillStyle = context.strokeStyle = this.state == deadState ? colors.deadCar : colors.car;
      context.beginPath();
      context.rect(-this.height / 2, -this.width / 2, this.height, this.width);
      context.closePath();
      context.fill();
      context.stroke();
      
      context.restore()
   }

   reset(position: Vec2, velocity: Vec2) {
      this.position = position.copy();
      this.velocity = velocity.copy();
      this.state = aliveState;
   }

   collide(other: Line): boolean {
      const reference = this.reference(),
         ll = reference.getGlobal(new Vec2(- this.height / 2, -this.width / 2)),
         lr = reference.getGlobal(new Vec2(- this.height / 2, this.width / 2)),
         hl = reference.getGlobal(new Vec2(this.height / 2, -this.width / 2)),
         hr = reference.getGlobal(new Vec2(this.height / 2, this.width / 2));

      const collide = lineIntersect(other, {start: ll, end: lr})
                   || lineIntersect(other, {start: ll, end: hl})
                   || lineIntersect(other, {start: hl, end: hr})
                   || lineIntersect(other, {start: hr, end: lr});
      return collide;
   }
}