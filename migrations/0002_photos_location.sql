ALTER TABLE photos ADD COLUMN lat  REAL;
ALTER TABLE photos ADD COLUMN lng  REAL;
CREATE INDEX idx_photos_location ON photos(lat, lng) WHERE lat IS NOT NULL;
