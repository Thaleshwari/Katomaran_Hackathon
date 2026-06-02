const express = require('express');
const router = express.Router();
const {
  createShortUrl,
  getUserUrls,
  deleteUrl,
  getQrCode,
  updateUrl,
  bulkShortenUrls,
  getAnalytics,
  getPublicStats,
} = require('../controllers/urlController');
const { authMiddleware, hasRole } = require('../middleware/authMiddleware');

// Public endpoints (no auth required)
router.get('/public/:shortUrl/stats', getPublicStats);

// Secure all URL management endpoints
router.use(authMiddleware);
router.use(hasRole('ROLE_USER'));

router.post('/shorten', createShortUrl);
router.post('/bulk', bulkShortenUrls);
router.get('/myurls', getUserUrls);
router.get('/:id/analytics', getAnalytics);
router.get('/:id/qrcode', getQrCode);
router.put('/:id', updateUrl);
router.delete('/:id', deleteUrl);

module.exports = router;
