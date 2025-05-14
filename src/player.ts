import { Vector2 } from './vector2';

export const NEAR_CLIPPING_PLANE = 0.2;
export const FAR_CLIPPING_PLANE = 10.0;
export const FOV = Math.PI * 0.5;
export const STEP_LENGTH = 0.1;
export const PLAYER_SPEED = 2.0

export class Player {
  position: Vector2;
  direction: number;

  constructor(position: Vector2, direction: number) {
    this.position = position;
    this.direction = direction;
  }

  getFov(): [Vector2, Vector2] {
    let p = this.position.add(Vector2.fromAngle(this.direction).scale(NEAR_CLIPPING_PLANE));
    const l = Math.tan(FOV * 0.5) * NEAR_CLIPPING_PLANE;

    const p1 = p.sub(p.sub(this.position).rotate90deg().norm().scale(l));
    const p2 = p.add(p.sub(this.position).rotate90deg().norm().scale(l));

    return [p1, p2];
  }
}
