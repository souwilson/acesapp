-- Add reimbursement fields to variable_expenses
ALTER TABLE public.variable_expenses
ADD COLUMN is_reimbursement boolean NOT NULL DEFAULT false,
ADD COLUMN receipt_url text,
ADD COLUMN reimbursement_status text DEFAULT 'pending' CHECK (reimbursement_status IN ('pending', 'paid'));

-- Create storage bucket for receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for receipts bucket
CREATE POLICY "Allowed users can view receipts"
ON storage.objects FOR SELECT
USING (bucket_id = 'receipts' AND is_allowed_user((auth.jwt() ->> 'email'::text)));

CREATE POLICY "Managers and admins can upload receipts"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'receipts' AND get_user_role((auth.jwt() ->> 'email'::text)) IN ('admin', 'manager'));

CREATE POLICY "Managers and admins can update receipts"
ON storage.objects FOR UPDATE
USING (bucket_id = 'receipts' AND get_user_role((auth.jwt() ->> 'email'::text)) IN ('admin', 'manager'));

CREATE POLICY "Admins can delete receipts"
ON storage.objects FOR DELETE
USING (bucket_id = 'receipts' AND is_admin((auth.jwt() ->> 'email'::text)));