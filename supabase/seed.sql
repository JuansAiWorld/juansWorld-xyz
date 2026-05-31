-- Seed default site settings
INSERT INTO site_settings (key, value) VALUES
  ('site_title', '"Juan''s World"'),
  ('site_description', '"AI showcase and ecosystem hub"'),
  ('theme', '"dark"')
ON CONFLICT (key) DO NOTHING;
