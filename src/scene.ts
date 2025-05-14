import { Vector2 } from './vector2';

// export type Scene = Array<Array<number>>;

class Color {
  r: number;
  g: number;
  b: number;
  a: number;
  constructor(r: number, g: number, b: number, a: number) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  mul(val: number): Color {
    return new Color(this.r * val, this.g * val, this.b * val, this.a);
  }

  toString(): string {
    return `rgba(${Math.floor(this.r * 255)}, ${Math.floor(this.g * 255)}, ${Math.floor(this.b * 255)}, ${this.a})`;
  }
}

class Scene {
  _scene: Array<Array<number>>;

  constructor(_scene: Array<Array<number>>) {
    this._scene = _scene;
  }

  get size(): Vector2 {
    const y = this._scene.length;
    let x = Number.MIN_VALUE;

    for (let row of this._scene) {
      x = Math.max(x, row.length);
    }
    return new Vector2(x, y);
  }

  isInside(p: Vector2): boolean {
    const s = this.size;
    return 0 <= p.x && p.x < s.x && 0 <= p.y && p.y < s.y;
  }

  isWall(p: Vector2): boolean {
    return this._scene[p.y][p.x] !== 0;
  }

  getColor(p: Vector2): Color {
    switch (this._scene[p.y][p.x]) {
      case 1:
        return new Color(1, 0, 0, 1);
      case 2:
        return new Color(0, 1, 0, 1);
      case 3:
        return new Color(0, 0, 1, 1);
      case 4:
        return new Color(1, 1, 0, 1);
      case 5:
        return new Color(0, 1, 1, 1);
      default:
        return new Color(0, 0, 0, 0);
    }
  }
}

export { Scene };
