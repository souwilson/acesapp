-- Create table to track dismissed/paid alerts
CREATE TABLE public.dismissed_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_key TEXT NOT NULL UNIQUE,
  dismissed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  dismissed_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dismissed_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies - all authenticated users can view and manage dismissed alerts
CREATE POLICY "Authenticated users can view dismissed alerts"
  ON public.dismissed_alerts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert dismissed alerts"
  ON public.dismissed_alerts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete dismissed alerts"
  ON public.dismissed_alerts
  FOR DELETE
  TO authenticated
  USING (true);