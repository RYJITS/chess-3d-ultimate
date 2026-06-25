
# Changelog

All notable changes to this project will be documented in this file.

## [1.9.7] - iPhone Optimization & Lego FX

### Visual Fixes (Mobile)
- **iPhone Black Screen**: Implemented strict User-Agent detection for iPhone/Android.
  - Forced `pixelRatio` to 1.0 (overriding default Retina 3.0) to prevent WebGL crashes on high-density screens.
  - Downgraded Shadow Map type to `BasicShadowMap` and resolution to 512x512 on mobile devices to drastically reduce VRAM usage.

### Lego Theme Updates
- **Luke Skywalker (White King)**: Changed outfit color from Black Jedi Robes to **Cream/White Tunic** to better distinguish from the Black pieces.
- **Lightsaber Positioning**: Moved lightsaber hilts and blades forward along the Z-axis (`0.4 - 0.95`). They are now held in front of the chest rather than at the side/hip.

### Animations
- **Death Star Superlaser**: Implemented a dynamic capture animation for the Lego Theme.
  - When a piece is captured, the background Death Star fires a massive green laser beam directly at the captured square.
  - The beam is calculated using 3D vector math to connect the distant moon to the specific board tile.
  - This effect respects the global "Show Animations" toggle.

## [1.9.6] - Lego Environment Update

### Features
- **Space Environment**:
  - **Starfield**: Added a procedural background of 2000 randomly distributed stars when Lego Mode is active, simulating deep space.
  - **Death Star**: Implemented a massive procedural Death Star in the background, featuring a grey hull, equatorial trench, and superlaser dish.
- **Animations**:
  - **Space Combat**: Added random "dogfight" events in the background.
  - **Procedural Ships**: X-Wings (Rebels) and TIE Fighters (Empire) spawn and fly across the skybox.
  - **Lasers**: Ships exchange fire (Red vs Green beams) as they traverse the scene.

## [1.9.5] - Lego Character Update

### Visual Updates
- **Black Pawn Replacement**: Replaced the Stormtrooper minifigure with an **Imperial Astromech Droid** (Black R2 Unit).
  - Matches the style of the White Pawn (R2-D2) but features a Black body and Dark Grey dome to maintain visual consistency within the robotic pawn theme.
  - Uses shared `buildAstromech` geometry logic for identical construction.

## [1.9.4] - Lego Construction Update

### Visual Overhaul
- **Realistic Minifigure Anatomy**: Completely rebuilt the Lego character engine to simulate real multi-part construction.
  - **Hands**: Replaced cylinders with accurate C-Clamp shapes using `TorusGeometry`.
  - **Torso**: Upgraded to a trapezoidal prism (4-sided cylinder) to match iconic minifig geometry, including a neck stud.
  - **Arms**: Now articulated with distinct Shoulder spheres, Angled Arm tubes, and Wrist connections.
  - **Legs**: Separated into distinct Left/Right pieces with rounded hip joints connecting to a central Hip piece.
- **Character Detail**:
  - **R2-D2**: Constructed from stacked "Round Plates" (Cylinders) and leg struts.
  - **Vader**: Composite Helmet with distinct dome and flared brim.
  - **Maul**: Added a "Crown of Studs" to represent horns.
  - **Lightsabers**: Now feature distinct hilts and blades.

## [1.9.3] - Lego Theme Refinement

### Visual Updates
- **Scaled Up Minifigures**: Increased the size of all Lego Star Wars pieces by approx 30% (Scale 0.65 -> 0.85) to maximize board presence.
- **Stud Alignment**: Adjusted the vertical position of Lego pieces (`y=0.15`) to ensure they stand perfectly on top of the baseplate studs instead of intersecting them.

## [1.9.2] - Visual Fix (Lego Mode)

### Bug Fixes
- **Visual Occlusion**: Fixed an issue where the selection highlight and valid move indicators were not visible in Lego mode.
  - **Cause**: The indicators were rendering at `y=0.02`, which is below the surface of the Lego studs (`y~0.15`).
  - **Fix**: Implemented dynamic Y-axis offsets. Indicators now render at `y=0.20` when Lego theme is active, ensuring they float clearly above the studs, while remaining at `y=0.02` for flat board themes.

## [1.9.1] - Critical Bug Fix

### Bug Fixes
- **Selection Logic**: Fixed a critical issue where clicking on pieces (especially in Lego and High-Def Classic themes) would not register the selection. This was caused by the Raycaster hitting the complex piece geometry which lacked the necessary coordinate data.
  - **Solution**: Explicitly propagated `userData.square` to the main Piece Group and recursively to all child meshes of every piece.
  - **Lego Board**: Ensured that the 4 studs on every Lego board tile also carry the coordinate data, ensuring that clicks on the "bumps" of the board are correctly detected.

## [1.9.0] - Lego Star Wars Theme Overhaul

### Features
- **Interactive Lego Board**: 
  - Replaced flat squares with studded "Baseplate" geometry when the Lego theme is active.
  - Each tile features 4 procedural studs (2x2 grid) for authentic plastic brick aesthetics.
  - Implemented high-specularity plastic material properties.
- **Procedural Minifigures (Star Wars)**:
  - **Rebels (White)**:
    - **Pawn**: R2-D2 (Cylinder/Dome, Blue eye).
    - **Rook**: Chewbacca (Brown, Bandolier).
    - **Knight**: Yoda (Small scale, Green ears, Green Lightsaber).
    - **Bishop**: C-3PO (Gold Metallic).
    - **Queen**: Princess Leia (White robes, Hair buns).
    - **King**: Luke Skywalker (Black Jedi robes, Green Lightsaber).
  - **Empire (Black)**:
    - **Pawn**: Stormtrooper (White Armor/Black suit, Helmet).
    - **Rook**: Royal Guard (Red robes, Elongated helmet).
    - **Knight**: Darth Maul (Horns, Red Double-Saber).
    - **Bishop**: Imperial Officer (Grey uniform, Cap).
    - **Queen**: The Emperor (Hooded, Pale face).
    - **King**: Darth Vader (Black Armor, Helmet Brim, Red Lightsaber).

## [1.8.0] - Classic Theme Finalization (STABLE)

### Status
- **THEME LOCKED**: The "Classic Wood" theme is now considered feature-complete and visually finalized. Future updates should preserve these exact specifications unless a redesign is explicitly requested.

### Final Specifications (Classic)
- **Palette**: 
  - White Pieces: Natural Boxwood (`0xf0d096`).
  - Black Pieces: Ebonized Wood (`0x151515`).
  - Board: Light Maple (`0xeaddcf`) & Dark Matte Grey (`0x4d4d4d`) tiles.
  - Surround: Pure Black Border (`0x0a0a0a`) with height `0.4`.
- **Geometry (High-Poly 64 Segments)**:
  - **Pawn**: Slender body, spherical head, tapered collar.
  - **Rook**: Height `1.25` (matches Pawn), stout body, central decorative ring, defined turret flare.
  - **Knight**: Wide pedestal base, extrusion depth `0.20`, high-definition "muscular" horse silhouette.
  - **Bishop**: Tapered elegant stem, distinct collar rim (`1.15` height), bulbous "teardrop" mitre, finial ball on top.
  - **Queen**: Voluptuous stem with ridges, composite **Coronet Crown** (9 angled spikes + central cap).
  - **King**: Massive base (`0.48` radius), multi-tiered stem rings, **Maltese Cross** finial (`BoxGeometry` composition).

## [1.7.0] - Bishop Refinement

### Features
- **Classic Bishop Upgrade**: 
  - Updated the Bishop's procedural geometry to better reflect traditional Staunton design.
  - Defined a more elegant, tapered stem.
  - Added a distinct "Collar" rim below the mitre.
  - Reshaped the Mitre to a bulbous egg-like silhouette.
  - Topped with a dedicated procedural "Finial Ball".

## [1.6.0] - Major Piece Overhaul

### Features
- **Thicker Proportions**: Significantly widened the base and body profiles for all major pieces (Rook, Knight, Bishop, Queen, King) to give them a heavier, more robust look ("Plus Grasse").
- **Sculptural Details**: Added decorative rings, collars, and grooves to the stems and bodies of the major pieces to mimic hand-turned wood sculpture.
- **Knight Upgrade**: Increased the width of the Knight's pedestal and the extrusion thickness of the horse head.

## [1.5.0] - Geometry Refinement

### Features
- **Piece Proportions**:
  - **Rook**: Lowered vertical profile to match the Pawn height (~1.25 units), giving it a stouter, more fortified appearance consistent with Staunton aesthetics.
- **Detailed Assets**:
  - **Queen**: Added a procedural **Coronet Crown**. Replaced simple lathe top with a composite group featuring a ring of 9 angular spikes and a central cap, giving the Queen a distinct and regal silhouette.

## [1.4.0] - Visual Upgrade

### Features
- **High-Definition Staunton Pieces**:
  - Completely rewrote procedural generation using Bezier-like curve approximation for piece profiles.
  - Increased geometry polygon count (64 segments) for smooth, museum-quality curvature.
  - Detailed refinements:
    - **Pawn**: Added spherical head and tapered collar.
    - **Rook**: Defined turret flare and deep body curve.
    - **Bishop**: Created distinct "Teardrop" mitre shape.
    - **Queen**: Added multi-tiered stem and coronet.
    - **King**: Tallest profile with "Maltese Cross" finial.
    - **Knight**: Sculpted a more organic, muscular horse silhouette with arched neck and mane.

## [1.3.0] - Visual Update

### Features
- **Classic Theme Visual Fidelity**:
  - Updated color palette to match high-contrast reference image (Cream/Charcoal squares, Boxwood/Ebony pieces).
  - Added a procedural Board Border (Black) to surround the playing area.
  - Adjusted material roughness for a more realistic contrast between matte board and semi-gloss pieces.

## [1.2.0] - Enhancement

### Features
- **Classic Theme Overhaul**:
  - Replaced generic cylinder pieces with high-fidelity, procedurally generated Staunton chess pieces.
  - Implemented `LatheGeometry` with custom profiles for Pawn, Rook, Bishop, Queen, and King.
  - Created a composite Knight piece using `ExtrudeGeometry` for a realistic horse silhouette.
  - Added Cross finials to Kings.
  - Tuned material properties for realistic Wood/Varnish aesthetic.

### Bug Fixes
- **Input Handling**: Fixed an issue where clicking an invalid target would log a noisy "Invalid move" error. Logic now pre-validates friendly fire before attempting moves.

## [1.1.0] - Enhancement

### Features
- **Move Assistance**:
  - Added visual indicators for valid moves when a piece is selected.
  - Green dots indicate legal move destinations.
  - Red dots indicate capture targets.
  - System automatically clears indicators when deselecting or moving a piece.

## [1.0.0] - Initial Release

### Features
- **3D Rendering Engine**: 
  - Implemented a full 3D scene using Three.js.
  - Added high-quality lighting (Ambient, Directional with Shadows, Blue Rim Light).
  - Configured Post-processing (ACESFilmicToneMapping, SRGBColorSpace).
- **Procedural Assets**:
  - Created a procedural geometry factory to generate assets without external files.
  - **Theme A (Classic)**: Uses `LatheGeometry` for wood-turned style pieces.
  - **Theme B (Lego)**: Constructed composite meshes (Legs, Torso, Head) to mimic minifigures.
  - **Theme C (Disney)**: Abstract geometric composition (Spheres, Cones) for character representation.
- **Game Logic**:
  - Integrated `chess.js` for move validation and game state management (Check, Checkmate, Draw).
  - Implemented Raycaster for piece selection and movement interaction.
- **Artificial Intelligence**:
  - **Local**: Minimax algorithm with Alpha-Beta pruning and Piece-Square Tables (PST) for positional evaluation.
  - **Cloud**: Integration with Google Gemini API for LLM-driven gameplay.
- **User Interface**:
  - Built a Glassmorphism HUD using Tailwind CSS.
  - Added settings for Theme, Difficulty, and AI Provider.
  - Implemented visual combat feedback ("POW!", "CLASH!").

### Technical
- Setup single-file React architecture using ES6 modules.
- Configured Tailwind CSS via CDN.
- Established clean separation of concerns: `ThreeScene` (View), `aiService` (Logic), `App` (Controller).
