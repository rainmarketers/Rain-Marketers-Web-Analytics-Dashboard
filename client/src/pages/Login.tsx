import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const C = {
  navy: '#272727',
  navyLight: '#3a3a3a',
  blue: '#e3703b',
  blueLight: '#fff0e8',
  teal: '#555747',
  tealLight: '#eeeee9',
  orange: '#e3703b',
  orangeLight: '#fff0e8',
  bg: '#f0f2f5',
  white: '#ffffff',
  text: '#272727',
  muted: '#555747',
  border: '#e5e5e5',
};

const shadow = {
  card: '0 1px 3px rgba(0,0,0,0.05), 0 4px 20px rgba(0,0,0,0.06)',
  hover: '0 4px 16px rgba(0,0,0,0.10), 0 8px 32px rgba(0,0,0,0.08)',
};

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, [navigate]);

  const checkAuth = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/status`, { withCredentials: true });
      if (response.data.isAuthenticated) {
        navigate('/dashboard');
      }
    } catch {
      // Not authenticated, stay on login
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/login`, { withCredentials: true });
      window.location.href = response.data.authUrl;
    } catch (error) {
      console.error('Failed to initiate login:', error);
      alert('Failed to initiate login. Make sure the backend server is running.');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
      `}</style>

      {/* Left brand panel */}
      <div
        style={{
          flex: '0 0 45%',
          background: C.teal,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 56px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        {[200, 340, 480].map((s, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: s,
              height: s,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.05)',
              right: -s * 0.4,
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          />
        ))}

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: 52 }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 20 }}>Rain Marketers</span>
          </div>

          <h1
            style={{
              color: '#fff',
              fontSize: 38,
              fontWeight: 700,
              lineHeight: 1.2,
              marginBottom: 16,
            }}
          >
            GA4 & GSC Reporting Tool
          </h1>

          <p
            style={{
              color: 'rgba(255,255,255,0.65)',
              fontSize: 15,
              lineHeight: 1.7,
              marginBottom: 48,
            }}
          >
            Connect GA4 and Search Console. Generate branded reports in minutes.
          </p>

          {/* Features list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 48 }}>
            {[
              'Real-time GA4 & GSC data',
              'Branded PDF and HTML exports',
              'Multi-client management',
            ].map((feature, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width="20" height="20" viewBox="0 0 20 20" style={{ flexShrink: 0 }}>
                  <path
                    d="M7 10L9 12L13 8"
                    stroke="#fff"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
                  {feature}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Footer text */}
      <div style={{ position: 'absolute', bottom: 24, left: 56, color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
        © 2026 Rain Marketers. All rights reserved.
      </div>

      {/* Right form panel */}
      <div
        style={{
          flex: 1,
          background: C.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40,
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 400,
            background: C.white,
            borderRadius: 18,
            padding: '44px 40px',
            boxShadow: shadow.hover,
          }}
        >
          <h2
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: C.text,
              marginBottom: 6,
              margin: 0,
            }}
          >
            Welcome back
          </h2>
          <p
            style={{
              fontSize: 14,
              color: C.muted,
              marginBottom: 36,
              margin: '6px 0 36px 0',
            }}
          >
            Sign in to your agency dashboard
          </p>

          <button
            onClick={handleGoogleLogin}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: 9,
              border: 'none',
              background: `linear-gradient(135deg, ${C.orange}, #c45a28)`,
              color: '#fff',
              fontWeight: 700,
              fontSize: 15,
              cursor: 'pointer',
              fontFamily: 'inherit',
              boxShadow: `0 4px 14px rgba(227,112,59,0.4)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `0 6px 20px rgba(227,112,59,0.5)`;
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = `0 4px 14px rgba(227,112,59,0.4)`;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <p
            style={{
              textAlign: 'center',
              fontSize: 12,
              color: C.muted,
              marginTop: 24,
            }}
          >
            Secured by Google OAuth 2.0
          </p>
        </div>
      </div>
    </div>
  );
}
