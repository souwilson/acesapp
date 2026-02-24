-- Create withdrawals table for tracking PJ to PF transfers
CREATE TABLE public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount NUMERIC NOT NULL DEFAULT 0,
  date DATE NOT NULL,
  reason TEXT NOT NULL,
  destination TEXT NOT NULL DEFAULT 'Pessoa Física',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- RLS policies for withdrawals (authenticated users only)
CREATE POLICY "Authenticated users can read withdrawals"
  ON public.withdrawals FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert withdrawals"
  ON public.withdrawals FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update withdrawals"
  ON public.withdrawals FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete withdrawals"
  ON public.withdrawals FOR DELETE
  TO authenticated
  USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_withdrawals_updated_at
  BEFORE UPDATE ON public.withdrawals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();