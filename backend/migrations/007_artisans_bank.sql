-- Add bank account details to artisans
ALTER TABLE artisans ADD COLUMN IF NOT EXISTS bank_name          VARCHAR(255) NOT NULL DEFAULT '';
ALTER TABLE artisans ADD COLUMN IF NOT EXISTS account_number     VARCHAR(50)  NOT NULL DEFAULT '';
ALTER TABLE artisans ADD COLUMN IF NOT EXISTS account_holder_name VARCHAR(255) NOT NULL DEFAULT '';
