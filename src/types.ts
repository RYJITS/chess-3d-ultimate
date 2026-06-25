
export enum Theme {
  CLASSIC = 'Bois Classique',
  LEGO = 'Lego Star Wars',
  DISNEY = 'Magie Disney'
}

export enum Difficulty {
  EASY = 'Facile (Aléatoire)',
  MEDIUM = 'Moyen (Profondeur 2)',
  HARD = 'Difficile (Profondeur 3)'
}

export enum AIType {
  LOCAL = 'Minimax Local',
  GEMINI = 'IA Gemini'
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
