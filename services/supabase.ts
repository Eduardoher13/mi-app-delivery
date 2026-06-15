import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

export function resolveSupabaseConfig() {
  const supabaseUrl = (
    Constants.expoConfig?.extra?.supabaseUrl ??
    process.env.EXPO_PUBLIC_SUPABASE_URL ??
    ''
  ).trim();

  const supabaseAnonKey = (
    Constants.expoConfig?.extra?.supabaseAnonKey ??
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
    ''
  ).trim();

  return { supabaseUrl, supabaseAnonKey };
}

export function isSupabaseConfigured(): boolean {
  const { supabaseUrl, supabaseAnonKey } = resolveSupabaseConfig();

  return (
    supabaseUrl.length > 0 &&
    supabaseAnonKey.length > 0 &&
    supabaseUrl.includes('.supabase.co') &&
    !supabaseUrl.includes('placeholder.supabase.co') &&
    !supabaseUrl.includes('TU_REF') &&
    supabaseAnonKey !== 'placeholder-anon-key' &&
    !supabaseAnonKey.includes('REEMPLAZA')
  );
}

export function getSupabaseStatus() {
  const { supabaseUrl, supabaseAnonKey } = resolveSupabaseConfig();
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] ?? null;

  return {
    configured: isSupabaseConfigured(),
    projectRef,
    keyType: supabaseAnonKey.startsWith('sb_publishable_')
      ? 'publishable'
      : supabaseAnonKey.startsWith('eyJ')
        ? 'anon-jwt'
        : 'unknown',
  };
}

export function resolveSupabaseConfigForDebug() {
  const { supabaseUrl, supabaseAnonKey } = resolveSupabaseConfig();
  const fromExtra = Boolean(Constants.expoConfig?.extra?.supabaseUrl);
  const fromEnv = Boolean(process.env.EXPO_PUBLIC_SUPABASE_URL);

  return {
    urlPreview: supabaseUrl ? `${supabaseUrl.slice(0, 35)}...` : '(vacío)',
    keyPreview: supabaseAnonKey ? `${supabaseAnonKey.slice(0, 18)}...` : '(vacío)',
    source: fromExtra ? 'app.config extra' : fromEnv ? 'process.env' : 'ninguno',
  };
}

let cachedClient: SupabaseClient | null = null;
let cachedUrl = '';
let cachedKey = '';

/**
 * Cliente fresco si cambian URL/key (evita quedarse con placeholder del primer import).
 */
export function getSupabase(): SupabaseClient {
  const { supabaseUrl, supabaseAnonKey } = resolveSupabaseConfig();

  if (
    !cachedClient ||
    cachedUrl !== supabaseUrl ||
    cachedKey !== supabaseAnonKey
  ) {
    cachedUrl = supabaseUrl;
    cachedKey = supabaseAnonKey;
    cachedClient = createClient(
      supabaseUrl || 'https://invalid.supabase.co',
      supabaseAnonKey || 'invalid-key',
    );
  }

  return cachedClient;
}

export default getSupabase;
