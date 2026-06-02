const { UrlMapping, ClickEvent } = require('../models');

const parseUserAgent = (uaString) => {
  const ua = uaString || '';
  let browser = 'Other';
  let device = 'Desktop';

  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Chrome') && !ua.includes('Chromium')) browser = 'Chrome';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';

  if (/mobile|android|iphone|ipad|phone/i.test(ua)) {
    if (/ipad|tablet/i.test(ua)) device = 'Tablet';
    else device = 'Mobile';
  }

  return { browser, device };
};

const fetchCountry = async (ip) => {
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1') {
    return 'Localhost';
  }
  try {
    const cleanIp = ip.split(',')[0].trim();
    const response = await fetch(`http://ip-api.com/json/${cleanIp}`);
    const data = await response.json();
    return data.country || 'Unknown';
  } catch (err) {
    console.error('GeoIP lookup failed:', err.message);
    return 'Unknown';
  }
};

/**
 * Redirect to original URL from short code or custom alias
 */
const redirectToOriginalUrl = async (req, res) => {
  const { shortUrl } = req.params;

  if (!shortUrl || shortUrl === 'error') {
    return res.status(404).send('Not Found');
  }

  try {
    // Find URL mapping in MongoDB (either by shortUrl OR customAlias)
    const urlMapping = await UrlMapping.findOne({
      $or: [
        { shortUrl },
        { customAlias: shortUrl }
      ]
    });

    if (!urlMapping) {
      return res.status(404).send('Not Found');
    }

    // Check if link has expired
    if (urlMapping.expiryDate && new Date(urlMapping.expiryDate) < new Date()) {
      return res.status(410).send(`
        <html>
          <head>
            <title>Link Expired - Shortify</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
              .card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); padding: 3rem; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); max-width: 400px; backdrop-filter: blur(12px); }
              h1 { color: #ef4444; margin-bottom: 1rem; font-size: 2rem; }
              p { color: #94a3b8; font-size: 1.1rem; line-height: 1.6; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>Link Expired</h1>
              <p>This shortened link has reached its expiration date and is no longer active.</p>
            </div>
          </body>
        </html>
      `);
    }

    // Increment click count
    urlMapping.clickCount += 1;
    await urlMapping.save();

    // Create a click event document with browser, device, country, and referrer
    try {
      const ua = req.headers['user-agent'] || '';
      const { browser, device } = parseUserAgent(ua);
      const referrer = req.headers['referer'] || req.headers['referrer'] || 'Direct';
      
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const country = await fetchCountry(ip);

      await ClickEvent.create({
        urlMapping: urlMapping._id,
        clickDate: new Date(),
        browser,
        device,
        country,
        referrer: referrer.startsWith('http') ? new URL(referrer).hostname : referrer,
      });
    } catch (clickErr) {
      console.error('Failed to log click event details:', clickErr.message);
    }

    let originalUrl = urlMapping.originalUrl;
    
    // Ensure URL is absolute for redirection
    if (!originalUrl.startsWith('http://') && !originalUrl.startsWith('https://')) {
      originalUrl = 'http://' + originalUrl;
    }

    // Perform HTTP 302 Redirect
    return res.redirect(302, originalUrl);
  } catch (error) {
    console.error(`Redirection error for ${shortUrl}:`, error);
    return res.status(500).send('Internal Server Error');
  }
};

module.exports = {
  redirectToOriginalUrl,
};
