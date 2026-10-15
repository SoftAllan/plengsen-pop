import test from 'node:test';
import assert from 'node:assert/strict';
import { loadGame, saveGame, SAVE_KEY } from '../src/storage.js';
import { createRound, isValidRound } from '../src/game.js';

test('saving and loading preserve progress, preferences and best score', () => {
  const values = new Map();
  globalThis.localStorage = { getItem: (key) => values.get(key) || null, setItem: (key, value) => values.set(key, value) };
  const game = createRound(4);
  const prefs = { lang: 'th', theme: 'thailand', sound: true };
  assert.equal(saveGame(game, prefs, 900), true);
  const restored = loadGame();
  assert.deepEqual(restored.game, game);
  assert.deepEqual(restored.prefs, prefs);
  assert.equal(restored.best, 900);
  assert.equal(restored.available, true);
});

test('broken or outdated saves fall back to a valid fresh round', () => {
  for (const text of ['not json', JSON.stringify({ version: 0 }), JSON.stringify({ version: 1, game: { board: null }, prefs: { lang: 'xx', theme: 'bad' }, best: -1 })]) {
    globalThis.localStorage = { getItem: () => text, setItem: () => {} };
    const restored = loadGame();
    assert.equal(isValidRound(restored.game), true);
    assert.equal(restored.prefs.lang, 'da');
    assert.equal(restored.prefs.theme, 'auto');
    assert.equal(restored.best, 0);
  }
});

test('unavailable storage reports a failure while leaving a playable game', () => {
  globalThis.localStorage = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('quota exceeded'); } };
  const loaded = loadGame();
  assert.equal(loaded.available, false);
  assert.equal(isValidRound(loaded.game), true);
  assert.equal(saveGame(loaded.game, loaded.prefs, 0), false);
  assert.equal(typeof SAVE_KEY, 'string');
});
