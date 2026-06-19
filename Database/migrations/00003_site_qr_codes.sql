-- Site QR Codes table
-- Stores QR code metadata for each site for QR-based attendance clock-in

CREATE TABLE IF NOT EXISTS site_qr_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE NOT NULL,
  site_name TEXT NOT NULL,
  location TEXT,
  qr_value TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  scans_today INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row-level security
ALTER TABLE site_qr_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org's QR codes"
  ON site_qr_codes FOR SELECT
  USING (organization_id = auth.uid()::uuid);

CREATE POLICY "Users can insert QR codes for their org"
  ON site_qr_codes FOR INSERT
  WITH CHECK (organization_id = auth.uid()::uuid);

CREATE POLICY "Users can update their org's QR codes"
  ON site_qr_codes FOR UPDATE
  USING (organization_id = auth.uid()::uuid);

CREATE POLICY "Users can delete their org's QR codes"
  ON site_qr_codes FOR DELETE
  USING (organization_id = auth.uid()::uuid);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_site_qr_codes_updated_at
  BEFORE UPDATE ON site_qr_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
