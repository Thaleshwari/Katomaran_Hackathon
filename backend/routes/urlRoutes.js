const express = require('express');
const router = express.Router();
const { createShortUrl, getUserUrls, deleteUrl, getQrCode, getAnalytics } = require('../controllers/urlController');
const { authMiddleware, hasRole } = require('../middleware/authMiddleware');

// Secure all URL management endpoints
router.use(authMiddleware);
router.use(hasRole('ROLE_USER'));

router.post('/shorten', createShortUrl);
router.get('/myurls', getUserUrls);
router.get('/:id/analytics', getAnalytics);
router.get('/:id/qrcode', getQrCode);
router.delete('/:id', deleteUrl);


module.exports = router;
