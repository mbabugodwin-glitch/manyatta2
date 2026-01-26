-- Safari Map Implementation Setup
-- This SQL script sets up the required tables and configurations for the interactive safari map feature

-- 1. Create safari_locations table
CREATE TABLE IF NOT EXISTS safari_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  map_coordinates JSONB NOT NULL, -- { "x": number, "y": number }
  wildlife TEXT[] DEFAULT '{}',
  lodging JSONB DEFAULT '[]', -- Array of lodging objects with name, type, pricePerNight
  best_time_to_visit TEXT,
  accessible_from TEXT,
  distance_from_nairobi TEXT,
  visit_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_location_name UNIQUE(name, region)
);

-- 2. Create safari_map_interactions table for tracking user interactions
CREATE TABLE IF NOT EXISTS safari_map_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES safari_locations(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (
    interaction_type IN ('view', 'click', 'hover', 'booking_initiated', 'info_opened')
  ),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT user_location_interaction UNIQUE(user_id, location_id, interaction_type, created_at)
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_safari_locations_region ON safari_locations(region);
CREATE INDEX IF NOT EXISTS idx_safari_locations_name ON safari_locations(name);
CREATE INDEX IF NOT EXISTS idx_safari_map_interactions_user_id ON safari_map_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_safari_map_interactions_location_id ON safari_map_interactions(location_id);
CREATE INDEX IF NOT EXISTS idx_safari_map_interactions_created_at ON safari_map_interactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_safari_map_interactions_type ON safari_map_interactions(interaction_type);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE safari_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE safari_map_interactions ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for safari_locations (public read)
CREATE POLICY safari_locations_read_policy ON safari_locations
  FOR SELECT
  USING (true);

CREATE POLICY safari_locations_insert_policy ON safari_locations
  FOR INSERT
  WITH CHECK (true); -- Admin only in practice; consider adding auth checks

CREATE POLICY safari_locations_update_policy ON safari_locations
  FOR UPDATE
  USING (true) -- Admin only in practice
  WITH CHECK (true);

-- 6. Create RLS policies for safari_map_interactions
CREATE POLICY safari_map_interactions_insert_policy ON safari_map_interactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY safari_map_interactions_read_policy ON safari_map_interactions
  FOR SELECT
  USING (auth.uid() = user_id OR true); -- Users can see their own or public interactions

CREATE POLICY safari_map_interactions_delete_policy ON safari_map_interactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- 7. Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_safari_locations_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger for safari_locations
DROP TRIGGER IF EXISTS safari_locations_updated_at_trigger ON safari_locations;
CREATE TRIGGER safari_locations_updated_at_trigger
BEFORE UPDATE ON safari_locations
FOR EACH ROW
EXECUTE FUNCTION update_safari_locations_timestamp();

-- 9. Create function to get popular locations
CREATE OR REPLACE FUNCTION get_popular_safari_locations(p_limit INT DEFAULT 10)
RETURNS TABLE (
  location_id UUID,
  location_name TEXT,
  region TEXT,
  interaction_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sl.id,
    sl.name,
    sl.region,
    COUNT(smi.id) as interaction_count
  FROM safari_locations sl
  LEFT JOIN safari_map_interactions smi ON sl.id = smi.location_id
  GROUP BY sl.id, sl.name, sl.region
  ORDER BY interaction_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- 10. Create function to get locations by region
CREATE OR REPLACE FUNCTION get_safari_locations_by_region(p_region TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  image_url TEXT,
  map_coordinates JSONB,
  wildlife TEXT[],
  visit_count INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sl.id,
    sl.name,
    sl.description,
    sl.image_url,
    sl.map_coordinates,
    sl.wildlife,
    sl.visit_count
  FROM safari_locations sl
  WHERE sl.region = p_region
  ORDER BY sl.name;
END;
$$ LANGUAGE plpgsql;

-- 11. Create function to increment visit count
CREATE OR REPLACE FUNCTION increment_location_visit_count(p_location_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE safari_locations
  SET visit_count = visit_count + 1,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = p_location_id;
END;
$$ LANGUAGE plpgsql;

-- 12. Insert safari locations from Safaris page itineraries
INSERT INTO safari_locations (name, region, description, image_url, map_coordinates, wildlife, lodging, best_time_to_visit, accessible_from, distance_from_nairobi)
VALUES
  (
    'Aberdare National Park',
    'Central Highlands',
    'Lush highland forest sanctuary perfect for spotting rhinos and elusive forest dwellers. The Ark offers a unique tree lodge experience where wildlife comes to a natural salt lick right below you.',
    '/assets/Curated%20Itineraries%20Images/unnamed%20(10).png',
    '{"x": 36.688, "y": -0.355}'::JSONB,
    '{"rhino", "elephant", "buffalo", "colobus_monkey", "giant_forest_hog", "bongo", "bushbuck"}',
    '[
      {"name": "The Ark Lodge", "type": "luxury", "pricePerNight": "$450-650"},
      {"name": "Aberdare Country Club", "type": "mid-range", "pricePerNight": "$250-400"}
    ]'::JSONB,
    'Year-round, best June to October',
    'Nairobi (120 km)',
    '120 km'
  ),
  (
    'Ol Pejeta Conservancy',
    'Central Highlands',
    'Premier wildlife conservancy home to the critically endangered black rhino and the only female northern white rhino on Earth. Features the award-winning Chimpanzee Sanctuary.',
    '/assets/Curated%20Itineraries%20Images/unnamed%20(10).png',
    '{"x": 36.9, "y": 0.25}'::JSONB,
    '{"rhino", "elephant", "lion", "buffalo", "giraffe", "chimpanzee", "wild_dog"}',
    '[
      {"name": "Sweetwaters Tented Camp", "type": "mid-range", "pricePerNight": "$350-500"},
      {"name": "Ol Pejeta Safari Camp", "type": "luxury", "pricePerNight": "$600-900"}
    ]'::JSONB,
    'June to October, December to March',
    'Nairobi (190 km)',
    '190 km'
  ),
  (
    'Solio Ranch',
    'Central Region',
    'Private wildlife sanctuary specializing in rhino conservation. One of Kenya''s most successful rhino breeding programs with unparalleled viewing opportunities.',
    '/assets/Curated%20Itineraries%20Images/unnamed%20(10).png',
    '{"x": 36.748, "y": -0.292}'::JSONB,
    '{"rhino", "elephant", "buffalo", "zebra", "giraffe", "warthog", "hyena"}',
    '[
      {"name": "Solio Lodge", "type": "mid-range", "pricePerNight": "$400-600"},
      {"name": "Solio Safari Lodge", "type": "luxury", "pricePerNight": "$550-800"}
    ]'::JSONB,
    'June to October, December to March',
    'Nairobi (160 km)',
    '160 km'
  ),
  (
    'Mount Kenya National Park',
    'Central Highlands',
    'Africa''s second-highest mountain offering diverse ecosystems from dense forests to alpine zones. Iconic for mountain climbing and unique forest wildlife.',
    '/assets/Curated%20Itineraries%20Images/unnamed%20(11).png',
    '{"x": 37.475, "y": 0.1587}'::JSONB,
    '{"elephant", "buffalo", "leopard", "mountain_bongo", "black_rhino", "colobus_monkey", "blue_monkey"}',
    '[
      {"name": "Fairmont Mt. Kenya", "type": "luxury", "pricePerNight": "$450-650"},
      {"name": "Mountain Rock Hotel", "type": "mid-range", "pricePerNight": "$250-400"},
      {"name": "Kirinyaga Haven", "type": "budget", "pricePerNight": "$150-300"}
    ]'::JSONB,
    'June to October, December to March',
    'Nairobi (150 km)',
    '150 km'
  ),
  (
    'Samburu National Reserve',
    'Northern Region',
    'Semi-arid reserve with unique wildlife including the endangered Somali ostrich, reticulated giraffe, and gerenuk. Home to the Special Five—species found nowhere else in Kenya. Remote and pristine safari experience.',
    '/assets/Curated%20Itineraries%20Images/unnamed%20(11).png',
    '{"x": 37.5, "y": 2.5}'::JSONB,
    '{"lion", "elephant", "giraffe", "leopard", "somali_ostrich", "gerenuk", "reticulated_giraffe", "grant_gazelle"}',
    '[
      {"name": "Samburu Serena Safari Lodge", "type": "luxury", "pricePerNight": "$500-800"},
      {"name": "Samburu Intrepids Club", "type": "mid-range", "pricePerNight": "$400-600"}
    ]'::JSONB,
    'June to October, January to February',
    'Nairobi (340 km)',
    '340 km'
  ),
  (
    'Lake Baringo',
    'Rift Valley',
    'Freshwater lake in the Northern Rift Valley teeming with birdlife and aquatic wildlife. Island camps offer unique experiences with boat rides and hot spring visits.',
    '/assets/Curated%20Itineraries%20Images/unnamed%20(12).png',
    '{"x": 35.99, "y": 0.6}'::JSONB,
    '{"hippo", "crocodile", "fish_eagle", "cormorant", "jackal", "waterbuck", "giraffe"}',
    '[
      {"name": "Island Camp Baringo", "type": "mid-range", "pricePerNight": "$250-400"}
    ]'::JSONB,
    'Year-round, best June to October',
    'Nairobi (280 km)',
    '280 km'
  ),
  (
    'Lake Bogoria',
    'Rift Valley',
    'Geothermal lake famous for hot springs and massive flamingo populations. The mineral-rich waters create stunning pink vistas against dramatic escarpment backdrops.',
    '/assets/Curated%20Itineraries%20Images/unnamed%20(12).png',
    '{"x": 35.95, "y": 0.27}'::JSONB,
    '{"flamingo", "greater_kudu", "buffalo", "lion", "cheetah", "jackal", "warthog"}',
    '[
      {"name": "Lake Bogoria Resort Club", "type": "mid-range", "pricePerNight": "$200-350"}
    ]'::JSONB,
    'June to October, December to March',
    'Nairobi (220 km)',
    '220 km'
  ),
  (
    'Meru National Park',
    'Eastern Region',
    'Remote and pristine park known for successful rhino reintroduction. Home to Elsa''s story (the famous lioness from "Born Free"). Features dramatic rock formations (kopjes) and diverse wildlife.',
    '/assets/Curated%20Itineraries%20Images/unnamed%20(12).png',
    '{"x": 38.35, "y": 0.5}'::JSONB,
    '{"rhino", "lion", "elephant", "buffalo", "giraffe", "leopard", "gerenuk", "kudu"}',
    '[
      {"name": "Elsa''s Kopje", "type": "luxury", "pricePerNight": "$500-750"},
      {"name": "Meru National Park Lodge", "type": "mid-range", "pricePerNight": "$300-450"}
    ]'::JSONB,
    'June to October, January to March',
    'Nairobi (340 km)',
    '340 km'
  );

-- Grant permissions
GRANT SELECT ON safari_locations TO anon, authenticated;
GRANT SELECT, INSERT, DELETE ON safari_map_interactions TO authenticated;
