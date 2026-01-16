-- Add missing virtual account columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS vbank_num text,
ADD COLUMN IF NOT EXISTS vbank_name text,
ADD COLUMN IF NOT EXISTS vbank_holder text,
ADD COLUMN IF NOT EXISTS vbank_date timestamp with time zone;
