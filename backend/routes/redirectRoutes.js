const express = require('express');
const router = express.Router();
const { redirectToOriginalUrl } = require('../controllers/redirectController');

router.get('/:shortUrl', redirectToOriginalUrl);

module.exports = router;
