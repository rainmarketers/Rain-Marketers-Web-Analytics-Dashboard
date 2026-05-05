import express, { Request, Response } from 'express';
import { getSetting, setSetting } from '../db/index';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);

router.get('/', (req: Request, res: Response) => {
  try {
    const settings = {
      agencyName: getSetting('agency_name') || '',
      primaryColor: getSetting('primary_color') || '#3B82F6',
      secondaryColor: getSetting('secondary_color') || '#1F2937',
      logo: getSetting('logo_base64') || null,
      footerText: getSetting('footer_text') || '',
    };
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.post('/', (req: Request, res: Response) => {
  try {
    const { agencyName, primaryColor, secondaryColor, logo, footerText } = req.body;

    if (agencyName) setSetting('agency_name', agencyName);
    if (primaryColor) setSetting('primary_color', primaryColor);
    if (secondaryColor) setSetting('secondary_color', secondaryColor);
    if (logo) setSetting('logo_base64', logo);
    if (footerText) setSetting('footer_text', footerText);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
