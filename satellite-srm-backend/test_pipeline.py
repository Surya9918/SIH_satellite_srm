import os
import sys

from server import generate_product_for_raster, OUTPUT_DIR, UPLOAD_DIR
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

test_input = r'C:\Users\mouni\OneDrive\Documents\sih final code\SRM_Final\satellite-srm-backend\data\uploads\SRM-5A0D8370_stacked_4band.tif'
if not os.path.exists(test_input):
    print("Test input not found!")
    sys.exit(1)

result = generate_product_for_raster(test_input, "TEST-JOB", "SwinIR-SRM", 3.0)
print(result)
