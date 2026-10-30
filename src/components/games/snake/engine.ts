/** Rules for Context Window Snake. No DOM here, so the canvas component only draws and reads input. */

export type Cell = { x: number; y: number };
export type Direction = "up" | "down" | "left" | "right";
export type EndCause = "wall" | "self" | "quality" | "overflow";

const VECTORS: Record<Direction, Cell> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};
const OPPOSITE: Record<Direction, Direction> = { up: "down", down: "up", left: "right", right: "left" };

const POINTS_PER_DOC = 10;
/** A relevant doc fills the context window; it also compacts slowly on its own. */
const CONTEXT_PER_DOC = 10;
const CONTEXT_DRAIN_PER_SECOND = 1.2;
const QUALITY_PER_DOC = 5;
const QUALITY_PER_JUNK = 25;
const MAX_JUNK = 5;
/** Steps a junk doc stays on the board. */
const JUNK_LIFETIME = 70;
const START_LENGTH = 4;

export interface GameState {
  cols: number;
  rows: number;
  snake: Cell[];
  /** Where each segment was one step ago, for smooth drawing. */
  previous: Cell[];
  direction: Direction;
  queue: Direction[];
  doc: Cell;
  junk: { cell: Cell; expires: number }[];
  context: number;
  quality: number;
  score: number;
  steps: number;
  cause: EndCause | null;
}

const same = (a: Cell, b: Cell) => a.x === b.x && a.y === b.y;

function freeCell(state: GameState, rand: () => number): Cell {
  const head = state.snake[0];
  for (let attempt = 0; attempt < 200; attempt++) {
    const cell = { x: Math.floor(rand() * state.cols), y: Math.floor(rand() * state.rows) };
    const taken =
      state.snake.some((s) => same(s, cell)) ||
      state.junk.some((j) => same(j.cell, cell)) ||
      (state.doc && same(state.doc, cell));
    // Never drop anything right in front of the player.
    if (!taken && Math.abs(cell.x - head.x) + Math.abs(cell.y - head.y) > 2) return cell;
  }
  return state.doc;
}

export function createGame(cols: number, rows: number, rand: () => number): GameState {
  const y = Math.floor(rows / 2);
  const x = Math.floor(cols / 2);
  const snake = Array.from({ length: START_LENGTH }, (_, i) => ({ x: x - i, y }));
  const state: GameState = {
    cols,
    rows,
    snake,
    previous: snake.map((s) => ({ ...s })),
    direction: "right",
    queue: [],
    doc: { x: -1, y: -1 },
    junk: [],
    context: 0,
    quality: 100,
    score: 0,
    steps: 0,
    cause: null,
  };
  state.doc = freeCell(state, rand);
  return state;
}

/** Queues a turn. Two can wait, so quick corners register; reversing into yourself is ignored. */
export function turn(state: GameState, direction: Direction) {
  const last = state.queue[state.queue.length - 1] ?? state.direction;
  if (direction === last || direction === OPPOSITE[last] || state.queue.length >= 2) return;
  state.queue.push(direction);
}

/** Sets off from the waiting position in any direction. Heading back along its own body just flips it. */
export function begin(state: GameState, direction: Direction) {
  if (direction === OPPOSITE[state.direction]) state.snake.reverse();
  state.direction = direction;
  state.previous = state.snake.map((s) => ({ ...s }));
}

export function stepDelay(state: GameState, calm: boolean) {
  if (calm) return 210;
  return Math.max(80, 135 - (state.snake.length - START_LENGTH) * 2);
}

/** Advances one cell. Returns what happened so the caller can announce it. */
export function step(state: GameState, elapsedMs: number, rand: () => number) {
  const events = { ateDoc: false, ateJunk: false };
  state.direction = state.queue.shift() ?? state.direction;
  state.steps += 1;
  state.previous = state.snake.map((s) => ({ ...s }));

  const vector = VECTORS[state.direction];
  const head = { x: state.snake[0].x + vector.x, y: state.snake[0].y + vector.y };

  if (head.x < 0 || head.y < 0 || head.x >= state.cols || head.y >= state.rows) {
    state.cause = "wall";
    return events;
  }

  const ateDoc = same(head, state.doc);
  // The tail moves out of the way unless the snake is growing.
  const body = ateDoc ? state.snake : state.snake.slice(0, -1);
  if (body.some((s) => same(s, head))) {
    state.cause = "self";
    return events;
  }

  state.snake.unshift(head);
  if (!ateDoc) state.snake.pop();

  state.context = Math.max(0, state.context - (CONTEXT_DRAIN_PER_SECOND * elapsedMs) / 1000);
  state.junk = state.junk.filter((j) => j.expires > state.steps);

  if (ateDoc) {
    events.ateDoc = true;
    state.score += POINTS_PER_DOC;
    state.context += CONTEXT_PER_DOC;
    state.quality = Math.min(100, state.quality + QUALITY_PER_DOC);
    state.doc = freeCell(state, rand);
    const wanted = Math.min(MAX_JUNK, 1 + Math.floor(state.score / 40));
    if (state.junk.length < wanted) state.junk.push({ cell: freeCell(state, rand), expires: state.steps + JUNK_LIFETIME });
  }

  const junkHit = state.junk.findIndex((j) => same(j.cell, head));
  if (junkHit >= 0) {
    events.ateJunk = true;
    state.junk.splice(junkHit, 1);
    state.quality -= QUALITY_PER_JUNK;
  }

  if (state.quality <= 0) {
    state.quality = 0;
    state.cause = "quality";
  } else if (state.context >= 100) {
    state.context = 100;
    state.cause = "overflow";
  }
  return events;
}
