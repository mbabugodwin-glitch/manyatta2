# Supabase Booking System Setup Guide

This guide provides complete setup instructions for the booking edge function and database queries.

## Overview

The booking system consists of:
1. **Edge Function** (`create-booking`): Handles booking creation with availability checking
2. **Database Tables**: Bookings, payments, history, and property unavailability
3. **RLS Policies**: Secure access control
4. **Triggers & Functions**: Automatic timestamp management

---

## Part 1: Database Setup

### Step 1: Run the SQL Queries

1. Open Supabase Dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy the contents from `supabase/booking-queries.sql`
5. Run the entire script

This will create:
- `bookings` table
- `booking_payments` table
- `booking_history` table
- `property_unavailability` table
- Indexes for performance
- RLS policies
- Triggers for timestamp management

### Tables Schema

#### Bookings Table
```
id (UUID, Primary Key)
user_id (UUID, Foreign Key → user_profiles)
property_id (TEXT)
check_in_date (DATE)
check_out_date (DATE)
number_of_guests (INT)
total_price (DECIMAL)
currency (TEXT, default: 'KES')
status (TEXT, default: 'pending') - pending | confirmed | cancelled | completed
special_requests (TEXT, nullable)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

#### Booking Payments Table
```
id (UUID, Primary Key)
booking_id (UUID, Foreign Key → bookings, UNIQUE)
amount (DECIMAL)
currency (TEXT, default: 'KES')
payment_method (TEXT) - credit_card | mobile_money | bank_transfer | pending
payment_status (TEXT, default: 'pending') - pending | completed | failed | refunded
payment_reference (TEXT, nullable)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

#### Booking History Table
```
id (UUID, Primary Key)
booking_id (UUID, Foreign Key → bookings)
action (TEXT) - created | confirmed | cancelled | completed | updated
previous_status (TEXT, nullable)
new_status (TEXT)
notes (TEXT, nullable)
changed_by (UUID, nullable - user who made the change)
timestamp (TIMESTAMP)
```

#### Property Unavailability Table
```
id (UUID, Primary Key)
property_id (TEXT)
start_date (DATE)
end_date (DATE)
reason (TEXT, nullable) - maintenance | blocked | owner_use
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

---

## Part 2: Deploy Edge Function

### Step 1: Create Function Directory

```bash
cd supabase/functions
mkdir -p create-booking
```

### Step 2: Create Function File

The edge function is already created at `supabase/functions/create-booking/index.ts`

### Step 3: Deploy Function

Using Supabase CLI:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Deploy the function
supabase functions deploy create-booking

# Or deploy all functions
supabase functions deploy
```

### Step 4: Verify Deployment

```bash
# List deployed functions
supabase functions list

# Check function details
supabase functions download create-booking
```

---

## Part 3: Update Frontend Service

The `services/bookingService.ts` already handles both direct Supabase calls and edge function calls. You can choose either approach:

### Option A: Use Edge Function (Recommended for Production)

Update `bookingService.ts` to call the edge function instead of direct inserts:

```typescript
export const createBooking = async (
  userId: string,
  payload: BookingPayload
): Promise<BookingResponse> => {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    
    // Call the edge function
    const response = await fetch(
      `${supabaseUrl}/functions/v1/create-booking`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          userId,
          propertyId: payload.propertyId,
          checkInDate: payload.checkInDate,
          checkOutDate: payload.checkOutDate,
          numberOfGuests: payload.numberOfGuests,
          totalPrice: payload.totalPrice,
          currency: payload.currency,
          specialRequests: payload.specialRequests,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create booking');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create booking';
    throw new Error(message);
  }
};
```

### Option B: Keep Direct Supabase Calls

The current implementation in `bookingService.ts` works directly with Supabase. The `checkPropertyAvailability` function is already implemented.

---

## Part 4: Environment Variables

### Supabase

Ensure these are set in your Supabase dashboard:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Supabase CLI (.env.local for local development)

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## Part 5: Testing

### Test Availability Check

```typescript
const result = await checkPropertyAvailability({
  propertyId: 'alba-gardens-b1702',
  checkInDate: '2024-02-01',
  checkOutDate: '2024-02-05',
});

console.log(result); // { available: true }
```

### Test Booking Creation

```typescript
const booking = await createBooking('user-id', {
  propertyId: 'alba-gardens-b1702',
  checkInDate: '2024-02-01',
  checkOutDate: '2024-02-05',
  numberOfGuests: 2,
  totalPrice: 500000,
  currency: 'KES',
  specialRequests: 'Please prepare early check-in',
});

console.log(booking);
// {
//   id: 'booking-uuid',
//   userId: 'user-id',
//   propertyId: 'alba-gardens-b1702',
//   checkInDate: '2024-02-01',
//   checkOutDate: '2024-02-05',
//   status: 'pending',
//   ...
// }
```

### Test Edge Function (cURL)

```bash
curl -X POST \
  https://your-project.supabase.co/functions/v1/create-booking \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -d '{
    "userId": "user-id",
    "propertyId": "alba-gardens-b1702",
    "checkInDate": "2024-02-01",
    "checkOutDate": "2024-02-05",
    "numberOfGuests": 2,
    "totalPrice": 500000,
    "currency": "KES",
    "specialRequests": "Early check-in requested"
  }'
```

---

## Part 6: Common Operations

### Cancel a Booking

```typescript
await supabase
  .from('bookings')
  .update({ status: 'cancelled' })
  .eq('id', 'booking-id');

// Add history
await supabase
  .from('booking_history')
  .insert({
    booking_id: 'booking-id',
    action: 'cancelled',
    previous_status: 'pending',
    new_status: 'cancelled',
    timestamp: new Date().toISOString(),
    notes: 'Cancelled by user',
  });
```

### Confirm a Booking (after payment)

```typescript
await supabase
  .from('bookings')
  .update({ status: 'confirmed' })
  .eq('id', 'booking-id');

// Update payment status
await supabase
  .from('booking_payments')
  .update({ 
    payment_status: 'completed',
    payment_reference: 'reference-id'
  })
  .eq('booking_id', 'booking-id');

// Add history
await supabase
  .from('booking_history')
  .insert({
    booking_id: 'booking-id',
    action: 'confirmed',
    previous_status: 'pending',
    new_status: 'confirmed',
    timestamp: new Date().toISOString(),
    notes: 'Payment confirmed',
  });
```

### Block Property Dates (Maintenance)

```typescript
await supabase
  .from('property_unavailability')
  .insert({
    property_id: 'alba-gardens-b1702',
    start_date: '2024-03-01',
    end_date: '2024-03-10',
    reason: 'maintenance',
  });
```

### Get User's Bookings

```typescript
const { data: bookings } = await supabase
  .from('bookings')
  .select('*, booking_payments(*), booking_history(*)')
  .eq('user_id', userId)
  .in('status', ['pending', 'confirmed'])
  .order('check_in_date', { ascending: true });
```

---

## Part 7: Edge Function Details

### Location
- `supabase/functions/create-booking/index.ts`

### Functionality

1. **Validates** required fields
2. **Checks availability** against existing bookings
3. **Checks unavailability** periods
4. **Creates booking** record
5. **Creates payment** record
6. **Creates history** entry
7. **Returns** booking details

### Response Examples

**Success (200)**
```json
{
  "success": true,
  "data": {
    "id": "booking-uuid",
    "userId": "user-id",
    "propertyId": "alba-gardens-b1702",
    "checkInDate": "2024-02-01",
    "checkOutDate": "2024-02-05",
    "numberOfGuests": 2,
    "totalPrice": 500000,
    "currency": "KES",
    "status": "pending",
    "createdAt": "2024-01-22T10:00:00Z"
  }
}
```

**Conflict (409)**
```json
{
  "error": "Property is already booked for these dates"
}
```

**Bad Request (400)**
```json
{
  "error": "Missing required fields"
}
```

---

## Part 8: Troubleshooting

### Issue: Edge function not deploying

**Solution**: Ensure Deno is compatible with the imports:
```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
```

### Issue: RLS policies blocking access

**Solution**: Verify user is authenticated and policies are set correctly:
```sql
-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'bookings';
```

### Issue: Availability check failing

**Solution**: Ensure date formats are correct (ISO 8601):
```
✓ Correct: 2024-02-01
✗ Wrong: 01-02-2024
```

### Issue: Payment records not creating

**Solution**: This is not blocking - payments are optional. Check logs for details.

---

## Summary

Your booking system is now ready with:
- ✅ Secure database schema
- ✅ RLS policies for data protection
- ✅ Edge function for atomic operations
- ✅ Availability checking
- ✅ Payment tracking
- ✅ Audit history

For questions or issues, refer to the Supabase documentation:
- https://supabase.com/docs/guides/database
- https://supabase.com/docs/guides/functions
- https://supabase.com/docs/guides/auth
