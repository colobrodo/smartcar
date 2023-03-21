import { Line, Vec2 } from "./core";

export function drawLine(context: CanvasRenderingContext2D, line: Line) {
   context.beginPath();
   context.moveTo(line.start.x, line.start.y);
   context.lineTo(line.end.x, line.end.y);
   context.stroke();
}

export function pointInLine(point: Vec2, line: Line, nearThreshold: number=0): boolean {
   const ds = point.distance(line.start),
      de = point.distance(line.end)
      length = line.start.distance(line.end);
   return de + ds <= length + nearThreshold;
}

export function isInsideCircle(point: Vec2, center: Vec2, radius: number): boolean {
   return point.distance(center) <= radius;
}
