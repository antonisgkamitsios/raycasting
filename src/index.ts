import { FAR_CLIPPING_PLANE, Player, PLAYER_SPEED, STEP_LENGTH } from './player';
import { Scene } from './scene';
import { loadImage } from './utils';
import { Vector2 } from './vector2';

const EPSILON = 1e-6;
const SCREEN_WIDTH = 2000;

function fillCircle(ctx: CanvasRenderingContext2D, center: Vector2, radius: number) {
  ctx.beginPath();
  ctx.arc(...center.array(), radius, 0, 2 * Math.PI);
  ctx.fill();
}

function strokeLine(ctx: CanvasRenderingContext2D, start: Vector2, finish: Vector2) {
  ctx.beginPath();
  ctx.moveTo(...start.array());
  ctx.lineTo(...finish.array());
  ctx.stroke();
}
function snap(x: number, dx: number): number {
  if (dx > 0) return Math.ceil(x + EPSILON);
  if (dx < 0) return Math.floor(x - EPSILON);
  return x;
}

function rayCast(scene: Scene, p1: Vector2, p2: Vector2): Vector2 {
  const first = p1;
  while (first.distanceToSquared(p1) < FAR_CLIPPING_PLANE * FAR_CLIPPING_PLANE) {
    const c = hittingCell(p1, p2);
    if (scene.isInside(c) && scene.isWall(c)) break;
    const p3 = rayStep(p1, p2);
    p1 = p2;
    p2 = p3;
  }
  return p2;
}

function hittingCell(p1: Vector2, p2: Vector2): Vector2 {
  const d = p2.sub(p1);
  return new Vector2(Math.floor(p2.x + Math.sign(d.x) * EPSILON), Math.floor(p2.y + Math.sign(d.y) * EPSILON));
}

function rayStep(p1: Vector2, p2: Vector2): Vector2 {
  // p1 = (x1, y1)
  // p2 = (x2, y2)
  // x1 = (y1-b)/a
  // y1 = a*x1+b
  // y2 = a*x2+b
  // b = y1 - a*x1
  // y2 = a*x2+y1 - a*x1
  // y2-y1 = a*(x2 - x1)
  // a = (y2-y1)/(x2-x1)
  const d = p2.sub(p1);
  let p3 = p2;

  if (d.x !== 0) {
    const a = d.y / d.x;
    const b = p1.y - a * p1.x;

    {
      const x3 = snap(p2.x, d.x);
      const y3 = a * x3 + b;
      p3 = new Vector2(x3, y3);
    }

    if (a !== 0) {
      const y3 = snap(p2.y, d.y);
      const x3 = (y3 - b) / a;
      const p3new = new Vector2(x3, y3);
      if (p2.distanceToSquared(p3new) < p2.distanceToSquared(p3)) {
        p3 = p3new;
      }
    }
  } else {
    const y3 = snap(p2.y, d.y);
    const x3 = p2.x;

    p3 = new Vector2(x3, y3);
  }

  return p3;
}

function canvasSize(ctx: CanvasRenderingContext2D): Vector2 {
  return new Vector2(ctx.canvas.width, ctx.canvas.height);
}

function renderMinimap(
  ctx: CanvasRenderingContext2D,
  player: Player,
  position: Vector2,
  size: Vector2,
  scene: Scene,
  image: HTMLImageElement
) {
  ctx.save();

  const gridSize = scene.size;

  ctx.translate(...position.array());
  ctx.scale(...size.div(gridSize).array());
  ctx.lineWidth = 0.1;

  ctx.fillStyle = '#181818';
  ctx.fillRect(0, 0, ...gridSize.array());

  for (let y = 0; y < gridSize.y; y++) {
    for (let x = 0; x < gridSize.x; x++) {
      const c = new Vector2(x, y);
      if (scene.isWall(c)) {
        const color = scene.getColor(c);
        ctx.drawImage(image, x, y, 1, 1);
        // ctx.fillStyle = color.toString();
        // ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  ctx.strokeStyle = '#303030';
  for (let x = 0; x <= gridSize.x; x++) {
    strokeLine(ctx, new Vector2(x, 0), new Vector2(x, gridSize.y));
    for (let y = 0; y <= gridSize.y; y++) {
      strokeLine(ctx, new Vector2(0, y), new Vector2(gridSize.x, y));
    }
  }

  ctx.fillStyle = 'red';
  fillCircle(ctx, player.position, 0.2);

  const [p1, p2] = player.getFov();
  ctx.strokeStyle = 'red';
  strokeLine(ctx, player.position, p1);
  strokeLine(ctx, player.position, p2);
  strokeLine(ctx, p1, p2);

  ctx.restore();
}

function renderScene(ctx: CanvasRenderingContext2D, player: Player, scene: Scene, image: HTMLImageElement) {
  const stripWidth = Math.ceil(ctx.canvas.width / SCREEN_WIDTH);

  const [p1, p2] = player.getFov();

  for (let x = 0; x < SCREEN_WIDTH; ++x) {
    const p = rayCast(scene, player.position, p1.lerp(p2, x / SCREEN_WIDTH));
    const c = hittingCell(player.position, p);

    if (scene.isInside(c) && scene.isWall(c)) {
      const v = p.sub(player.position);
      const d = Vector2.fromAngle(player.direction);

      const stripHeight = ctx.canvas.height / v.dot(d);

      // const t = 1 - p.sub(player.position).length() / FAR_CLIPPING_PLANE;
      const otherT = 1 / v.dot(d);

      // const color = scene.getColor(c);
      // ctx.fillStyle = color.mul(otherT).toString();
      // ctx.fillRect(x * stripWidth, (ctx.canvas.height - stripHeight) * 0.5, stripWidth, stripHeight);

      const t = p.sub(c);
      let u = 0;
      if (Math.abs(t.x) < EPSILON || (Math.abs(t.x - 1) < EPSILON && t.y > 0)) {
        u = t.y;
      } else {
        u = t.x;
      }

      ctx.drawImage(
        image,
        u * image.width,
        0,
        1,
        image.height,
        x * stripWidth,
        (ctx.canvas.height - stripHeight) * 0.5,
        stripWidth,
        stripHeight
      );
    }
  }
}

function renderGame(ctx: CanvasRenderingContext2D, player: Player, scene: Scene, image: HTMLImageElement) {
  const minimapPosition = Vector2.zero().add(canvasSize(ctx).scale(0.05));
  const cellSize = ctx.canvas.width * 0.02;
  const minimapSize = scene.size.scale(cellSize);

  ctx.fillStyle = '#020202';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  renderScene(ctx, player, scene, image);
  renderMinimap(ctx, player, minimapPosition, minimapSize, scene, image);
}

(async () => {
  const scene: Scene = new Scene([
    [0, 0, 1, 2, 0, 0, 0, 0, 0],
    [0, 0, 0, 3, 0, 0, 0, 0, 0],
    [0, 2, 5, 4, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
  ]);
  const game = document.getElementById('game')! as HTMLCanvasElement;
  const image = await loadImage('images/test2.jpg');
  const factor = 90;
  game.width = 16 * factor;
  game.height = 9 * factor;
  const ctx = game.getContext('2d');
  if (ctx === null) {
    throw new Error('context 2d is not supported');
  }

  const sceneSize = scene.size;

  const player = new Player(sceneSize.mul(new Vector2(0.94, 0.94)), Math.PI * 1.25);

  let prevTime = 0;
  let movingForward = false;
  let movingBackward = false;
  let movingLeft = false;
  let movingRight = false;

  const frame = (time: DOMHighResTimeStamp) => {
    const dt = (time - prevTime) / 1000;
    prevTime = time;

    let velocity = Vector2.zero();
    let angularVelocity = 0.0;

    if (movingForward) {
      velocity = velocity.add(Vector2.fromAngle(player.direction).scale(PLAYER_SPEED));
    }
    if (movingBackward) {
      velocity = velocity.sub(Vector2.fromAngle(player.direction).scale(PLAYER_SPEED));
    }
    if (movingLeft) {
      angularVelocity -= Math.PI * 0.5;
    }
    if (movingRight) {
      angularVelocity += Math.PI * 0.5;
    }
    player.direction = player.direction + angularVelocity * dt;
    player.position = player.position.add(velocity.scale(dt));

    renderGame(ctx, player, scene, image);
    requestAnimationFrame(frame);
  };

  requestAnimationFrame((time) => {
    prevTime = time;
    requestAnimationFrame(frame);
  });

  document.addEventListener('keydown', (e) => {
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (e.key === 'w') {
      movingForward = true;
      // player.position = player.position.add(Vector2.fromAngle(player.direction).scale(STEP_LENGTH));
    } else if (e.key === 's') {
      movingBackward = true;
      // player.position = player.position.sub(Vector2.fromAngle(player.direction).scale(STEP_LENGTH));
    } else if (e.key === 'a') {
      movingLeft = true;
      // player.direction -= 0.1;
    } else if (e.key === 'd') {
      movingRight = true;
      // player.direction += 0.1;
    }
  });

  document.addEventListener('keyup', (e) => {
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (e.key === 'w') {
      movingForward = false;
      // player.position = player.position.add(Vector2.fromAngle(player.direction).scale(STEP_LENGTH));
    } else if (e.key === 's') {
      movingBackward = false;
      // player.position = player.position.sub(Vector2.fromAngle(player.direction).scale(STEP_LENGTH));
    } else if (e.key === 'a') {
      movingLeft = false;
      // player.direction -= 0.1;
    } else if (e.key === 'd') {
      movingRight = false;
      // player.direction += 0.1;
    }
  });
})();
