-- Add qrcode column to receptions table
ALTER TABLE public.receptions
ADD COLUMN IF NOT EXISTS qrcode TEXT;

COMMENT ON COLUMN public.receptions.qrcode IS 'Stores the encrypted QR code string for reception check-in or identification.';