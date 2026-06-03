import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTheme, ThemeToggle } from './ThemeContext';
import {
  Link2, Zap, BarChart3, QrCode, Upload,
  Shield, Bot, ArrowRight, Check, ExternalLink,
} from 'lucide-react';

/* ─── Feature Card ───────────────────────────────────────────── */
const FeatureCard = ({ icon: Icon, color, title, description }) => (
  <div style={{
    background: 'var(--glass-bg)',
    border: '1px solid var(--glass-border)',
    borderRadius: '20px',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    backdropFilter: 'blur(12px)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    cursor: 'default',
  }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-6px)';
      e.currentTarget.style.boxShadow = `0 20px 40px ${color}22`;
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}
  >
    <div style={{
      width: '52px', height: '52px', borderRadius: '14px',
      background: `${color}22`, border: `1px solid ${color}44`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon size={26} color={color} />
    </div>
    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>{title}</h3>
    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{description}</p>
  </div>
);



/* ─── Landing Page ───────────────────────────────────────────── */
export const LandingPage = () => {
  const { theme } = useTheme();
  const heroRef = useRef(null);
  const brandColor = theme === 'dark' ? '#ffffff' : '#0f172a';
  const cursorRef = useRef(null);
  const ringRef = useRef(null);
  // Store current mouse position
  const mousePos = useRef({ x: 0, y: 0 });
  // Store ring position for lerping
  const ringPos = useRef({ x: 0, y: 0 });

  /* subtle parallax on hero */
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        heroRef.current.style.transform = `translateY(${window.scrollY * 0.25}px)`;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* interactive professional cursor */
  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
      
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }
    };
    
    let animationFrameId;
    const animateCursor = () => {
      // Lerp ring towards mouse position
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.15;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.15;
      
      if (ringRef.current) {
        ringRef.current.style.left = `${ringPos.current.x}px`;
        ringRef.current.style.top = `${ringPos.current.y}px`;
      }
      
      animationFrameId = requestAnimationFrame(animateCursor);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animationFrameId = requestAnimationFrame(animateCursor);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', overflowX: 'hidden', background: 'var(--bg)', position: 'relative' }}>
      
      {/* Interactive Cursor Glow */}
      <div 
        ref={cursorRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, rgba(139, 92, 246, 0.03) 40%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 9998,
          transform: 'translate(-50%, -50%)',
          transition: 'opacity 0.3s ease',
          mixBlendMode: theme === 'dark' ? 'screen' : 'multiply',
        }}
      />

      {/* Professional Trailing Ring */}
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          border: '1px solid rgba(212, 175, 55, 0.5)',
          pointerEvents: 'none',
          zIndex: 9999,
          transform: 'translate(-50%, -50%)',
          transition: 'width 0.2s, height 0.2s',
          boxShadow: '0 0 10px rgba(212, 175, 55, 0.1)',
        }}
      />

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem 2.5rem',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(18px)',
        borderBottom: '1px solid var(--glass-border)',
      }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
          <img src="/logo.png" alt="Shortify" style={{ height: '38px', width: '38px', objectFit: 'contain', borderRadius: '8px' }} />
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: brandColor }}>Shortify</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ThemeToggle style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }} />
          <Link to="/login" style={{
            padding: '0.5rem 1.25rem', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 600,
            border: '1px solid var(--glass-border)', color: 'var(--text)', textDecoration: 'none',
            background: 'transparent', transition: 'all 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--glass-bg)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >Log In</Link>
          <Link to="/register" style={{
            padding: '0.5rem 1.25rem', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 600,
            background: 'var(--primary)', color: '#fff', textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(139,92,246,0.4)', transition: 'opacity 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >Get Started Free</Link>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', paddingTop: '10rem', paddingBottom: '6rem', textAlign: 'center', padding: '10rem 1.5rem 7rem' }}>
        {/* Glow blobs */}
        <div style={{ position: 'absolute', top: '-10%', left: '10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-5%', right: '5%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div ref={heroRef} style={{ position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.4rem 1rem', borderRadius: '9999px', marginBottom: '2rem',
            background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)',
            color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600,
          }}>
            <Zap size={14} fill="currentColor" /> Premium Link Shortening
          </div>

          <h1 style={{
            fontSize: 'clamp(2.6rem, 6vw, 5rem)', fontWeight: 900, lineHeight: 1.1,
            margin: '0 auto 1.5rem', maxWidth: '800px',
            background: 'linear-gradient(135deg, #ffffff 0%, #D4AF37 50%, #8B5CF6 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            Shorten Links.<br />Amplify Results.
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2.2vw, 1.25rem)', color: 'var(--text-muted)',
            maxWidth: '600px', margin: '0 auto 3rem', lineHeight: 1.7,
          }}>
            Shortify transforms long, ugly URLs into powerful branded links — complete with analytics,
            QR codes, custom aliases, and AI-powered insights.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.9rem 2.2rem', borderRadius: '12px', fontSize: '1rem', fontWeight: 700,
              background: 'linear-gradient(135deg, #8B5CF6, #D4AF37)',
              color: '#fff', textDecoration: 'none',
              boxShadow: '0 8px 24px rgba(139,92,246,0.35)', transition: 'transform 0.2s, box-shadow 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(139,92,246,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(139,92,246,0.35)'; }}
            >
              Start for Free <ArrowRight size={18} />
            </Link>
            <Link to="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.9rem 2.2rem', borderRadius: '12px', fontSize: '1rem', fontWeight: 600,
              background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
              color: 'var(--text)', textDecoration: 'none', transition: 'transform 0.2s',
              backdropFilter: 'blur(12px)',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Log In <ExternalLink size={16} />
            </Link>
          </div>
        </div>
      </section>



      {/* ── Features ───────────────────────────────────────────── */}
      <section style={{ padding: '2rem 1.5rem 6rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, margin: '0 0 1rem',
            background: 'linear-gradient(135deg, var(--text) 0%, #D4AF37 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            Everything You Need to Manage Links
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '550px', margin: '0 auto' }}>
            A complete toolkit built for marketers, developers, and creators.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
        }}>
          <FeatureCard icon={Link2}    color="#8B5CF6" title="Instant URL Shortening"   description="Transform any long URL into a compact, shareable link in milliseconds. No sign-up required for basic shortening." />
          <FeatureCard icon={Zap}      color="#D4AF37" title="Custom Aliases"           description="Brand your links with memorable custom slugs like /summer-sale or /product-launch instead of random codes." />
          <FeatureCard icon={BarChart3} color="#10B981" title="Deep Analytics"          description="Track clicks, devices, browsers, referrers, and geographic data. Understand exactly who clicks your links and when." />
          <FeatureCard icon={QrCode}   color="#0EA5E9" title="QR Code Generation"       description="Every shortened link gets an instant, downloadable QR code — perfect for print, packaging, and offline campaigns." />
          <FeatureCard icon={Upload}   color="#F97316" title="Bulk URL Upload"           description="Shorten hundreds of URLs at once by uploading a CSV file. Set custom aliases and expiry dates for each link." />
          <FeatureCard icon={Bot}      color="#EC4899" title="AI Chatbot Assistant"      description="Ask our AI assistant anything about your links, analytics, or how to use Shortify — answers in seconds." />
          <FeatureCard icon={Shield}   color="#14B8A6" title="Link Expiry Control"       description="Set expiry dates on links for time-limited campaigns. Expired links automatically stop redirecting." />
          <FeatureCard icon={BarChart3} color="#A78BFA" title="Public Stats Pages"      description="Share a public stats page for any of your links — great for transparency in campaigns and collaborations." />
        </div>
      </section>

      {/* ── How it Works ───────────────────────────────────────── */}
      <section style={{ padding: '2rem 1.5rem 6rem', maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{
          fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 800, marginBottom: '3rem',
          color: 'var(--text)',
        }}>Get Started in 3 Simple Steps</h2>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { step: '01', title: 'Create an Account', desc: 'Sign up free in seconds — no credit card required.' },
            { step: '02', title: 'Paste Your Long URL', desc: 'Drop any URL into the dashboard and hit Shorten.' },
            { step: '03', title: 'Share & Track', desc: 'Copy your short link, share it, and watch analytics roll in.' },
          ].map(({ step, title, desc }) => (
            <div key={step} style={{
              flex: '1 1 240px', padding: '2rem 1.5rem', borderRadius: '20px',
              background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
              backdropFilter: 'blur(12px)',
            }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#D4AF37', opacity: 0.5, marginBottom: '0.75rem' }}>{step}</div>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>{title}</h3>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────── */}
      <section style={{ padding: '2rem 1.5rem 7rem', textAlign: 'center' }}>
        <div style={{
          maxWidth: '750px', margin: '0 auto', padding: '4rem 2rem', borderRadius: '28px',
          background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(212,175,55,0.15) 100%)',
          border: '1px solid rgba(139,92,246,0.3)', backdropFilter: 'blur(20px)',
        }}>
          <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, margin: '0 0 1rem', color: 'var(--text)' }}>
            Ready to take control of your links?
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '2rem', lineHeight: 1.6 }}>
            Join Shortify today. It's free, instant, and built for power users.
          </p>

          {/* Checkmarks */}
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            {['Free forever plan', 'No credit card needed', 'Analytics included'].map(item => (
              <span key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <Check size={16} color="#10B981" /> {item}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.9rem 2.5rem', borderRadius: '12px', fontSize: '1rem', fontWeight: 700,
              background: 'linear-gradient(135deg, #8B5CF6, #D4AF37)', color: '#fff',
              textDecoration: 'none', boxShadow: '0 8px 24px rgba(139,92,246,0.35)',
              transition: 'transform 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Create Free Account <ArrowRight size={18} />
            </Link>
            <Link to="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.9rem 2rem', borderRadius: '12px', fontSize: '1rem', fontWeight: 600,
              border: '1px solid var(--glass-border)', color: 'var(--text)', textDecoration: 'none',
              background: 'transparent',
            }}>
              Already a member? Log In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid var(--glass-border)', padding: '1.75rem 2.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <img src="/logo.png" alt="Shortify" style={{ height: '28px', width: '28px', objectFit: 'contain', borderRadius: '6px' }} />
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: brandColor }}>Shortify</span>
        </div>
        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} Shortify. All rights reserved.
        </p>
        <div style={{ display: 'flex', gap: '1.25rem' }}>
          <Link to="/login"    style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'none' }}>Login</Link>
          <Link to="/register" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'none' }}>Sign Up</Link>
        </div>
      </footer>
    </div>
  );
};
