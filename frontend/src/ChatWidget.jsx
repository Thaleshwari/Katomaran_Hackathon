import React, { useState, useEffect, useRef } from 'react';
import api from './api';
import { MessageSquare, Send, X, Sparkles, Bot, User, Loader } from 'lucide-react';

/**
 * Custom Markdown Parser for rendering chat messages securely.
 */
const parseMarkdown = (text) => {
  if (!text) return '';
  
  // Escape HTML entities to prevent XSS
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks: ```js ... ```
  html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
    return `<pre class="chat-code-block"><code>${code.trim()}</code></pre>`;
  });

  // Inline code: `code`
  html = html.replace(/`([^`]+)`/g, '<code class="chat-inline-code">$1</code>');

  // Bold: **bold**
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Headers: e.g. ### Header
  html = html.replace(/^### (.*$)/gim, '<h4 class="chat-h4">$1</h4>');
  html = html.replace(/^## (.*$)/gim, '<h3 class="chat-h3">$1</h3>');
  html = html.replace(/^# (.*$)/gim, '<h2 class="chat-h2">$1</h2>');

  // Lists
  const lines = html.split('\n');
  let inList = false;
  let listType = null; // 'ul' or 'ol'
  let resultLines = [];

  for (let line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList) {
        resultLines.push('<ul class="chat-list">');
        inList = true;
        listType = 'ul';
      } else if (listType === 'ol') {
        resultLines.push('</ol><ul class="chat-list">');
        listType = 'ul';
      }
      resultLines.push(`<li>${trimmed.substring(2)}</li>`);
    } else if (/^\d+\.\s/.test(trimmed)) {
      if (!inList) {
        resultLines.push('<ol class="chat-list">');
        inList = true;
        listType = 'ol';
      } else if (listType === 'ul') {
        resultLines.push('</ul><ol class="chat-list">');
        listType = 'ol';
      }
      const itemText = trimmed.replace(/^\d+\.\s/, '');
      resultLines.push(`<li>${itemText}</li>`);
    } else {
      if (inList) {
        resultLines.push(listType === 'ul' ? '</ul>' : '</ol>');
        inList = false;
        listType = null;
      }
      resultLines.push(line);
    }
  }
  
  if (inList) {
    resultLines.push(listType === 'ul' ? '</ul>' : '</ol>');
  }

  html = resultLines.join('\n');

  // Replace remaining newlines with br, but skip inside pre blocks
  const parts = html.split(/(<\/pre>)/);
  for (let i = 0; i < parts.length; i++) {
    if (!parts[i].includes('<pre') && !parts[i].includes('<code>')) {
      parts[i] = parts[i].replace(/\n/g, '<br/>');
    }
  }
  html = parts.join('');

  return html;
};

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I am your **Shortify AI Assistant** ✨\n\nI can help you analyze your link metrics, explain features, or guide you on creating short URLs and custom aliases. Ask me anything!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Send the entire conversation history (excluding the first mock assistant message if needed, but standard history is fine)
      const chatHistory = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await api.post('/chat', { messages: chatHistory });
      
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.data.reply }
      ]);
    } catch (err) {
      console.error('Chat failed:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "❌ Sorry, I encountered an error while communicating with the AI server. Please make sure the backend is running and the API Key is valid."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-widget-container">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button 
          className="chat-toggle-btn glass animate-fade"
          onClick={() => setIsOpen(true)}
          title="Chat with AI Assistant"
        >
          <div className="pulse-glow"></div>
          <Sparkles size={20} className="sparkles-icon" />
          <MessageSquare size={22} color="white" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window glass animate-scale">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar-ai">
                <Bot size={18} color="#090909" />
              </div>
              <div>
                <h4>Shortify Assistant</h4>
                <div className="status-indicator">
                  <span className="dot"></span>
                  <span>Online</span>
                </div>
              </div>
            </div>
            <button 
              className="chat-close-btn" 
              onClick={() => setIsOpen(false)}
              title="Close Chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`chat-message-row ${msg.role === 'user' ? 'user-row' : 'assistant-row'}`}
              >
                {msg.role !== 'user' && (
                  <div className="msg-avatar msg-avatar-ai">
                    <Bot size={14} color="#D4AF37" />
                  </div>
                )}
                
                <div className={`chat-bubble ${msg.role === 'user' ? 'user-bubble' : 'assistant-bubble'}`}>
                  <div 
                    className="chat-bubble-text"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }}
                  />
                </div>

                {msg.role === 'user' && (
                  <div className="msg-avatar msg-avatar-user">
                    <User size={14} color="#fff" />
                  </div>
                )}
              </div>
            ))}
            
            {/* Loading Indicator */}
            {loading && (
              <div className="chat-message-row assistant-row">
                <div className="msg-avatar msg-avatar-ai">
                  <Bot size={14} color="#D4AF37" />
                </div>
                <div className="chat-bubble assistant-bubble loading-bubble">
                  <div className="chat-typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="chat-input-form">
            <input
              type="text"
              placeholder="Ask about your links or metrics..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="chat-input"
            />
            <button 
              type="submit" 
              className="chat-send-btn" 
              disabled={loading || !input.trim()}
              title="Send Message"
            >
              {loading ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
