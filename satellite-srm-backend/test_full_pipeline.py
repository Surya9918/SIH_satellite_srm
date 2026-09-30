"""
Full end-to-end pipeline test with synthetic uint16 Sentinel-2 data.
Creates 4 synthetic band files, stacks them, runs the full pipeline,
and verifies all outputs.
"""
import os, sys, time, json
import numpy as np

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "core_engine", "satellite-srm", "src"))

# Create synthetic uint16 Sentinel-2 bands (64x64, typical DN range 0-3000)
from pathlib import Path
import rasterio
from rasterio.transform import from_origin
from rasterio.crs import CRS

test_dir = Path(__file__).parent / "data" / "test_synthetic"
test_dir.mkdir(parents=True, exist_ok=True)

H, W = 32, 32  # Small for speed
crs = CRS.from_epsg(32644)
transform = from_origin(500000.0, 2000000.0, 10.0, 10.0)  # 10m GSD

np.random.seed(42)
band_paths = {}
for i, band in enumerate(["b02", "b03", "b04", "b08"]):
    data = np.random.randint(200, 3000, (1, H, W), dtype=np.uint16)
    path = str(test_dir / f"synthetic_{band}.tif")
    with rasterio.open(path, "w", driver="GTiff", height=H, width=W,
                       count=1, dtype="uint16", crs=crs, transform=transform) as dst:
        dst.write(data)
    band_paths[band] = path
    print(f"  Created {band}: dtype=uint16, shape=(1,{H},{W}), range=[{data.min()}, {data.max()}]")

# Stack bands
from server import stack_four_bands
stacked_path = str(test_dir / "stacked_4band.tif")
stack_four_bands(band_paths, stacked_path)

# Verify stacked file
with rasterio.open(stacked_path) as src:
    stacked_data = src.read()
    print(f"\nStacked file verification:")
    print(f"  Shape: {stacked_data.shape}")
    print(f"  Dtype: {stacked_data.dtype}")
    print(f"  Range: [{stacked_data.min()}, {stacked_data.max()}]")
    print(f"  CRS: {src.crs}")
    print(f"  Transform: {src.transform}")

# Run full pipeline
print("\n" + "="*60)
print("RUNNING FULL PIPELINE")
print("="*60)

from server import generate_product_for_raster, OUTPUT_DIR
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

t0 = time.time()
result = generate_product_for_raster(stacked_path, "FULLTEST-001", "SwinIR-SRM", 3.0)
elapsed = time.time() - t0

if result is None:
    print("\n[FAIL] Pipeline returned None")
    sys.exit(1)

print(f"\n{'='*60}")
print(f"PIPELINE COMPLETED in {elapsed:.1f}s")
print(f"{'='*60}")
print(f"  SR GeoTIFF: {result['sr_tif_name']}")
print(f"  Uncertainty TIFF: {result['uncertainty_tif_name']}")
print(f"  Output dimensions: {result['width']} x {result['height']}")
print(f"  Expected: {W*3} x {H*3}")

# Verify SR output
sr_path = str(OUTPUT_DIR / result['sr_tif_name'])
if os.path.exists(sr_path):
    with rasterio.open(sr_path) as src:
        sr_data = src.read()
        print(f"\nSR Output verification:")
        print(f"  Shape: {sr_data.shape}")
        print(f"  Expected: (4, {H*3}, {W*3})")
        print(f"  Dtype: {sr_data.dtype}")
        print(f"  Range: [{sr_data.min():.6f}, {sr_data.max():.6f}]")
        print(f"  Mean: {sr_data.mean():.6f}")
        print(f"  Has NaN: {np.any(np.isnan(sr_data))}")
        print(f"  Has Inf: {np.any(np.isinf(sr_data))}")
        print(f"  CRS: {src.crs}")
        gsd = abs(src.transform.a)
        print(f"  Output GSD: {gsd:.4f}m")
        print(f"  Expected GSD: ~3.33m")
        
        shape_ok = sr_data.shape == (4, H*3, W*3)
        print(f"\n  3x upscale check: {'PASS' if shape_ok else 'FAIL'}")
else:
    print(f"  [FAIL] SR output file not found: {sr_path}")

# Verify uncertainty output
unc_path = str(OUTPUT_DIR / result['uncertainty_tif_name'])
if os.path.exists(unc_path):
    with rasterio.open(unc_path) as src:
        unc_data = src.read()
        print(f"\nUncertainty output:")
        print(f"  Shape: {unc_data.shape}")
        print(f"  Mean: {unc_data.mean():.6f}")
        print(f"  Min: {unc_data.min():.6f}")
        print(f"  Max: {unc_data.max():.6f}")

# Verify previews exist
for key in ['sr_png_name', 'lr_png_name', 'uncertainty_png_name', 'ndvi_png_name',
            'b02_png_name', 'b03_png_name', 'b04_png_name', 'b08_png_name', 'false_color_png_name']:
    fpath = OUTPUT_DIR / result[key]
    exists = fpath.exists()
    print(f"  Preview {key}: {'EXISTS' if exists else 'MISSING'}")

print(f"\nMetrics: {json.dumps(result['metrics'], indent=2)}")
print("="*60)
