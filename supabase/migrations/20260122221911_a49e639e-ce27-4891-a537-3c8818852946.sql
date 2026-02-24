-- Create tables for the admin dashboard

-- Platforms table (financial platforms)
CREATE TABLE public.platforms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('bank', 'gateway', 'exchange', 'digital')),
    balance DECIMAL(15,2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'BRL',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tools table (subscriptions and fixed costs)
CREATE TABLE public.tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('ads', 'infra', 'design', 'ai', 'crm', 'other')),
    monthly_value DECIMAL(15,2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'USD',
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),
    payment_method TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Collaborators table (team members)
CREATE TABLE public.collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('freelancer', 'pj', 'fixed')),
    role TEXT NOT NULL,
    monthly_value DECIMAL(15,2) NOT NULL DEFAULT 0,
    payment_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ad performance table (ads metrics)
CREATE TABLE public.ad_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform TEXT NOT NULL CHECK (platform IN ('meta', 'google', 'twitter', 'tiktok', 'other')),
    date DATE NOT NULL,
    investment DECIMAL(15,2) NOT NULL DEFAULT 0,
    revenue DECIMAL(15,2) NOT NULL DEFAULT 0,
    sales INTEGER NOT NULL DEFAULT 0,
    roas DECIMAL(10,4) GENERATED ALWAYS AS (CASE WHEN investment > 0 THEN revenue / investment ELSE 0 END) STORED,
    cpa DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_performance ENABLE ROW LEVEL SECURITY;

-- Create public read/write policies (for single-user admin dashboard)
-- Platforms policies
CREATE POLICY "Anyone can read platforms" ON public.platforms FOR SELECT USING (true);
CREATE POLICY "Anyone can insert platforms" ON public.platforms FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update platforms" ON public.platforms FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete platforms" ON public.platforms FOR DELETE USING (true);

-- Tools policies
CREATE POLICY "Anyone can read tools" ON public.tools FOR SELECT USING (true);
CREATE POLICY "Anyone can insert tools" ON public.tools FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update tools" ON public.tools FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete tools" ON public.tools FOR DELETE USING (true);

-- Collaborators policies
CREATE POLICY "Anyone can read collaborators" ON public.collaborators FOR SELECT USING (true);
CREATE POLICY "Anyone can insert collaborators" ON public.collaborators FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update collaborators" ON public.collaborators FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete collaborators" ON public.collaborators FOR DELETE USING (true);

-- Ad performance policies
CREATE POLICY "Anyone can read ad_performance" ON public.ad_performance FOR SELECT USING (true);
CREATE POLICY "Anyone can insert ad_performance" ON public.ad_performance FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update ad_performance" ON public.ad_performance FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete ad_performance" ON public.ad_performance FOR DELETE USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_platforms_updated_at BEFORE UPDATE ON public.platforms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tools_updated_at BEFORE UPDATE ON public.tools FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_collaborators_updated_at BEFORE UPDATE ON public.collaborators FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ad_performance_updated_at BEFORE UPDATE ON public.ad_performance FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();