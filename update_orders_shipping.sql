-- Add shipping information columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS recipient_name text,
ADD COLUMN IF NOT EXISTS recipient_phone text,
ADD COLUMN IF NOT EXISTS shipping_address text,
ADD COLUMN IF NOT EXISTS shipping_detail_address text,
ADD COLUMN IF NOT EXISTS shipping_zipcode text,
ADD COLUMN IF NOT EXISTS shipping_memo text;
