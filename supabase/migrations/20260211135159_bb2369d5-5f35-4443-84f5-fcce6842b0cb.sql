
-- Create taxes table for DARFs and tax documents
CREATE TABLE public.taxes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  tax_date DATE NOT NULL,
  due_date DATE NOT NULL,
  paid BOOLEAN NOT NULL DEFAULT false,
  paid_at TIMESTAMP WITH TIME ZONE,
  receipt_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.taxes ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Allowed users can read taxes"
ON public.taxes FOR SELECT
USING (is_allowed_user((auth.jwt() ->> 'email'::text)));

CREATE POLICY "Managers and admins can insert taxes"
ON public.taxes FOR INSERT
WITH CHECK (get_user_role((auth.jwt() ->> 'email'::text)) = ANY (ARRAY['admin'::app_role, 'manager'::app_role]));

CREATE POLICY "Managers and admins can update taxes"
ON public.taxes FOR UPDATE
USING (get_user_role((auth.jwt() ->> 'email'::text)) = ANY (ARRAY['admin'::app_role, 'manager'::app_role]));

CREATE POLICY "Admins can delete taxes"
ON public.taxes FOR DELETE
USING (is_admin((auth.jwt() ->> 'email'::text)));

-- Trigger for updated_at
CREATE TRIGGER update_taxes_updated_at
BEFORE UPDATE ON public.taxes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
