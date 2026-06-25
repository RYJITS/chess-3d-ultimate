import React, { useState } from 'react';
import { Chess } from 'chess.js';
import ThreeScene from './components/ThreeScene';
import { Theme, Difficulty, AIType, GameSettings } from './types';

const App: React.FC = () => {
  const [game, setGame] = useState(new Chess());
  const [turn, setTurn] = useState<'w' | 'b'>('w');
  const [captureMsg, setCaptureMsg] = useState<string | null>(null);
  
  const [settings, setSettings] = useState<GameSettings>({
    theme: Theme.CLASSIC,
    difficulty: Difficulty.MEDIUM,
    aiType: AIType.LOCAL,
    showAnimations: true,
    geminiKey: ''
  });

  const resetGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setTurn('w');
  };

  const handleCapture = (msg: string) => {
    if (!settings.showAnimations) return;
    setCaptureMsg(msg);
    setTimeout(() => setCaptureMsg(null), 1500);
  };

  return (
    <div className="relative w-full h-screen text-white overflow-hidden bg-slate-900">
      
      {/* 3D Scene Layer */}
      <ThreeScene 
        game={game} 
        setGame={setGame} 
        settings={settings} 
        onCapture={handleCapture}
        onTurnChange={setTurn}
      />

      {/* HUD: Top Bar */}
      <div className="absolute top-0 left-0 w-full p-4 flex flex-wrap gap-4 items-center justify-between bg-black/40 backdrop-blur-md border-b border-white/10 z-10">
        <h1 className="text-2xl font-bold text-cyan-400 tracking-widest uppercase">Chess 3D Ultimate</h1>
        
        <div className="flex gap-3 items-center flex-wrap">
            <select 
                className="bg-black/50 border border-white/20 rounded px-3 py-1 text-sm focus:border-cyan-400 outline-none"
                value={settings.theme}
                onChange={(e) => setSettings({...settings, theme: e.target.value as Theme})}
            >
                {Object.values(Theme).map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            <select 
                className="bg-black/50 border border-white/20 rounded px-3 py-1 text-sm focus:border-cyan-400 outline-none"
                value={settings.difficulty}
                onChange={(e) => setSettings({...settings, difficulty: e.target.value as Difficulty})}
            >
                {Object.values(Difficulty).map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            <select 
                className="bg-black/50 border border-white/20 rounded px-3 py-1 text-sm focus:border-cyan-400 outline-none"
                value={settings.aiType}
                onChange={(e) => setSettings({...settings, aiType: e.target.value as AIType})}
            >
                {Object.values(AIType).map(a => <option key={a} value={a}>{a}</option>)}
            </select>

             {settings.aiType === AIType.GEMINI && (
                <input 
                    type="password" 
                    placeholder="Gemini API Key"
                    className="bg-black/50 border border-white/20 rounded px-3 py-1 text-sm w-32 focus:w-64 transition-all focus:border-cyan-400 outline-none"
                    value={settings.geminiKey}
                    onChange={(e) => setSettings({...settings, geminiKey: e.target.value})}
                />
            )}

            <button 
                onClick={resetGame}
                className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-1 rounded text-sm font-bold uppercase transition-colors"
            >
                New Game
            </button>
        </div>
      </div>

      {/* HUD: Status Bar */}
      <div className="absolute bottom-0 left-0 w-full p-4 bg-black/60 backdrop-blur-md border-t border-white/10 z-10 flex justify-center">
        <div className="text-lg font-semibold tracking-widest">
            {game.isGameOver() ? (
                <span className="text-red-500">
                    GAME OVER 
                    {game.isCheckmate() ? (turn === 'w' ? ' - BLACK WINS' : ' - WHITE WINS') : ' - DRAW'}
                </span>
            ) : (
                <span className={turn === 'w' ? "text-white" : "text-gray-400"}>
                    TURN: {turn === 'w' ? "WHITE" : "BLACK"} 
                    {game.inCheck() && <span className="text-red-400 ml-2 animate-pulse"> (CHECK)</span>}
                </span>
            )}
        </div>
      </div>

      {/* Capture / Effect Overlay */}
      {captureMsg && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
            <h1 className="text-6xl font-black text-yellow-400 drop-shadow-[0_0_10px_rgba(255,215,0,0.8)] animate-bounce">
                {captureMsg}
            </h1>
        </div>
      )}

      {/* Instructions Overlay (Bottom Right) */}
      <div className="absolute bottom-20 right-4 text-right text-xs text-white/40 pointer-events-none z-0">
         <p>LMB: Select/Move</p>
         <p>RMB: Rotate View</p>
         <p>Scroll: Zoom</p>
      </div>

    </div>
  );
};

export default App;