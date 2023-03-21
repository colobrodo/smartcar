import { Vec2, Line } from '../../core';
import Circuit from '../../circuit';
import { drawLine, pointInLine, isInsideCircle } from '../../graphics';
import * as db from '../../db';

import Panel from './panel';
import { environment } from '../../environment';


export enum EntityType {
   WALL,
   GOAL,
   CHECKPOINT,
}

export enum EditorMode {
   DRAW,
   CANCEL,
}

interface Entity {
   type: EntityType,
   entity: Line,
}

export default class Editor extends Panel {
   lastPoint: Vec2 = null;
   currentPoint: Vec2 = null;
   mousePressed = false;
   movingVelocity = false;
   private drawSubject: EntityType = EntityType.WALL;
   private mode: EditorMode = EditorMode.DRAW;

   constructor(public circuit: Circuit = null) {
      super();
      this.circuit = circuit ?? new Circuit([]);
   }

   initialize() {
      this.attachHandlers();
   }

   run() {
      super.run();
      this.resetDraw();
   }

   close() {
      super.close();
      const loadedCircuit = db.currentEntry();
      db.save(loadedCircuit, this.circuit);
   }

   setMode(mode: EditorMode) {
      this.mode = mode;
   }

   setDrawSubject(subject: EntityType) {
      this.drawSubject = subject;
   }

   private findEntity(point: Vec2): Entity {
      const threshold = 2;
      // returns an object with the entity touching the point and his type
      for (const wall of this.circuit.walls) {
         if (pointInLine(point, wall, threshold))
            return { entity: wall, type: EntityType.WALL };
      }
      for (const checkpoint of this.circuit.checkpoints) {
         if (pointInLine(point, checkpoint, threshold))
            return { entity: checkpoint, type: EntityType.CHECKPOINT };
      }
      if (this.circuit.goal && pointInLine(point, this.circuit.goal, threshold))
         return { entity: this.circuit.goal, type: EntityType.GOAL };
      return null;
   }

   private deleteEntity(toErase: Entity) {
      const { entity, type } = toErase;
      if (type == EntityType.GOAL) {
         this.circuit.goal = null;
      } else if (type == EntityType.WALL) {
         const i = this.circuit.walls.indexOf(entity);
         this.circuit.walls.splice(i, 1);
      } else if (type == EntityType.CHECKPOINT) {
         const i = this.circuit.checkpoints.indexOf(entity);
         this.circuit.checkpoints.splice(i, 1);
      }
   }

   private attachHandlers() {

      function getMousePosition(event: MouseEvent): Vec2 {
         const target = <HTMLElement>event.target;
         if (target.nodeName !== 'CANVAS')
            return null;
         const rect = target.getBoundingClientRect();
         return new Vec2(event.clientX - rect.left, event.clientY - rect.top);
      }

      window.onmouseup = (event: MouseEvent) => {
         if (!this.active) return;
         if (!this.mousePressed) return;
         if(this.movingVelocity) {
            this.movingVelocity = false;
         } else if (this.mode == EditorMode.DRAW) {
            const line = { start: this.lastPoint, end: this.currentPoint };
            switch (this.drawSubject) {
               case EntityType.WALL: {
                  this.circuit.walls.push(line);
                  break;
               }
               case EntityType.GOAL: {
                  this.circuit.goal = structuredClone(line);
                  break;
               }
               case EntityType.CHECKPOINT: {
                  this.circuit.checkpoints.push(line);
                  break;
               }
            }
            this.resetDraw();
         }
         this.mousePressed = false;
      }

      window.onmousemove = (event: MouseEvent) => {
         if (!this.active) return;

         const mousePosition = getMousePosition(event);
         // mouse outside permitted region
         if (mousePosition == null) return;
         if (this.mode == EditorMode.DRAW) {
            if(this.movingVelocity) {
               // setting starting velocity
               const velocity = new Vec2(1, 0),
                  angle = mousePosition.angleBetween(this.circuit.spawnPoint);
               this.circuit.startVelocity = velocity.rotate(angle).mul(2);
            } else {
               this.currentPoint = mousePosition;
            }
         } else if (this.mode == EditorMode.CANCEL) {
            if (!this.mousePressed) {
               return;
            }
            const toErase = this.findEntity(mousePosition);
            if (toErase == null) return;
            this.deleteEntity(toErase);
         }
      }

      window.onmousedown = (event: MouseEvent) => {
         if (!this.active) return;

         const mousePosition = getMousePosition(event);
         // mouse outside permitted region
         if (mousePosition == null) return;

         if (event.ctrlKey) {
            // setting the spawn point
            this.circuit.spawnPoint = mousePosition;
            return;
         }

         this.mousePressed = true;

         if (this.mode == EditorMode.DRAW) {
            if(isInsideCircle(mousePosition, this.circuit.spawnPoint, 5)) {
               // moving start velocity
               this.movingVelocity = true;
            } else if (this.lastPoint == null) {
               this.lastPoint = mousePosition;
               return;
            }
         }
      }
   }

   drawing() {
      return this.mousePressed && !this.movingVelocity && this.mode == EditorMode.DRAW;
   }

   render(context: CanvasRenderingContext2D, dt: number) {
      const { colors } = environment;
      if (this.drawing()) {
         context.strokeStyle = colors.wall;;
         switch (this.drawSubject) {
            case EntityType.GOAL: {
               context.strokeStyle = colors.goal;
               break;
            }
            case EntityType.CHECKPOINT: {
               context.strokeStyle = colors.checkpoint;
               break;
            }
         }
         drawLine(context, { start: this.currentPoint, end: this.lastPoint });
      }

      this.circuit.draw(context);
   }

   resetDraw() {
      this.lastPoint = null;
      this.currentPoint = null;
   }

}
