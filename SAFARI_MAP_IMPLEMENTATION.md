# Safari Map Implementation Guide

## Overview

The interactive safari map feature allows users to explore Kenya's premium safari destinations, track interactions, and seamlessly book experiences. This implementation includes a complete frontend, backend services, edge functions, and database setup.

---

## Frontend Implementation

### SafariMap.tsx (`/pages/SafariMap.tsx`)

**Features:**
- Interactive grid and list view modes
- Real-time filtering by region and search terms
- Date-based availability checking
- Guest count selection
- Direct booking integration
- Location detail modal with full information
- User interaction tracking (views, clicks, hovers, booking initiations)

**Key Components:**
- Hero section with background image
- Filter section with date picker, guest selector, and search
- Dynamic location cards with images and details
- Location details modal
- Responsive grid/list views
- Real-time interaction tracking

**User Flow:**
```
1. User lands on /safari-map
2. Fills in check-in/out dates and guest count
3. Filters locations by region or searches by keyword
4. Hovers over location (tracked)
5. Clicks location to view details (tracked)
6. Reviews full location information in modal
7. Clicks "Book Now" button
8. System checks availability
9. Redirects to booking page with location data
```

---

## Backend Services

### Safari Map Service (`/services/safariMapService.ts`)

**Available Functions:**

#### 1. `fetchSafariLocations(region?: string)`
- Fetches all safari locations or by specific region
- Returns: `SafariLocation[]`

#### 2. `fetchSafariLocationById(locationId: string)`
- Fetches single location with full details
- Returns: `SafariLocation | null`

#### 3. `fetchSafariLocationsByRegion(region: string)`
- Fetches locations filtered by region
- Returns: `SafariLocation[]`

#### 4. `fetchSafariRegions()`
- Gets list of unique regions
- Returns: `string[]`

#### 5. `trackSafariMapInteraction(payload: SafariMapInteractionPayload)`
- Logs user interactions to database
- Calls edge function for recording
- Returns: `SafariMapInteraction | null`

**Example Usage:**
```typescript
import { 
  fetchSafariLocations, 
  trackSafariMapInteraction 
} from '../services/safariMapService';

// Fetch locations
const locations = await fetchSafariLocations('Rift Valley');

// Track interaction
await trackSafariMapInteraction({
  locationId: 'location-id',
  interactionType: 'click',
  metadata: { region: 'Rift Valley' }
});
```

#### 6. `searchSafariLocations(searchTerm: string)`
- Searches locations by name and description
- Returns: `SafariLocation[]`

#### 7. `getUserSafariInteractionHistory(limit?: number)`
- Gets user's interaction history
- Default limit: 50
- Returns: `SafariMapInteraction[]`

#### 8. `getPopularSafariLocations(limit?: number)`
- Gets top locations by interaction count
- Returns: `{ location: SafariLocation; interactionCount: number }[]`

#### 9. `checkLocationAvailability(locationId, checkInDate, checkOutDate)`
- Checks if location has available properties
- Returns: `boolean`

---

## Edge Function

### Safari Map Interactions Edge Function
**Path:** `/supabase/functions/safari-map-interactions/index.ts`

**Endpoint:** `POST /functions/v1/safari-map-interactions`

**Purpose:** Records user interactions with the safari map in real-time

**Request Body:**
```json
{
  "locationId": "uuid",
  "interactionType": "click|view|hover|booking_initiated|info_opened",
  "metadata": {
    "custom": "data"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "location_id": "uuid",
    "interaction_type": "click",
    "metadata": {},
    "created_at": "2026-01-26T10:00:00Z"
  }
}
```

**Features:**
- Validates interaction types
- Authenticates user via JWT token
- Logs user interaction to database
- Returns recorded interaction
- CORS enabled
- Error handling for missing fields

**Interaction Types:**
- `view` - Page/location view
- `click` - Location card click
- `hover` - Mouse hover on element
- `booking_initiated` - User clicks booking
- `info_opened` - Location details opened

---

## Database Schema

### Tables Created by SQL Setup

#### 1. `safari_locations`
```sql
id              UUID PRIMARY KEY
name            TEXT NOT NULL
region          TEXT NOT NULL
description     TEXT
image_url       TEXT
map_coordinates JSONB -- {x, y} coordinates
wildlife        TEXT[] -- Array of wildlife species
lodging         JSONB -- Array of lodging objects
best_time_to_visit TEXT
accessible_from TEXT
distance_from_nairobi TEXT
visit_count     INT
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

#### 2. `safari_map_interactions`
```sql
id              UUID PRIMARY KEY
user_id         UUID FOREIGN KEY
location_id     UUID FOREIGN KEY
interaction_type TEXT -- Check constraint
metadata        JSONB
created_at      TIMESTAMP
```

### Indexes
- `safari_locations.region`
- `safari_locations.name`
- `safari_map_interactions.user_id`
- `safari_map_interactions.location_id`
- `safari_map_interactions.created_at DESC`
- `safari_map_interactions.interaction_type`

### Functions
- `get_popular_safari_locations(limit)` - Get top locations by interaction count
- `get_safari_locations_by_region(region)` - Get locations by region
- `increment_location_visit_count(location_id)` - Update visit count

---

## Setup Instructions

### 1. Backend Setup

#### Step 1: Run SQL Setup
```bash
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Create new query
4. Copy contents from SUPABASE_SAFARI_MAP_SETUP.sql
5. Execute the query
```

This will:
- Create `safari_locations` table with sample data
- Create `safari_map_interactions` table
- Set up indexes and triggers
- Enable RLS policies
- Create utility functions

#### Step 2: Deploy Edge Function
```bash
# Deploy the edge function
supabase functions deploy safari-map-interactions

# Or use the Supabase dashboard:
# 1. Go to Edge Functions
# 2. Create new function: safari-map-interactions
# 3. Copy code from /supabase/functions/safari-map-interactions/index.ts
# 4. Deploy
```

### 2. Frontend Setup

The SafariMap component is already integrated:

#### Route is defined in App.tsx
```tsx
<Route
  path="/safari-map"
  element={
    <ProtectedRoute>
      <SafariMap />
    </ProtectedRoute>
  }
/>
```

#### Access via navigation
- Add link in Navbar to `/safari-map`
- Protected route - requires authentication

---

## Configuration & Settings

### Environment Variables
Ensure these are set in your `.env` file:
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### RLS Policies

**safari_locations:**
- All users can SELECT (read)
- Admin can INSERT/UPDATE (handled in dashboard)

**safari_map_interactions:**
- Users can INSERT their own interactions
- Users can READ all (for analytics)
- Users can DELETE their own interactions

### Rate Limiting
Consider implementing rate limiting on the edge function:
```typescript
// Add to edge function for production
const key = `safari-map-${user.id}`;
const count = await redis.incr(key);
if (count > 100) { // 100 requests per minute
  return new Response("Rate limit exceeded", { status: 429 });
}
```

---

## Analytics & Metrics

### Tracking Data Available

The system tracks:
- **Page Views** - When users visit /safari-map
- **Location Clicks** - When users click on location cards
- **Hovers** - When users hover over locations (engagement metric)
- **Bookings Initiated** - When users click "Book Now"
- **Info Opened** - When users view location details
- **User Segments** - By region, location, interaction type
- **Popularity** - Most viewed and clicked locations

### Query Examples

**Get top 10 locations by views:**
```sql
SELECT * FROM get_popular_safari_locations(10);
```

**Get user interaction history:**
```sql
SELECT * FROM safari_map_interactions
WHERE user_id = 'user-uuid'
ORDER BY created_at DESC;
```

**Get interactions by type:**
```sql
SELECT interaction_type, COUNT(*) as count
FROM safari_map_interactions
GROUP BY interaction_type;
```

**Get location visit trends:**
```sql
SELECT 
  location_id, 
  DATE(created_at) as date,
  COUNT(*) as daily_views
FROM safari_map_interactions
WHERE interaction_type = 'view'
GROUP BY location_id, DATE(created_at)
ORDER BY date DESC;
```

---

## Booking Integration

### Flow from Safari Map to Booking

When user clicks "Book Now":

1. **Availability Check**
   ```typescript
   const isAvailable = await checkLocationAvailability(
     location.id,
     checkInDate,
     checkOutDate
   );
   ```

2. **Track Booking Initiation**
   ```typescript
   await trackSafariMapInteraction({
     locationId: location.id,
     interactionType: 'booking_initiated',
     metadata: { checkInDate, checkOutDate, guests }
   });
   ```

3. **Navigate to Booking Page**
   ```typescript
   navigate('/booking', {
     state: {
       property: {
         id: location.id,
         name: location.name,
         type: 'safari',
         region: location.region,
         basePrice: location.lodging[0].pricePerNight,
         currency: 'KES',
         image: location.imageUrl,
         description: location.description
       },
       checkInDate,
       checkOutDate,
       numberOfGuests
     }
   });
   ```

---

## Types Reference

### SafariLocation
```typescript
interface SafariLocation {
  id: string;
  name: string;
  region: string;
  description: string;
  imageUrl: string;
  mapCoordinates: { x: number; y: number };
  wildlife: string[];
  lodging: SafariLocationLodging[];
  bestTimeToVisit?: string;
  accessibleFrom?: string;
  distanceFromNairobi?: string;
  visitCount?: number;
  createdAt?: string;
  updatedAt?: string;
}
```

### SafariMapInteraction
```typescript
interface SafariMapInteraction {
  id: string;
  user_id: string;
  location_id: string;
  interaction_type: 'view' | 'click' | 'hover' | 'booking_initiated' | 'info_opened';
  metadata?: Record<string, unknown>;
  created_at: string;
}
```

### SafariMapInteractionPayload
```typescript
interface SafariMapInteractionPayload {
  locationId: string;
  interactionType: 'view' | 'click' | 'hover' | 'booking_initiated' | 'info_opened';
  metadata?: Record<string, unknown>;
}
```

---

## Features & Enhancements

### Current Features
✅ Interactive location grid view
✅ List view for detailed browsing
✅ Real-time filtering by region
✅ Search functionality
✅ Date availability checking
✅ Guest count selection
✅ Location detail modal
✅ User interaction tracking
✅ Analytics-ready metrics
✅ Responsive design
✅ Accessibility support
✅ Error handling
✅ Loading states

### Future Enhancements
- Interactive map view with pinned locations
- Weather integration
- Real-time pricing updates
- User reviews and ratings
- Recommended itineraries
- Group booking discounts
- Seasonal promotions
- Integration with payment systems
- Advanced analytics dashboard
- Email notifications for availability

---

## Troubleshooting

### Issue: Edge function not recording interactions
**Solution:**
- Check Authorization header is being sent
- Verify JWT token is valid
- Check Supabase service role key in function environment

### Issue: Locations not loading
**Solution:**
- Verify SQL setup was executed completely
- Check Supabase URL and keys in .env
- Check browser console for API errors
- Verify RLS policies are correct

### Issue: Booking navigation fails
**Solution:**
- Ensure dates are selected before booking
- Check /booking route exists in App.tsx
- Verify user is authenticated
- Check router state is being passed correctly

### Issue: Interactions not tracked
**Solution:**
- Check edge function is deployed
- Verify user is authenticated
- Check network tab for edge function calls
- Verify metadata is valid JSON

---

## Performance Optimization Tips

1. **Image Optimization**
   - Use compressed images for location_url
   - Implement lazy loading on cards
   - Use WebP format where possible

2. **Database Queries**
   - Use indexes for filtering (region, name)
   - Limit interactions query results
   - Cache popular locations list

3. **Frontend Performance**
   - Use React.memo for location cards
   - Implement pagination for large result sets
   - Debounce search input
   - Virtual scrolling for list view

4. **Caching Strategy**
   - Cache locations list for 5 minutes
   - Cache regions list for 24 hours
   - Cache popular locations for 1 hour

---

## Security Considerations

1. **Authentication**
   - All interactions require valid JWT token
   - Edge function validates token before recording
   - RLS policies enforce user-specific access

2. **Validation**
   - Interaction types are validated
   - Location IDs are validated against database
   - Metadata size limits enforced

3. **Rate Limiting**
   - Consider adding rate limits to edge function
   - Implement per-user interaction limits
   - Monitor for suspicious patterns

4. **Data Privacy**
   - Interaction data is per-user (RLS enforced)
   - Aggregate analytics don't expose user data
   - GDPR compliance with deletion capabilities

---

## Support & Maintenance

### Regular Maintenance Tasks
- Monitor edge function performance
- Clean up old interaction records (>90 days)
- Update sample locations with new data
- Review analytics for performance insights
- Test booking flow monthly

### Monitoring Queries
```sql
-- Check edge function invocation count
SELECT COUNT(*) FROM safari_map_interactions;

-- Get latest interactions
SELECT * FROM safari_map_interactions 
ORDER BY created_at DESC 
LIMIT 10;

-- Check for errors in locations
SELECT name, COUNT(*) as views
FROM safari_map_interactions
WHERE location_id = 'location-uuid'
GROUP BY name;
```

---

For additional support, refer to:
- [Supabase Documentation](https://supabase.com/docs)
- [React Router Documentation](https://reactrouter.com)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
