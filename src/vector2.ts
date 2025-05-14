class Vector2 {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  static zero(): Vector2 {
    return new Vector2(0, 0);
  }

  static fromAngle(angle: number): Vector2 {
    return new Vector2(Math.cos(angle), Math.sin(angle));
  }

  array(): [number, number] {
    return [this.x, this.y];
  }

  add(other: Vector2): Vector2 {
    return new Vector2(this.x + other.x, this.y + other.y);
  }

  sub(other: Vector2): Vector2 {
    return new Vector2(this.x - other.x, this.y - other.y);
  }

  div(other: Vector2): Vector2 {
    return new Vector2(this.x / other.x, this.y / other.y);
  }

  mul(other: Vector2): Vector2 {
    return new Vector2(this.x * other.x, this.y * other.y);
  }

  scale(a: number): Vector2 {
    return new Vector2(this.x * a, this.y * a);
  }

  lengthSquared(): number {
    return this.x * this.x + this.y * this.y;
  }
  length(): number {
    return Math.sqrt(this.lengthSquared());
  }

  norm(): Vector2 {
    const l = this.length();
    if (l === 0) {
      return Vector2.zero();
    }
    return new Vector2(this.x / l, this.y / l);
  }

  distanceToSquared(other: Vector2): number {
    return this.sub(other).lengthSquared();
  }
  distanceTo(other: Vector2): number {
    return this.sub(other).length();
  }

  rotate90deg(): Vector2 {
    return new Vector2(-this.y, this.x);
  }

  lerp(other: Vector2, t: number): Vector2 {
    return other.sub(this).scale(t).add(this);
  }

  dot(other: Vector2): number {
    return this.x * other.x + this.y * other.y;
  }
}

export { Vector2 };
