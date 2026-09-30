import os
import sys
import time
import json
import rasterio

# Paths
CURRENT_BACKEND = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(CURRENT_BACKEND, "core_engine", "satellite-srm", "src"))
from server import stack_four_bands, generate_product_for_raster, OUTPUT_DIR

print("Locating real Sentinel-2 files...")
# We use the 5153C200 prefix files
prefix = "SRM-5153C200"
base_dir = os.path.join(CURRENT_BACKEND, "data", "uploads")
band_names = ["b02", "b03", "b04", "b08"]
band_paths = {}

for f in os.listdir(base_dir):
    if f.startswith(prefix) and f.endswith(".tif") and "stacked" not in f:
        # e.g., SRM-5153C200_b02_sentinel-2-l2a_2026-06-11_..._B02.tif
        for b in band_names:
            if f"_{b}_" in f:
                band_paths[b] = os.path.join(base_dir, f)

if len(band_paths) != 4:
    print(f"Error: Could not find all 4 bands. Found: {list(band_paths.keys())}")
    sys.exit(1)

print("\n--- INPUT VERIFICATION ---")
for b in band_names:
    p = band_paths[b]
    with rasterio.open(p) as src:
        d = src.read(1)
        print(f"{b.upper()} path: {p}")
        print(f"  dtype: {d.dtype}, min: {d.min()}, max: {d.max()}")
        if b == "b02":
            input_crs = src.crs
            input_gsd = src.transform.a
            input_shape = (4, src.height, src.width)
            
print(f"CRS: {input_crs}")
print(f"Input GSD: {input_gsd}")
print(f"Expected Stacked Shape: {input_shape}")

print("\n--- STACKING & RUNNING PIPELINE ---")
stacked_path = os.path.join(base_dir, f"{prefix}_real_uint16_stacked.tif")
stacked_path = stack_four_bands(band_paths, stacked_path)

print(f"\nStarting generate_product_for_raster...")
t0 = time.time()
# The pipeline internally prints normalizer range and model input shape
result = generate_product_for_raster(stacked_path, "REAL-S2-TEST", "SwinIR-SRM", 3.0)
print(f"Pipeline finished in {time.time() - t0:.1f}s")

if result:
    print("\n--- OUTPUT VERIFICATION ---")
    sr_path = os.path.join(OUTPUT_DIR, result["sr_tif_name"])
    unc_path = os.path.join(OUTPUT_DIR, result["uncertainty_tif_name"])
    
    with rasterio.open(sr_path) as src:
        sr_d = src.read()
        print(f"Output Path: {sr_path}")
        print(f"Output Shape: {sr_d.shape}")
        print(f"Output Dtype: {sr_d.dtype}")
        print(f"Output Min: {sr_d.min():.6f}, Max: {sr_d.max():.6f}")
        import numpy as np
        print(f"No NaN: {not np.any(np.isnan(sr_d))}")
        print(f"No Inf: {not np.any(np.isinf(sr_d))}")
        print(f"Output CRS: {src.crs}")
        print(f"Output Resolution: {src.transform.a}")

    with rasterio.open(unc_path) as src:
        unc_d = src.read()
        print(f"\nUncertainty Min: {unc_d.min():.6f}")
        print(f"Uncertainty Max: {unc_d.max():.6f}")
        print(f"Uncertainty Mean: {unc_d.mean():.6f}")
        
    print("\nFrontend Compatible Response:")
    print(json.dumps(result, indent=2))
