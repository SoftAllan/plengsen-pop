// Pure game rules. No React, DOM or storage dependencies.
export const SIZE = 7;
export const KINDS = 6;
export const MOVES = 24;
let tileId = 0;

export const targetForLevel = (level) => 550 + level * 150;
export const isAdjacent = (a, b) => Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1;
export const cellKey = ({ row, col }) => `${row}:${col}`;
const tile = (kind) => ({ id: `${Date.now().toString(36)}-${tileId++}`, kind });
const randomKind = (rng) => Math.min(KINDS - 1, Math.floor(rng() * KINDS));

export function swapCells(board, a, b) {
  const next = board.map((row) => [...row]);
  [next[a.row][a.col], next[b.row][b.col]] = [next[b.row][b.col], next[a.row][a.col]];
  return next;
}

export function findMatches(board) {
  const found = new Map();
  for (let axis = 0; axis < 2; axis++) {
    for (let line = 0; line < SIZE; line++) {
      let start = 0;
      while (start < SIZE) {
        const get = (offset) => axis === 0 ? board[line][offset] : board[offset][line];
        const kind = get(start)?.kind;
        let end = start + 1;
        while (end < SIZE && kind !== undefined && get(end)?.kind === kind) end++;
        if (kind !== undefined && end - start >= 3) {
          for (let i = start; i < end; i++) {
            const cell = axis === 0 ? { row: line, col: i } : { row: i, col: line };
            found.set(cellKey(cell), cell);
          }
        }
        start = end;
      }
    }
  }
  return [...found.values()];
}

export function findMove(board) {
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const a = { row, col };
      for (const b of [{ row, col: col + 1 }, { row: row + 1, col }]) {
        if (b.row < SIZE && b.col < SIZE && findMatches(swapCells(board, a, b)).length) return [a, b];
      }
    }
  }
  return null;
}

export function createBoard(rng = Math.random) {
  for (let attempt = 0; attempt < 100; attempt++) {
    const board = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
    for (let row = 0; row < SIZE; row++) {
      for (let col = 0; col < SIZE; col++) {
        const allowed = Array.from({ length: KINDS }, (_, i) => i).filter((kind) =>
          !(col >= 2 && board[row][col - 1]?.kind === kind && board[row][col - 2]?.kind === kind)
          && !(row >= 2 && board[row - 1][col]?.kind === kind && board[row - 2][col]?.kind === kind));
        board[row][col] = tile(allowed[Math.min(allowed.length - 1, Math.floor(rng() * allowed.length))]);
      }
    }
    if (findMove(board)) return board;
  }
  // A deterministic playable pattern, even with an adversarial random generator.
  const board = Array.from({ length: SIZE }, (_, row) =>
    Array.from({ length: SIZE }, (_, col) => tile((row * 2 + col) % KINDS)));
  board[0][0] = tile(0); board[0][1] = tile(1); board[0][2] = tile(0); board[1][1] = tile(0);
  return board;
}

export function clearMatches(board, matches) {
  const cleared = new Set(matches.map(cellKey));
  return board.map((row, r) => row.map((value, c) => cleared.has(`${r}:${c}`) ? null : value));
}

export function refillBoard(board, rng = Math.random) {
  const next = board.map((row) => [...row]);
  for (let col = 0; col < SIZE; col++) {
    const survivors = board.map((row) => row[col]).filter(Boolean);
    const missing = SIZE - survivors.length;
    const values = [...Array.from({ length: missing }, () => tile(randomKind(rng))), ...survivors];
    for (let row = 0; row < SIZE; row++) next[row][col] = values[row];
  }
  return next;
}

export function createRound(level = 1) {
  return { board: createBoard(), level, score: 0, moves: MOVES, status: 'playing' };
}

export function isValidRound(value) {
  if (!value || !Number.isInteger(value.level) || value.level < 1 || value.level > 10000
      || !Number.isInteger(value.score) || value.score < 0
      || !Number.isInteger(value.moves) || value.moves < 0 || value.moves > MOVES
      || !['playing', 'won', 'lost'].includes(value.status)) return false;
  if (!Array.isArray(value.board) || value.board.length !== SIZE) return false;
  const ids = new Set();
  for (const row of value.board) {
    if (!Array.isArray(row) || row.length !== SIZE) return false;
    for (const item of row) {
      if (!item || typeof item.id !== 'string' || ids.has(item.id)
          || !Number.isInteger(item.kind) || item.kind < 0 || item.kind >= KINDS) return false;
      ids.add(item.id);
    }
  }
  if (findMatches(value.board).length || !findMove(value.board)) return false;
  const target = targetForLevel(value.level);
  return value.status === 'won' ? value.score >= target
    : value.status === 'lost' ? value.moves === 0 && value.score < target
      : value.moves > 0 && value.score < target;
}
