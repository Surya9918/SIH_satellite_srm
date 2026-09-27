# TerraSR 3D Models Directory

This directory hosts custom 3D models created in **Blender** (or any 3D modeling suite) and exported as binary **GLB** (`.glb`).

---

## 1. Custom Satellite Model (`satellite.glb`)

To replace the default procedural Three.js satellite with your custom Blender satellite:

1. **Export from Blender**:
   - File format: **glTF 2.0 (`.glb`)** (Binary format).
   - Origin: Centered at `(0, 0, 0)`.
   - Scale: Standard size (roughly `1.0` unit total wingspan in Blender). The component automatically scales it to fit realistic orbital proportions.
   - Forward orientation: Model pointing toward `-Z` or `+Y` (nadir-facing optical payload).
   - Textures: Embedded PBR textures (Principled BSDF).

2. **File Location**:
   Save to:
   ```
   satellite-srm-frontend/public/models/satellite.glb
   ```

3. **Hot-Swap Loading**:
   - `SatelliteModel.tsx` automatically detects `public/models/satellite.glb`.
   - When present, the orbital physics and nadir-pointing attitude logic will automatically animate your custom Blender satellite!
   - If missing, it smoothly falls back to the built-in procedural Three.js satellite spacecraft.

---

## 2. Custom Earth Model (`earth.glb`)

To replace the default procedural Three.js Earth with your custom Blender Earth:

1. **Export from Blender**:
   - Format: **glTF 2.0 (`.glb`)**.
   - Origin: Centered at `(0, 0, 0)`.
   - Radius: Roughly `1.0` unit sphere.
   - Textures: Packed PBR textures.

2. **File Location**:
   Save to:
   ```
   satellite-srm-frontend/public/models/earth.glb
   ```

3. **Hot-Swap Loading**:
   - `EarthModel.tsx` automatically detects and renders `earth.glb`.
