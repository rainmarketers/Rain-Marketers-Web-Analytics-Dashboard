# Setup Guide: Getting Google Cloud Credentials

This guide walks you through setting up your Google Cloud OAuth 2.0 credentials so the report tool can access your GA4 and Search Console data.

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account (the one that has access to your GA4 and GSC)
3. At the top, click the **Select a Project** dropdown
4. Click **New Project**
5. Enter project name: `Agency Reports` (or any name you like)
6. Click **Create**
7. Wait for the project to be created (about 30 seconds)

## Step 2: Enable Required APIs

1. In the Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for **"Google Analytics Data API"**
   - Click on it
   - Click **Enable**
3. Go back to **APIs & Services** → **Library**
4. Search for **"Google Search Console API"**
   - Click on it
   - Click **Enable**

## Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. If prompted to create an OAuth consent screen first:
   - Choose **External** user type
   - Click **Create**
   - Fill in the form:
     - App name: `Agency Reports`
     - User support email: Your email
     - Scroll down, enter your email again under Developer contact information
     - Click **Save and Continue** (skip through the other screens)
4. Back to creating the Client ID:
   - Choose **Web application**
   - Under **Authorized redirect URIs**, click **Add URI**
   - Paste: `http://localhost:3001/api/auth/callback`
   - Click **Create**

## Step 4: Save Your Credentials

A dialog will appear with your **Client ID** and **Client Secret**.

⚠️ **IMPORTANT**: Copy these values now. You won't see the secret again!

## Step 5: Add to Your Project

1. Open `server/.env` in your text editor:
   ```
   GOOGLE_CLIENT_ID=paste-your-client-id-here
   GOOGLE_CLIENT_SECRET=paste-your-client-secret-here
   ```

2. Save the file

## Step 6: Give Your Google Account Access

Make sure the Google account you're using has access to:

- **GA4 Properties**: The account must be an Editor or Viewer on each property
  - Go to [Google Analytics](https://analytics.google.com)
  - Admin → Property → Property Access Management
  - Check that your email is listed with "Editor" or "Viewer" access

- **Search Console Sites**: The account must have access
  - Go to [Google Search Console](https://search.google.com/search-console)
  - You should see your sites listed. If not, you need to add yourself.

## Step 7: Test the Setup

1. Navigate to your project folder:
   ```bash
   cd /Users/steviefox/agency-reports
   ```

2. Start the development servers:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

4. Click **Sign in with Google**

5. You should see a consent screen asking to allow the app to access your GA4 and GSC data

6. After consenting, you should be redirected to the Dashboard

## Troubleshooting

### "Invalid client" error
- Double-check that Client ID and Client Secret are correctly pasted in `.env`
- Make sure there are no extra spaces or quotes

### Can't see the login screen
- Make sure both servers started (you should see "Server running on http://localhost:3001" and "VITE..." output)
- Try clearing your browser cache
- Try a different browser or incognito window

### "Permission denied" after login
- Make sure your Google account has access to at least one GA4 property
- Check [Google Analytics](https://analytics.google.com) that you can see your properties

### OAuth popup doesn't appear
- Check browser console for errors (F12)
- Make sure you have [Client ID] set in the environment variable
- Try refreshing the page

## Next Steps

1. Once logged in, go to **Settings** to set up your agency branding (optional but recommended)
2. Go to **Dashboard** → **Add Client** to add your first client
3. You'll need the GA4 Property ID and GSC Site URL for each client

## Getting GA4 Property ID

1. Go to [Google Analytics](https://analytics.google.com)
2. Select the property
3. Click **Admin** (gear icon, bottom left)
4. Under "Property", click **Property Settings**
5. Copy the **Property ID** (10-digit number like "123456789")
6. When adding to the tool, use: `properties/123456789` (add "properties/" prefix)

## Getting GSC Site URL

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select your site
3. Copy the exact site URL shown at the top (e.g., `https://example.com/`)
4. Use this exact URL in the tool

## Need Help?

- Check that Node.js is installed: `node --version`
- Check that both client and server are running
- Review the main [README.md](README.md) for more details
