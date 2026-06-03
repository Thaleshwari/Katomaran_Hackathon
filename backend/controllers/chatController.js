const { UrlMapping } = require('../models');

/**
 * Handle chat conversation using SambaNova API
 */
const handleChat = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: 'Messages array is required' });
    }

    const apiKey = process.env.SAMBANOVA_API_KEY;
    if (!apiKey) {
      console.error('SambaNova API Key is missing in environment variables');
      return res.status(500).json({ message: 'SambaNova API Key is not configured on the server.' });
    }

    // 1. Fetch user's URLs to provide context to the LLM
    const userUrls = await UrlMapping.find({ user: req.user._id }).sort({ createdDate: -1 });

    // Calculate total clicks and find top performing link
    let totalClicks = 0;
    let topUrl = null;
    let maxClicks = -1;

    const formattedUrls = userUrls.map(url => {
      totalClicks += url.clickCount || 0;
      if ((url.clickCount || 0) > maxClicks) {
        maxClicks = url.clickCount || 0;
        topUrl = url;
      }

      const expiryStr = url.expiryDate ? new Date(url.expiryDate).toLocaleDateString() : 'None';
      const createdStr = url.createdDate ? new Date(url.createdDate).toLocaleDateString() : 'Unknown';

      return {
        originalUrl: url.originalUrl,
        shortUrl: url.customAlias || url.shortUrl,
        clickCount: url.clickCount || 0,
        createdDate: createdStr,
        expiryDate: expiryStr
      };
    });

    const topUrlInfo = topUrl
      ? `"${topUrl.originalUrl}" (${topUrl.customAlias || topUrl.shortUrl}) with ${topUrl.clickCount} clicks`
      : 'None';

    const urlListString = formattedUrls.length > 0
      ? formattedUrls.map((u, i) => `${i + 1}. Original: ${u.originalUrl}\n   Short: ${u.shortUrl}\n   Clicks: ${u.clickCount}\n   Created: ${u.createdDate}\n   Expiry: ${u.expiryDate}`).join('\n\n')
      : 'No URLs shortened yet.';

    // 2. Build the system prompt with user context
    const systemPrompt = `You are "Shortify AI Assistant", a premium AI chatbot built into the Shortify URL Shortener platform. 
Your goal is to help the user manage their links, analyze their link performance, and navigate the platform.

Here is the context about the current user:
- Username: ${req.user.username}
- Total links: ${userUrls.length}
- Total clicks: ${totalClicks}
- Most popular link: ${topUrlInfo}

Here is a list of all their current shortened URLs:
${urlListString}

Rules:
1. Always be polite, modern, helpful, and concise.
2. Use clear, neat markdown formatting (bullet points, bold text, code blocks for URLs) so that it is easy to read.
3. If they ask about their links or analytics, look up the answers in the provided list.
4. If they ask to shorten a link, explain that they can do this directly using the "Shorten URL" form on the dashboard, or describe the steps.
5. If they ask questions unrelated to URL shortening or their analytics, help them politely but try to steer the conversation back to their URL Shortening dashboard.
6. Keep the tone premium and SaaS-focused.`;

    // 3. Prepare payload for SambaNova
    const apiPayload = {
      model: 'Meta-Llama-3.3-70B-Instruct', // SambaNova's high-performance production model
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content }))
      ],
      temperature: 0.7,
      max_tokens: 1000
    };

    // 4. Call SambaNova Cloud API
    const response = await fetch('https://api.sambanova.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(apiPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`SambaNova API error: ${response.status} ${errorText}`);
      throw new Error(`SambaNova API returned status ${response.status}`);
    }

    const responseData = await response.json();
    const assistantMessage = responseData.choices?.[0]?.message?.content || 'No response generated.';

    return res.status(200).json({ reply: assistantMessage });
  } catch (error) {
    console.error('Chat controller error:', error);
    return res.status(500).json({ message: 'Error communicating with AI chatbot server.' });
  }
};

module.exports = {
  handleChat
};
