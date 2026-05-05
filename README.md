# Agency GA4 & GSC Monthly Report Tool

A professional web dashboard for marketing agencies to generate, preview, and download branded monthly analytics reports from Google Analytics 4 and Google Search Console.

## Features

✅ **Google OAuth Authentication** - Secure login with your Google account  
✅ **Client Management** - Organize 11-50+ clients with their GA4 and GSC properties  
✅ **Automated Report Generation** - Pull live data from GA4 and GSC APIs  
✅ **Agency Branding** - Customize reports with your logo, colors, and footer  
✅ **PDF & HTML Export** - Download professional reports in multiple formats  
✅ **Monthly Analytics** - Sessions, users, pageviews, traffic sources, search performance  

## Prerequisites

- Node.js v20+ (installed)
- Google Cloud Account with:
  - Google Analytics 4 access to client properties
  - Google Search Console access to client sites
  - OAuth 2.0 credentials set up

## Quick Start

### 1. Clone the Project

```bash
cd /Users/steviefox/agency-reports
```

### 2. Set Up Google OAuth Credentials

You need to create OAuth 2.0 credentials in Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable these APIs:
   - Google Analytics Data API
   - Google Search Console API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
   - Choose **Web application**
   - Add Authorized redirect URIs: `http://localhost:3001/api/auth/callback`
   - Copy the Client ID and Client Secret

### 3. Configure Environment Variables

**Server** (`server/.env`):
```
PORT=3001
SESSION_SECRET=your-secret-key-change-in-production
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/callback
CLIENT_URL=http://localhost:3000
```

**Client** (`client/.env`):
```
VITE_API_URL=http://localhost:3001/api
```

### 4. Install Dependencies

```bash
npm run install-all
```

### 5. Start Development Server

```bash
npm run dev
```

This starts both the backend (port 3001) and frontend (port 3000) in parallel.

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Use

### 1. **Login**
   - Click "Sign in with Google"
   - Use a Google account that has access to your GA4 properties and GSC sites

### 2. **Add Clients**
   - Click "+ Add Client"
   - Enter client name, GA4 Property ID, GSC Site URL
   - Save client

### 3. **Customize Branding** (Optional)
   - Go to Settings
   - Upload agency logo
   - Set primary and secondary colors
   - Add footer text with contact info

### 4. **Generate Reports**
   - Click "Generate Report" on a client card
   - Select date range (default: current month)
   - Wait for data to load from GA4 and GSC
   - Preview report in browser

### 5. **Download Reports**
   - Click "Download as PDF" or "Download as HTML"
   - File saves to your Downloads folder
   - Send to client via email

## Report Contents

### GA4 Metrics:
- Sessions, Users, New Users, Pageviews
- Avg Session Duration, Bounce Rate
- Top 10 Pages by views
- Traffic by channel (Organic, Direct, Paid, etc.)
- Device breakdown (Mobile, Desktop, Tablet)
- Top 10 countries by sessions
- Daily trend chart

### GSC Metrics:
- Total Clicks, Impressions, Avg CTR, Avg Position
- Top 10 search queries
- Top 10 pages by clicks
- Click trend chart
- Position improvements

## Finding GA4 Property IDs and GSC Site URLs

### GA4 Property ID:
1. Go to [Google Analytics](https://analytics.google.com)
2. Select the property
3. Admin → Property Settings
4. Copy the 10-digit Property ID (NOT the Measurement ID)
5. When adding to the tool, use format: `properties/123456789`

### GSC Site URL:
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Copy the exact site URL shown (e.g., `https://example.com/`)
3. Use this exact URL when adding the client

## Project Structure

```
agency-reports/
├── server/                 # Node.js + Express API
│   ├── src/
│   │   ├── db/            # SQLite database setup
│   │   ├── routes/        # API endpoints (auth, clients, reports, settings)
│   │   ├── services/      # GA4, GSC, PDF generation
│   │   ├── middleware/    # Authentication
│   │   └── index.ts       # Express app entry point
│   ├── .env               # Server environment variables
│   └── package.json
├── client/                 # React + TypeScript + Tailwind UI
│   ├── src/
│   │   ├── pages/         # Dashboard, Clients, Reports, Settings
│   │   └── App.tsx        # Routing
│   ├── .env               # Client environment variables
│   └── package.json
└── README.md
```

## Technology Stack

- **Frontend**: React 19 + TypeScript + Tailwind CSS + Vite
- **Backend**: Node.js + Express 5 + TypeScript
- **Database**: SQLite (file-based, zero config)
- **APIs**: Google Analytics Data API, Google Search Console API
- **PDF Generation**: Puppeteer (headless Chrome)
- **Charts**: Chart.js (rendered server-side)
- **Authentication**: Google OAuth 2.0

## API Endpoints

```
POST   /api/auth/login              # Get Google OAuth URL
GET    /api/auth/callback           # OAuth callback
GET    /api/auth/status             # Check auth status
POST   /api/auth/logout             # Logout

GET    /api/clients                 # List all clients
GET    /api/clients/:id             # Get client details
POST   /api/clients                 # Add new client
PUT    /api/clients/:id             # Update client
DELETE /api/clients/:id             # Delete client

GET    /api/settings                # Get branding settings
POST   /api/settings                # Update branding settings

POST   /api/reports/generate        # Generate report (GA4 + GSC data)
POST   /api/reports/export-pdf      # Export report as PDF
POST   /api/reports/export-html     # Export report as HTML
```

## Troubleshooting

### "No authentication tokens found" error
- Make sure you've logged in with Google OAuth
- Check that your Google account has access to the GA4 property and GSC site

### "Failed to fetch GA4 data"
- Verify GA4 Property ID is correct (should be just numbers, e.g., 123456789)
- Ensure your Google account has "Viewer" access or higher to the GA4 property
- Wait 24-48 hours if property is newly created

### "Failed to fetch GSC data"
- Verify the GSC Site URL is exactly as it appears in Search Console
- Make sure your Google account has access to the site in GSC
- Property must have data (need at least a few days of clicks/impressions)

### PDF download fails
- Check that Puppeteer can access Chrome (usually automatic on Mac/Linux)
- Try downloading HTML first to verify data is correct
- If still failing, check server logs for errors

## Development

### Run tests (if added):
```bash
npm test
```

### Build for production:
```bash
npm run build
```

### Deploy:
1. Build: `npm run build`
2. Server runs on configured PORT
3. Serve static client build from `client/dist`

## License

MIT

## Support

For issues or questions:
- Check the troubleshooting section above
- Review server logs: `tail -f server/data.db` for SQLite issues
- Verify Google API credentials are correct
