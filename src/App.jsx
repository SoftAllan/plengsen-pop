import React, { useEffect, useRef, useState } from 'react';
import { SIZE, targetForLevel, isAdjacent, cellKey, swapCells, findMatches, findMove, clearMatches, refillBoard, createBoard, createRound } from './game.js';
import { messages } from './i18n.js';
import { Icon, Fruit, BrandMark } from './art.jsx';
import { loadGame, saveGame } from './storage.js';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const themeFor = (theme, level) => theme !== 'auto' ? theme : level % 8 === 0 ? 'thailand' : level % 8 === 4 ? 'denmark' : 'garden';

function Modal({ title, close, children }) {
  const dialog = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);
  return <dialog ref={dialog} className="modal" aria-labelledby="modal-title" onCancel={(event) => { event.preventDefault(); close(); }} onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
    <div className="modal-content">
      <div className="modal-heading"><h2 id="modal-title">{title}</h2><button className="icon-button" aria-label={messages[document.documentElement.lang]?.close || 'Luk'} onClick={close}><Icon name="close" /></button></div>
      {children}
    </div>
  </dialog>;
}

export default function App() {
  const [initial] = useState(loadGame);
  const [game, setGame] = useState(initial.game);
  const [prefs, setPrefs] = useState(initial.prefs);
  const [best, setBest] = useState(initial.best);
  const [canSave, setCanSave] = useState(initial.available);
  const [animationBoard, setAnimationBoard] = useState(null);
  const [liveScore, setLiveScore] = useState(null);
  const [liveMoves, setLiveMoves] = useState(null);
  const [selected, setSelected] = useState(null);
  const [hint, setHint] = useState(null);
  const [popping, setPopping] = useState([]);
  const [shaking, setShaking] = useState([]);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState({ key: 'ready' });
  const [modal, setModal] = useState(null);
  const [installPrompt, setInstallPrompt] = useState(null);
  const lock = useRef(false);
  const mounted = useRef(true);
  const pointer = useRef(null);
  const suppressClickUntil = useRef(0);
  const audio = useRef(null);
  const boardElement = useRef(null);
  const endButton = useRef(null);
  const t = messages[prefs.lang];
  const theme = themeFor(prefs.theme, game.level);
  const board = animationBoard || game.board;
  const score = liveScore ?? game.score;
  const moves = liveMoves ?? game.moves;
  const target = targetForLevel(game.level);
  const fmt = (number) => number.toLocaleString(prefs.lang === 'th' ? 'th-TH' : 'da-DK');

  useEffect(() => {
    document.documentElement.lang = prefs.lang;
  }, [prefs.lang]);
  useEffect(() => {
    setCanSave(saveGame(game, prefs, best));
  }, [game, prefs, best]);
  useEffect(() => {
    if (!hint) return;
    const timeout = setTimeout(() => setHint(null), 5000);
    return () => clearTimeout(timeout);
  }, [hint]);
  useEffect(() => {
    if (game.status !== 'playing') endButton.current?.focus({ preventScroll: true });
  }, [game.status]);
  useEffect(() => {
    const handler = (event) => { event.preventDefault(); setInstallPrompt(event); };
    const installed = () => setInstallPrompt(null);
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installed);
    return () => {
      mounted.current = false;
      audio.current?.close().catch(() => {});
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installed);
    };
  }, []);

  function unlockSound() {
    if (!prefs.sound) return;
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      audio.current ||= new Audio();
      audio.current.resume().catch(() => {});
    } catch { /* Sound is optional. */ }
  }

  function popSound(chain) {
    if (!prefs.sound || !audio.current) return;
    try {
      const context = audio.current;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.connect(gain); gain.connect(context.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(420 + Math.min(chain, 8) * 80, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(850 + Math.min(chain, 8) * 80, context.currentTime + 0.12);
      gain.gain.setValueAtTime(0.055, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.18);
      oscillator.start(); oscillator.stop(context.currentTime + 0.19);
    } catch { /* Continue play even when audio is unavailable. */ }
  }

  async function swap(a, b) {
    if (lock.current || game.status !== 'playing' || !isAdjacent(a, b)) return;
    lock.current = true;
    setBusy(true); setSelected(null); setHint(null); unlockSound();
    const speed = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 30 : 220;
    let next = swapCells(game.board, a, b);
    let total = game.score;
    let chain = 0;
    setAnimationBoard(next);
    try {
      await wait(speed);
      if (!mounted.current) return;
      let matches = findMatches(next);
      if (!matches.length) {
        setAnimationBoard(game.board); setShaking([cellKey(a), cellKey(b)]);
        setFeedback({ key: 'invalid' });
        await wait(speed);
        return;
      }
      setLiveMoves(game.moves - 1);
      while (matches.length && chain < 100) {
        chain++;
        const points = matches.length * 10 * Math.min(chain, 5);
        total += points;
        setPopping(matches.map(cellKey));
        setLiveScore(total);
        setFeedback({ key: chain > 1 ? 'combo' : 'nice', points, chain });
        popSound(chain);
        await wait(speed);
        if (!mounted.current) return;
        next = clearMatches(next, matches);
        setAnimationBoard(next);
        setPopping([]);
        await wait(speed / 3);
        if (!mounted.current) return;
        next = refillBoard(next);
        setAnimationBoard(next);
        await wait(speed + 50);
        if (!mounted.current) return;
        matches = findMatches(next);
      }
      if (matches.length || !findMove(next)) {
        next = createBoard();
        setFeedback({ key: 'shuffle' });
      }
      const remaining = game.moves - 1;
      setGame({ ...game, board: next, score: total, moves: remaining,
        status: total >= target ? 'won' : remaining === 0 ? 'lost' : 'playing' });
      setBest((previous) => Math.max(previous, total));
    } finally {
      if (mounted.current) {
        setAnimationBoard(null); setPopping([]); setShaking([]);
        setLiveScore(null); setLiveMoves(null); setBusy(false);
      }
      lock.current = false;
    }
  }

  function selectCell(cell) {
    if (lock.current || game.status !== 'playing') return;
    setHint(null);
    if (selected && isAdjacent(selected, cell)) swap(selected, cell);
    else setSelected(selected && cellKey(selected) === cellKey(cell) ? null : cell);
  }

  function pointerUp(event, cell) {
    const start = pointer.current;
    pointer.current = null;
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 16) return;
    suppressClickUntil.current = Date.now() + 450;
    const horizontal = Math.abs(dx) > Math.abs(dy);
    const neighbor = { row: cell.row + (horizontal ? 0 : Math.sign(dy)), col: cell.col + (horizontal ? Math.sign(dx) : 0) };
    if (neighbor.row >= 0 && neighbor.row < SIZE && neighbor.col >= 0 && neighbor.col < SIZE) swap(cell, neighbor);
  }

  function keyboard(event, cell) {
    const direction = { ArrowLeft: [0,-1], ArrowRight: [0,1], ArrowUp: [-1,0], ArrowDown: [1,0] }[event.key];
    if (!direction) return;
    event.preventDefault();
    const row = Math.max(0, Math.min(SIZE - 1, cell.row + direction[0]));
    const col = Math.max(0, Math.min(SIZE - 1, cell.col + direction[1]));
    boardElement.current?.querySelector(`[data-cell="${row}:${col}"]`)?.focus();
  }

  function startRound(level = game.level) {
    if (lock.current) return;
    setGame(createRound(level)); setSelected(null); setHint(null); setModal(null);
    setFeedback({ key: 'ready' });
  }

  return <div className={`app theme-${theme}`}>
    <header className="site-header">
      <div className="brand"><BrandMark/><div className="brand-name">Plengsen <span>Pop</span><small>{t.tagline}</small></div></div>
      <div className="header-controls">
        <button className="language-button" onClick={() => setPrefs({ ...prefs, lang: prefs.lang === 'da' ? 'th' : 'da' })} aria-label={t.changeLanguage}><span className={prefs.lang === 'da' ? 'active' : ''} lang="da">DA</span><span className="language-separator">/</span><span className={prefs.lang === 'th' ? 'active' : ''} lang="th">ไทย</span></button>
        <button className="icon-button settings-button" disabled={busy} aria-label={t.settings} onClick={() => setModal('settings')}><Icon name="settings"/></button>
      </div>
    </header>

    <main className="main-layout">
      <aside className="welcome-panel">
        <p className="eyebrow"><span className="little-spark">✦</span> {t.eyebrow}</p>
        <h1>{t.hero1}<br/><span>{t.hero2}</span></h1>
        <p className="welcome-copy">{t.heroText}</p>
        <div className="welcome-tags"><span><Icon name="check" size={15}/>{t.noTimer}</span><span><Icon name="heart" size={14}/>{t.allAges}</span></div>
        <div className="art-stack" aria-hidden="true"><div className="decor-tile decor-pear"><Fruit kind={1}/></div><div className="decor-tile decor-cherry"><Fruit kind={0}/></div><div className="decor-tile decor-orange"><Fruit kind={4}/></div><span className="art-spark spark-one">✧</span><span className="art-spark spark-two">✦</span><span className="art-dot"/></div>
        <p className="personal-note">{t.personal}<span>♡</span></p>
      </aside>

      <section className="game-panel" aria-label="Plengsen Pop">
        <div className="game-topline"><span className="level-tag"><span className="level-dot"/>{t.level} {String(game.level).padStart(2, '0')}</span><span className="best-score"><Icon name="trophy" size={15}/>{t.best}<strong>{fmt(best)}</strong></span></div>
        <div className="game-heading"><h2>{t[theme]}</h2><p>{t[`${theme}Sub`]}</p></div>

        <div className="score-card">
          <div className="score-details"><div className="goal-label">{t.goal}<Icon name="star" size={13}/></div><div className="score-value"><strong>{fmt(score)}</strong><span>/ {fmt(target)}</span></div><progress max={target} value={Math.min(score, target)} aria-label={`${t.points}: ${fmt(score)} / ${fmt(target)}`}/></div>
          <div className={`moves-box ${moves <= 5 ? 'few-moves' : ''}`}><strong>{moves}</strong><span>{t.moves}</span></div>
        </div>

        <div className="board-frame" aria-busy={busy}>
          <div className="board-grid" ref={boardElement} role="group" aria-label={t.instruction}>
            {board.flatMap((row, r) => row.map((item, c) => {
              if (!item) return null;
              const cell = { row: r, col: c };
              const key = cellKey(cell);
              return <button key={item.id} className={`tile kind-${item.kind} ${selected && cellKey(selected) === key ? 'is-selected' : ''} ${hint?.includes(key) ? 'is-hint' : ''} ${popping.includes(key) ? 'is-popping' : ''} ${shaking.includes(key) ? 'is-shaking' : ''}`}
                style={{ '--row': r, '--col': c }} data-cell={key}
                aria-label={`${t.kinds[theme][item.kind]}, ${t.row} ${r + 1}, ${t.col} ${c + 1}`}
                aria-pressed={selected ? cellKey(selected) === key : false} aria-disabled={busy || game.status !== 'playing'} tabIndex={busy || game.status !== 'playing' ? -1 : 0}
                onPointerDown={(event) => { if (lock.current || game.status !== 'playing') return; pointer.current = { x: event.clientX, y: event.clientY, id: event.pointerId }; event.currentTarget.setPointerCapture(event.pointerId); }}
                onPointerUp={(event) => pointerUp(event, cell)} onPointerCancel={() => { pointer.current = null; }}
                onClick={() => { if (Date.now() >= suppressClickUntil.current) selectCell(cell); }} onKeyDown={(event) => keyboard(event, cell)}>
                <span className="tile-face"><Fruit kind={item.kind} theme={theme}/></span>
              </button>;
            }))}
          </div>
          {game.status !== 'playing' && <div className="result-overlay"><div className={`result-card ${game.status}`}>
            <div className="result-symbol"><Icon name={game.status === 'won' ? 'star' : 'heart'} size={34}/></div>
            <h2>{game.status === 'won' ? t.won : t.lost}</h2><p>{game.status === 'won' ? t.wonSub : t.lostSub}</p>
            <div className="result-score"><span>{t.roundScore}</span><strong>{fmt(game.score)}</strong></div>
            <button className="primary-button" ref={endButton} onClick={() => startRound(game.status === 'won' ? Math.min(10000, game.level + 1) : game.level)}>{game.status === 'won' ? t.next : t.retry}<Icon name="arrow" size={19}/></button>
          </div></div>}
        </div>

        <div className={`feedback ${feedback.key === 'invalid' ? 'feedback-invalid' : ''}`} role="status" aria-live="polite" aria-atomic="true"><span>{t[feedback.key]}</span>{feedback.points && <strong>+{fmt(feedback.points)}{feedback.chain > 1 && <small> ×{Math.min(feedback.chain, 5)}</small>}</strong>}</div>
        <div className="game-tools"><button disabled={busy || game.status !== 'playing'} onClick={() => { setSelected(null); const move = findMove(game.board); setHint(move?.map(cellKey) || null); setFeedback({ key: 'hintMessage' }); }}><Icon name="hint" size={20}/>{t.hint}</button><span className="tool-divider"/><button disabled={busy} onClick={() => game.score > 0 && game.status === 'playing' ? setModal('restart') : startRound()}><Icon name="restart" size={19}/>{t.restart}</button><span className="tool-divider"/><button onClick={() => setModal('help')}><Icon name="help" size={19}/>{t.how}</button></div>
        <p className="swipe-note">{t.swipe}</p>
        <div className={`save-status ${!canSave ? 'save-warning' : ''}`}><Icon name={canSave ? 'check' : 'help'} size={13}/>{canSave ? t.saved : t.savingUnavailable}</div>
      </section>
    </main>

    <footer className="site-footer"><span><Icon name="heart" size={13}/>{t.family}</span><button onClick={() => setModal('install')}><Icon name="download" size={15}/>{t.install}</button></footer>

    {modal === 'settings' && <Modal title={t.settings} close={() => setModal(null)}>
      <label className="setting-label" htmlFor="language">{t.language}</label>
      <select id="language" value={prefs.lang} onChange={(event) => setPrefs({ ...prefs, lang: event.target.value })}><option value="da">Dansk</option><option value="th">ไทย</option></select>
      <label className="setting-label" htmlFor="theme">{t.theme}</label>
      <select id="theme" value={prefs.theme} onChange={(event) => { setPrefs({ ...prefs, theme: event.target.value }); setHint(null); setSelected(null); }}><option value="auto">{t.auto}</option><option value="garden">{t.generic}</option><option value="denmark">{t.dk}</option><option value="thailand">{t.th}</option></select>
      <p className="field-help">{t.themeHelp}</p>
      <div className="sound-setting"><div><label htmlFor="sound">{t.sound}</label><p className="field-help">{t.soundHelp}</p></div><input id="sound" type="checkbox" role="switch" checked={prefs.sound} onChange={(event) => setPrefs({ ...prefs, sound: event.target.checked })}/></div>
      <button className="primary-button" onClick={() => setModal(null)}>{t.close}<Icon name="check" size={19}/></button>
    </Modal>}
    {modal === 'help' && <Modal title={t.howTitle} close={() => setModal(null)}><div className="help-art" aria-hidden="true">{[0,0,0].map((kind,index)=><div className="mini-tile kind-0" key={index}><Fruit kind={kind}/></div>)}</div><ol className="help-steps">{[1,2,3].map((number) => <li key={number}><span>{number}</span><div><h3>{t[`step${number}`]}</h3><p>{t[`step${number}Text`]}</p></div></li>)}</ol><p className="help-note">{t.howNote}</p><button className="primary-button" onClick={() => setModal(null)}>{t.gotIt}<Icon name="arrow" size={19}/></button></Modal>}
    {modal === 'restart' && <Modal title={t.restartTitle} close={() => setModal(null)}><p className="modal-copy">{t.restartText}</p><button className="primary-button" onClick={() => startRound()}>{t.confirmRestart}<Icon name="restart" size={19}/></button><button className="secondary-button" onClick={() => setModal(null)}>{t.cancel}</button></Modal>}
    {modal === 'install' && <Modal title={t.installTitle} close={() => setModal(null)}><p className="modal-copy">{t.installText}</p><div className="install-instructions"><p>{t.iosInstall}</p><p>{t.androidInstall}</p></div><p className="field-help">{t.offlineNote}</p>{installPrompt && <button className="primary-button" onClick={async () => { await installPrompt.prompt(); const { outcome } = await installPrompt.userChoice; setInstallPrompt(null); if (outcome === 'accepted') setModal(null); }}>{t.installNow}<Icon name="download"/></button>}</Modal>}
  </div>;
}
