export class Vec2 {
   constructor(public x: number, public y: number) {}

   sum(other: Vec2): Vec2 {
      return new Vec2(this.x + other.x, this.y + other.y)
   }

   minus(other: Vec2): Vec2 {
      return new Vec2(this.x - other.x, this.y - other.y)
   }

   mul(k: number): Vec2 {
      return new Vec2(this.x * k, this.y * k)
   }

   div(k: number): Vec2 {
      return new Vec2(this.x / k, this.y / k)
   }

   add(other: Vec2) {
      this.x += other.x;
      this.y += other.y;
   }

   angle(): number {
      return Math.atan2(this.y, this.x);
   }

   length(): number {
      return Math.sqrt(this.x ** 2 + this.y ** 2);
   }

   distance(other: Vec2): number {
      return Math.sqrt((this.x - other.x) ** 2 + (this.y - other.y) ** 2)
   }
   
   angleBetween(other: Vec2): number {
      return Math.atan2(this.y - other.y, this.x - other.x);
   }

   copy(): Vec2 {
      return new Vec2(this.x, this.y);
   }

   rotate(angle: number): Vec2 {
      const newAngle = this.angle() + angle,
         x = this.length() * Math.cos(newAngle),
         y = this.length() * Math.sin(newAngle);
      return new Vec2(x, y)
   }

   static random(magnitude: number = 1) {
      const factor = magnitude * 2;
      return new Vec2(Math.random() - .5, Math.random() - .5).mul(factor);
   }
}

export class Reference2D {
   constructor(public origin: Vec2, public orientation: number) {}

   getGlobal(vector: Vec2): Vec2 {
      return vector.rotate(this.orientation).sum(this.origin);
   }
}

export interface Line {
   start: Vec2,
   end:   Vec2,
}

export function lineIntersect(lineA: Line, lineB: Line): boolean {
   var A1 = lineA.end.y - lineA.start.y,
      B1 = lineA.start.x - lineA.end.x,
      C1 = A1 * lineA.start.x + B1 * lineA.start.y,
      A2 = lineB.end.y - lineB.start.y,
      B2 = lineB.start.x - lineB.end.x,
      C2 = A2 * lineB.start.x + B2 * lineB.start.y,
      denominator = A1 * B2 - A2 * B1;

   if(denominator == 0) {
      return false;
   }

   var intersectX = (B2 * C1 - B1 * C2) / denominator,
      intersectY = (A1 * C2 - A2 * C1) / denominator,
      rx0 = (intersectX - lineA.start.x) / (lineA.end.x - lineA.start.x),
      ry0 = (intersectY - lineA.start.y) / (lineA.end.y - lineA.start.y),
      rx1 = (intersectX - lineB.start.x) / (lineB.end.x - lineB.start.x),
      ry1 = (intersectY - lineB.start.y) / (lineB.end.y - lineB.start.y);

   if(((rx0 >= 0 && rx0 <= 1) || (ry0 >= 0 && ry0 <= 1)) && 
      ((rx1 >= 0 && rx1 <= 1) || (ry1 >= 0 && ry1 <= 1))) {
      return true;
   }
   else {
      return false;
   }
}