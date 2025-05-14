import { Vector2 } from './vector2';

// export type Scene = Array<Array<number>>;

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
}

export { Scene };
