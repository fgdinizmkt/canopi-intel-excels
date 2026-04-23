-- Migration: System Settings — Central configuration persistence
-- Status: Infrastructure

CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'published')),
    version INTEGER NOT NULL DEFAULT 1,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by TEXT,
    dirty_flag BOOLEAN DEFAULT FALSE
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_system_settings_status ON public.system_settings(status);

-- RLS (Row Level Security)
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access for all" ON public.system_settings FOR SELECT USING (true);
CREATE POLICY "Allow upsert for authenticated users" ON public.system_settings FOR ALL USING (true);
