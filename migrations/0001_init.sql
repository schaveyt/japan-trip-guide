CREATE TABLE notes (
  id           TEXT PRIMARY KEY,
  entity_type  TEXT NOT NULL,
  entity_id    TEXT NOT NULL,
  body         TEXT NOT NULL,
  author       TEXT NOT NULL,
  published    INTEGER NOT NULL DEFAULT 0,
  created_at   INTEGER NOT NULL,
  updated_at   INTEGER NOT NULL
);
CREATE INDEX idx_notes_entity ON notes(entity_type, entity_id);

CREATE TABLE photos (
  id            TEXT PRIMARY KEY,
  entity_type   TEXT NOT NULL,
  entity_id     TEXT NOT NULL,
  r2_key        TEXT NOT NULL,
  mime          TEXT NOT NULL,
  width         INTEGER,
  height        INTEGER,
  bytes         INTEGER NOT NULL,
  caption       TEXT,
  author        TEXT NOT NULL,
  published     INTEGER NOT NULL DEFAULT 0,
  created_at    INTEGER NOT NULL
);
CREATE INDEX idx_photos_entity ON photos(entity_type, entity_id);
