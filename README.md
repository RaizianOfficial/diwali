# 🪔 3D WebGL Diwali Mela Experience

An interactive 3D WebGL Diwali Mela experience built with **React**, **React Three Fiber (R3F)**, **Drei**, **Tailwind CSS**, **Firebase Firestore**, and **Razorpay**.

---

## ✨ Features

1. **Atmospheric Low-Poly Night Environment**:
   - Dark celestial night sky with twinkling stars and depth fog.
   - Warm flickering **PointLights** and **SpotLights** simulating earthen diyas and hanging fairy light garlands.
   - Realistic directional moonlight casting crisp dynamic shadows.
   - Village square surrounded by traditional Indian houses with open courtyards (**"dura"** / **"aangan"**), verandahs, and rangoli art.
   - Modular placeholders for an Indian swing (**jhula**), festive **NPCs** in traditional attire, and resting **street dogs** — designed for easy drop-in replacement with standard `.gltf` / `.glb` models via `useGLTF`.

2. **Third-Person Character Controller & Camera**:
   - Responsive character movement via `W`, `A`, `S`, `D` or Arrow Keys.
   - `Shift` key to sprint.
   - Smooth 3rd-person spring camera follow with directional look-ahead.
   - Walking bob animation and smooth yaw rotation towards the travel direction.
   - Constrained within an invisible bounding box (`[-26, 26]` units).

3. **Firecracker Mechanics & Optimized Particle System**:
   - Responsive Tailwind CSS bottom-bar inventory UI with 4 distinct firecrackers:
     - 🌟 **Phuljhadi (Sparkler)**: High-speed spherical needle sparks and crackles.
     - 🌋 **Anaar (Flowerpot)**: Roaring vertical fountain of golden embers raining down.
     - 🌀 **Chakri (Ground Spinner)**: Fast-spinning vortex disc spitting horizontal sparks.
     - 🚀 **Rocket**: Launch whistle, high vertical ascent, and apex multi-color spherical burst.
   - **Click-to-place**: Raycasted intersection points directly on the 3D ground.
   - **Interactive Ignition**: Approaching within 3.2m displays a prompt; pressing **[E]** (or tapping the HUD button) sparks the fuse.
   - **Performance-optimized VFX**: Instanced particles strictly bounded below 500 instances (`<instancedMesh>`) with dynamic PointLight bloom.
   - **Web Audio API**: Procedural sound synthesis for sizzles, roars, whirs, whistles, and booms without broken audio URLs.

4. **3D Contribution Billboard (Dynamic Leaderboard)**:
   - Central 3D plane billboard with royal gold and brass ornamentation.
   - **Dynamic 2D HTML Canvas Texture**: Procedurally renders high-DPI leaderboard table (Rank badges, Devotee Names, Amounts in `₹`, and festive blessings).
   - **Firebase Firestore Integration**: Subscribes to the `"contributors"` collection ordered by `amount` descending (Top 10) on mount and auto-updates the texture.
   - **Proximity Detection**: Approaching within 5 units triggers the Razorpay Contribution Modal.
   - **Razorpay Checkout**: Seamless payment modal placeholder that triggers the Razorpay checkout script with instant confetti celebration and billboard updates.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 3. Production Build
```bash
npm run build
```

---

## ⚙️ Configuration (.env)

Create a `.env` file from `.env.example`:
```env
# Firebase Firestore
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Razorpay Payments
VITE_RAZORPAY_KEY_ID=rzp_test_your_razorpay_key_id
```

> **Note**: Even without `.env` credentials, the application starts immediately with simulated real-time Firestore mock data and test checkout workflows!

---

## 🎨 Swapping Placeholders for 3D GLTF / GLB Models

All props in `src/components/Props.jsx` and `src/components/Player.jsx` are cleanly structured for Drei's `useGLTF`:

```jsx
import { useGLTF } from '@react-three/drei';

export function VillageHouse({ position, rotation, scale }) {
  const { scene } = useGLTF('/models/village_house.glb');
  return <primitive object={scene.clone()} position={position} rotation={rotation} scale={scale} />;
}
```

Preload your models in Vite for instant rendering:
```jsx
useGLTF.preload('/models/village_house.glb');
```

---

## 📁 Project Structure

```
├── index.html                   # HTML entry point, fonts, Razorpay SDK
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx                 # React root mount
    ├── App.jsx                  # Main 3D Canvas, state, and interaction loop
    ├── index.css                # Tailwind directives and custom glowing styles
    ├── firebase.js              # Firestore Top 10 query & realtime subscriber
    ├── components/
    │   ├── Scene.jsx            # Sky, lighting, ground raycast, village layout
    │   ├── Player.jsx           # 3rd-person controller, camera follow, bounds
    │   ├── Billboard.jsx        # 3D plane billboard with 2D CanvasTexture
    │   ├── Firecracker.jsx      # Instanced spark VFX, fuse logic, bloom light
    │   ├── Props.jsx            # Houses, Dura courtyards, Jhula, NPCs, Dogs, Diyas
    │   └── UI.jsx               # Festive bottom bar, 'E' prompt, Razorpay modal
    └── utils/
        └── SoundManager.js      # Web Audio API procedural firecracker synthesizer
```
