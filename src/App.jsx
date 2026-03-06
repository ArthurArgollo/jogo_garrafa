import { useState, useEffect, useRef } from 'react';
import './App.css';

// Mantemos os formatos, pois o filtro vai arredondá-los
const BOTTLE_SHAPES = ['shape-flask', 'shape-potion', 'shape-cone', 'shape-classic'];

function App() {
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(0);
  const [isMenu, setIsMenu] = useState(true);
  const [percent, setPercent] = useState(0);
  const [isFilling, setIsFilling] = useState(false);
  const [canFill, setCanFill] = useState(true);
  const [gameState, setGameState] = useState('playing'); 
  const [bottleSize, setBottleSize] = useState({ width: 120, height: 300 });
  const [bottleShape, setBottleShape] = useState(BOTTLE_SHAPES[0]);
  const requestRef = useRef();
  const lastTimeRef = useRef();

  useEffect(() => {
    const savedScore = localStorage.getItem('bottleFill_highScore');
    if (savedScore) setHighScore(parseInt(savedScore));
  }, []);

  useEffect(() => {
    if (gameState === 'won' && level > highScore) {
      setHighScore(level);
      localStorage.setItem('bottleFill_highScore', level.toString());
    }
  }, [gameState, level, highScore]);

  const winThreshold = Math.min(93, 55 + (Math.floor((level - 1) / 2) * 5));
  const speedMultiplier = 1 + (Math.floor((level - 1) / 2) * 0.2);

  const animate = (time) => {
    if (lastTimeRef.current !== undefined && isFilling && gameState === 'playing' && canFill) {
      const deltaTime = time - lastTimeRef.current;
      setPercent((prev) => {
        const widthFactor = 110 / bottleSize.width;
        const baseSpeed = 50; 
        const increment = (baseSpeed * deltaTime / 1000) * widthFactor * speedMultiplier;
        const next = prev + increment;
        return next > 110 ? 110 : next; 
      });
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (!isMenu) {
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isFilling, gameState, canFill, bottleSize.width, isMenu, speedMultiplier]);

  const startGame = (initialLevel) => {
    setLevel(initialLevel);
    setIsMenu(false);
    startNextLevel(true);
  };

  const handleStartFilling = (e) => {
    if (e.cancelable) e.preventDefault();
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
      } else {
        setGameState('lost');
        // ADICIONE ISSO: Se perdeu e passou de 100, solta as gotas!
        
      }
    };

  const startNextLevel = (isRetry) => {
    setPercent(0);
    setCanFill(true);
    setGameState('playing');
    lastTimeRef.current = undefined;
    if (!isRetry) setLevel((l) => l + 1);
    const newWidth = Math.floor(Math.random() * (160 - 90) + 90);
    setBottleSize({
      width: newWidth,
      height: Math.floor(Math.random() * (350 - 220) + 220)
    });
    const randomShape = BOTTLE_SHAPES[Math.floor(Math.random() * BOTTLE_SHAPES.length)];
    setBottleShape(randomShape);
  };

  const themeColor = gameState === 'lost' ? '#e74c3c' : (gameState === 'won' ? '#2ecc71' : '#3498db');
  const borderColor = gameState === 'lost' ? '#e74c3c' : (gameState === 'won' ? '#2ecc71' : '#333');

  if (isMenu) {
    return (
      <div className="container">
        <h1 className="title">Bottle Fill</h1>
        {highScore > 0 && <div className="high-score-badge">🏆 RECORDE: NÍVEL {highScore}</div>}
        <div className="menu-box">
          <button className="menu-btn" style={{backgroundColor: '#2ecc71'}} onClick={() => startGame(1)}>LENTO</button>
          <button className="menu-btn" style={{backgroundColor: '#f1c40f'}} onClick={() => startGame(5)}>MÉDIO</button>
          <button className="menu-btn" style={{backgroundColor: '#e67e22'}} onClick={() => startGame(9)}>RÁPIDO</button>
          <button className="menu-btn" style={{backgroundColor: '#e74c3c'}} onClick={() => startGame(15)}>INSANO</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ '--bottle-border-color': borderColor }}>
      <button onClick={() => setIsMenu(true)} className="back-btn">← Sair</button>
      
      <div className="header">
        {level >= highScore && level > 1 && gameState === 'won' && (
          <div className="high-score-badge new-record-anim">✨ NOVO RECORDE! ✨</div>
        )}
        <h1 className="title">Nível {level}</h1>
        <div className="stats-row">
          <span>Meta: <strong>{winThreshold.toFixed(0)}%</strong></span>
          <span>Velocidade: <strong>{speedMultiplier.toFixed(1)}x</strong></span>
        </div>
      </div>

      <div className="bottle-scene">
        <div className="bottle-wrapper">
          {/* O GARGAO AGORA É PARTE DO CORPO NO CSS */}
          
          <div 
            className={`bottle ${bottleShape}`}
            style={{ width: bottleSize.width, height: bottleSize.height }}
            onMouseDown={handleStartFilling}
            onMouseUp={handleRelease}
            onMouseLeave={handleRelease}
            onTouchStart={handleStartFilling}
            onTouchEnd={handleRelease}
          >
            {/* LINHA DE META */}
            <div className="target-line" style={{ bottom: `${winThreshold}%` }}>
              <span className="target-label">META</span>
            </div>

            {/* ÁGUA */}
            <div className="water" style={{ 
              height: `${Math.min(percent, 100)}%`, 
              '--water-color': themeColor 
            }}>
              <div className="water-gloss" />
            </div>
            
            {/* ÁGUA NO GARGALO (Visual) */}
             {percent > 100.1 && (
                <div className="water-neck-fill" style={{
                  height: `${Math.min((percent - 100) * 10, 100)}%`, 
                  backgroundColor: themeColor,
                  opacity: percent >  100.1 ? 1 : 0,
                  transition: 'opacity 0.2s ease-in'
                }} />
              )}
          </div>
        </div>
      </div>

      <div className="ui">
        <h2 className="percentage" style={{ color: percent > 100 ? '#e74c3c' : '#333' }}>
          {Math.floor(percent)}%
        </h2>
        {!canFill && (
          <button className="game-btn" onClick={() => startNextLevel(gameState === 'lost')}>
            {gameState === 'won' ? 'PRÓXIMO' : 'TENTAR DE NOVO'}
          </button>
        )}
      </div>

      {/* --- ESTE É O FILTRO SVG MÁGICO QUE ARREDONDA TUDO --- */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="round-corners" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9" result="gooey" />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop"/>
          </filter>
        </defs>
      </svg>
    </div>
  );
}

export default App;