import { createRound, isValidRound } from './game.js';

export const SAVE_KEY = 'plengsen-pop-v1';

export function loadGame() {
  let saved;
  let available = true;
  try { saved = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch { available = false; }
  const valid = saved?.version === 1;
  const initialLanguage = navigator.language?.toLowerCase().startsWith('th') ? 'th' : 'da';
  return {
    game: valid && isValidRound(saved.game) ? saved.game : createRound(),
    prefs: {
      lang: valid && ['da', 'th'].includes(saved.prefs?.lang) ? saved.prefs.lang : initialLanguage,
      theme: valid && ['auto', 'garden', 'denmark', 'thailand'].includes(saved.prefs?.theme) ? saved.prefs.theme : 'auto',
      sound: valid && saved.prefs?.sound === true,
    },
    best: valid && Number.isInteger(saved.best) && saved.best >= 0 ? saved.best : 0,
    available,
  };
}

export function saveGame(game, prefs, best) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, game, prefs, best }));
    return true;
  } catch { return false; }
}
