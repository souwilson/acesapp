-- Create table for variable expenses (day-to-day expenses)
CREATE TABLE public.variable_expenses (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 0,
    category TEXT NOT NULL DEFAULT 'other',
    date DATE NOT NULL,
    payment_method TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.variable_expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allowed users can read variable_expenses"
ON public.variable_expenses
FOR SELECT
USING (is_allowed_user((auth.jwt() ->> 'email'::text)));

CREATE POLICY "Managers and admins can insert variable_expenses"
ON public.variable_expenses
FOR INSERT
WITH CHECK (get_user_role((auth.jwt() ->> 'email'::text)) = ANY (ARRAY['admin'::app_role, 'manager'::app_role]));

CREATE POLICY "Managers and admins can update variable_expenses"
ON public.variable_expenses
FOR UPDATE
USING (get_user_role((auth.jwt() ->> 'email'::text)) = ANY (ARRAY['admin'::app_role, 'manager'::app_role]));

CREATE POLICY "Admins can delete variable_expenses"
ON public.variable_expenses
FOR DELETE
USING (is_admin((auth.jwt() ->> 'email'::text)));

-- Trigger for updated_at
CREATE TRIGGER update_variable_expenses_updated_at
BEFORE UPDATE ON public.variable_expenses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();