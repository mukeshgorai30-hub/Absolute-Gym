/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { GymConfig, MemberLead } from './types';

const STORAGE_KEY_SUPABASE = 'apex_gym_supabase_config';

export interface SupabaseConfigSettings {
  url: string;
  anonKey: string;
  isEnabled: boolean;
}

export function getStoredSupabaseCredentials(): SupabaseConfigSettings {
  const envUrl = typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_SUPABASE_URL || '' : '';
  const envKey = typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '' : '';

  try {
    const saved = localStorage.getItem(STORAGE_KEY_SUPABASE);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        url: (parsed.url || envUrl || '').trim(),
        anonKey: (parsed.anonKey || envKey || '').trim(),
        isEnabled: parsed.isEnabled !== undefined ? parsed.isEnabled : Boolean(parsed.url || envUrl),
      };
    }
  } catch (e) {
    console.warn('Failed to read Supabase stored config:', e);
  }

  return {
    url: envUrl.trim(),
    anonKey: envKey.trim(),
    isEnabled: Boolean(envUrl && envKey),
  };
}

export function saveStoredSupabaseCredentials(creds: Partial<SupabaseConfigSettings>) {
  try {
    const current = getStoredSupabaseCredentials();
    const updated: SupabaseConfigSettings = {
      url: creds.url !== undefined ? creds.url.trim() : current.url,
      anonKey: creds.anonKey !== undefined ? creds.anonKey.trim() : current.anonKey,
      isEnabled: creds.isEnabled !== undefined ? creds.isEnabled : current.isEnabled,
    };
    localStorage.setItem(STORAGE_KEY_SUPABASE, JSON.stringify(updated));
    // Clear cached client
    cachedClient = null;
    lastClientKey = '';
    return updated;
  } catch (e) {
    console.error('Failed to save Supabase credentials:', e);
    return null;
  }
}

let cachedClient: SupabaseClient | null = null;
let lastClientKey = '';

export function sanitizeSupabaseUrl(rawUrl: string): string {
  let url = rawUrl.trim();
  if (!url) return '';
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  return url.replace(/\/+$/, '');
}

export function getSupabaseClient(): SupabaseClient | null {
  const creds = getStoredSupabaseCredentials();
  if (!creds.isEnabled || !creds.url || !creds.anonKey) {
    return null;
  }

  const cleanUrl = sanitizeSupabaseUrl(creds.url);
  const cleanKey = creds.anonKey.trim().replace(/^["']|["']$/g, '');

  if (!cleanUrl || !cleanKey) return null;

  const clientKey = `${cleanUrl}_${cleanKey}`;
  if (cachedClient && lastClientKey === clientKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(cleanUrl, cleanKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    lastClientKey = clientKey;
    return cachedClient;
  } catch (e) {
    console.error('Failed to initialize Supabase client:', e);
    return null;
  }
}

/**
 * Tests connection to Supabase and checks if tables exist
 */
export async function testSupabaseConnection(): Promise<{
  success: boolean;
  message: string;
  tableExists: boolean;
}> {
  const creds = getStoredSupabaseCredentials();
  if (!creds.url || !creds.anonKey) {
    return {
      success: false,
      message: 'Supabase URL or Anon Key is missing. Please enter them above.',
      tableExists: false,
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Invalid Supabase configuration URL or Key format.',
      tableExists: false,
    };
  }

  try {
    // Try querying the gym_config table
    const { data, error } = await client
      .from('gym_config')
      .select('id, updated_at')
      .limit(1);

    if (error) {
      // Check if table missing
      if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: true,
          message: 'Connected to Supabase! However, the `gym_config` table is not created yet. Please copy and run the SQL Script in Step 2 in Supabase SQL Editor.',
          tableExists: false,
        };
      }
      if (error.code === '42501' || error.message.includes('policy') || error.message.includes('permission')) {
        return {
          success: true,
          message: 'Connected to Supabase! Table exists, but permissions need updating. Please run the SQL Script in Step 2 to enable public read/write.',
          tableExists: true,
        };
      }
      return {
        success: false,
        message: `Supabase error: ${error.message}`,
        tableExists: false,
      };
    }

    return {
      success: true,
      message: 'Successfully connected to Supabase and verified `gym_config` database table!',
      tableExists: true,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Connection failed: ${err?.message || 'Network error'}`,
      tableExists: false,
    };
  }
}

/**
 * Fetch gym config from Supabase
 */
export async function fetchSupabaseConfig(): Promise<GymConfig | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('gym_config')
      .select('data, updated_at')
      .eq('id', 'main')
      .maybeSingle();

    if (error) {
      console.warn('Supabase fetch config notice:', error.message);
      return null;
    }

    if (data && data.data) {
      return data.data as GymConfig;
    }
    return null;
  } catch (err) {
    console.warn('Supabase fetchConfig exception:', err);
    return null;
  }
}

/**
 * Save gym config to Supabase
 */
export async function saveSupabaseConfig(config: GymConfig): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase client is not configured or disabled.' };

  try {
    const { error } = await client
      .from('gym_config')
      .upsert({
        id: 'main',
        data: config,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Supabase saveConfig error:', error.message);
      if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: false,
          error: 'Table `gym_config` does not exist in Supabase yet. Please run the SQL setup script in Supabase SQL editor.',
        };
      }
      if (error.code === '42501' || error.message.includes('policy') || error.message.includes('permission')) {
        return {
          success: false,
          error: 'Supabase Permission/RLS error: Run the SQL script in Step 2 in Supabase SQL editor.',
        };
      }
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error('Supabase saveConfig exception:', err);
    return { success: false, error: err?.message || 'Network error connecting to Supabase.' };
  }
}

/**
 * Fetch member leads from Supabase
 */
export async function fetchSupabaseLeads(): Promise<MemberLead[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('gym_leads')
      .select('id, data, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch leads notice:', error.message);
      return null;
    }

    if (data && Array.isArray(data)) {
      return data.map((item) => ({
        id: item.id,
        ...(item.data || {}),
        createdAt: item.data?.createdAt || item.created_at,
      }));
    }
    return null;
  } catch (err) {
    console.warn('Supabase fetchLeads exception:', err);
    return null;
  }
}

/**
 * Save single lead to Supabase
 */
export async function saveSupabaseLead(lead: MemberLead): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase is not configured' };

  try {
    const { error } = await client
      .from('gym_leads')
      .upsert({
        id: lead.id,
        data: lead,
        created_at: lead.createdAt || new Date().toISOString(),
      });

    if (error) {
      console.warn('Supabase saveLead notice:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.warn('Supabase saveLead exception:', err);
    return { success: false, error: err?.message || 'Network error' };
  }
}

export const SUPABASE_SQL_SETUP_SCRIPT = `-- ==========================================
-- ABSOLUTE GYM SUPABASE SETUP SCRIPT
-- Paste and run this in your Supabase SQL Editor:
-- (https://supabase.com/dashboard/project/_/sql)
-- ==========================================

-- 1. Create table for Gym CMS Configuration (Plans, Trainers, Schedule, Cafe, Images, etc.)
create table if not exists public.gym_config (
  id text primary key default 'main',
  data jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create table for Member Inquiries & Trial Leads
create table if not exists public.gym_leads (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable Row Level Security (RLS)
alter table public.gym_config enable row level security;
alter table public.gym_leads enable row level security;

-- 4. Create Policies for Public & Admin read/write
drop policy if exists "Allow public read gym_config" on public.gym_config;
create policy "Allow public read gym_config" on public.gym_config
  for select using (true);

drop policy if exists "Allow public insert/update gym_config" on public.gym_config;
create policy "Allow public insert/update gym_config" on public.gym_config
  for all using (true) with check (true);

drop policy if exists "Allow public read gym_leads" on public.gym_leads;
create policy "Allow public read gym_leads" on public.gym_leads
  for select using (true);

drop policy if exists "Allow public insert/update gym_leads" on public.gym_leads;
create policy "Allow public insert/update gym_leads" on public.gym_leads
  for all using (true) with check (true);

-- 5. Enable Realtime Replication for instant live sync to all devices & mobile
alter publication supabase_realtime add table public.gym_config;
alter publication supabase_realtime add table public.gym_leads;
`;
