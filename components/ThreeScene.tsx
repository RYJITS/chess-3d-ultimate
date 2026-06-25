
import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Chess, Move, Square } from 'chess.js';
import { Theme, GameSettings, AIType } from '../types';
import { THEME_COLORS } from '../constants';
import { getBestMoveLocal, getGeminiMove } from '../services/aiService';

interface ThreeSceneProps {
  game: Chess;
  setGame: React.Dispatch<React.SetStateAction<Chess>>;
  settings: GameSettings;
  onCapture: (msg: string) => void;
  onTurnChange: (turn: 'w' | 'b') => void;
}

// --- PROCEDURAL ASSET HELPERS (HIGH DEF STAUNTON) ---

const getStauntonProfile = (type: string): THREE.Vector2[] => {
    const points: THREE.Vector2[] = [];
    
    // Helper to add curve points
    const addCurve = (start: THREE.Vector2, ctrl: THREE.Vector2, end: THREE.Vector2, steps: number) => {
        for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            const x = (1 - t) * (1 - t) * start.x + 2 * (1 - t) * t * ctrl.x + t * t * end.x;
            const y = (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * ctrl.y + t * t * end.y;
            points.push(new THREE.Vector2(x, y));
        }
    };

    // Helper for a "Sculptural Ring" (A small protrusion/ridge)
    const addRing = (y: number, rBase: number, rProtrusion: number, height: number) => {
        points.push(new THREE.Vector2(rBase, y));
        points.push(new THREE.Vector2(rProtrusion, y + height * 0.5));
        points.push(new THREE.Vector2(rBase, y + height));
    };

    // --- BASE CONSTRUCTION ---
    // Major pieces get a wider, heavier base ("Plus Grasse")
    const isMajor = ['r', 'n_base', 'b', 'q', 'k'].includes(type);
    const baseWidth = isMajor ? 0.48 : 0.42; 

    points.push(new THREE.Vector2(0.0, 0.0));
    points.push(new THREE.Vector2(baseWidth, 0.0)); // Bottom flat
    points.push(new THREE.Vector2(baseWidth, 0.12)); // Vertical edge
    points.push(new THREE.Vector2(baseWidth - 0.04, 0.18)); // Chamfer
    points.push(new THREE.Vector2(baseWidth - 0.06, 0.25)); // Tier 1
    
    // Decorative Base Ring for Major Pieces
    if (isMajor) {
        addRing(0.25, baseWidth - 0.08, baseWidth - 0.05, 0.05); // Sculpture detail
    }
    
    const stemStart = isMajor ? 0.30 : 0.25; // Major pieces start stem at 0.30 height
    // Curve into stem
    addCurve(
        new THREE.Vector2(baseWidth - 0.08, isMajor ? 0.30 : 0.25), 
        new THREE.Vector2(baseWidth - 0.12, 0.35), 
        new THREE.Vector2(isMajor ? 0.26 : 0.20, 0.4), // Major pieces have thicker stem start (0.26 vs 0.20)
        5
    );

    switch (type) {
        case 'p': // Pawn (Kept slender)
            addCurve(new THREE.Vector2(0.20, 0.4), new THREE.Vector2(0.15, 0.6), new THREE.Vector2(0.12, 0.8), 8);
            points.push(new THREE.Vector2(0.22, 0.82)); 
            points.push(new THREE.Vector2(0.22, 0.88));
            points.push(new THREE.Vector2(0.12, 0.90));
            addCurve(new THREE.Vector2(0.12, 0.90), new THREE.Vector2(0.28, 1.1), new THREE.Vector2(0.0, 1.25), 10);
            break;

        case 'r': // Rook (Fatter & Sculpted)
            // Thicker body
            addCurve(new THREE.Vector2(0.26, 0.4), new THREE.Vector2(0.24, 0.6), new THREE.Vector2(0.26, 0.8), 8);
            // Central Ring Detail
            addRing(0.6, 0.245, 0.27, 0.05); 

            // Turret flare
            addCurve(new THREE.Vector2(0.26, 0.8), new THREE.Vector2(0.30, 1.0), new THREE.Vector2(0.36, 1.05), 4);
            points.push(new THREE.Vector2(0.36, 1.25)); 
            points.push(new THREE.Vector2(0.28, 1.25)); 
            points.push(new THREE.Vector2(0.28, 1.15)); 
            points.push(new THREE.Vector2(0.0, 1.15));
            break;

        case 'b': // Bishop (Refined Classic - More Elegant)
            // Stem - Tapered for elegance
            addCurve(new THREE.Vector2(0.26, 0.4), new THREE.Vector2(0.16, 0.75), new THREE.Vector2(0.14, 1.0), 8);
            
            // Distinct Collar / Rim
            points.push(new THREE.Vector2(0.24, 1.05)); // Flare out
            points.push(new THREE.Vector2(0.24, 1.12)); // Vertical edge
            points.push(new THREE.Vector2(0.12, 1.15)); // Inset cut

            // The Mitre (Head) - Traditional Egg Shape
            addCurve(new THREE.Vector2(0.12, 1.15), new THREE.Vector2(0.28, 1.35), new THREE.Vector2(0.05, 1.65), 12);

            // Finial Ball on top
            addCurve(new THREE.Vector2(0.05, 1.65), new THREE.Vector2(0.08, 1.68), new THREE.Vector2(0.0, 1.72), 4);
            break;

        case 'q': // Queen (Voluptuous & Detailed)
            // Complex sculpted stem
            addCurve(new THREE.Vector2(0.26, 0.4), new THREE.Vector2(0.22, 0.6), new THREE.Vector2(0.20, 0.8), 6);
            addRing(0.8, 0.20, 0.24, 0.05); // Mid-stem ring
            addCurve(new THREE.Vector2(0.20, 0.85), new THREE.Vector2(0.18, 1.1), new THREE.Vector2(0.18, 1.3), 6);

            points.push(new THREE.Vector2(0.30, 1.42)); // Lower collar
            points.push(new THREE.Vector2(0.30, 1.48));
            points.push(new THREE.Vector2(0.20, 1.5));
            // Crown flare
            addCurve(new THREE.Vector2(0.20, 1.5), new THREE.Vector2(0.40, 1.7), new THREE.Vector2(0.36, 1.8), 6);
            points.push(new THREE.Vector2(0.28, 1.82)); 
            points.push(new THREE.Vector2(0.0, 1.82));
            break;

        case 'k': // King (Massive & Multi-tiered)
            // Thick heavy stem
            addCurve(new THREE.Vector2(0.26, 0.4), new THREE.Vector2(0.24, 0.8), new THREE.Vector2(0.22, 1.2), 10);
            // Multiple decorative rings
            addRing(0.7, 0.23, 0.26, 0.04);
            addRing(1.1, 0.22, 0.25, 0.04);

            addCurve(new THREE.Vector2(0.22, 1.25), new THREE.Vector2(0.22, 1.4), new THREE.Vector2(0.22, 1.5), 4);

            // Collar
            points.push(new THREE.Vector2(0.32, 1.55));
            points.push(new THREE.Vector2(0.32, 1.62));
            points.push(new THREE.Vector2(0.22, 1.65));
            // Crown bulb
            addCurve(new THREE.Vector2(0.22, 1.65), new THREE.Vector2(0.40, 1.8), new THREE.Vector2(0.35, 2.0), 8);
            points.push(new THREE.Vector2(0.0, 2.0));
            break;

        case 'n_base': // Knight Pedestal (Stout)
            // Very thick neck base
            addCurve(new THREE.Vector2(0.26, 0.4), new THREE.Vector2(0.24, 0.55), new THREE.Vector2(0.28, 0.7), 6);
            points.push(new THREE.Vector2(0.28, 0.75)); 
            points.push(new THREE.Vector2(0.0, 0.75));
            break;
    }
    return points;
};

const getKnightShape = (): THREE.Shape => {
    const shape = new THREE.Shape();
    shape.moveTo(0.26, 0.0); // Wider neck base
    
    shape.bezierCurveTo(0.40, 0.2, 0.44, 0.4, 0.36, 0.6); // Broader chest
    
    shape.lineTo(0.40, 0.55); 
    shape.lineTo(0.48, 0.52); // Snout
    
    shape.lineTo(0.46, 0.65); 
    shape.bezierCurveTo(0.40, 0.8, 0.30, 0.95, 0.30, 1.05); 
    
    shape.lineTo(0.24, 1.15); 
    shape.lineTo(0.18, 1.00); 
    
    shape.bezierCurveTo(0.08, 1.05, -0.10, 0.9, -0.18, 0.7); 
    shape.bezierCurveTo(-0.25, 0.5, -0.25, 0.2, -0.25, 0.0); // Thicker neck back
    
    shape.lineTo(0.26, 0.0); 
    
    return shape;
};

// --- SPACE ENVIRONMENT HELPERS ---

const createSpaceShip = (type: 'tie' | 'xwing') => {
    const ship = new THREE.Group();
    const matGrey = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.4 });
    const matDark = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.4 });
    const matEngine = new THREE.MeshBasicMaterial({ color: 0xff4400 });

    if (type === 'tie') {
        // Ball Cockpit
        const ball = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), matGrey);
        ship.add(ball);
        // Window
        const win = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.1), matDark);
        win.rotation.x = Math.PI/2;
        win.position.z = 0.45;
        ship.add(win);
        // Wings
        const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.8), matGrey);
        strut.rotation.z = Math.PI/2;
        ship.add(strut);
        const wingGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.1, 6);
        const lWing = new THREE.Mesh(wingGeo, matDark); lWing.rotation.z = Math.PI/2; lWing.position.x = -0.9;
        const rWing = new THREE.Mesh(wingGeo, matDark); rWing.rotation.z = Math.PI/2; rWing.position.x = 0.9;
        ship.add(lWing); ship.add(rWing);
    } else {
        // X-Wing Fuselage
        const fuse = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 2), matGrey);
        ship.add(fuse);
        // Nose
        const nose = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.8, 4), matGrey);
        nose.rotation.x = -Math.PI/2; nose.rotation.y = Math.PI/4;
        nose.position.z = 1.4;
        ship.add(nose);
        // Wings (X shape)
        const wGeo = new THREE.BoxGeometry(1.2, 0.1, 0.6);
        for(let i=0; i<4; i++) {
            const w = new THREE.Mesh(wGeo, matGrey);
            w.position.z = -0.2;
            if(i===0) { w.position.set(0.8, 0.4, 0); w.rotation.z = -0.2; }
            if(i===1) { w.position.set(-0.8, 0.4, 0); w.rotation.z = 0.2; }
            if(i===2) { w.position.set(0.8, -0.4, 0); w.rotation.z = 0.2; }
            if(i===3) { w.position.set(-0.8, -0.4, 0); w.rotation.z = -0.2; }
            ship.add(w);
            // Engines
            const eng = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.1, 0.6), matGrey);
            eng.rotation.x = Math.PI/2;
            eng.position.copy(w.position);
            eng.position.z = -0.6;
            ship.add(eng);
            const glow = new THREE.Mesh(new THREE.CircleGeometry(0.08), matEngine);
            glow.position.set(0, -0.31, 0); glow.rotation.x = Math.PI/2;
            eng.add(glow);
        }
    }
    return ship;
};

// Interface for active background battles
interface BattleShip {
    mesh: THREE.Group;
    velocity: THREE.Vector3;
    type: 'tie' | 'xwing';
    life: number;
    shootTimer: number;
}

const ThreeScene: React.FC<ThreeSceneProps> = ({ game, setGame, settings, onCapture, onTurnChange }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const piecesRef = useRef<Map<string, THREE.Group>>(new Map());
  const controlsRef = useRef<OrbitControls | null>(null);
  const selectedSquareRef = useRef<string | null>(null);
  const highlightMeshRef = useRef<THREE.Mesh | null>(null);
  const validMovesGroupRef = useRef<THREE.Group>(new THREE.Group());
  const boardGroupRef = useRef<THREE.Group | null>(null);

  // Space Environment Refs
  const starfieldRef = useRef<THREE.Points | null>(null);
  const deathStarRef = useRef<THREE.Group | null>(null);
  const battlesRef = useRef<BattleShip[]>([]);
  const laserGroupRef = useRef<THREE.Group>(new THREE.Group());

  const getPositionFromSquare = (square: string): THREE.Vector3 => {
    const file = square.charCodeAt(0) - 97;
    const rank = parseInt(square[1]) - 1;
    return new THREE.Vector3(file - 3.5, 0, 3.5 - rank);
  };

  // --- SCENE INIT ---
  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510);
    scene.fog = new THREE.FogExp2(0x050510, 0.03);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 10, 12);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minPolarAngle = 0.1;
    controls.maxPolarAngle = Math.PI / 2 - 0.1;
    controls.maxDistance = 20;
    controls.minDistance = 5;
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(5, 10, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    const spotLight = new THREE.SpotLight(0x00ffff, 50);
    spotLight.position.set(-10, 5, -5);
    spotLight.lookAt(0, 0, 0);
    scene.add(spotLight);

    // Initialize Board Group
    const bg = new THREE.Group();
    scene.add(bg);
    boardGroupRef.current = bg;

    // Selection Highlight
    const highlightGeo = new THREE.PlaneGeometry(1, 1);
    const highlightMat = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
    const highlight = new THREE.Mesh(highlightGeo, highlightMat);
    highlight.rotation.x = -Math.PI / 2;
    highlight.position.y = 0.01;
    highlight.visible = false;
    scene.add(highlight);
    highlightMeshRef.current = highlight;

    scene.add(validMovesGroupRef.current);
    scene.add(laserGroupRef.current);

    // --- STAR WARS ENVIRONMENT ---
    
    // 1. Starfield
    const starsGeo = new THREE.BufferGeometry();
    const starsCount = 2000;
    const posArray = new Float32Array(starsCount * 3);
    for(let i=0; i<starsCount*3; i++) {
        posArray[i] = (Math.random() - 0.5) * 100; // Spread wide
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const starsMat = new THREE.PointsMaterial({size: 0.15, color: 0xFFFFFF});
    const starfield = new THREE.Points(starsGeo, starsMat);
    starfield.visible = false;
    scene.add(starfield);
    starfieldRef.current = starfield;

    // 2. Death Star
    const dsGroup = new THREE.Group();
    // Hull
    const dsGeo = new THREE.SphereGeometry(15, 32, 32);
    const dsMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.7 });
    const dsHull = new THREE.Mesh(dsGeo, dsMat);
    dsGroup.add(dsHull);
    // Trench
    const trench = new THREE.Mesh(new THREE.TorusGeometry(14.8, 0.2, 8, 64), new THREE.MeshBasicMaterial({color: 0x111111}));
    trench.rotation.x = Math.PI/2;
    dsGroup.add(trench);
    // Superlaser Dish (Darker Circle Mesh)
    const dish = new THREE.Mesh(new THREE.CircleGeometry(4, 32), new THREE.MeshStandardMaterial({color: 0x333333, roughness: 0.9}));
    dish.position.set(8, 8, 10);
    dish.lookAt(0,0,0); // Invert look
    dish.position.set(5, 8, 12); // Reposition
    dish.rotation.x = -0.5;
    dish.rotation.y = 0.2;
    dsGroup.add(dish);
    
    dsGroup.position.set(-40, 10, -60); // Far background
    dsGroup.visible = false;
    scene.add(dsGroup);
    deathStarRef.current = dsGroup;


    const handleResize = () => {
        if (cameraRef.current && rendererRef.current) {
            cameraRef.current.aspect = window.innerWidth / window.innerHeight;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(window.innerWidth, window.innerHeight);
        }
    };
    window.addEventListener('resize', handleResize);

    return () => {
        window.removeEventListener('resize', handleResize);
        if (rendererRef.current && mountRef.current) {
            mountRef.current.removeChild(rendererRef.current.domElement);
        }
        renderer.dispose();
    };
  }, []);

  // --- BOARD GENERATION (Refreshes on Theme Change) ---
  useEffect(() => {
    if (!sceneRef.current || !boardGroupRef.current) return;

    const isLego = settings.theme === Theme.LEGO;

    // Toggle Space Environment
    if (starfieldRef.current) starfieldRef.current.visible = isLego;
    if (deathStarRef.current) deathStarRef.current.visible = isLego;
    if (sceneRef.current) {
        sceneRef.current.background = new THREE.Color(isLego ? 0x000000 : 0x050510);
        sceneRef.current.fog = new THREE.FogExp2(isLego ? 0x000000 : 0x050510, isLego ? 0.005 : 0.03); // Less fog in space
    }

    const boardGroup = boardGroupRef.current;
    boardGroup.clear();

    // 1. Create Border
    if (isLego) {
        // LEGO BOARD - Studded Plate Style
        const cWhite = THEME_COLORS.lego.boardWhite;
        const cBlack = THEME_COLORS.lego.boardBlack;
        
        // Baseplate (Large thin plate)
        const baseGeo = new THREE.BoxGeometry(8.4, 0.2, 8.4);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.2 });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.y = -0.15;
        base.receiveShadow = true;
        boardGroup.add(base);

        // Stud Geometry
        const studGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 12);
        
        for (let x = 0; x < 8; x++) {
            for (let z = 0; z < 8; z++) {
                const isWhite = (x + z) % 2 === 0;
                const color = isWhite ? cWhite : cBlack;
                const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.1, metalness: 0.0 }); // Plastic look
                
                // Tile Plate
                const plateGeo = new THREE.BoxGeometry(1, 0.1, 1);
                const plate = new THREE.Mesh(plateGeo, mat);
                plate.position.set(x - 3.5, 0.0, 3.5 - z);
                plate.receiveShadow = true;
                plate.userData = { square: `${String.fromCharCode(97 + x)}${z + 1}` };
                boardGroup.add(plate);

                // 4 Studs per tile
                for (let sx = -0.25; sx <= 0.25; sx += 0.5) {
                    for (let sz = -0.25; sz <= 0.25; sz += 0.5) {
                        const stud = new THREE.Mesh(studGeo, mat);
                        stud.position.set(sx, 0.1, sz); // Relative to plate
                        stud.userData = plate.userData; // COPY USERDATA SO CLICKS WORK ON STUDS
                        plate.add(stud);
                    }
                }
            }
        }

    } else {
        // CLASSIC & DISNEY - Standard Flat Board
        const isClassic = settings.theme === Theme.CLASSIC;
        let cWhite = THEME_COLORS.classic.boardWhite;
        let cBlack = THEME_COLORS.classic.boardBlack;
        let cBorder = THEME_COLORS.classic.boardBorder;

        if (settings.theme === Theme.DISNEY) {
            cWhite = THEME_COLORS.disney.boardWhite;
            cBlack = THEME_COLORS.disney.boardBlack;
            cBorder = 0x330033;
        }

        const borderSize = 9;
        const borderHeight = 0.4;
        const borderGeo = new THREE.BoxGeometry(borderSize, borderHeight, borderSize);
        const borderMat = new THREE.MeshStandardMaterial({ 
            color: cBorder, 
            roughness: 0.8, 
            metalness: 0.1 
        });
        const borderMesh = new THREE.Mesh(borderGeo, borderMat);
        borderMesh.position.y = -0.25;
        borderMesh.receiveShadow = true;
        boardGroup.add(borderMesh);

        const tileGeo = new THREE.BoxGeometry(1, 0.1, 1);
        for (let x = 0; x < 8; x++) {
          for (let z = 0; z < 8; z++) {
            const isWhite = (x + z) % 2 === 0;
            const material = new THREE.MeshStandardMaterial({ 
                color: isWhite ? cWhite : cBlack,
                roughness: isClassic ? 0.7 : 0.5,
                metalness: 0.1
            });
            const square = new THREE.Mesh(tileGeo, material);
            square.position.set(x - 3.5, -0.05, 3.5 - z);
            square.receiveShadow = true;
            square.userData = { square: `${String.fromCharCode(97 + x)}${z + 1}` };
            boardGroup.add(square);
          }
        }
    }

  }, [settings.theme]);

  // --- PIECE FACTORY ---
  const createPieceMesh = useCallback((type: string, color: 'w' | 'b', theme: Theme): THREE.Group => {
      const group = new THREE.Group();
      const isWhite = color === 'w';

      if (theme === Theme.CLASSIC) {
          // ... (Existing Classic Logic Preserved) ...
          let primaryColor = isWhite ? THEME_COLORS.classic.white : THEME_COLORS.classic.black;
          const material = new THREE.MeshStandardMaterial({ 
            color: primaryColor,
            roughness: 0.4, 
            metalness: 0.15 
          });
          const SEGMENTS = 64; 

          if (type === 'n') {
              const basePts = getStauntonProfile('n_base');
              const baseGeo = new THREE.LatheGeometry(basePts, SEGMENTS);
              const base = new THREE.Mesh(baseGeo, material);
              base.castShadow = true;
              group.add(base);

              const shape = getKnightShape();
              const extrudeSettings = { depth: 0.20, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 4 };
              const headGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
              headGeo.center(); 
              const head = new THREE.Mesh(headGeo, material);
              head.rotation.y = Math.PI / 2; 
              if (!isWhite) head.rotation.y = -Math.PI / 2; 
              head.position.set(0, 0.95, 0);
              head.castShadow = true;
              group.add(head);

          } else if (type === 'k') {
              const pts = getStauntonProfile('k');
              const geo = new THREE.LatheGeometry(pts, SEGMENTS);
              const body = new THREE.Mesh(geo, material);
              body.castShadow = true;
              group.add(body);
              const vGeo = new THREE.BoxGeometry(0.08, 0.3, 0.08);
              const hGeo = new THREE.BoxGeometry(0.22, 0.08, 0.08);
              const vMesh = new THREE.Mesh(vGeo, material);
              const hMesh = new THREE.Mesh(hGeo, material);
              vMesh.position.y = 2.15;
              hMesh.position.y = 2.15;
              const crossGroup = new THREE.Group();
              crossGroup.add(vMesh);
              crossGroup.add(hMesh);
              crossGroup.castShadow = true;
              group.add(crossGroup);
          } else if (type === 'q') {
              const pts = getStauntonProfile('q');
              const geo = new THREE.LatheGeometry(pts, SEGMENTS);
              const body = new THREE.Mesh(geo, material);
              body.castShadow = true;
              group.add(body);
              const crownGroup = new THREE.Group();
              const spikeCount = 9;
              const radius = 0.35;
              const spikeGeo = new THREE.ConeGeometry(0.04, 0.15, 8);
              for (let i = 0; i < spikeCount; i++) {
                  const angle = (i / spikeCount) * Math.PI * 2;
                  const spike = new THREE.Mesh(spikeGeo, material);
                  spike.position.set(Math.cos(angle) * radius, 1.85, Math.sin(angle) * radius);
                  spike.rotation.x = 0.3; 
                  spike.rotation.y = -angle; 
                  crownGroup.add(spike);
              }
              const capGeo = new THREE.SphereGeometry(0.12, 16, 16);
              const cap = new THREE.Mesh(capGeo, material);
              cap.position.y = 1.82;
              crownGroup.add(cap);
              crownGroup.castShadow = true;
              group.add(crownGroup);
          } else {
              const points = getStauntonProfile(type);
              const geo = new THREE.LatheGeometry(points, SEGMENTS);
              const mesh = new THREE.Mesh(geo, material);
              mesh.castShadow = true;
              mesh.receiveShadow = true;
              group.add(mesh);
          }
          group.scale.set(0.55, 0.55, 0.55);
      } 
      else if (theme === Theme.LEGO) {
          // --- REALISTIC LEGO CONSTRUCTION ENGINE ---
          const plasticMat = (col: number) => new THREE.MeshStandardMaterial({ 
              color: col, 
              roughness: 0.2, 
              metalness: 0.1 // Slight metalness for shiny plastic
          });
          
          // Helper to build the iconic "C-Clamp" Hand
          const createLegoHand = (color: number) => {
              const handGroup = new THREE.Group();
              // The C-clamp (Torus segment)
              const geo = new THREE.TorusGeometry(0.06, 0.02, 8, 16, 3.5); 
              const mesh = new THREE.Mesh(geo, plasticMat(color));
              mesh.rotation.z = -1.0;
              handGroup.add(mesh);
              // Wrist pin
              const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.06), plasticMat(color));
              pin.rotation.z = Math.PI/2;
              pin.position.x = -0.05;
              handGroup.add(pin);
              return handGroup;
          };

          // Helper to build an Astromech Droid (R2 Unit)
          const buildAstromech = (bodyColor: number, domeColor: number) => {
              const droid = new THREE.Group();
              const bMat = plasticMat(bodyColor);
              const dMat = plasticMat(domeColor);

              // Body: Stack of cylinders
              const body = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.35, 16), bMat);
              body.position.y = 0.3;
              droid.add(body);
              
              // Dome: Hemisphere
              const dome = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16, 0, 6.3, 0, 1.6), dMat);
              dome.position.y = 0.475;
              droid.add(dome);

              // Legs: Distinct Struts
              const legGeo = new THREE.BoxGeometry(0.08, 0.5, 0.15);
              const lLeg = new THREE.Mesh(legGeo, bMat); lLeg.position.set(-0.22, 0.25, 0);
              const rLeg = new THREE.Mesh(legGeo, bMat); rLeg.position.set(0.22, 0.25, 0);
              
              // Shoulder joints for legs
              const shoulderGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.1);
              const lS = new THREE.Mesh(shoulderGeo, bMat); lS.rotation.z = Math.PI/2; lS.position.set(-0.22, 0.4, 0);
              const rS = new THREE.Mesh(shoulderGeo, bMat); rS.rotation.z = Math.PI/2; rS.position.set(0.22, 0.4, 0);

              droid.add(lLeg); droid.add(rLeg); droid.add(lS); droid.add(rS);
              droid.traverse(c => { if(c instanceof THREE.Mesh) c.castShadow = true; });
              return droid;
          };

          // -- Helper to build generic minifig parts --
          const buildMinifig = (
              legColor: number, 
              torsoColor: number, 
              headColor: number, 
              handColor: number = 0xFFCC88, // Skin default
              hasSkirt: boolean = false,
              isShort: boolean = false
          ) => {
              const fig = new THREE.Group();
              
              // 1. HIPS (Connector)
              const hipGeo = new THREE.BoxGeometry(0.36, 0.12, 0.20);
              const hip = new THREE.Mesh(hipGeo, plasticMat(legColor));
              hip.position.y = 0.26 + (isShort ? -0.15 : 0); // Adjust based on leg height
              // Hip Pin
              const hipPin = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.20), plasticMat(legColor));
              hipPin.rotation.z = Math.PI/2;
              hip.add(hipPin);
              fig.add(hip);

              // 2. LEGS (Separate Left/Right)
              if (hasSkirt) {
                  // Skirt is a specialized slope brick
                  const skirtGeo = new THREE.CylinderGeometry(0.25, 0.45, 0.5, 4);
                  const skirt = new THREE.Mesh(skirtGeo, plasticMat(legColor));
                  skirt.rotation.y = Math.PI / 4;
                  skirt.position.y = 0.25;
                  fig.add(skirt);
              } else {
                  const legH = isShort ? 0.25 : 0.45;
                  const legGeo = new THREE.BoxGeometry(0.16, legH, 0.28);
                  
                  // Left Leg
                  const lLeg = new THREE.Mesh(legGeo, plasticMat(legColor));
                  lLeg.position.set(-0.10, legH/2, 0);
                  // Cylinder joint at top of leg
                  const lJoint = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.16), plasticMat(legColor));
                  lJoint.rotation.z = Math.PI/2;
                  lJoint.position.y = legH/2;
                  lLeg.add(lJoint);
                  fig.add(lLeg);

                  // Right Leg
                  const rLeg = new THREE.Mesh(legGeo, plasticMat(legColor));
                  rLeg.position.set(0.10, legH/2, 0);
                  const rJoint = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.16), plasticMat(legColor));
                  rJoint.rotation.z = Math.PI/2;
                  rJoint.position.y = legH/2;
                  rLeg.add(rJoint);
                  fig.add(rLeg);
              }

              // 3. TORSO (Trapezoidal)
              const torsoBaseY = hasSkirt ? 0.5 : (isShort ? 0.4 : 0.6); // Base of torso
              const torsoHeight = 0.45;
              // Using Cylinder with 4 sides to make trapezoid
              const torsoGeo = new THREE.CylinderGeometry(0.16, 0.26, torsoHeight, 4); 
              const torso = new THREE.Mesh(torsoGeo, plasticMat(torsoColor));
              torso.rotation.y = Math.PI / 4;
              torso.position.y = torsoBaseY + torsoHeight/2;
              fig.add(torso);

              // Neck Stud
              const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.1), plasticMat(headColor)); // Usually torso color? No, usually yellow or skin if skin exposed. Let's assume torso color for shirt collar or head color for skin.
              neck.position.y = torsoBaseY + torsoHeight + 0.05;
              fig.add(neck);

              // 4. ARMS (Articulated)
              const createArm = (isLeft: boolean) => {
                  const armGroup = new THREE.Group();
                  const armCol = plasticMat(torsoColor);
                  
                  // Shoulder Sphere
                  const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.08), armCol);
                  armGroup.add(shoulder);
                  
                  // Arm Tube
                  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.25), armCol);
                  tube.rotation.z = isLeft ? -0.3 : 0.3;
                  tube.position.set(isLeft ? -0.08 : 0.08, -0.12, 0);
                  armGroup.add(tube);
                  
                  // Wrist
                  const hand = createLegoHand(handColor);
                  hand.position.set(isLeft ? -0.14 : 0.14, -0.25, 0);
                  hand.rotation.z = isLeft ? 0.3 : -0.3;
                  hand.rotation.y = -Math.PI/2; // Face forward
                  armGroup.add(hand);

                  // Position on Torso
                  armGroup.position.set(isLeft ? -0.22 : 0.22, torsoBaseY + 0.35, 0);
                  return armGroup;
              }

              fig.add(createArm(true));
              fig.add(createArm(false));

              // 5. HEAD (Cylinder + Stud)
              const headY = torsoBaseY + torsoHeight + 0.1; 
              const headGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.22, 16);
              const head = new THREE.Mesh(headGeo, plasticMat(headColor));
              head.position.y = headY + 0.11;
              // Head Stud
              const headStud = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.05), plasticMat(headColor));
              headStud.position.y = 0.135;
              head.add(headStud);
              fig.add(head);

              fig.traverse(c => { if(c instanceof THREE.Mesh) c.castShadow = true; });

              return { fig, headY };
          };

          // --- SPECIFIC CHARACTERS ---
          
          // WHITE PAWN: R2-D2 (Construction)
          if (isWhite && type === 'p') {
              const r2 = buildAstromech(0xFFFFFF, 0xCCCCCC); // White Body, Silver Dome
              group.add(r2);
          }
          // BLACK PAWN: IMPERIAL ASTROMECH (Black Robot)
          else if (!isWhite && type === 'p') {
              const r2q5 = buildAstromech(0x111111, 0x222222); // Black Body, Dark Grey Dome
              group.add(r2q5);
          }
          // WHITE ROOK: CHEWBACCA
          else if (isWhite && type === 'r') {
               // Using headColor as Brown for the fur head
               const { fig, headY } = buildMinifig(0x5C4033, 0x5C4033, 0x5C4033, 0x5C4033); 
               // Bandolier (Diagonal Plate)
               const bandolier = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.05), plasticMat(0x888888));
               bandolier.rotation.z = Math.PI / 4;
               bandolier.position.set(0, 0.7, 0.15);
               fig.add(bandolier);
               group.add(fig);
          }
          // BLACK ROOK: ROYAL GUARD
          else if (!isWhite && type === 'r') {
              const { fig, headY } = buildMinifig(0x880000, 0xAA0000, 0x000000, 0x880000, true); // Red Skirt/Torso, Red Gloves
              // Red Helmet (Elongated smooth)
              const helmGeo = new THREE.CapsuleGeometry(0.18, 0.3, 4, 8);
              const helm = new THREE.Mesh(helmGeo, plasticMat(0xAA0000));
              helm.position.y = headY + 0.1;
              fig.add(helm);
              // Cape
              const capeGeo = new THREE.PlaneGeometry(0.5, 0.8);
              const cape = new THREE.Mesh(capeGeo, new THREE.MeshStandardMaterial({color: 0x660000, side: THREE.DoubleSide}));
              cape.position.set(0, 0.6, -0.15);
              fig.add(cape);
              group.add(fig);
          }
          // WHITE KNIGHT: YODA
          else if (isWhite && type === 'n') {
              const { fig, headY } = buildMinifig(0x654321, 0xD2B48C, 0x77DD77, 0x77DD77, false, true); // Short legs, Green Skin
              // Ears
              const earGeo = new THREE.ConeGeometry(0.05, 0.3, 8);
              const lEar = new THREE.Mesh(earGeo, plasticMat(0x77DD77));
              lEar.rotation.z = Math.PI / 2; lEar.position.set(-0.20, headY + 0.15, 0);
              const rEar = new THREE.Mesh(earGeo, plasticMat(0x77DD77));
              rEar.rotation.z = -Math.PI / 2; rEar.position.set(0.20, headY + 0.15, 0);
              fig.add(lEar); fig.add(rEar);
              // Green Lightsaber
              const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.2), plasticMat(0xAAAAAA));
              hilt.rotation.x = Math.PI/2; hilt.position.set(0.3, 0.45, 0.2);
              const blade = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6), new THREE.MeshBasicMaterial({ color: 0x00FF00 }));
              blade.rotation.x = Math.PI/2; blade.position.set(0.3, 0.45, 0.6);
              fig.add(hilt); fig.add(blade);
              group.add(fig);
          }
          // BLACK KNIGHT: DARTH MAUL
          else if (!isWhite && type === 'n') {
              const { fig, headY } = buildMinifig(0x111111, 0x111111, 0xFF0000, 0x111111); // Red Face, Black gloves
              // Horns (Small studs)
              const hornGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.03);
              for(let i=0; i<6; i++) {
                  const h = new THREE.Mesh(hornGeo, plasticMat(0xFFFFCC));
                  const angle = (i/6)*Math.PI*2;
                  h.position.set(Math.cos(angle)*0.12, headY + 0.28, Math.sin(angle)*0.12);
                  fig.add(h);
              }
              // Double Saber
              const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.3), plasticMat(0xAAAAAA));
              hilt.rotation.x = Math.PI/2; hilt.position.set(0.3, 0.55, 0.3);
              const b1 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6), new THREE.MeshBasicMaterial({ color: 0xFF0000 }));
              b1.rotation.x = Math.PI/2; b1.position.set(0.3, 0.55, 0.75);
              const b2 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6), new THREE.MeshBasicMaterial({ color: 0xFF0000 }));
              b2.rotation.x = Math.PI/2; b2.position.set(0.3, 0.55, -0.15);
              fig.add(hilt); fig.add(b1); fig.add(b2);
              group.add(fig);
          }
          // WHITE BISHOP: C-3PO
          else if (isWhite && type === 'b') {
              const { fig } = buildMinifig(0xFFD700, 0xFFD700, 0xFFD700, 0xFFD700); // Gold everywhere
              // Metallic finish
              fig.traverse((child) => {
                  if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                      child.material.metalness = 0.8;
                      child.material.roughness = 0.15;
                  }
              });
              group.add(fig);
          }
          // BLACK BISHOP: IMPERIAL OFFICER
          else if (!isWhite && type === 'b') {
               const { fig, headY } = buildMinifig(0x444444, 0x555555, 0xFFCC88, 0xFFCC88); // Grey Uniform, Skin hands
               // Cap
               const capGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.05, 16);
               const cap = new THREE.Mesh(capGeo, plasticMat(0x444444));
               cap.position.y = headY + 0.24;
               const visor = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.02, 0.08), plasticMat(0x000000));
               visor.position.set(0, headY + 0.24, 0.08);
               fig.add(cap); fig.add(visor);
               group.add(fig);
          }
          // WHITE QUEEN: LEIA
          else if (isWhite && type === 'q') {
               const { fig, headY } = buildMinifig(0xFFFFFF, 0xFFFFFF, 0xFFCC88, 0xFFCC88, true); // White Dress
               // Hair Buns
               const bunGeo = new THREE.TorusGeometry(0.08, 0.04, 8, 16);
               const lBun = new THREE.Mesh(bunGeo, plasticMat(0x331100));
               lBun.rotation.y = Math.PI/2; lBun.position.set(-0.16, headY+0.15, 0);
               const rBun = new THREE.Mesh(bunGeo, plasticMat(0x331100));
               rBun.rotation.y = Math.PI/2; rBun.position.set(0.16, headY+0.15, 0);
               fig.add(lBun); fig.add(rBun);
               // Blaster
               const blaster = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.1, 0.15), plasticMat(0x111111));
               blaster.position.set(0.3, 0.55, 0.3);
               fig.add(blaster);
               group.add(fig);
          }
          // BLACK QUEEN: THE EMPEROR
          else if (!isWhite && type === 'q') {
               const { fig, headY } = buildMinifig(0x111111, 0x111111, 0xDDDDDD, 0x111111, true); // Black Robes, Pale face
               // Hood
               const hoodGeo = new THREE.ConeGeometry(0.25, 0.4, 4, 1, true);
               const hood = new THREE.Mesh(hoodGeo, new THREE.MeshStandardMaterial({color: 0x111111, side: THREE.DoubleSide}));
               hood.rotation.y = Math.PI/4;
               hood.position.y = headY + 0.1;
               fig.add(hood);
               // Lightning
               const zap = new THREE.Mesh(new THREE.TorusKnotGeometry(0.1, 0.02, 32, 4), new THREE.MeshBasicMaterial({color: 0x8888FF}));
               zap.position.set(0.3, 0.5, 0.3);
               fig.add(zap);
               group.add(fig);
          }
          // WHITE KING: LUKE
          else if (isWhite && type === 'k') {
              const { fig, headY } = buildMinifig(0x111111, 0x111111, 0xFFCC88, 0x111111); // Black Jedi Robes, Black glove
              // Hair
              const hairGeo = new THREE.SphereGeometry(0.15, 16, 8, 0, 6.3, 0, 1.5);
              const hair = new THREE.Mesh(hairGeo, plasticMat(0xDDAA33)); // Dirty Blonde
              hair.position.y = headY + 0.14;
              fig.add(hair);
              // Green Lightsaber
              const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.2), plasticMat(0xAAAAAA));
              hilt.rotation.x = Math.PI/2; hilt.position.set(0.3, 0.55, 0.2);
              const blade = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.9), new THREE.MeshBasicMaterial({ color: 0x00FF00 }));
              blade.rotation.x = Math.PI/2; blade.position.set(0.3, 0.55, 0.75);
              fig.add(hilt); fig.add(blade);
              group.add(fig);
          }
          // BLACK KING: VADER
          else if (!isWhite && type === 'k') {
               const { fig, headY } = buildMinifig(0x111111, 0x111111, 0xCCCCCC, 0x111111); // Black Armor
               // Helmet (Cone + Cylinder)
               const helmGroup = new THREE.Group();
               const top = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 16, 0, 6.3, 0, 1.5), plasticMat(0x000000));
               const brim = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.15, 16, 1, true), new THREE.MeshStandardMaterial({color: 0x000000, side: THREE.DoubleSide}));
               brim.position.y = -0.05;
               helmGroup.add(top); helmGroup.add(brim);
               helmGroup.position.y = headY + 0.2;
               fig.add(helmGroup);
               // Cape
               const cape = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.9), new THREE.MeshStandardMaterial({color: 0x000000, side: THREE.DoubleSide}));
               cape.position.set(0, 0.65, -0.18);
               fig.add(cape);
               // Red Lightsaber
               const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.2), plasticMat(0x000000));
               hilt.rotation.x = Math.PI/2; hilt.position.set(0.3, 0.55, 0.2);
               const blade = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.9), new THREE.MeshBasicMaterial({ color: 0xFF0000 }));
               blade.rotation.x = Math.PI/2; blade.position.set(0.3, 0.55, 0.75);
               fig.add(hilt); fig.add(blade);
               group.add(fig);
          }
          
          // Scale to fit square (increased from 0.65 to 0.85)
          group.scale.set(0.85, 0.85, 0.85);
      }
      else if (theme === Theme.DISNEY) {
          const primaryColor = isWhite ? THEME_COLORS.disney.white : THEME_COLORS.disney.black;
          const material = new THREE.MeshStandardMaterial({ color: primaryColor, roughness: 0.2 });

          const bodyGeo = new THREE.SphereGeometry(0.35, 16, 16);
          const body = new THREE.Mesh(bodyGeo, material);
          body.position.y = 0.35;
          body.castShadow = true;
          group.add(body);

          if (isWhite) {
              const earGeo = new THREE.SphereGeometry(0.15, 16, 16);
              const earMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
              const leftEar = new THREE.Mesh(earGeo, earMat);
              leftEar.position.set(-0.25, 0.65, 0);
              group.add(leftEar);
              const rightEar = new THREE.Mesh(earGeo, earMat);
              rightEar.position.set(0.25, 0.65, 0);
              group.add(rightEar);
          } else {
              const hornGeo = new THREE.ConeGeometry(0.08, 0.4, 16);
              hornGeo.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0.2, 0));
              const hornMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
              const leftHorn = new THREE.Mesh(hornGeo, hornMat);
              leftHorn.position.set(-0.15, 0.5, 0);
              leftHorn.rotation.z = 0.5;
              group.add(leftHorn);
              const rightHorn = new THREE.Mesh(hornGeo, hornMat);
              rightHorn.position.set(0.15, 0.5, 0);
              rightHorn.rotation.z = -0.5;
              group.add(rightHorn);
          }
      }

      return group;
  }, []);

  const updateBoardVisuals = useCallback((fullRebuild = false) => {
      if (!sceneRef.current) return;

      const board = game.board();
      const currentPieces = piecesRef.current;

      if (fullRebuild) {
          currentPieces.forEach(p => sceneRef.current?.remove(p));
          currentPieces.clear();
      }

      for (let i = 0; i < 8; i++) {
          for (let j = 0; j < 8; j++) {
              const squareName = `${String.fromCharCode(97 + j)}${8 - i}`;
              const pieceData = board[i][j];

              if (pieceData) {
                  if (!currentPieces.has(squareName)) {
                      const mesh = createPieceMesh(pieceData.type, pieceData.color, settings.theme);
                      const pos = getPositionFromSquare(squareName);
                      mesh.position.copy(pos);

                      // Lego pieces stand on studs
                      if (settings.theme === Theme.LEGO) {
                          mesh.position.y = 0.15;
                      }

                      // CRITICAL FIX: Assign userData to the group AND all children meshes
                      // This allows the raycaster to detect the piece regardless of which part is clicked
                      mesh.userData = { square: squareName };
                      mesh.traverse((child) => {
                          if (child instanceof THREE.Mesh) {
                              child.userData = { square: squareName };
                          }
                      });

                      sceneRef.current.add(mesh);
                      currentPieces.set(squareName, mesh);
                  }
              } else {
                  if (currentPieces.has(squareName)) {
                      const mesh = currentPieces.get(squareName)!;
                      sceneRef.current.remove(mesh);
                      currentPieces.delete(squareName);
                  }
              }
          }
      }
  }, [game, settings.theme, createPieceMesh]);

  useEffect(() => {
      updateBoardVisuals(true);
  }, [settings.theme]);

  useEffect(() => {
      let frameId: number;
      
      // BATTLE LOGIC SPAWNER
      const spawnBattle = () => {
          if(!sceneRef.current) return;
          // Random position start
          const startZ = (Math.random()-0.5)*40;
          const startY = 5 + Math.random()*10;
          const startX = -50;
          
          // Spawn X-Wing (Rebel)
          const xwingMesh = createSpaceShip('xwing');
          xwingMesh.position.set(startX, startY, startZ);
          xwingMesh.scale.set(0.5,0.5,0.5);
          xwingMesh.rotation.y = Math.PI/2; // Face right
          
          // Spawn TIE (Empire) - Chasing or being chased
          const tieMesh = createSpaceShip('tie');
          tieMesh.position.set(startX - 5, startY + (Math.random()-0.5)*2, startZ + (Math.random()-0.5)*2);
          tieMesh.scale.set(0.5,0.5,0.5);
          tieMesh.rotation.y = Math.PI/2;

          sceneRef.current.add(xwingMesh);
          sceneRef.current.add(tieMesh);

          battlesRef.current.push({
              mesh: xwingMesh, velocity: new THREE.Vector3(0.4, 0, 0), type: 'xwing', life: 300, shootTimer: 0
          });
          battlesRef.current.push({
              mesh: tieMesh, velocity: new THREE.Vector3(0.42, 0, 0), type: 'tie', life: 300, shootTimer: 0
          });
      };

      const animate = () => {
          frameId = requestAnimationFrame(animate);
          if (controlsRef.current) controlsRef.current.update();
          
          // ANIMATE BATTLES (Only in Lego Mode)
          if (settings.theme === Theme.LEGO) {
              // Random Spawn
              if(Math.random() < 0.005) spawnBattle();

              // Update Ships
              for (let i = battlesRef.current.length - 1; i >= 0; i--) {
                  const ship = battlesRef.current[i];
                  ship.mesh.position.add(ship.velocity);
                  ship.life--;

                  // Shooting
                  ship.shootTimer++;
                  if(ship.shootTimer > 20 && Math.random() > 0.8) {
                      ship.shootTimer = 0;
                      // Create laser
                      const color = ship.type === 'xwing' ? 0xFF0000 : 0x00FF00;
                      const laserGeo = new THREE.BoxGeometry(2, 0.05, 0.05);
                      const laser = new THREE.Mesh(laserGeo, new THREE.MeshBasicMaterial({color}));
                      laser.position.copy(ship.mesh.position);
                      laser.position.x += 2; // Front of ship
                      laserGroupRef.current.add(laser);
                      
                      // Animate laser locally (simple firewall)
                      const laserV = new THREE.Vector3(1, 0, 0);
                      const animateLaser = () => {
                          laser.position.add(laserV);
                          if(laser.position.x > 100) {
                              laserGroupRef.current.remove(laser);
                          } else {
                              requestAnimationFrame(animateLaser);
                          }
                      };
                      animateLaser();
                  }

                  // Cleanup
                  if(ship.life <= 0) {
                      sceneRef.current?.remove(ship.mesh);
                      battlesRef.current.splice(i, 1);
                  }
              }
          } else {
              // Clear battles if switched away
              if(battlesRef.current.length > 0 && sceneRef.current) {
                  battlesRef.current.forEach(b => sceneRef.current?.remove(b.mesh));
                  battlesRef.current = [];
              }
          }

          if (rendererRef.current && sceneRef.current && cameraRef.current) {
              rendererRef.current.render(sceneRef.current, cameraRef.current);
          }
      };
      animate();
      return () => cancelAnimationFrame(frameId);
  }, [settings.theme]);


  // --- INTERACTION & GAME LOGIC ---

  const clearValidMoves = () => {
    if (validMovesGroupRef.current) validMovesGroupRef.current.clear();
  };

  const highlightValidMoves = (square: string) => {
    clearValidMoves();
    if (!validMovesGroupRef.current) return;

    const moves = game.moves({ square: square as Square, verbose: true });
    const indicatorGeo = new THREE.CircleGeometry(0.3, 32);
    indicatorGeo.rotateX(-Math.PI / 2);

    const isLego = settings.theme === Theme.LEGO;
    // In Lego mode, indicators must be higher to sit on top of the studs (Stud top ~0.15, Plate ~0.0)
    const yOffset = isLego ? 0.2 : 0.02; 

    moves.forEach(move => {
        const pos = getPositionFromSquare(move.to);
        const isCapture = move.captured !== undefined;
        
        const color = isCapture ? 0xff0000 : 0x00ff00;
        const mat = new THREE.MeshBasicMaterial({ 
            color: color, 
            transparent: true, 
            opacity: 0.6, 
            side: THREE.DoubleSide 
        });
        
        const mesh = new THREE.Mesh(indicatorGeo, mat);
        mesh.position.set(pos.x, yOffset, pos.z);
        validMovesGroupRef.current.add(mesh);
    });
  };

  const handleSquareClick = async (square: string) => {
      const targetPiece = game.get(square as any);
      const isFriendly = targetPiece && targetPiece.color === game.turn();

      // 1. If same square selected, unselect
      if (selectedSquareRef.current === square) {
          selectedSquareRef.current = null;
          if (highlightMeshRef.current) highlightMeshRef.current.visible = false;
          clearValidMoves();
          return;
      }

      // 2. If clicking a friendly piece (either new selection or switching selection)
      if (isFriendly) {
          selectedSquareRef.current = square;
          if (highlightMeshRef.current) {
              const pos = getPositionFromSquare(square);
              highlightMeshRef.current.position.x = pos.x;
              highlightMeshRef.current.position.z = pos.z;
              // Fix highlight height for Lego (studs are tall)
              highlightMeshRef.current.position.y = settings.theme === Theme.LEGO ? 0.2 : 0.02;
              highlightMeshRef.current.visible = true;
          }
          highlightValidMoves(square);
          return;
      }

      // 3. If something selected and clicking empty or enemy square -> Try Move
      if (selectedSquareRef.current) {
          const from = selectedSquareRef.current;
          const to = square;

          try {
              // Check strict legality before moving to avoid spamming exceptions
              const move = game.move({ from, to, promotion: 'q' }); 

              if (move) {
                  setGame(new Chess(game.fen()));
                  onTurnChange(game.turn());
                  if (move.captured) onCapture("POW!");
                  updateBoardVisuals(true);
                  
                  selectedSquareRef.current = null;
                  if (highlightMeshRef.current) highlightMeshRef.current.visible = false;
                  clearValidMoves();

                  // AI Logic
                  if (!game.isGameOver() && game.turn() === 'b') {
                       setTimeout(async () => {
                           let aiMove: string | null = null;
                           if (settings.aiType === AIType.GEMINI) {
                               aiMove = await getGeminiMove(game, settings.geminiKey);
                               if (!aiMove) {
                                   console.log("Gemini failed or no key, falling back to Local");
                                   aiMove = getBestMoveLocal(game, settings.difficulty);
                               }
                           } else {
                               aiMove = getBestMoveLocal(game, settings.difficulty);
                           }

                           if (aiMove) {
                               const result = game.move(aiMove);
                               if(result && result.captured) onCapture("CLASH!");
                               setGame(new Chess(game.fen()));
                               onTurnChange(game.turn());
                               updateBoardVisuals(true);
                           }
                       }, 500);
                  }
              }
          } catch (e) {
              selectedSquareRef.current = null;
              if (highlightMeshRef.current) highlightMeshRef.current.visible = false;
              clearValidMoves();
          }
      }
  };

  useEffect(() => {
      const canvas = rendererRef.current?.domElement;
      if (!canvas) return;

      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      const onClick = (event: MouseEvent) => {
          const rect = canvas.getBoundingClientRect();
          mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

          if (cameraRef.current && sceneRef.current) {
              raycaster.setFromCamera(mouse, cameraRef.current);
              // Intersect recursively
              const intersects = raycaster.intersectObjects(sceneRef.current.children, true);
              
              if (intersects.length > 0) {
                   // Find first object with square data
                   const hit = intersects.find(i => i.object.userData.square);
                   if (hit) {
                       handleSquareClick(hit.object.userData.square);
                   }
              }
          }
      };

      canvas.addEventListener('click', onClick);
      return () => canvas.removeEventListener('click', onClick);
  }, [game, settings]);

  return <div ref={mountRef} className="absolute inset-0 z-0" />;
};

export default ThreeScene;
