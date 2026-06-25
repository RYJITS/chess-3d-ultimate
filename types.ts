export enum Theme {
  CLASSIC = 'Classic Wood',
  LEGO = 'Lego Star Wars',
  DISNEY = 'Disney Magic'
}

export enum Difficulty {
  EASY = 'Easy (Random)',
  MEDIUM = 'Medium (Depth 2)',
  HARD = 'Hard (Depth 3)'
}

export enum AIType {
  LOCAL = 'Local Minimax',
  GEMINI = 'Gemini AI'
}

export interface GameSettings {
  theme: Theme;
  difficulty: Difficulty;
  aiType: AIType;
  showAnimations: boolean;
  geminiKey: string;
}

export interface MoveResult {
  from: string;
  to: string;
  promotion?: string;
}

export interface PieceProps {
  color: 'w' | 'b';
  type: string; // p, n, b, r, q, k
}