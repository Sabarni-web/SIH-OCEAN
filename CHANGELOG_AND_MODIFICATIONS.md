# 🌊 OceanVista — Recent Modifications & Architecture Guide

This document explains in simple, clear language all the new features added, approaches changed, and files modified in the project. It is written so that anyone (a developer, evaluator, or AI agent) can easily understand what was built and why.

---

## 📌 1. Summary of What Was Built

We built a complete **Historical Temporal Replay Simulation System** for the Indian Ocean digital twin:

1. **Past-to-Present Time Scrubbing**: Users can pick a date filter (like **7 Days**, **30 Days**, or a **Custom Range**), click **`⏪ Replay`**, and watch the ocean animate through real historical days.
2. **100% Real Scientific Data**:
   - **Ocean Currents (3D Arrows)**: Driven by Copernicus / Open-Meteo satellite-derived velocity vectors ($u, v$).
   - **Particle Flow Streamlines**: Particles glide along the actual measured ocean velocity field.
   - **Sea Surface Temperature (SST)**: The 3D ocean surface reflects real satellite temperatures in Celsius ($^\circ\text{C}$).
   - **Robotic Instruments (Argo Floats & Gliders)**: Robots move to where they actually were on that specific historical date, leaving glowing trajectory trails behind them.
3. **High-Resolution Satellite Basemap**: Added an Esri World Imagery satellite layer toggle to the 2D GIS radar.

---

## 🔄 2. What Approaches Were Modified & Why

### ❌ Old Approach 1: Mathematical Approximation of Ocean Temperatures
- **What it was**: The ocean surface was colored using a mathematical sine/cosine formula (`Math.sin(...) * Math.cos(...)`).
- **Why it was changed**: It looked like water ripples, but the temperature numbers were fake and didn't change with real dates.
- **New Approach**: We now fetch genuine **Sea Surface Temperature (`sea_surface_temperature`)** from the Copernicus/Open-Meteo Marine API across 37 Indian Ocean stations. An **Inverse Distance Weighting (IDW)** algorithm creates smooth, real-world temperature gradients across the entire 3D mesh.

---

### ❌ Old Approach 2: Calling the Server on Every Single Animation Frame
- **What the problem was**: If the simulation made a network request to the server every second during playback, network lag would freeze or stutter the animation, and 30-day replays would send hundreds of server requests.
- **New Approach (Pre-Fetch Once $\rightarrow$ Play from RAM)**:
  - When the user clicks **`⏪ Replay`**, the client makes **ONE single API request** (`/api/currents/timeline`).
  - The server gathers all frames for that entire date range in parallel and sends them back in a single compressed JSON package (~100–250 KB).
  - The client stores these frames in browser memory (RAM).
  - **Zero network requests happen during playback**, resulting in silky-smooth 60fps playback and scrubbing.

---

### ❌ Old Approach 3: Drifting Argo Floats from Today's Positions
- **What it was**: Floats were loaded from their current positions and artificially drifted backwards/forwards.
- **Why it was changed**: Floats weren't showing their real past locations.
- **New Approach (Snapshot-Driven Instrumentation)**:
  - We query the **INCOIS ERDDAP database** for actual recorded historical dive cycles ($c_1, c_2, c_3 \dots$).
  - For each replay frame, we create an **`InstrumentSnapshot`** containing the real latitude, longitude, depth, temperature, and salinity of every float at that hour.
  - As time plays, floats glide along their true recorded paths, drawing glowing gold trajectory lines.

---

### ❌ Old Approach 4: Fixed Step vs. Adaptive Temporal Sampling
- **What the problem was**: If someone selected a 1-year or 5-year date range, fetching hourly frames would return 40,000+ data points and crash the browser.
- **New Approach (Adaptive Sampling)**:
  - **1 to 3 Days**: Samples every **3 hours** (~24 frames)
  - **4 to 7 Days**: Samples every **6 hours** (~32 frames)
  - **8 to 30 Days**: Samples every **12 hours** (~60 frames)
  - **1 to 3 Months**: Samples **daily** (~90 frames)
  - **Up to 1 Year**: Samples **weekly** (~52 frames)
  - **Multi-Year**: Samples **monthly** (capped at 360 frames max)
  - *Result*: Superfast loading for any date range from 2 days to 5 years.

---

### ❌ Old Approach 5: Hidden Layers on Replay
- **What the problem was**: When replay started, if the 3D Vector Grid and Particle Flow toggles on the left toolbar were turned OFF, the user saw no moving arrows or particles.
- **New Approach**: Clicking **`⏪ Replay`** now **automatically activates** the 3D Vector Grid and Particle Flow layers so the visualizer starts moving immediately.

---

### ❌ Old Approach 6: Linear Glider Scrubbing
- **What it was**: Underwater gliders were positioned using a simple percentage slider (`progress * length`).
- **New Approach**: Gliders now look up their track waypoints by matching the actual **recorded timestamps** of each survey dive.

---

## 📦 3. What New Things Were Included

### 1. New Backend Timeline Route & Controller
- **`server/src/controllers/timeline.controller.ts`** *(NEW)*:
  - Handles `GET /api/currents/timeline?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`.
  - Validates query dates and invokes the timeline service.
- **`server/src/services/timeline-instruments.service.ts`** *(NEW)*:
  - Fetches historical Argo float observations from INCOIS ERDDAP.
  - Builds time-synchronized `InstrumentSnapshot[]` objects for each frame.
  - Filters active underwater gliders, CTD research vessels, and BGC floats based on deployment time windows.
- **`server/src/routes/currents.routes.ts`**:
  - Mounted `/timeline` endpoint before the root `/` route.

### 2. New Client State & Replay Scrubber
- **`client/src/store/useReplayStore.ts`** *(NEW)*:
  - Dedicated Zustand store managing replay state (`replayMode`, `replayFrames`, `instrumentSnapshots`, `currentFrameIndex`, `replaySpeed`, `isReplayPlaying`).
  - Contains actions for `startReplay`, `stopReplay`, `setFrameIndex`, `setReplaySpeed`, and `advanceFrame`.
- **`client/src/components/ReplayTimeline.tsx`** *(NEW)*:
  - Glassmorphic floating control bar at the bottom of the 3D viewport.
  - Features **Play/Pause**, **1x/2x/4x speed toggles**, **Step Forward/Backward**, **Interactive Slider Track**, **Active Frame Timestamp**, and **Live Active Sensor Counter**.

### 3. Satellite Imagery Toggle for 2D GIS Radar
- **`client/src/components/panels/OceanMap.tsx`**:
  - Added a toggle between **Dark Map** (CARTO Dark Matter) and **Satellite Map** (Esri World Imagery with boundary overlays).
  - Synchronized mini-map markers with historical instrument snapshots during replay.

### 4. 3D Visualizer Reactivity Upgrades
- **`client/src/three/VectorFieldRenderer.tsx`**:
  - Connected arrows to `activeFrame.vectors`, updating arrow angle, speed, and length on every frame step.
- **`client/src/three/ParticleFlowRenderer.tsx`**:
  - Connected particle advection to `activeFrame.vectors`, dynamically curving particle streamlines along the historical velocity field.
- **`client/src/three/OceanWorld.tsx`**:
  - Implemented the `interpolateSST()` IDW spatial interpolator for real satellite surface temperature rendering.
- **`client/src/three/ObservationSystem.tsx`**:
  - Rendered Argo floats using historical ERDDAP snapshots and added glowing dashed trajectory lines behind moving floats.

---

## 🗂️ 4. File-by-File Summary of Changes

### Shared Types (`shared/types/`)
- **`shared/types/index.ts`**:
  - Added `SSTGridPoint` interface (`latitude`, `longitude`, `temperature`).
  - Added `InstrumentSnapshot` interface (`timestamp`, `argos`, `activeGliderIndices`, `activeCTDIds`, `activeBGCIds`).
  - Updated `TimelineFrame` to include `sst?: SSTGridPoint[]`.
  - Updated `TimelineResponse` to include `instrumentSnapshots?: InstrumentSnapshot[]`.

### Server Files (`server/src/`)
- **`server/src/services/currents.service.ts`**:
  - Added `fetchTimelineCurrents()` function.
  - Added `sea_surface_temperature` to Open-Meteo URL query.
  - Ran Open-Meteo marine query and INCOIS ERDDAP query in parallel via `Promise.all()`.
  - Added 15-minute caching for timeline responses.
- **`server/src/services/incois.service.ts`**:
  - Exported `fetchJson` helper and instrument arrays (`INCOIS_MOORED_BUOYS`, `INCOIS_GLIDERS`, `INCOIS_CTD_STATIONS`, `INCOIS_BGC_FLOATS`).
- **`server/src/services/timeline-instruments.service.ts`** *(NEW)*:
  - Created historical Argo position extractor and snapshot builder.
- **`server/src/controllers/timeline.controller.ts`** *(NEW)*:
  - Created Express controller for `/api/currents/timeline`.
- **`server/src/routes/currents.routes.ts`**:
  - Mounted `router.get('/timeline', getTimelineCurrents)`.

### Client Files (`client/src/`)
- **`client/src/services/api.ts`**:
  - Added `currentsService.getTimeline(startDate, endDate)`.
- **`client/src/store/useReplayStore.ts`** *(NEW)*:
  - Created replay store with frame memory cache and animation loop triggers.
- **`client/src/components/ReplayTimeline.tsx`** *(NEW)*:
  - Created bottom scrubber bar with speed controls, frame tracker, and live sensor counter.
- **`client/src/components/GlobalOceanControls.tsx`**:
  - Added glowing **`⏪ Replay`** button (visible when non-live date preset is chosen).
  - Linked UTC clock badge to active replay frame timestamp.
- **`client/src/components/OceanViewport.tsx`**:
  - Mounted `<ReplayTimeline />` inside the 3D viewport overlay container.
- **`client/src/three/VectorFieldRenderer.tsx`**:
  - Added replay mode vectors to `useMemo` dependency array for reactive frame updates.
- **`client/src/three/ParticleFlowRenderer.tsx`**:
  - Linked particle velocity grid to active replay frame vectors.
- **`client/src/three/OceanWorld.tsx`**:
  - Added `interpolateSST()` IDW spatial interpolation to render real satellite SST on the 3D mesh.
- **`client/src/three/ObservationSystem.tsx`**:
  - Rendered floats from snapshot data and added glowing trajectory trail lines.
- **`client/src/components/panels/OceanMap.tsx`**:
  - Added Satellite Imagery tile layer and synced 2D markers with replay snapshots.

---

## 🚀 5. How to Test Everything

1. **Start the Application** (if not already running):
   - Server: `cd server && npm run dev` (Port 5000)
   - Client: `cd client && npm run dev` (Port 5173)
2. **Open the App in your Browser**:
   - Go to `http://localhost:5173`.
3. **Test Historical Replay**:
   - Click **`7 Days`** or **`30 Days`** in the top control bar.
   - Click the glowing **`⏪ Replay`** button.
   - Watch the 3D ocean arrows rotate, particles re-advect, and floats drift along their real historical paths.
   - Select **`Temperature`** in the top bar to see the satellite SST heat map shift across days.
   - Use the bottom scrubber slider to drag forward and backward through time.
4. **Test Satellite View**:
   - In the **Live GIS Radar** panel (bottom-right), click the **Satellite** icon button to see real orbital satellite photography of the Indian Ocean with sensor pins overlaid.
