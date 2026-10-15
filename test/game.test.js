import test from 'node:test';
import assert from 'node:assert/strict';
import { SIZE, MOVES, createBoard, createRound, findMatches, findMove, swapCells, clearMatches, refillBoard, isAdjacent, isValidRound, targetForLevel } from '../src/game.js';

function seeded(seed) {
  return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
}
const pattern = () => Array.from({ length: SIZE }, (_, r) => Array.from({ length: SIZE }, (_, c) => ({ id: `${r}:${c}`, kind: (r * 2 + c) % 6 })));

test('200 starting boards have no matches, unique pieces, and a legal move', () => {
  for (let seed = 1; seed <= 200; seed++) {
    const board = createBoard(seeded(seed));
    assert.equal(findMatches(board).length, 0);
    assert.equal(new Set(board.flat().map((t) => t.id)).size, SIZE * SIZE);
    const move = findMove(board);
    assert.ok(move);
    assert.ok(isAdjacent(...move));
    assert.ok(findMatches(swapCells(board, ...move)).length >= 3);
  }
});

test('crossing horizontal and vertical matches count the shared tile once', () => {
  const board = pattern();
  for (let i = 1; i <= 3; i++) {
    board[2][i] = { id: `h${i}`, kind: 5 };
    board[i][2] = { id: `v${i}`, kind: 5 };
  }
  const matches = findMatches(board);
  assert.equal(matches.length, 5);
  assert.equal(new Set(matches.map(({ row, col }) => `${row}:${col}`)).size, 5);
});

test('clearing and gravity preserve survivors and their order without mutating input', () => {
  const board = pattern();
  const matches = [{ row: 2, col: 1 }, { row: 5, col: 1 }];
  const cleared = clearMatches(board, matches);
  assert.ok(board[2][1]);
  assert.equal(cleared[2][1], null);
  const survivors = board.map((row) => row[1]).filter((_, row) => row !== 2 && row !== 5);
  const refilled = refillBoard(cleared, seeded(10));
  assert.deepEqual(refilled.slice(2).map((row) => row[1]), survivors);
  assert.equal(refilled.flat().filter(Boolean).length, SIZE * SIZE);
  assert.equal(cleared[2][1], null);
  assert.deepEqual(refilled.map((row) => row[0]), board.map((row) => row[0]));
});

test('swapping preserves the original board and rejects diagonal adjacency', () => {
  const board = pattern();
  const a = { row: 0, col: 0 }, b = { row: 0, col: 1 };
  const result = swapCells(board, a, b);
  assert.equal(result[0][0], board[0][1]);
  assert.equal(result[0][1], board[0][0]);
  assert.equal(board[0][0].id, '0:0');
  assert.equal(isAdjacent(a, { row: 1, col: 1 }), false);
});

test('a board is still playable with an unlucky constant random generator', () => {
  const board = createBoard(() => 0);
  assert.equal(findMatches(board).length, 0);
  assert.ok(findMove(board));
});

test('saved rounds validate status, bounds and tile identities before loading', () => {
  const round = createRound();
  assert.equal(isValidRound(round), true);
  assert.equal(round.moves, MOVES);
  assert.equal(isValidRound({ ...round, moves: -1 }), false);
  assert.equal(isValidRound({ ...round, status: 'won' }), false);
  assert.equal(isValidRound({ ...round, status: 'lost', moves: 0 }), true);
  assert.equal(isValidRound({ ...round, status: 'won', score: targetForLevel(1) }), true);
  assert.equal(isValidRound({ ...round, score: targetForLevel(1) }), false);
  assert.equal(isValidRound({ ...round, board: [] }), false);
  const duplicated = round.board.map((row) => [...row]);
  duplicated[0][1] = duplicated[0][0];
  assert.equal(isValidRound({ ...round, board: duplicated }), false);
});

test('a long sequence of valid moves settles to complete, playable boards', () => {
  const rng = seeded(102);
  let board = createBoard(rng);
  for (let turn = 0; turn < 100; turn++) {
    board = swapCells(board, ...findMove(board));
    let matches = findMatches(board);
    let chains = 0;
    while (matches.length && chains++ < 100) {
      board = refillBoard(clearMatches(board, matches), rng);
      matches = findMatches(board);
    }
    assert.ok(chains < 100);
    assert.equal(findMatches(board).length, 0);
    assert.equal(new Set(board.flat().map((t) => t.id)).size, SIZE * SIZE);
    if (!findMove(board)) board = createBoard(rng);
  }
});
