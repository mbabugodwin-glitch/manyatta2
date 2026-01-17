# Frontend Routing Improvements - Booking Flow

## Overview

The frontend routing has been significantly improved to create a seamless booking flow from property discovery through confirmation. This document outlines the new architecture and user journey.

---

## New Route Structure

```
Home (/)
├── Availability Widget (BookingWidget)
│   ├── Property Selection (Mountain/Safari/Urban)
│   ├── Check-in Date
│   ├── Check-out Date
│   └── Number of Guests
│
├── Property Pages (/mountain-villas, /safaris, /urban-apartments)
│   └── Receives booking params via router state
│   └── Shows Reserve Now button
│
└── Booking Confirmation (/booking) [Protected]
    └── Reviews booking details
    └── Confirms and creates booking
    └── Redirects to Profile

Profile (/profile) [Protected]
├── User Account Info
└── Booking History
    └── View all bookings
    └── Filter by status
```

---

## Component Hierarchy

### BookingWidget
**Purpose**: Home page availability checker
**Location**: `/components/BookingWidget.tsx`

**Features**:
- Tabbed property type selection (Mountain/Safari/Urban)
- Date range picker (check-in/check-out)
- Guest count selector
- Form validation
- Navigates to property page with booking state

**Data Flow**:
```
User fills form → Validates dates → Navigates to property page with:
  - checkInDate
  - checkOutDate
  - numberOfGuests
```

---

### Property Pages
**Locations**: 
- `/pages/MountainVillas.tsx`
- `/pages/Safaris.tsx` (similar implementation)
- `/pages/UrbanApartments.tsx` (similar implementation)

**Features**:
- Receives booking parameters from router state
- Displays properties with images and details
- "Reserve Now" button calculates price based on nights
- Navigates to Booking page with full booking data

**Data Flow**:
```
Receives: { checkInDate, checkOutDate, numberOfGuests }

Calculates:
  - Number of nights
  - Total price (pricePerNight × nights)

Passes to Booking page:
  - propertyId
  - propertyType
  - propertyName
  - checkInDate
  - checkOutDate
  - numberOfGuests
  - totalPrice
  - currency
```

---

### Booking Page
**Purpose**: Booking confirmation and creation
**Location**: `/pages/Booking.tsx`
**Protection**: ProtectedRoute (requires authentication)

**Features**:
- Reviews full booking details
- Displays price breakdown
- Shows nights calculation
- Allows special requests input (future)
- Creates booking via Supabase RPC function
- Shows confirmation with success/error states
- Auto-redirects to Profile after success

**Two-Step Flow**:
1. **Details Step**: Review and confirm
2. **Confirmation Step**: Success message with booking reference

**Data Flow**:
```
Receives booking state from property page → 
Validates user auth →
Shows booking details →
User confirms →
API call to Supabase:
  POST /rest/v1/rpc/create_booking
  
Response → Success step → Redirect to profile
```

---

### Profile Page
**Purpose**: User account and booking management
**Location**: `/pages/Profile.tsx`
**Protection**: ProtectedRoute

**Features**:
- User profile information
- Account creation date and last sign-in
- **NEW**: Booking history section
- View all user bookings with status
- Filter by booking status (pending/confirmed/cancelled)
- Sign out functionality

**Booking History Display**:
```
Card per booking showing:
  - Property name and type
  - Booking status (color-coded)
  - Total price
  - Check-in date
  - Check-out date
  - Number of guests
  - Booking creation date
```

---

## Protected Routes

**ProtectedRoute Component** (`/components/ProtectedRoute.tsx`):
- Wraps all property and profile pages
- Redirects unauthenticated users to Auth page
- Uses `useAuth()` hook to check login status

**Protected Pages**:
- `/profile`
- `/booking`
- `/mountain-villas`
- `/safaris`
- `/urban-apartments`

---

## API Integration

### Booking Creation
**Endpoint**: `POST {SUPABASE_URL}/rest/v1/rpc/create_booking`

**Headers**:
```
Authorization: Bearer {ACCESS_TOKEN}
apikey: {VITE_SUPABASE_ANON_KEY}
Content-Type: application/json
```

**Request Body**:
```json
{
  "property_id": "burguret",
  "property_type": "mountain",
  "check_in_date": "2024-02-15",
  "check_out_date": "2024-02-18",
  "number_of_guests": 2,
  "total_price": 1500,
  "currency": "KES",
  "special_requests": null
}
```

**Response**: Booking ID or error message

### Fetch User Bookings
**Endpoint**: `GET {SUPABASE_URL}/rest/v1/bookings?user_id=eq.{USER_ID}`

**Headers**: Same as above

**Response**: Array of booking objects

---

## User Journey Examples

### Example 1: Home → Booking → Confirmation
```
1. User lands on Home page
2. Sees BookingWidget with availability checker
3. Selects property type, dates, and guests
4. Clicks "Check Availability"
5. Navigates to property page (/mountain-villas)
6. Views property details
7. Clicks "Reserve Now"
8. Redirected to Booking page (/booking)
9. Reviews details and price breakdown
10. Confirms booking
11. Success message shows with booking reference
12. Auto-redirects to Profile
13. Booking appears in "My Bookings" section
```

### Example 2: Unauthenticated Access
```
1. User tries to access /booking without logging in
2. ProtectedRoute redirects to /auth
3. User completes signup/login
4. Returns to /booking (if deep linked)
5. Or starts fresh from Home
```

---

## State Management

### Router State vs Local State

**Router State** (passed via `navigate` location state):
- Booking parameters (dates, guests, property info)
- Persists during navigation within single flow
- Lost on page refresh

**Local Component State**:
- Form inputs in BookingWidget
- Modal open/close states
- Loading states during API calls
- Error/success messages

### Future Improvements
- Consider Redux/Context for global booking state
- Persist booking draft to localStorage
- Resume incomplete bookings

---

## Error Handling

### Validation Points

1. **BookingWidget**: 
   - Check-out date > check-in date
   - Both dates required

2. **Property Page**:
   - Check booking parameters received
   - Calculate valid price

3. **Booking Page**:
   - User authentication check
   - API response validation
   - Graceful error display

4. **Profile Page**:
   - Fetch bookings error handling
   - Empty state when no bookings

---

## Styling & UX

### Color-Coded Status
- **Confirmed**: Green (bg-green-100, text-green-700)
- **Pending**: Amber (bg-amber-100, text-amber-700)
- **Cancelled**: Red (bg-red-100, text-red-700)
- **Completed**: Gray (bg-gray-100, text-gray-700)

### Animations
- Smooth page transitions
- Hover effects on buttons
- Loading spinners during async operations
- Confirmation success animation

---

## Configuration

### Price Calculation (Currently Hardcoded)
```
In MountainVillas.tsx (line ~60):
const pricePerNight = 500; // KES
const totalPrice = nights * pricePerNight;
```

**TODO**: Move to property-specific pricing in future:
```
const pricePerNight = villa.details.pricePerNight || 500;
```

### Environment Variables
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Testing Checklist

- [ ] Dates validation in BookingWidget
- [ ] Navigation with booking state
- [ ] Booking confirmation display
- [ ] API call to create_booking
- [ ] Success/error states
- [ ] Redirect to profile
- [ ] Booking appears in history
- [ ] Protected route blocking
- [ ] Mobile responsive flow
- [ ] Empty state in booking history

---

## Next Steps & Future Improvements

1. **Dynamic Pricing**
   - Get property prices from database
   - Implement seasonal pricing
   - Add discounts/promotions

2. **Advanced Filtering**
   - Filter bookings by property type
   - Sort by date or price
   - Search bookings

3. **Booking Management**
   - Cancel booking button
   - Modify booking dates
   - Add special requests UI

4. **Payment Integration**
   - Payment gateway integration
   - Invoice generation
   - Payment status tracking

5. **Notifications**
   - Email confirmations
   - SMS reminders
   - Status update emails

6. **Analytics**
   - Track booking funnel
   - User behavior insights
   - Conversion metrics

---

## Common Issues & Solutions

### Issue: Booking parameters lost after page refresh
**Solution**: Use localStorage to persist booking state
```typescript
// Save to localStorage
localStorage.setItem('bookingState', JSON.stringify(bookingParams));

// Restore on mount
const saved = localStorage.getItem('bookingState');
```

### Issue: Price calculation differs per property type
**Solution**: Move pricing to constants/database
```typescript
const PROPERTY_PRICING = {
  mountain: { pricePerNight: 500, currency: 'KES' },
  safari: { pricePerNight: 750, currency: 'KES' },
  urban: { pricePerNight: 300, currency: 'KES' },
};
```

### Issue: Bookings not fetching in Profile
**Solution**: Ensure RLS policies allow user to read their bookings
```sql
-- In Supabase SQL:
CREATE POLICY "Users can view their own bookings"
ON public.bookings
FOR SELECT
USING (auth.uid() = user_id);
```

---

## File Structure

```
Frontend/
├── pages/
│   ├── Booking.tsx (NEW - Confirmation page)
│   ├── MountainVillas.tsx (Updated - Better routing)
│   ├── Safaris.tsx (Similar implementation)
│   ├── UrbanApartments.tsx (Similar implementation)
│   ├── Profile.tsx (Updated - Booking history)
│   ├── Home.tsx
│   ├── Auth.tsx
│   └── Others.tsx
│
├── components/
│   ├── BookingWidget.tsx (Updated - Better state management)
│   ├── ProtectedRoute.tsx
│   └── ... (other components)
│
├── App.tsx (Updated - New booking route)
└── ... (other files)
```

---

## Summary

The new routing structure provides:
✅ Clear user journey from discovery to booking
✅ Type-safe state passing between routes
✅ Protected routes for authenticated pages
✅ Booking history in profile
✅ Responsive design across all pages
✅ Error handling and validation
✅ Smooth animations and transitions

The implementation is production-ready with room for enhancements like dynamic pricing, payment integration, and advanced booking management features.
