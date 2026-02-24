
-- Create table for campaign-level data from CSV uploads
CREATE TABLE public.ad_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_performance_id UUID NOT NULL REFERENCES public.ad_performance(id) ON DELETE CASCADE,
  campaign_name TEXT NOT NULL,
  status TEXT,
  budget TEXT,
  sales INTEGER DEFAULT 0,
  cpa NUMERIC DEFAULT 0,
  spend NUMERIC DEFAULT 0,
  revenue NUMERIC DEFAULT 0,
  profit NUMERIC DEFAULT 0,
  roas NUMERIC DEFAULT 0,
  margin TEXT,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ctr TEXT,
  cpc NUMERIC DEFAULT 0,
  cpm NUMERIC DEFAULT 0,
  hook TEXT,
  frequency TEXT,
  conv_checkout TEXT,
  conv_body TEXT,
  rejected_sales INTEGER DEFAULT 0,
  ic INTEGER DEFAULT 0,
  cpi NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;

-- RLS policies - same pattern as ad_performance
CREATE POLICY "Allowed users can view ad_campaigns"
  ON public.ad_campaigns FOR SELECT
  USING (public.is_allowed_user(auth.jwt()->>'email'));

CREATE POLICY "Admin and manager can insert ad_campaigns"
  ON public.ad_campaigns FOR INSERT
  WITH CHECK (public.get_user_role(auth.jwt()->>'email') IN ('admin', 'manager'));

CREATE POLICY "Admin and manager can update ad_campaigns"
  ON public.ad_campaigns FOR UPDATE
  USING (public.get_user_role(auth.jwt()->>'email') IN ('admin', 'manager'));

CREATE POLICY "Admin and manager can delete ad_campaigns"
  ON public.ad_campaigns FOR DELETE
  USING (public.get_user_role(auth.jwt()->>'email') IN ('admin', 'manager'));

-- Index for fast lookup
CREATE INDEX idx_ad_campaigns_performance_id ON public.ad_campaigns(ad_performance_id);
