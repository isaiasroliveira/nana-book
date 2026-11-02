CREATE TABLE editions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    provider text NOT NULL CHECK (provider = 'google_books'),
    provider_volume_id text NOT NULL CHECK (provider_volume_id ~ '^[A-Za-z0-9_-]{1,128}$'),
    UNIQUE (provider, provider_volume_id)
);

CREATE TABLE reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES neon_auth."user" (id) ON DELETE CASCADE,
    edition_id uuid NOT NULL REFERENCES editions (id) ON DELETE RESTRICT,
    rating_units smallint NOT NULL CHECK (rating_units BETWEEN 1 AND 10),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, edition_id)
);

CREATE INDEX reviews_diary_idx ON reviews (user_id, created_at DESC, id DESC);
CREATE INDEX reviews_edition_idx ON reviews (edition_id);
