-- Add cash receipt columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS cash_receipt_number text,
ADD COLUMN IF NOT EXISTS cash_receipt_type text; -- 'personal' or 'business'
