import { Vec2 } from "./core";
import Circuit from "./circuit";
import * as ui from "./ui";
import { panels } from './ui';
import * as db from './db'


function createCircuit(points: Vec2[]): Circuit {
   const walls = [];
   for(let i = 0; i < points.length; i += 1) {
      const p1 = points[i],
            p2 = points[(i + 1) % points.length];
      walls.push({start: p1, end: p2});
   }
   return new Circuit(walls);
}

function getDefaultCircuit() {
   const walls = [
      {start: new Vec2(81, 257), end: new Vec2(245, 410)},
      {start: new Vec2(231, 194), end: new Vec2(340, 283)},
      {start: new Vec2(342, 283), end: new Vec2(425, 252)},
      {start: new Vec2(427, 252), end: new Vec2(451, 166)},
      {start: new Vec2(245, 408), end: new Vec2(336, 430)},
      {start: new Vec2(339, 430), end: new Vec2(478, 378)},
      {start: new Vec2(479, 378), end: new Vec2(527, 323)},
      {start: new Vec2(527, 323), end: new Vec2(559, 202)},
      {start: new Vec2(559, 202), end: new Vec2(618, 192)},
      {start: new Vec2(452, 165), end: new Vec2(515, 113)},
      {start: new Vec2(549, 96), end: new Vec2(691, 67)},
      {start: new Vec2(516, 109), end: new Vec2(546, 95)},
      {start: new Vec2(624, 191), end: new Vec2(699, 169)},
      {start: new Vec2(699, 171), end: new Vec2(818, 250)},
      {start: new Vec2(691, 63), end: new Vec2(760, 73)},
      {start: new Vec2(760, 76), end: new Vec2(875, 141)},
      {start: new Vec2(822, 253), end: new Vec2(840, 308)},
      {start: new Vec2(840, 308), end: new Vec2(899, 413)},
      {start: new Vec2(899, 414), end: new Vec2(1011, 478)},
      {start: new Vec2(877, 142), end: new Vec2(931, 210)},
      {start: new Vec2(931, 210), end: new Vec2(969, 308)},
      {start: new Vec2(970, 311), end: new Vec2(1035, 360)},
      {start: new Vec2(1035, 360), end: new Vec2(1178, 326)},
      {start: new Vec2(1217, 427), end: new Vec2(1227, 308)},
      {start: new Vec2(1011, 477), end: new Vec2(1211, 426)},
      {start: new Vec2(1177, 325), end: new Vec2(1225, 309)},
      {start: new Vec2(74, 255), end: new Vec2(234, 194)}
   ];
   const circuit = new Circuit(walls);
   circuit.spawnPoint = new Vec2(200, 250);
   circuit.goal = {
      start: new Vec2(1150, 320),
      end: new Vec2(1150, 450),
   }
   circuit.checkpoints = [
      {start: new Vec2(418, 252), end: new Vec2(536, 326)},
      {start: new Vec2(544, 97), end: new Vec2(560, 205)},
      {start: new Vec2(755, 73), end: new Vec2(697, 173)},
      {start: new Vec2(813, 249), end: new Vec2(931, 208)},
      {start: new Vec2(967, 314), end: new Vec2(893, 432)},
      {start: new Vec2(1037, 355), end: new Vec2(1012, 481)},
   ];
   return circuit;
}

const circuit = db.load() ?? getDefaultCircuit();

function update(dt: number) {
   const canvas = <HTMLCanvasElement>document.getElementById('canvas');
   let context: CanvasRenderingContext2D = canvas.getContext('2d');
   
   context.clearRect(0, 0, canvas.width, canvas.height);
   
   panels.render(context, dt);
   
   window.requestAnimationFrame(update);
}

window.onload = () => {
   ui.initialize(circuit);

   const canvas = <HTMLCanvasElement>document.getElementById('canvas');
   canvas.width = canvas.parentElement.clientWidth;
   canvas.height = canvas.parentElement.clientHeight;

   window.requestAnimationFrame(update);
}
