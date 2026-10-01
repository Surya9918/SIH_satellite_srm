import unittest
import numpy as np
from satellite_srm.preprocessing.normalization import RadiometricNormalizer

class TestNormalization(unittest.TestCase):
    def test_scale_factor_normalization(self):
        norm = RadiometricNormalizer(scale_factor=10000.0)
        raw = np.array([[[0.0, 5000.0, 10000.0]]], dtype=np.float32)
        res = norm.normalize(raw)
        self.assertAlmostEqual(res[0, 0, 0], 0.0)
        self.assertAlmostEqual(res[0, 0, 1], 0.5)
        self.assertAlmostEqual(res[0, 0, 2], 1.0)

    def test_reversibility(self):
        norm = RadiometricNormalizer()
        raw = np.random.uniform(500, 9500, (4, 16, 16)).astype(np.float32)
        n = norm.normalize(raw)
        recovered = norm.unnormalize(n, to_dn=True)
        # Verify within roundoff error
        np.testing.assert_allclose(raw, recovered, atol=2.0)

    def test_percentile_normalization_restores_physical_reflectance(self):
        raw = np.linspace(1000.0, 9000.0, 4 * 16 * 16, dtype=np.float32).reshape(4, 16, 16)
        norm = RadiometricNormalizer(use_percentiles=True, p_min=1.0, p_max=99.0)

        normalized = norm.normalize(raw)
        restored = norm.unnormalize(normalized)
        expected = np.empty_like(raw)
        for band in range(raw.shape[0]):
            low = norm.stats["mins"][band]
            high = norm.stats["maxs"][band]
            expected[band] = np.clip(raw[band] / norm.scale_factor, low, high)

        np.testing.assert_allclose(restored, expected, atol=1e-6)

if __name__ == "__main__":
    unittest.main()
