ALTER TABLE reviews
    ADD COLUMN opinion text CHECK (opinion IS NULL OR (
        char_length(opinion) BETWEEN 1 AND 5000
        AND opinion = btrim(opinion)
        AND opinion ~ '[^[:space:]]'
    )),
    ADD COLUMN contains_spoilers boolean NOT NULL DEFAULT false;
