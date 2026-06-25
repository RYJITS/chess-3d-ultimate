import { Chess, Move } from 'chess.js';
import { PIECE_VALUES, PST } from '../constants';
import { Difficulty } from '../types';
import { GoogleGenAI } from '@google/genai';

// --- LOCAL MINIMAX AI ---

const evaluateBoard = (game: Chess): number => {
  let totalEvaluation = 0;
  const board = game.board();

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (piece) {
        const isWhite = piece.color === 'w';
        const value = PIECE_VALUES[piece.type] || 0;
        
        // Position bonus
        let pst = PST[piece.type] || PST.generic;
        // If black, we need to mirror the table or read from bottom up. 
        // Simple way: mapping row index.
        const row = isWhite ? i : 7 - i;
        const col = j; 
        const positionValue = pst[row] ? pst[row][col] : 0;

        totalEvaluation += (value + positionValue) * (isWhite ? 1 : -1);
      }
    }
  }
  return totalEvaluation;
};

const minimax = (
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizingPlayer: boolean
): number => {
  if (depth === 0 || game.isGameOver()) {
    return -evaluateBoard(game); // Invert because evaluation is usually from white's perspective
  }

  const moves = game.moves();

  if (isMaximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of moves) {
      game.move(move);
      const evalVal = minimax(game, depth - 1, alpha, beta, false);
      game.undo();
      maxEval = Math.max(maxEval, evalVal);
      alpha = Math.max(alpha, evalVal);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      game.move(move);
      const evalVal = minimax(game, depth - 1, alpha, beta, true);
      game.undo();
      minEval = Math.min(minEval, evalVal);
      beta = Math.min(beta, evalVal);
      if (beta <= alpha) break;
    }
    return minEval;
  }
};

export const getBestMoveLocal = (game: Chess, difficulty: Difficulty): string | null => {
  const moves = game.moves();
  if (moves.length === 0) return null;

  // Easy: Random
  if (difficulty === Difficulty.EASY) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  // Medium/Hard: Minimax
  const depth = difficulty === Difficulty.HARD ? 3 : 2;
  let bestMove: string | null = null;
  let bestValue = -Infinity;
  
  // Assuming AI plays Black (minimizing in absolute eval, but maximizing its own gain)
  // We simplify: The AI just wants the move that results in the best board state for itself.
  const isWhiteTurn = game.turn() === 'w';

  // Shuffle moves to add variety to equal evaluations
  moves.sort(() => Math.random() - 0.5);

  for (const move of moves) {
    game.move(move);
    // If AI is white, we want to maximize. If AI is black, we want to minimize absolute score, 
    // but evaluateBoard returns (White - Black). 
    // So if AI is Black, it wants evaluateBoard to be very negative.
    // Let's simplify: minimax returns score from perspective of current player?
    // Let's stick to: Minimax returns value for White.
    
    const boardValue = minimax(game, depth - 1, -Infinity, Infinity, !isWhiteTurn);
    game.undo();

    // If AI is White, pick highest value.
    // If AI is Black, pick lowest value.
    if (isWhiteTurn) {
        if (boardValue > bestValue) {
            bestValue = boardValue;
            bestMove = move;
        }
    } else {
        // Initial comparison for black needs inverting logic or just using negative infinity approach differently
        // Actually, let's just make 'bestValue' store the best relative score.
        // Evaluation function returns (White - Black).
        // White wants Max. Black wants Min.
        const valueForComparison = isWhiteTurn ? boardValue : -boardValue;
        if (valueForComparison > bestValue) {
            bestValue = valueForComparison;
            bestMove = move;
        }
    }
  }

  return bestMove || moves[0];
};

// --- EXTERNAL GEMINI AI ---

export const getGeminiMove = async (game: Chess, apiKey: string): Promise<string | null> => {
  if (!apiKey) return null;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const fen = game.fen();
    const possibleMoves = game.moves().join(', ');
    
    const prompt = `
      You are a chess grandmaster engine.
      Current FEN: ${fen}
      Possible Moves: ${possibleMoves}
      
      Analyze the position and output ONLY the best move in SAN format (e.g., "e4", "Nf3", "O-O").
      Do not provide explanation. Just the move string.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    
    const text = response.text?.trim();
    if (!text) return null;

    // Clean up response (remove potential dots or extra text)
    const cleanMove = text.replace(/\.$/, '').trim();
    
    // Validate
    const moves = game.moves();
    if (moves.includes(cleanMove)) {
        return cleanMove;
    }
    
    // If Gemini returns invalid format, fallback to first valid move to prevent crash
    console.warn("Gemini returned invalid move:", text);
    return null;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};