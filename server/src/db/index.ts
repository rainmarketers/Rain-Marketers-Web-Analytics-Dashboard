import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../../data.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS tokens (
      id INTEGER PRIMARY KEY,
      access_token TEXT,
      refresh_token TEXT,
      expiry INTEGER
    );

    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      ga4_property_id TEXT,
      gsc_site_url TEXT,
      website TEXT,
      contact_email TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER,
      period_start TEXT,
      period_end TEXT,
      generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id)
    );
  `);

  // Migration: Add website and notes columns if they don't exist
  try {
    db.prepare('ALTER TABLE clients ADD COLUMN website TEXT').run();
  } catch (e) {
    // Column already exists
  }
  try {
    db.prepare('ALTER TABLE clients ADD COLUMN notes TEXT').run();
  } catch (e) {
    // Column already exists
  }
}

export function getSetting(key: string): string | null {
  const result = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined;
  return result?.value ?? null;
}

export function setSetting(key: string, value: string): void {
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value);
}

export function getTokens(): { access_token: string; refresh_token: string; expiry: number } | null {
  const result = db.prepare('SELECT * FROM tokens WHERE id = 1').get() as any;
  return result ?? null;
}

export function setTokens(accessToken: string, refreshToken: string, expiry: number): void {
  db.prepare('INSERT OR REPLACE INTO tokens (id, access_token, refresh_token, expiry) VALUES (1, ?, ?, ?)').run(
    accessToken,
    refreshToken,
    expiry
  );
}

export function getClients(): any[] {
  return db.prepare('SELECT * FROM clients ORDER BY created_at DESC').all();
}

export function getClient(id: number): any {
  return db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
}

export function addClient(name: string, ga4PropertyId: string, gscSiteUrl: string, contactEmail: string, website?: string, notes?: string): number {
  const result = db.prepare('INSERT INTO clients (name, ga4_property_id, gsc_site_url, contact_email, website, notes) VALUES (?, ?, ?, ?, ?, ?)').run(
    name,
    ga4PropertyId,
    gscSiteUrl,
    contactEmail,
    website || '',
    notes || ''
  );
  return result.lastInsertRowid as number;
}

export function updateClient(id: number, name: string, ga4PropertyId: string, gscSiteUrl: string, contactEmail: string, website?: string, notes?: string): void {
  db.prepare('UPDATE clients SET name = ?, ga4_property_id = ?, gsc_site_url = ?, contact_email = ?, website = ?, notes = ? WHERE id = ?').run(
    name,
    ga4PropertyId,
    gscSiteUrl,
    contactEmail,
    website || '',
    notes || '',
    id
  );
}

export function deleteClient(id: number): void {
  db.prepare('DELETE FROM clients WHERE id = ?').run(id);
}

export default db;
