-- Safari Map Interactions - Queries and RLS Policies
-- This file contains the database configuration for safari_map_interactions tracking

-- ============================================================================
-- 1. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on safari_map_interactions table
ALTER TABLE safari_map_interactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can INSERT their own interactions
CREATE POLICY safari_map_interactions_insert_policy ON safari_map_interactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can SELECT their own interactions, authenticated users can see all for analytics
CREATE POLICY safari_map_interactions_select_policy ON safari_map_interactions
  FOR SELECT
  USING (
    auth.uid() = user_id OR  -- Users can see their own
    true  -- Authenticated users can see all (for analytics), remove "OR true" if you want stricter privacy
  );

-- Policy: Users can DELETE their own interactions
CREATE POLICY safari_map_interactions_delete_policy ON safari_map_interactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Policy: Only admins can UPDATE (restrict modifications)
CREATE POLICY safari_map_interactions_update_policy ON safari_map_interactions
  FOR UPDATE
  USING (false)  -- Prevents all updates; remove this if admins need to update
  WITH CHECK (false);

-- ============================================================================
-- 2. INDEXES FOR PERFORMANCE
-- ============================================================================

-- Composite index for efficient queries on user_id and created_at
CREATE INDEX IF NOT EXISTS idx_safari_interactions_user_created 
ON safari_map_interactions(user_id, created_at DESC);

-- Index for location popularity queries
CREATE INDEX IF NOT EXISTS idx_safari_interactions_location_created 
ON safari_map_interactions(location_id, created_at DESC);

-- Index for filtering by interaction type
CREATE INDEX IF NOT EXISTS idx_safari_interactions_type_created 
ON safari_map_interactions(interaction_type, created_at DESC);

-- ============================================================================
-- 3. UTILITY FUNCTIONS AND QUERIES
-- ============================================================================

-- Function: Get user's interaction history
CREATE OR REPLACE FUNCTION get_user_interaction_history(
  p_user_id UUID,
  p_limit INT DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  location_id UUID,
  interaction_type TEXT,
  metadata JSONB,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    smi.id,
    smi.location_id,
    smi.interaction_type,
    smi.metadata,
    smi.created_at
  FROM safari_map_interactions smi
  WHERE smi.user_id = p_user_id
  ORDER BY smi.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function: Get interaction statistics by type
CREATE OR REPLACE FUNCTION get_interaction_statistics(
  p_days INT DEFAULT 7
)
RETURNS TABLE (
  interaction_type TEXT,
  count BIGINT,
  unique_users BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    smi.interaction_type,
    COUNT(*) as count,
    COUNT(DISTINCT smi.user_id) as unique_users
  FROM safari_map_interactions smi
  WHERE smi.created_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY smi.interaction_type
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

-- Function: Get location view count
CREATE OR REPLACE FUNCTION get_location_view_count(
  p_location_id UUID
)
RETURNS BIGINT AS $$
DECLARE
  view_count BIGINT;
BEGIN
  SELECT COUNT(*)
  INTO view_count
  FROM safari_map_interactions
  WHERE location_id = p_location_id
  AND interaction_type IN ('view', 'click', 'info_opened');
  
  RETURN COALESCE(view_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Function: Get user's booking conversions (clicked to booking)
CREATE OR REPLACE FUNCTION get_user_booking_funnel(
  p_user_id UUID
)
RETURNS TABLE (
  total_views BIGINT,
  total_clicks BIGINT,
  total_bookings BIGINT,
  conversion_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH interaction_counts AS (
    SELECT 
      COUNT(CASE WHEN interaction_type = 'view' THEN 1 END) as views,
      COUNT(CASE WHEN interaction_type = 'click' THEN 1 END) as clicks,
      COUNT(CASE WHEN interaction_type = 'booking_initiated' THEN 1 END) as bookings
    FROM safari_map_interactions
    WHERE user_id = p_user_id
  )
  SELECT 
    views,
    clicks,
    bookings,
    CASE 
      WHEN bookings = 0 OR views = 0 THEN 0
      ELSE ROUND((bookings::NUMERIC / views::NUMERIC) * 100, 2)
    END as conversion_rate
  FROM interaction_counts;
END;
$$ LANGUAGE plpgsql;

-- Function: Get trending locations (most interactions in last N days)
CREATE OR REPLACE FUNCTION get_trending_locations(
  p_days INT DEFAULT 7,
  p_limit INT DEFAULT 10
)
RETURNS TABLE (
  location_id UUID,
  location_name TEXT,
  interaction_count BIGINT,
  unique_users BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    smi.location_id,
    sl.name,
    COUNT(*) as interaction_count,
    COUNT(DISTINCT smi.user_id) as unique_users
  FROM safari_map_interactions smi
  JOIN safari_locations sl ON smi.location_id = sl.id
  WHERE smi.created_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY smi.location_id, sl.name
  ORDER BY interaction_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function: Get user's favorite locations (most visited)
CREATE OR REPLACE FUNCTION get_user_favorite_locations(
  p_user_id UUID,
  p_limit INT DEFAULT 5
)
RETURNS TABLE (
  location_id UUID,
  location_name TEXT,
  visit_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    smi.location_id,
    sl.name,
    COUNT(*) as visit_count
  FROM safari_map_interactions smi
  JOIN safari_locations sl ON smi.location_id = sl.id
  WHERE smi.user_id = p_user_id
  AND smi.interaction_type IN ('view', 'click', 'info_opened')
  GROUP BY smi.location_id, sl.name
  ORDER BY visit_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function: Get interactions by location (for analytics)
CREATE OR REPLACE FUNCTION get_location_interactions(
  p_location_id UUID,
  p_interaction_type TEXT DEFAULT NULL,
  p_limit INT DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  interaction_type TEXT,
  metadata JSONB,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    smi.id,
    smi.user_id,
    smi.interaction_type,
    smi.metadata,
    smi.created_at
  FROM safari_map_interactions smi
  WHERE smi.location_id = p_location_id
  AND (p_interaction_type IS NULL OR smi.interaction_type = p_interaction_type)
  ORDER BY smi.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: User engagement summary
CREATE OR REPLACE VIEW user_engagement_summary AS
SELECT 
  user_id,
  COUNT(*) as total_interactions,
  COUNT(DISTINCT location_id) as locations_visited,
  COUNT(CASE WHEN interaction_type = 'booking_initiated' THEN 1 END) as booking_attempts,
  MAX(created_at) as last_activity,
  DATE(MAX(created_at)) as last_activity_date
FROM safari_map_interactions
GROUP BY user_id;

-- View: Location engagement summary
CREATE OR REPLACE VIEW location_engagement_summary AS
SELECT 
  sl.id as location_id,
  sl.name as location_name,
  sl.region,
  COUNT(smi.id) as total_interactions,
  COUNT(DISTINCT smi.user_id) as unique_visitors,
  COUNT(CASE WHEN smi.interaction_type = 'view' THEN 1 END) as view_count,
  COUNT(CASE WHEN smi.interaction_type = 'click' THEN 1 END) as click_count,
  COUNT(CASE WHEN smi.interaction_type = 'hover' THEN 1 END) as hover_count,
  COUNT(CASE WHEN smi.interaction_type = 'info_opened' THEN 1 END) as info_opened_count,
  COUNT(CASE WHEN smi.interaction_type = 'booking_initiated' THEN 1 END) as booking_count,
  ROUND(
    COUNT(CASE WHEN smi.interaction_type = 'booking_initiated' THEN 1 END)::NUMERIC / 
    NULLIF(COUNT(CASE WHEN smi.interaction_type = 'view' THEN 1 END), 0) * 100, 
    2
  ) as booking_conversion_rate,
  MAX(smi.created_at) as last_interaction
FROM safari_locations sl
LEFT JOIN safari_map_interactions smi ON sl.id = smi.location_id
GROUP BY sl.id, sl.name, sl.region;

-- View: Daily interaction trends
CREATE OR REPLACE VIEW daily_interaction_trends AS
SELECT 
  DATE(created_at) as date,
  interaction_type,
  COUNT(*) as count,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT location_id) as unique_locations
FROM safari_map_interactions
GROUP BY DATE(created_at), interaction_type
ORDER BY date DESC, interaction_type;

-- View: Interaction funnel (views to bookings)
CREATE OR REPLACE VIEW interaction_funnel AS
SELECT 
  location_id,
  COUNT(CASE WHEN interaction_type = 'view' THEN 1 END) as views,
  COUNT(CASE WHEN interaction_type = 'click' THEN 1 END) as clicks,
  COUNT(CASE WHEN interaction_type = 'info_opened' THEN 1 END) as info_opens,
  COUNT(CASE WHEN interaction_type = 'booking_initiated' THEN 1 END) as bookings,
  ROUND(
    COUNT(CASE WHEN interaction_type = 'booking_initiated' THEN 1 END)::NUMERIC / 
    NULLIF(COUNT(CASE WHEN interaction_type = 'view' THEN 1 END), 0) * 100, 
    2
  ) as conversion_rate_percent
FROM safari_map_interactions
GROUP BY location_id;

-- ============================================================================
-- 5. GRANT PERMISSIONS
-- ============================================================================

-- Grant read access to functions
GRANT EXECUTE ON FUNCTION get_user_interaction_history TO authenticated;
GRANT EXECUTE ON FUNCTION get_interaction_statistics TO authenticated;
GRANT EXECUTE ON FUNCTION get_location_view_count TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_booking_funnel TO authenticated;
GRANT EXECUTE ON FUNCTION get_trending_locations TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_favorite_locations TO authenticated;
GRANT EXECUTE ON FUNCTION get_location_interactions TO authenticated;

-- Grant view access
GRANT SELECT ON user_engagement_summary TO authenticated;
GRANT SELECT ON location_engagement_summary TO authenticated;
GRANT SELECT ON daily_interaction_trends TO authenticated;
GRANT SELECT ON interaction_funnel TO authenticated;

-- Grant table access for edge function
GRANT INSERT, SELECT ON safari_map_interactions TO authenticated;
GRANT SELECT ON safari_locations TO authenticated;

-- ============================================================================
-- 6. EXAMPLE QUERIES FOR ANALYTICS
-- ============================================================================

/*

-- Get all interactions for a specific user
SELECT * FROM get_user_interaction_history('user-uuid', 50);

-- Get interaction statistics for the last 7 days
SELECT * FROM get_interaction_statistics(7);

-- Get total views for a location
SELECT get_location_view_count('location-uuid');

-- Get user's booking conversion funnel
SELECT * FROM get_user_booking_funnel('user-uuid');

-- Get trending locations in the last 30 days
SELECT * FROM get_trending_locations(30, 10);

-- Get user's favorite locations
SELECT * FROM get_user_favorite_locations('user-uuid', 5);

-- Get all interactions for a specific location
SELECT * FROM get_location_interactions('location-uuid', 'click', 100);

-- Get location engagement summary
SELECT * FROM location_engagement_summary ORDER BY total_interactions DESC;

-- Get user engagement summary
SELECT * FROM user_engagement_summary WHERE total_interactions > 5;

-- Get daily trends
SELECT * FROM daily_interaction_trends LIMIT 30;

-- Get conversion funnel for all locations
SELECT * FROM interaction_funnel ORDER BY conversion_rate_percent DESC;

-- Get statistics by interaction type for last 7 days
SELECT * FROM get_interaction_statistics(7);

*/
