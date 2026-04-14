-- Migration: Bloco C — Campaigns, Interactions, Play Recommendations
-- Status: Draft/Infrastructure

-- 1. Create Campaigns Table
CREATE TABLE IF NOT EXISTS public.campaigns (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('inbound', 'outbound', 'earned', 'partnership')),
    channel TEXT,
    source TEXT,
    start_date DATE,
    end_date DATE,
    budget NUMERIC,
    objective TEXT,
    target_audience TEXT,
    accounts_reached INTEGER DEFAULT 0,
    accounts_engaged INTEGER DEFAULT 0,
    signals_generated INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    performance NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Interactions Table
CREATE TABLE IF NOT EXISTS public.interactions (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL, -- FK to accounts (managed defensively)
    campaign_id TEXT, -- FK to campaigns
    interaction_type TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    date DATE NOT NULL,
    channel TEXT,
    direction TEXT CHECK (direction IN ('inbound', 'outbound')),
    initiator TEXT CHECK (initiator IN ('conta', 'empresa')),
    description TEXT,
    relevance INTEGER,
    sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
    owner TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    next_step TEXT,
    source TEXT,
    confidence INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Play Recommendations Table
CREATE TABLE IF NOT EXISTS public.play_recommendations (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL, -- FK to accounts
    play_id TEXT NOT NULL,
    play_name TEXT NOT NULL,
    play_type TEXT,
    rationale TEXT,
    key_signals TEXT[], -- Using TEXT[] for simple array of signals
    account_readiness INTEGER,
    estimated_value NUMERIC,
    timeline_weeks INTEGER,
    confidence_score INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    started_at DATE,
    success_probability INTEGER,
    next_step_description TEXT,
    next_step_owner TEXT,
    next_step_deadline DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Indices for performance
CREATE INDEX IF NOT EXISTS idx_interactions_account_id ON public.interactions(account_id);
CREATE INDEX IF NOT EXISTS idx_interactions_campaign_id ON public.interactions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_play_recs_account_id ON public.play_recommendations(account_id);

-- 5. RLS (Row Level Security) - Basic Setup
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.play_recommendations ENABLE ROW LEVEL SECURITY;

-- Allow authenticated and anon read (defensive read layer pattern)
CREATE POLICY "Allow read access for all" ON public.campaigns FOR SELECT USING (true);
CREATE POLICY "Allow read access for all" ON public.interactions FOR SELECT USING (true);
CREATE POLICY "Allow read access for all" ON public.play_recommendations FOR SELECT USING (true);
