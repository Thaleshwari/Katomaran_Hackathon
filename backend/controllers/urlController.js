const { UrlMapping, ClickEvent } = require('../models');
const QRCode = require('qrcode');

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
 * Create a new shortened URL
 */
const createShortUrl = async (req, res) => {
  try {
    const { OriginalUrl } = req.body; // Frontend sends OriginalUrl with uppercase O

    if (!OriginalUrl) {
      return res.status(400).json({ message: 'OriginalUrl is required' });
    }

    const shortUrl = generateShortUrl();

    // Create UrlMapping in MongoDB
    const newMapping = await UrlMapping.create({
      originalUrl: OriginalUrl,
      shortUrl: shortUrl,
      user: req.user._id, // Reference to User ObjectId
      createdDate: new Date(),
      clickCount: 0,
    });

    // Return UrlMappingDTO structure
    return res.status(200).json({
      id: newMapping._id.toString(),
      originalUrl: newMapping.originalUrl,
      shortUrl: newMapping.shortUrl,
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
    // Find all mapping documents belonging to this user
    const urls = await UrlMapping.find({ user: req.user._id }).sort({ createdDate: -1 });

    const response = urls.map(url => ({
      id: url._id.toString(),
      originalUrl: url.originalUrl,
      shortUrl: url.shortUrl,
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

    // Find mapping by ID
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

    const baseUrl = process.env.BASE_URL || 'http://localhost:8080';
    const fullShortUrl = `${baseUrl}/s/${urlMapping.shortUrl}`;

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
 * Get analytics for a shortened URL by its ID
 * Returns per-day click counts for the last 30 days + quick stats
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

    // Quick stats
    const [todayCount, weekCount] = await Promise.all([
      ClickEvent.countDocuments({ urlMapping: urlMapping._id, clickDate: { $gte: todayStart } }),
      ClickEvent.countDocuments({ urlMapping: urlMapping._id, clickDate: { $gte: weekStart } }),
    ]);

    return res.status(200).json({
      url: {
        id: urlMapping._id.toString(),
        originalUrl: urlMapping.originalUrl,
        shortUrl: urlMapping.shortUrl,
        createdDate: urlMapping.createdDate,
        clickCount: urlMapping.clickCount,
      },
      stats: {
        today: todayCount,
        lastSevenDays: weekCount,
        allTime: urlMapping.clickCount,
      },
      timeline,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return res.status(500).json({ message: 'Failed to load analytics' });
  }
};

module.exports = {
  createShortUrl,
  getUserUrls,
  deleteUrl,
  getQrCode,
  getAnalytics,
};
