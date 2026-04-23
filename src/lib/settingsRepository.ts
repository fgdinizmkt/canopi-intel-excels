import { supabase, isSupabaseConfigured } from './supabaseClient';

export interface SystemSetting {
  key: string;
  data: any;
  status: 'draft' | 'pending_review' | 'published';
  version: number;
  updated_at?: string;
  updated_by?: string;
  dirty_flag?: boolean;
}

/**
 * getSettings: Read configuration block from Supabase
 */
export async function getSettings(key: string): Promise<SystemSetting | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await supabase!
      .from('system_settings')
      .select('*')
      .eq('key', key)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.warn(`[Settings Repository] Error reading ${key}:`, error.message);
      }
      return null;
    }

    return data as SystemSetting;
  } catch (exception) {
    console.error(`[Settings Repository] Exception reading ${key}:`, exception);
    return null;
  }
}

/**
 * getAllSettings: Read all configuration blocks
 */
export async function getAllSettings(): Promise<SystemSetting[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const { data, error } = await supabase!
      .from('system_settings')
      .select('*');

    if (error) {
      console.warn('[Settings Repository] Error reading all settings:', error.message);
      return [];
    }

    return data as SystemSetting[];
  } catch (exception) {
    console.error('[Settings Repository] Exception reading all settings:', exception);
    return [];
  }
}

/**
 * saveSettings: Persist configuration block in Supabase
 */
export async function saveSettings(setting: SystemSetting): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  try {
    const payload = {
      ...setting,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase!
      .from('system_settings')
      .upsert(payload, { onConflict: 'key' });

    if (error) {
      console.warn(`[Settings Repository] Error saving ${setting.key}:`, error.message);
      return false;
    }

    console.info(`[Settings Repository] Saved setting: ${setting.key} (${setting.status})`);
    return true;
  } catch (exception) {
    console.error(`[Settings Repository] Exception saving ${setting.key}:`, exception);
    return false;
  }
}
