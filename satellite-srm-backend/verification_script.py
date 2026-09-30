import os
import sys
import time
import json
import numpy as np
import rasterio

# We are in the current backend
CURRENT_BACKEND = os.path.dirname(os.path.abspath(__file__))
OLD_BACKEND = r"C:\Users\mouni\OneDrive\Documents\sih 142\backend\Satellite_SRM_DL"

# Paths
ckpt_path = os.path.join(CURRENT_BACKEND, "data", "outputs", "checkpoints", "srm_corrected_v1.pt")
old_ckpt_path = os.path.join(OLD_BACKEND, "outputs", "checkpoints", "srm_corrected_v1.pt")

print("="*60)
print("A. CHECKPOINT VERIFICATION")
print("="*60)
print(f"Exists in current: {os.path.exists(ckpt_path)}")
print(f"Path: {ckpt_path}")
print(f"Size: {os.path.getsize(ckpt_path)} bytes")

# Test files for Real Test
test_bands = {
    "b02": os.path.join(CURRENT_BACKEND, "data", "uploads", "SRM-016F6D4F_b02_S2_B02.tif"),
    "b03": os.path.join(CURRENT_BACKEND, "data", "uploads", "SRM-016F6D4F_b03_S2_B03.tif"),
    "b04": os.path.join(CURRENT_BACKEND, "data", "uploads", "SRM-016F6D4F_b04_S2_B04.tif"),
    "b08": os.path.join(CURRENT_BACKEND, "data", "uploads", "SRM-016F6D4F_b08_S2_B08.tif")
}

print("\n" + "="*60)
print("B. & C. & D. & E. RUNNING REAL SENTINEL-2 TEST VIA CURRENT PIPELINE")
print("="*60)

sys.path.insert(0, os.path.join(CURRENT_BACKEND, "core_engine", "satellite-srm", "src"))
from server import stack_four_bands, generate_product_for_raster, OUTPUT_DIR

# 1. Stack
stacked_path = os.path.join(CURRENT_BACKEND, "data", "uploads", "test_real_stacked.tif")
stack_four_bands(test_bands, stacked_path)

with rasterio.open(stacked_path) as src:
    d = src.read()
    print(f"Input Shape: {d.shape}")
    print(f"Input Dtype: {d.dtype}")
    print(f"Input Min: {d.min()}, Max: {d.max()}")
    print(f"Input CRS: {src.crs}")
    input_gsd = src.transform.a
    print(f"Input GSD: {input_gsd}")

# 2. Run Pipeline
print("\nRunning generate_product_for_raster (Numpy Compat Pipeline)...")
t0 = time.time()
result = generate_product_for_raster(stacked_path, "VERIFICATION-001", "SwinIR-SRM", 3.0)
elapsed = time.time() - t0
print(f"Pipeline took: {elapsed:.2f}s")

if result:
    sr_tif_path = os.path.join(OUTPUT_DIR, result["sr_tif_name"])
    unc_tif_path = os.path.join(OUTPUT_DIR, result["uncertainty_tif_name"])
    
    with rasterio.open(sr_tif_path) as src:
        sr_d = src.read()
        print(f"\nOutput Shape: {sr_d.shape}")
        print(f"Output Dtype: {sr_d.dtype}")
        print(f"Output Min: {sr_d.min():.4f}, Max: {sr_d.max():.4f}, Mean: {sr_d.mean():.4f}")
        print(f"Output CRS: {src.crs}")
        print(f"Output GSD: {src.transform.a}")
        print(f"No NaNs: {not np.any(np.isnan(sr_d))}")
        print(f"No Infs: {not np.any(np.isinf(sr_d))}")
        print(f"Band order descriptions: {[src.tags(i+1).get('DESCRIPTION', src.descriptions[i]) for i in range(4)]}")

    with rasterio.open(unc_tif_path) as src:
        unc_d = src.read()
        print(f"\nUncertainty Min: {unc_d.min():.4f}, Max: {unc_d.max():.4f}, Mean: {unc_d.mean():.4f}")
        
    print("\nFrontend Compatibility Check (Metrics):")
    metrics_path = os.path.join(OUTPUT_DIR, result["metrics_json_name"])
    with open(metrics_path, "r") as f:
        print(json.dumps(json.load(f), indent=2))
        
    print(f"Result Dictionary keys: {list(result.keys())}")


print("\n" + "="*60)
print("H. NUMERICAL COMPARISON WITH OLD VERIFIED PIPELINE (PyTorch)")
print("="*60)

# Temporarily remove current src from path to load old codebase cleanly via subprocess
import subprocess
import tempfile

old_test_script = f"""
import os, sys, numpy as np, rasterio
sys.path.insert(0, r"{os.path.join(OLD_BACKEND, 'src')}")
import torch

from models.model_factory import create_model
from models.checkpoint import load_checkpoint_weights
from inference.pipeline import FullSceneSRMPipeline

config = {{
    "model": {{
        "backend": "swinir",
        "scale_factor": 3.0,
        "swinir": {{
            "in_channels": 4,
            "out_channels": 4,
            "embed_dim": 60,
            "depths": [4, 4, 4, 4],
            "num_heads": [6, 6, 6, 6],
            "window_size": 4
        }}
    }},
    "inference": {{
        "scale_factor": 3.0,
        "tile_size": 128,
        "overlap": 32,
        "blending_method": "weighted_hann",
        "uncertainty": {{"mc_passes": 8}}
    }}
}}

model = create_model(config)
model = load_checkpoint_weights(model, r"{old_ckpt_path}", strict=True)
model.eval()

pipeline = FullSceneSRMPipeline(model=model, config=config)
out_sr = r"{OUTPUT_DIR}\\old_pytorch_sr_out.tif"
out_unc = r"{OUTPUT_DIR}\\old_pytorch_unc_out.tif"

pipeline.run(r"{stacked_path}", out_sr, out_unc)
"""

script_path = os.path.join(tempfile.gettempdir(), "run_old_pytorch.py")
with open(script_path, "w") as f:
    f.write(old_test_script)

print("Running old PyTorch pipeline...")
proc = subprocess.run(["python", script_path], capture_output=True, text=True)
if proc.returncode != 0:
    print("Error running old pipeline:")
    print(proc.stderr)
else:
    old_sr_path = os.path.join(OUTPUT_DIR, "old_pytorch_sr_out.tif")
    with rasterio.open(old_sr_path) as src:
        old_d = src.read()
        
    with rasterio.open(sr_tif_path) as src:
        new_d = src.read()
        
    diff = np.abs(old_d.astype(np.float32) - new_d.astype(np.float32))
    print(f"Max absolute difference: {np.max(diff):.6f}")
    print(f"Mean absolute difference: {np.mean(diff):.6f}")
    if np.max(diff) < 1e-4:
        print("Outputs are numerically identical (within float precision tolerance).")
    else:
        print("Outputs differ!")

