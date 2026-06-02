const { UrlMapping, ClickEvent } = require('../models');

/**
 * Redirect to original URL from short code
 */
const redirectToOriginalUrl = async (req, res) => {
  const { shortUrl } = req.params;

  if (!shortUrl || shortUrl === 'error') {
    return res.status(404).send('Not Found');
  }

  try {
    // Find URL mapping in MongoDB
    const urlMapping = await UrlMapping.findOne({ shortUrl });

    if (!urlMapping) {
      return res.status(404).send('Not Found');
    }

    // Increment click count
    urlMapping.clickCount += 1;
    await urlMapping.save();

    // Create a click event document
    try {
      await ClickEvent.create({
        urlMapping: urlMapping._id, // Reference to UrlMapping ObjectId
        clickDate: new Date(),
      });
    } catch (clickErr) {
      // Don't fail redirection if click logging has an issue
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
