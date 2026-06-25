
// Weights for piece evaluation
export const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Piece-Square Tables (simplified for brevity, mirrored for black in logic)
// Higher numbers = better position for White
export const PST: Record<string, number[][]> = {
  p: [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 25, 25, 10,  5,  5],
    [0,  0,  0, 20, 20,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0]
  ],
  n: [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
  ],
  // Generic fallback for others to encourage center control
  generic: [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
  ]
};

export const THEME_COLORS = {
  classic: {
    white: 0xf0d096, // Natural Boxwood
    black: 0x151515, // Ebonized Wood (Black)
    boardWhite: 0xeaddcf, // Light Maple/Cream
    boardBlack: 0x4d4d4d, // Dark Matte Grey
    boardBorder: 0x0a0a0a // Pure Black Border
  },
  lego: {
    white: 0xDDDDDD, // N/A - Overridden by character logic
    black: 0x111111, // N/A - Overridden by character logic
    boardWhite: 0xCCCCCC, // Light Grey Plate
    boardBlack: 0x444444, // Dark Grey Plate
    studWhite: 0xDDDDDD,
    studBlack: 0x333333
  },
  disney: {
    white: 0xFF0000, // Mickey Red
    black: 0x4B0082, // Maleficent Purple
    boardWhite: 0xFFFFFF,
    boardBlack: 0x000000
  }
};