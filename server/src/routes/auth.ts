import express, { Request, Response } from 'express';
import { google } from 'googleapis';
import { setTokens, getTokens, setSetting } from '../db/index';

const router = express.Router();

const scopes = [
  'https://www.googleapis.com/auth/analytics.readonly',
  'https://www.googleapis.com/auth/webmasters.readonly',
];

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

router.get('/login', (req: Request, res: Response) => {
  const oauth2Client = getOAuth2Client();
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });
  res.json({ authUrl });
});

router.get('/callback', async (req: Request, res: Response) => {
  const { code } = req.query;

  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code as string);
    console.log('Tokens received:', JSON.stringify(tokens, null, 2));

    const access_token = tokens.access_token;
    const refresh_token = tokens.refresh_token || '';
    const expiry_date = tokens.expiry_date || tokens.expiryDate || tokens.exp;

    if (access_token && expiry_date) {
      setTokens(access_token, refresh_token, expiry_date);
      (req.session as any).userId = 'agency_owner';
      setSetting('authenticated', 'true');

      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          res.status(500).json({ error: 'Failed to save session' });
        } else {
          res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard`);
        }
      });
    } else {
      console.error('Missing token fields:', {
        has_access_token: !!access_token,
        has_refresh_token: !!refresh_token,
        has_expiry_date: !!expiry_date,
        tokens_keys: Object.keys(tokens),
      });
      res.status(400).json({ error: 'Failed to get tokens' });
    }
  } catch (error) {
    console.error('OAuth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

router.get('/status', (req: Request, res: Response) => {
  const isAuthenticated = !!((req.session as any)?.userId);
  res.json({ isAuthenticated });
});

router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: 'Logout failed' });
    } else {
      res.json({ success: true });
    }
  });
});

export default router;
