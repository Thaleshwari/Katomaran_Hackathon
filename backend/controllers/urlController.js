const { UrlMapping, ClickEvent } = require('../models');
const QRCode = require('qrcode');

/**
 * Get the backend base URL dynamically or from environment variables
 */
const getBaseUrl = (req) => {
  if (process.env.BASE_URL) {
    return process.env.BASE_URL.trim();
  }
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.headers['x-forwarded-host'] || req.get('host');
  return `${protocol}://${host}`;
};

/**
 * Generate a random 8-character alphanumeric string for the short URL
 */
const generateShortUrl = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let shortUrl = '';
  for (let i = 0; i < 8; i++) {
    shortUrl += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return shortUrl;
};

/**
 * Create a new shortened URL with optional custom alias and expiry date
 */
const createShortUrl = async (req, res) => {
  try {
    const { OriginalUrl, customAlias, expiryDate } = req.body;

    if (!OriginalUrl) {
      return res.status(400).json({ message: 'OriginalUrl is required' });
    }

    const shortUrl = generateShortUrl();

    // Check customAlias
    let cleanedAlias = undefined;
    if (customAlias && customAlias.trim() !== '') {
      cleanedAlias = customAlias.trim();
      // Validate format
      if (!/^[a-zA-Z0-9_-]+$/.test(cleanedAlias)) {
        return res.status(400).json({ message: 'Custom alias must be alphanumeric, dashes, or underscores only' });
      }
      
      // Check if alias is already used
      const existing = await UrlMapping.findOne({
        $or: [
          { shortUrl: cleanedAlias },
          { customAlias: cleanedAlias }
        ]
      });
      if (existing) {
        return res.status(400).json({ message: 'Custom alias is already in use' });
      }
    }

    // Check expiryDate
    let parsedExpiry = undefined;
    if (expiryDate) {
      parsedExpiry = new Date(expiryDate);
      if (isNaN(parsedExpiry.getTime())) {
        return res.status(400).json({ message: 'Invalid expiry date' });
      }
    }

    // Create UrlMapping in MongoDB
    const newMapping = await UrlMapping.create({
      originalUrl: OriginalUrl,
      shortUrl: shortUrl,
      customAlias: cleanedAlias,
      expiryDate: parsedExpiry,
      user: req.user._id,
      createdDate: new Date(),
      clickCount: 0,
    });

    // Return UrlMappingDTO structure
    return res.status(200).json({
      id: newMapping._id.toString(),
      originalUrl: newMapping.originalUrl,
      shortUrl: newMapping.shortUrl,
      customAlias: newMapping.customAlias,
      expiryDate: newMapping.expiryDate,
      clickCount: newMapping.clickCount,
      createdDate: newMapping.createdDate,
      username: req.user.username,
    });
  } catch (error) {
    console.error('Create short URL error:', error);
    return res.status(500).json({ message: 'Internal server error while creating short URL' });
  }
};

/**
 * Get all URLs belonging to the authenticated user
 */
const getUserUrls = async (req, res) => {
  try {
    const urls = await UrlMapping.find({ user: req.user._id }).sort({ createdDate: -1 });

    const response = urls.map(url => ({
      id: url._id.toString(),
      originalUrl: url.originalUrl,
      shortUrl: url.shortUrl,
      customAlias: url.customAlias,
      expiryDate: url.expiryDate,
      clickCount: url.clickCount,
      createdDate: url.createdDate,
      username: req.user.username,
    }));

    return res.status(200).json(response);
  } catch (error) {
    console.error('Get user URLs error:', error);
    return res.status(500).json({ message: 'Internal server error while retrieving URLs' });
  }
};

/**
 * Delete a shortened URL by ID
 */
const deleteUrl = async (req, res) => {
  try {
    const { id } = req.params;

    const urlMapping = await UrlMapping.findById(id);
    if (!urlMapping) {
      return res.status(404).json({ message: 'URL not found' });
    }

    // Verify ownership
    if (String(urlMapping.user) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized to delete this URL' });
    }

    await urlMapping.deleteOne();
    return res.status(204).send(); // No Content
  } catch (error) {
    console.error('Delete URL error:', error);
    return res.status(500).json({ message: 'Internal server error while deleting URL' });
  }
};

/**
 * Generate a QR code (data URL) for a shortened URL by its ID
 */
const getQrCode = async (req, res) => {
  try {
    const { id } = req.params;

    const urlMapping = await UrlMapping.findById(id);
    if (!urlMapping) {
      return res.status(404).json({ message: 'URL not found' });
    }

    // Verify ownership
    if (String(urlMapping.user) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const baseUrl = getBaseUrl(req);
    const fullShortUrl = `${baseUrl}/s/${urlMapping.customAlias || urlMapping.shortUrl}`;

    const qrDataUrl = await QRCode.toDataURL(fullShortUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });

    return res.status(200).json({ qrCode: qrDataUrl, shortUrl: fullShortUrl });
  } catch (error) {
    console.error('QR code generation error:', error);
    return res.status(500).json({ message: 'Failed to generate QR code' });
  }
};

/**
 * Update the destination URL, expiry date, or custom alias of a mapping
 */
const updateUrl = async (req, res) => {
  try {
    const { id } = req.params;
    const { originalUrl, expiryDate, customAlias } = req.body;

    const urlMapping = await UrlMapping.findById(id);
    if (!urlMapping) {
      return res.status(404).json({ message: 'URL not found' });
    }

    // Verify ownership
    if (String(urlMapping.user) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (originalUrl) {
      urlMapping.originalUrl = originalUrl;
    }

    if (expiryDate !== undefined) {
      urlMapping.expiryDate = expiryDate ? new Date(expiryDate) : undefined;
    }

    if (customAlias !== undefined) {
      const cleanedAlias = customAlias && customAlias.trim() !== '' ? customAlias.trim() : undefined;
      if (cleanedAlias) {
        if (!/^[a-zA-Z0-9_-]+$/.test(cleanedAlias)) {
          return res.status(400).json({ message: 'Custom alias must be alphanumeric, dashes, or underscores only' });
        }
        
        // Ensure uniqueness
        const existing = await UrlMapping.findOne({
          _id: { $ne: urlMapping._id },
          $or: [
            { shortUrl: cleanedAlias },
            { customAlias: cleanedAlias }
          ]
        });
        if (existing) {
          return res.status(400).json({ message: 'Custom alias is already in use' });
        }
      }
      urlMapping.customAlias = cleanedAlias;
    }

    await urlMapping.save();

    return res.status(200).json({
      id: urlMapping._id.toString(),
      originalUrl: urlMapping.originalUrl,
      shortUrl: urlMapping.shortUrl,
      customAlias: urlMapping.customAlias,
      expiryDate: urlMapping.expiryDate,
      clickCount: urlMapping.clickCount,
      createdDate: urlMapping.createdDate,
      username: req.user.username,
    });
  } catch (error) {
    console.error('Update URL error:', error);
    return res.status(500).json({ message: 'Internal server error while updating URL' });
  }
};

/**
 * Bulk create shortened URLs (supports custom alias and expiry date)
 */
const bulkShortenUrls = async (req, res) => {
  try {
    const { urls } = req.body; // Expects array of objects: [{ originalUrl, customAlias, expiryDate }]

    if (!urls || !Array.isArray(urls)) {
      return res.status(400).json({ message: 'An array of urls is required' });
    }

    if (urls.length > 50) {
      return res.status(400).json({ message: 'Maximum 50 URLs can be processed at once' });
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < urls.length; i++) {
      const { originalUrl, customAlias, expiryDate } = urls[i];

      if (!originalUrl) {
        errors.push({ index: i, message: 'Original URL is required' });
        continue;
      }

      let cleanedAlias = undefined;
      if (customAlias && customAlias.trim() !== '') {
        cleanedAlias = customAlias.trim();
        if (!/^[a-zA-Z0-9_-]+$/.test(cleanedAlias)) {
          errors.push({ index: i, message: `Invalid custom alias format: ${cleanedAlias}` });
          continue;
        }

        // Check if alias is already used
        const existing = await UrlMapping.findOne({
          $or: [
            { shortUrl: cleanedAlias },
            { customAlias: cleanedAlias }
          ]
        });
        if (existing) {
          errors.push({ index: i, message: `Custom alias already in use: ${cleanedAlias}` });
          continue;
        }
      }

      let parsedExpiry = undefined;
      if (expiryDate) {
        parsedExpiry = new Date(expiryDate);
        if (isNaN(parsedExpiry.getTime())) {
          errors.push({ index: i, message: `Invalid expiry date: ${expiryDate}` });
          continue;
        }
      }

      const shortUrl = generateShortUrl();

      try {
        const newMapping = await UrlMapping.create({
          originalUrl,
          shortUrl,
          customAlias: cleanedAlias,
          expiryDate: parsedExpiry,
          user: req.user._id,
          createdDate: new Date(),
          clickCount: 0,
        });

        results.push({
          id: newMapping._id.toString(),
          originalUrl: newMapping.originalUrl,
          shortUrl: newMapping.shortUrl,
          customAlias: newMapping.customAlias,
          expiryDate: newMapping.expiryDate,
          clickCount: newMapping.clickCount,
          createdDate: newMapping.createdDate,
        });
      } catch (err) {
        errors.push({ index: i, message: err.message });
      }
    }

    return res.status(200).json({ results, errors });
  } catch (error) {
    console.error('Bulk shorten error:', error);
    return res.status(500).json({ message: 'Internal server error during bulk shortening' });
  }
};

/**
 * Get analytics for a shortened URL by its ID (includes geolocation, device, browser, referrer stats)
 */
const getAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    const urlMapping = await UrlMapping.findById(id);
    if (!urlMapping) {
      return res.status(404).json({ message: 'URL not found' });
    }

    // Verify ownership
    if (String(urlMapping.user) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Build date boundaries
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    // Aggregate clicks per day (last 30 days)
    const dailyClicks = await ClickEvent.aggregate([
      {
        $match: {
          urlMapping: urlMapping._id,
          clickDate: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            year:  { $year:  '$clickDate' },
            month: { $month: '$clickDate' },
            day:   { $dayOfMonth: '$clickDate' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    // Fill missing days with 0
    const clickMap = {};
    dailyClicks.forEach(({ _id, count }) => {
      const key = `${_id.year}-${String(_id.month).padStart(2, '0')}-${String(_id.day).padStart(2, '0')}`;
      clickMap[key] = count;
    });

    const timeline = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const key = d.toISOString().slice(0, 10);
      timeline.push({ date: key, clicks: clickMap[key] || 0 });
    }

    // Quick stats and recent visits
    const [todayCount, weekCount, recentClicks] = await Promise.all([
      ClickEvent.countDocuments({ urlMapping: urlMapping._id, clickDate: { $gte: todayStart } }),
      ClickEvent.countDocuments({ urlMapping: urlMapping._id, clickDate: { $gte: weekStart } }),
      ClickEvent.find({ urlMapping: urlMapping._id }).sort({ clickDate: -1 }).limit(5),
    ]);

    const lastVisited = recentClicks.length > 0 ? recentClicks[0].clickDate : null;

    // Advanced analytics aggregations — $ifNull handles old click events without these fields
    const [deviceStats, browserStats, countryStats, referrerStats] = await Promise.all([
      ClickEvent.aggregate([
        { $match: { urlMapping: urlMapping._id } },
        { $group: { _id: { $ifNull: ['$device', 'Desktop'] }, count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      ClickEvent.aggregate([
        { $match: { urlMapping: urlMapping._id } },
        { $group: { _id: { $ifNull: ['$browser', 'Unknown'] }, count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      ClickEvent.aggregate([
        { $match: { urlMapping: urlMapping._id } },
        { $group: { _id: { $ifNull: ['$country', 'Unknown'] }, count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      ClickEvent.aggregate([
        { $match: { urlMapping: urlMapping._id } },
        { $group: { _id: { $ifNull: ['$referrer', 'Direct'] }, count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    return res.status(200).json({
      url: {
        id: urlMapping._id.toString(),
        originalUrl: urlMapping.originalUrl,
        shortUrl: urlMapping.shortUrl,
        customAlias: urlMapping.customAlias,
        expiryDate: urlMapping.expiryDate,
        createdDate: urlMapping.createdDate,
        clickCount: urlMapping.clickCount,
      },
      stats: {
        today: todayCount,
        lastSevenDays: weekCount,
        allTime: urlMapping.clickCount,
        lastVisited,
        devices: deviceStats.map(d => ({ name: d._id || 'Desktop', count: d.count })),
        browsers: browserStats.map(b => ({ name: b._id || 'Unknown', count: b.count })),
        countries: countryStats.map(c => ({ name: c._id || 'Unknown', count: c.count })),
        referrers: referrerStats.map(r => ({ name: r._id || 'Direct', count: r.count })),
      },
      recentVisits: recentClicks.map(c => ({
        id: c._id.toString(),
        clickDate: c.clickDate,
        country: c.country,
        device: c.device,
        browser: c.browser,
      })),
      timeline,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return res.status(500).json({ message: 'Failed to load analytics' });
  }
};

/**
 * Retrieve public analytics for a shortened URL without authentication
 */
const getPublicStats = async (req, res) => {
  try {
    const { shortUrl } = req.params;

    // Find the URL mapping by shortUrl or customAlias
    const urlMapping = await UrlMapping.findOne({
      $or: [
        { shortUrl },
        { customAlias: shortUrl }
      ]
    });

    if (!urlMapping) {
      return res.status(404).json({ message: 'URL not found' });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const dailyClicks = await ClickEvent.aggregate([
      {
        $match: {
          urlMapping: urlMapping._id,
          clickDate: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            year:  { $year:  '$clickDate' },
            month: { $month: '$clickDate' },
            day:   { $dayOfMonth: '$clickDate' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    const clickMap = {};
    dailyClicks.forEach(({ _id, count }) => {
      const key = `${_id.year}-${String(_id.month).padStart(2, '0')}-${String(_id.day).padStart(2, '0')}`;
      clickMap[key] = count;
    });

    const timeline = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const key = d.toISOString().slice(0, 10);
      timeline.push({ date: key, clicks: clickMap[key] || 0 });
    }

    return res.status(200).json({
      url: {
        originalUrl: urlMapping.originalUrl,
        shortUrl: urlMapping.shortUrl,
        customAlias: urlMapping.customAlias,
        createdDate: urlMapping.createdDate,
        clickCount: urlMapping.clickCount,
      },
      timeline,
    });
  } catch (error) {
    console.error('Public stats error:', error);
    return res.status(500).json({ message: 'Failed to load public stats' });
  }
};

module.exports = {
  createShortUrl,
  getUserUrls,
  deleteUrl,
  getQrCode,
  updateUrl,
  bulkShortenUrls,
  getAnalytics,
  getPublicStats,
};
