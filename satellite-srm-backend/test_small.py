"""
Quick verification test: loads checkpoint, runs a tiny (4,16,16) tile through the model,
and checks that the output shape is correct (4, 48, 48) — 3x upscaled.
"""
import os, sys, time
import numpy as np

# Ensure satellite_srm is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "core_engine", "satellite-srm", "src"))

from satellite_srm.models.model_factory import create_model
from satellite_srm.models.pytorch_loader import load_pytorch_checkpoint
from satellite_srm.compat import torch

config = {
    "model": {
        "backend": "swinir",
        "scale_factor": 3.0,
        "swinir": {
            "in_channels": 4,
            "out_channels": 4,
            "embed_dim": 60,
            "depths": [4, 4, 4, 4],
            "num_heads": [6, 6, 6, 6],
            "window_size": 4
        }
    }
}

print("=" * 60)
print("STEP 1: Create model")
model = create_model(config)
print(f"  Model class: {model.__class__.__name__}")
n_params = sum(np.prod(p.numpy().shape) if hasattr(p, 'numpy') else np.prod(p.shape) for p in model.parameters())
print(f"  Number of parameters: {n_params}")

print("\nSTEP 2: Load checkpoint")
ckpt_path = os.path.join(os.path.dirname(__file__), "data", "outputs", "checkpoints", "srm_corrected_v1.pt")
print(f"  Checkpoint path: {ckpt_path}")
print(f"  Checkpoint size: {os.path.getsize(ckpt_path)} bytes")

ckpt = load_pytorch_checkpoint(ckpt_path)
state_dict = ckpt.get("model_state", ckpt.get("model_state_dict", ckpt))
print(f"  State dict keys count: {len(state_dict)}")

res = model.load_state_dict(state_dict, strict=True)
print(f"  Missing keys: {len(res['missing_keys'])}")
print(f"  Unexpected keys: {len(res['unexpected_keys'])}")
model.eval()

print("\nSTEP 3: Create small synthetic input (4, 16, 16)")
# Simulate normalized Sentinel-2 reflectance: [0, 1] range
inp = np.random.rand(1, 4, 16, 16).astype(np.float32) * 0.3  # Typical reflectance range
print(f"  Input shape: {inp.shape}")
print(f"  Input dtype: {inp.dtype}")
print(f"  Input range: [{inp.min():.4f}, {inp.max():.4f}]")

print("\nSTEP 4: Run inference")
t0 = time.time()
tensor_in = torch.from_numpy(inp)
with torch.no_grad():
    output = model(tensor_in)
elapsed = time.time() - t0

if hasattr(output, 'numpy'):
    out_arr = output.numpy()
elif hasattr(output, '_data'):
    out_arr = output._data
else:
    out_arr = np.array(output)

print(f"  Output shape: {out_arr.shape}")
print(f"  Output dtype: {out_arr.dtype}")
print(f"  Output min/max: [{np.min(out_arr):.6f}, {np.max(out_arr):.6f}]")
print(f"  Output mean: {np.mean(out_arr):.6f}")
print(f"  Inference time: {elapsed:.2f}s")
print(f"  Has NaN: {np.any(np.isnan(out_arr))}")
print(f"  Has Inf: {np.any(np.isinf(out_arr))}")

# Verify 3x spatial upscaling
expected_shape = (1, 4, 48, 48)
if out_arr.shape == expected_shape:
    print(f"\n[PASS] Output is exactly 3x spatial (16->48). Shape {out_arr.shape} matches expected {expected_shape}")
else:
    print(f"\n[FAIL] Expected {expected_shape}, got {out_arr.shape}")

print("=" * 60)
