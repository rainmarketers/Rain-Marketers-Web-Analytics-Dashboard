import express, { Request, Response } from 'express';
import { getClients, getClient, addClient, updateClient, deleteClient } from '../db/index';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);

router.get('/', (req: Request, res: Response) => {
  try {
    const clients = getClients();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const client = getClient(parseInt(req.params.id));
    if (!client) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch client' });
  }
});

router.post('/', (req: Request, res: Response) => {
  try {
    const name = req.body.name;
    const ga4PropertyId = req.body.ga4PropertyId || req.body.ga4_property_id;
    const gscSiteUrl = req.body.gscSiteUrl || req.body.gsc_site_url;
    const contactEmail = req.body.contactEmail || req.body.contact_email || '';
    const website = req.body.website || '';
    const notes = req.body.notes || '';

    if (!name || !ga4PropertyId || !gscSiteUrl) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const id = addClient(name, ga4PropertyId, gscSiteUrl, contactEmail, website, notes);
    const client = getClient(id);
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create client' });
  }
});

router.put('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const name = req.body.name;
    const ga4PropertyId = req.body.ga4PropertyId || req.body.ga4_property_id;
    const gscSiteUrl = req.body.gscSiteUrl || req.body.gsc_site_url;
    const contactEmail = req.body.contactEmail || req.body.contact_email || '';
    const website = req.body.website || '';
    const notes = req.body.notes || '';

    if (!name || !ga4PropertyId || !gscSiteUrl) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    updateClient(id, name, ga4PropertyId, gscSiteUrl, contactEmail, website, notes);
    const client = getClient(id);
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update client' });
  }
});

router.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    deleteClient(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

export default router;
