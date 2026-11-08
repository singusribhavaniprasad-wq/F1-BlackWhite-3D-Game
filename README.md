# F1 Grand Prix — Monochrome 3D

A browser-based, black-and-white 3D arcade racing prototype built with Three.js and Vite. It includes a closed circuit with multiple bends, a chase camera and cockpit-style camera, nine AI opponents, steering/throttle/braking, track-edge and car-to-car collision handling, damage, position, a timer and a five-lap finish.

> This is an original 3D arcade prototype, not an officially licensed Formula 1 title or a professional-grade vehicle simulator. The car handling is game physics tuned for playability.

## Requirements

- Windows 10/11, macOS or Linux
- Node.js 20.19+ or 22.12+ (recommended current LTS)
- VS Code
- Internet connection for installing dependencies and deploying. The game is hosted online and uses Three.js from the installed package. A Google Fonts connection is optional; system fallback fonts are provided.

## Run in VS Code

1. Extract the ZIP file.
2. Open the extracted `f1-blackwhite-3d` folder in VS Code.
3. Open **Terminal → New Terminal**.
4. Check Node and npm:
   ```powershell
   node -v
   npm -v
   ```
5. Install packages:
   ```powershell
   npm install
   ```
6. Start the local development server:
   ```powershell
   npm run dev
   ```
7. Open the URL printed by Vite (normally `http://localhost:5173`).

## Controls

| Action | Keyboard |
|---|---|
| Accelerate | W or ↑ |
| Brake | S or ↓ |
| Steer | A / ← and D / → |
| Switch camera | C |
| Pause / resume | Esc or on-screen button |

On touch devices, use the on-screen steering and pedal buttons.

## Build and test production output

```powershell
npm run build
npm run preview
```

Vite creates the deployable site in the `dist` folder.

## Deploy to Vercel

### Option A — Vercel dashboard

1. Create a GitHub repository and push this project.
2. Sign in at https://vercel.com/ and choose **Add New → Project**.
3. Import the GitHub repository.
4. Set **Framework Preset** to `Vite`.
5. Set **Root Directory** to `./` (the folder containing `package.json`).
6. Build command: `npm run build`.
7. Output directory: `dist`.
8. Select **Deploy**. Vercel will provide a public URL.

### Option B — Vercel CLI

```powershell
npm install -g vercel
vercel
```

Follow the prompts. For production deployment:

```powershell
vercel --prod
```

## Notes

- No backend or database is required for this single-player browser game.
- An internet connection is needed to install packages and access the deployed Vercel URL. After the page and assets are loaded, the game logic itself runs in the browser.
- This prototype uses procedural 3D geometry, so it does not download third-party car or track models.
- For a more advanced simulator, the next development phase would add a dedicated rigid-body physics engine, tyre grip curves, gear shifting, racing-line AI, audio, particle effects and detailed imported car/track models.
