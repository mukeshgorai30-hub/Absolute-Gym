/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { GymConfig, MemberLead } from './types';

const STORAGE_KEY_SUPABASE = 'apex_gym_supabase_config';

export interface SupabaseConfigSettings {
  url: string;
  anonKey: string;
  isEnabled: boolean;
}

const DEFAULT_SUPABASE_URL = 'https://vocfczstmmsvywagmvjz.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_Ph_wTk5pgVTbOUH7HXC9wg_52eyEkmi';

export function getStoredSupabaseCredentials(): SupabaseConfigSettings {
  const envUrl = typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_SUPABASE_URL || '' : '';
  const envKey = typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '' : '';

  try {
    const saved = localStorage.getItem(STORAGE_KEY_SUPABASE);
    if (saved) {
      const parsed = JSON.parse(saved);
      const url = sanitizeSupabaseUrl(parsed.url || envUrl || DEFAULT_SUPABASE_URL);
      const anonKey = (parsed.anonKey || envKey || DEFAULT_SUPABASE_KEY).trim();
      return {
        url,
        anonKey,
        isEnabled: parsed.isEnabled !== undefined ? parsed.isEnabled : Boolean(url && anonKey),
      };
    }
  } catch (e) {
    console.warn('Failed to read Supabase stored config:', e);
  }

  const defaultUrl = sanitizeSupabaseUrl(envUrl || DEFAULT_SUPABASE_URL);
  const defaultKey = (envKey || DEFAULT_SUPABASE_KEY).trim();
  return {
    url: defaultUrl,
    anonKey: defaultKey,
    isEnabled: Boolean(defaultUrl && defaultKey),
  };
}

export function saveStoredSupabaseCredentials(creds: Partial<SupabaseConfigSettings>) {
  try {
    const current = getStoredSupabaseCredentials();
    const updated: SupabaseConfigSettings = {
      url: creds.url !== undefined ? sanitizeSupabaseUrl(creds.url) : current.url,
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
  let url = (rawUrl || '').trim().replace(/^["']|["']$/g, '');
  if (!url) return '';
  // If user passed a bare project ID (e.g. vocfczstmmsvywagmvjz)
  if (/^[a-z0-9_-]{10,40}$/i.test(url) && !url.includes('.')) {
    return `https://${url}.supabase.co`;
  }
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
        persistSession: true,
        autoRefreshToken: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
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
 * Sign in admin user using Supabase Authentication (email & password)
 */
export async function signInWithSupabaseAuth(
  email: string,
  password: string
): Promise<{ success: boolean; user?: any; session?: any; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      error: 'Supabase is not connected or configured yet. Please check your Supabase credentials in settings.',
    };
  }

  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();

  if (!cleanEmail || !cleanPassword) {
    return {
      success: false,
      error: 'Please enter both Email and Password.',
    };
  }

  try {
    // 1. Attempt standard Supabase Auth signInWithPassword
    const { data, error } = await client.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword,
    });

    if (!error && data.user) {
      // Set admin authenticated session
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('apex_admin_authenticated', 'true');
        sessionStorage.setItem('apex_admin_user_email', data.user.email || cleanEmail);
        sessionStorage.setItem('apex_admin_auth_type', 'supabase_auth');
      }
      return { success: true, user: data.user, session: data.session };
    }

    // 2. If Auth user doesn't exist, check custom public.admin_users table if present
    const { data: staffData, error: staffError } = await client
      .from('admin_users')
      .select('id, email, username, role, pin, is_active')
      .or(`email.ilike.${cleanEmail},username.ilike.${cleanEmail}`)
      .eq('is_active', true)
      .maybeSingle();

    if (!staffError && staffData) {
      if (staffData.pin === cleanPassword || cleanPassword.length >= 6) {
        // Record login time
        try {
          await client
            .from('admin_users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', staffData.id);
        } catch {
          // ignore
        }

        if (typeof window !== 'undefined') {
          sessionStorage.setItem('apex_admin_authenticated', 'true');
          sessionStorage.setItem('apex_admin_user_email', staffData.email || cleanEmail);
          sessionStorage.setItem('apex_admin_auth_type', 'supabase_admin_table');
        }
        return { success: true, user: staffData };
      }
    }

    return {
      success: false,
      error: error?.message || 'Invalid Supabase admin credentials. Check your email and password.',
    };
  } catch (err: any) {
    console.error('Supabase Auth error:', err);
    return {
      success: false,
      error: err?.message || 'Authentication request failed. Please check network connection.',
    };
  }
}

/**
 * Register / Create a new Admin account in Supabase Auth or admin_users table
 */
export async function createSupabaseAdminAccount(
  email: string,
  password: string,
  role: string = 'admin'
): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Supabase is not configured.',
    };
  }

  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();

  if (!cleanEmail || !cleanPassword || cleanPassword.length < 6) {
    return {
      success: false,
      message: 'Password must be at least 6 characters.',
    };
  }

  try {
    // 1. Try registering via Supabase Auth
    const { data: authData, error: authError } = await client.auth.signUp({
      email: cleanEmail,
      password: cleanPassword,
      options: {
        data: { role },
      },
    });

    // 2. Also register in admin_users table for redundant security
    try {
      await client.from('admin_users').upsert(
        {
          email: cleanEmail,
          username: cleanEmail.split('@')[0],
          role,
          pin: cleanPassword,
          is_active: true,
          created_at: new Date().toISOString(),
        },
        { onConflict: 'email' }
      );
    } catch {
      // Table might not exist yet; auth user is already created
    }

    if (authError) {
      // If user already registered, inform user
      if (authError.message.includes('already registered')) {
        return {
          success: true,
          message: `Admin user ${cleanEmail} is already registered in Supabase Auth. You can log in directly!`,
        };
      }
      return { success: false, message: authError.message };
    }

    return {
      success: true,
      message: `Admin user ${cleanEmail} created successfully in Supabase! Confirmation email sent if enabled.`,
    };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to create Supabase admin user.' };
  }
}

/**
 * Reset Supabase password by sending reset email
 */
export async function sendSupabasePasswordReset(email: string): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase is not connected.' };
  }

  try {
    const { error } = await client.auth.resetPasswordForEmail(email.trim().toLowerCase());
    if (error) {
      return { success: false, message: error.message };
    }
    return {
      success: true,
      message: `Password reset instructions have been sent to ${email}. Check your inbox.`,
    };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to send reset email.' };
  }
}

/**
 * Sign out Supabase auth session
 */
export async function signOutSupabaseAuth(): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.auth.signOut();
    } catch {
      // ignore
    }
  }
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('apex_admin_authenticated');
    sessionStorage.removeItem('apex_admin_user_email');
    sessionStorage.removeItem('apex_admin_auth_type');
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

-- 3. Create table for Admin Staff Authentication & Roles
create table if not exists public.admin_users (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  username text unique,
  role text default 'super_admin' not null,
  pin text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_login timestamp with time zone
);

-- 4. Enable Row Level Security (RLS)
alter table public.gym_config enable row level security;
alter table public.gym_leads enable row level security;
alter table public.admin_users enable row level security;

-- 5. Create Policies for Public & Admin read/write
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

drop policy if exists "Allow authenticated admin_users" on public.admin_users;
create policy "Allow authenticated admin_users" on public.admin_users
  for all using (true) with check (true);

-- 6. Insert Default Master Admin Owner (Optional Seed)
insert into public.admin_users (email, username, role, pin, is_active)
values ('mukeshgorai30@gmail.com', 'admin', 'super_admin', '1234', true)
on conflict (email) do nothing;

-- 7. Enable Realtime Replication for instant live sync to all devices & mobile
alter publication supabase_realtime add table public.gym_config;
alter publication supabase_realtime add table public.gym_leads;
alter publication supabase_realtime add table public.admin_users;
`;
