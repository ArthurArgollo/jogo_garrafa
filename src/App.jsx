import { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';

const BOTTLE_TYPES = [
  { name: 'Cola', category: 'Refrigerante', emoji: '🥤', shape: 'shape-classic', className: 'bottle-cola', water: '#4a2118' },
  { name: 'Laranja', category: 'Refrigerante', emoji: '🍊', shape: 'shape-potion', className: 'bottle-orange', water: '#f28c28' },
  { name: 'Uva', category: 'Suco', emoji: '🍇', shape: 'shape-flask', className: 'bottle-grape', water: '#713f9e' },
  { name: 'Tropical', category: 'Suco', emoji: '🍹', shape: 'shape-classic', className: 'bottle-tropical', water: '#f4c542' },
  { name: 'Limão', category: 'Suco', emoji: '🍋', shape: 'shape-cone', className: 'bottle-lemon', water: '#b6d936' },
  { name: 'Energético', category: 'Bebida', emoji: '⚡', shape: 'shape-cone', className: 'bottle-energy', water: '#e83e8c' },
  { name: 'Água', category: 'Bebida', emoji: '💧', shape: 'shape-classic', className: 'bottle-water', water: '#52b9e9' },
  { name: 'Detergente', category: 'Limpeza', emoji: '🧼', shape: 'shape-potion', className: 'bottle-detergent', water: '#36c9a5' },
  { name: 'Desinfetante', category: 'Limpeza', emoji: '✨', shape: 'shape-flask', className: 'bottle-cleaner', water: '#6b7de8' },
  { name: 'Shampoo', category: 'Cuidados', emoji: '🫧', shape: 'shape-potion', className: 'bottle-shampoo', water: '#e56bb2' },
];
const BASE_SPEED = 50;

function randomBottle() {
  return BOTTLE_TYPES[Math.floor(Math.random() * BOTTLE_TYPES.length)];
}

function App() {
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(() => {
    const savedScore = localStorage.getItem('bottleFill_highScore');
    const parsedScore = Number.parseInt(savedScore ?? '0', 10);
    return Number.isFinite(parsedScore) ? parsedScore : 0;
  });
  const [isMenu, setIsMenu] = useState(true);
  const [percent, setPercent] = useState(0);
  const [isFilling, setIsFilling] = useState(false);
  const [canFill, setCanFill] = useState(true);
  const [gameState, setGameState] = useState('playing');
  const [bottleSize, setBottleSize] = useState({ width: 120, height: 300 });
  const [bottle, setBottle] = useState(BOTTLE_TYPES[0]);
  const requestRef = useRef();
  const lastTimeRef = useRef();
  const animateRef = useRef();

  const winThreshold = Math.min(93, 55 + (Math.floor((level - 1) / 2) * 5));
  const speedMultiplier = 1 + (Math.floor((level - 1) / 2) * 0.2);

  const animate = useCallback((time) => {
    if (lastTimeRef.current !== undefined && isFilling && gameState === 'playing' && canFill) {
      const deltaTime = time - lastTimeRef.current;
      setPercent((previousPercent) => Math.min(previousPercent + ((BASE_SPEED * deltaTime / 1000) * (110 / bottleSize.width) * speedMultiplier), 110));
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame((nextTime) => animateRef.current?.(nextTime));
  }, [bottleSize.width, canFill, gameState, isFilling, speedMultiplier]);

  useEffect(() => {
    animateRef.current = animate;
    if (!isMenu) requestRef.current = requestAnimationFrame((time) => animateRef.current?.(time));
    return () => cancelAnimationFrame(requestRef.current);
  }, [animate, isMenu]);

  const startNextLevel = (isRetry) => {
    setPercent(0);
    setCanFill(true);
    setGameState('playing');
    lastTimeRef.current = undefined;
    if (!isRetry) setLevel((currentLevel) => currentLevel + 1);
    setBottleSize({ width: Math.floor(Math.random() * 70 + 90), height: Math.floor(Math.random() * 130 + 220) });
    setBottle(randomBottle());
  };

  const startGame = (initialLevel) => {
    setLevel(initialLevel);
    setIsMenu(false);
    startNextLevel(true);
  };

  const handleStartFilling = (event) => {
    if (event.cancelable) event.preventDefault();
    if (canFill && gameState === 'playing') {
      lastTimeRef.current = performance.now();
      setIsFilling(true);
    }
  };

  const handleRelease = () => {
    if (!isFilling) return;
    setIsFilling(false);
    setCanFill(false);
    if (percent >= winThreshold && percent <= 100.5) {
      setGameState('won');
      if (level > highScore) {
        setHighScore(level);
        localStorage.setItem('bottleFill_highScore', level.toString());
      }
    } else {
      setGameState('lost');
    }
  };

  const themeColor = gameState === 'lost' ? '#e74c3c' : (gameState === 'won' ? '#2ecc71' : bottle.water);
  const borderColor = gameState === 'lost' ? '#e74c3c' : (gameState === 'won' ? '#2ecc71' : '#333');

  if (isMenu) {
    return <div className="container">
      <h1 className="title">Bottle Fill</h1>
      <p className="subtitle">Encha a garrafa na medida certa!</p>
      {highScore > 0 && <div className="high-score-badge">🏆 RECORDE: NÍVEL {highScore}</div>}
      <div className="menu-box">
        <button className="menu-btn" style={{ backgroundColor: '#2ecc71' }} onClick={() => startGame(1)}>LENTO</button>
        <button className="menu-btn" style={{ backgroundColor: '#f1c40f' }} onClick={() => startGame(5)}>MÉDIO</button>
        <button className="menu-btn" style={{ backgroundColor: '#e67e22' }} onClick={() => startGame(9)}>RÁPIDO</button>
        <button className="menu-btn" style={{ backgroundColor: '#e74c3c' }} onClick={() => startGame(15)}>INSANO</button>
      </div>
    </div>;
  }

  return <div className="container" style={{ '--bottle-border-color': borderColor }}>
    <button onClick={() => setIsMenu(true)} className="back-btn">← Sair</button>
    <div className="header">
      {level >= highScore && level > 1 && gameState === 'won' && <div className="high-score-badge">✨ NOVO RECORDE! ✨</div>}
      <h1 className="title">Nível {level}</h1>
      <div className="stats-row"><span>Meta: <strong>{winThreshold.toFixed(0)}%</strong></span><span>Velocidade: <strong>{speedMultiplier.toFixed(1)}x</strong></span></div>
    </div>
    <div className="bottle-info"><span>{bottle.emoji}</span><strong>{bottle.name}</strong><small>{bottle.category}</small></div>
    <div className="bottle-scene"><div className="bottle-wrapper">
      <div className={`bottle ${bottle.shape} ${bottle.className}`} style={{ width: bottleSize.width, height: bottleSize.height }} onMouseDown={handleStartFilling} onMouseUp={handleRelease} onMouseLeave={handleRelease} onTouchStart={handleStartFilling} onTouchEnd={handleRelease}>
        <div className="cap" />
        <div className="target-line" style={{ bottom: `${winThreshold}%` }}><span className="target-label">META</span></div>
        <div className="water" style={{ height: `${Math.min(percent, 100)}%`, '--water-color': themeColor }}><div className="water-gloss" /></div>
        <div className="bottle-label"><span>{bottle.emoji}</span>{bottle.name}</div>
        {percent > 100.1 && <div className="water-neck-fill" style={{ height: `${Math.min((percent - 100) * 10, 100)}%`, backgroundColor: themeColor }} />}
      </div>
    </div></div>
    <div className="ui"><h2 className="percentage" style={{ color: percent > 100 ? '#e74c3c' : '#333' }}>{Math.floor(percent)}%</h2>
      {!canFill && <button className="game-btn" onClick={() => startNextLevel(gameState === 'lost')}>{gameState === 'won' ? 'PRÓXIMO' : 'TENTAR DE NOVO'}</button>}
    </div>
    <svg width="0" height="0" style={{ position: 'absolute' }}><defs><filter id="round-corners" colorInterpolationFilters="sRGB"><feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" /><feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9" result="gooey" /><feComposite in="SourceGraphic" in2="gooey" operator="atop" /></filter></defs></svg>
  </div>;
}

export default App;
