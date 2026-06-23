-- Artisan Records
CREATE TABLE IF NOT EXISTS artisans (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    trade       VARCHAR(100) NOT NULL DEFAULT '',
    phone       VARCHAR(50) NOT NULL DEFAULT '',
    email       VARCHAR(255) NOT NULL DEFAULT '',
    site        VARCHAR(255) NOT NULL DEFAULT '',
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_artisans_trade ON artisans(trade);
CREATE INDEX IF NOT EXISTS idx_artisans_site ON artisans(site);
CREATE INDEX IF NOT EXISTS idx_artisans_active ON artisans(is_active);
