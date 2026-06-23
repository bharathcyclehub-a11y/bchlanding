/**
 * Create / promote a Supabase admin user.
 *
 * Usage:
 *   node scripts/create-admin.mjs <email> <password>
 *
 * Reads SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from .env.local.
 * If the user already exists, it is promoted to admin (app_metadata.role=admin)
 * and its password is reset to the one provided.
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env.local
const envPath = path.resolve(__dirname, '..', '.env.local');
const env = {};
try {
  fs.readFileSync(envPath, 'utf-8').split('\n').forEach((line) => {
    const t = line.trim();
    if (!t || t.startsWith('#')) return;
    const i = t.indexOf('=');
    if (i === -1) return;
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    env[t.slice(0, i).trim()] = v;
  });
} catch {
  console.error('❌ Could not read .env.local');
  process.exit(1);
}

const url = env.SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('❌ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing in .env.local');
  process.exit(1);
}

const [email, password] = process.argv.slice(2);
if (!email || !password) {
  console.error('Usage: node scripts/create-admin.mjs <email> <password>');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

const { data: list } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
const existing = list.users.find((u) => (u.email || '').toLowerCase() === email.toLowerCase());

if (existing) {
  const { error } = await supabase.auth.admin.updateUserById(existing.id, {
    password,
    app_metadata: { role: 'admin', admin: true },
  });
  if (error) { console.error('❌', error.message); process.exit(1); }
  console.log(`✅ Promoted existing user to admin: ${email} (${existing.id})`);
} else {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role: 'admin', admin: true },
  });
  if (error) { console.error('❌', error.message); process.exit(1); }
  console.log(`✅ Created admin user: ${email} (${data.user.id})`);
}
