# Supabase Booking API Reference

Quick reference for the booking system API and database operations.

## Edge Function: Create Booking

### Endpoint
```
POST {SUPABASE_URL}/functions/v1/create-booking
```

### Headers
```
Content-Type: application/json
Authorization: Bearer {ANON_KEY}
```

### Request Body
```json
{
  "userId": "string (UUID)",
  "propertyId": "string",
  "checkInDate": "string (ISO 8601 date)",
  "checkOutDate": "string (ISO 8601 date)",
  "numberOfGuests": "number",
  "totalPrice": "number (decimal)",
  "currency": "string (default: KES)",
  "specialRequests": "string (optional)"
}
```

### Response (Success - 200)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "propertyId": "string",
    "checkInDate": "date",
    "checkOutDate": "date",
    "numberOfGuests": "number",
    "totalPrice": "number",
    "currency": "string",
    "status": "pending",
    "createdAt": "timestamp"
  }
}
```

### Error Responses

**Missing Fields (400)**
```json
{
  "error": "Missing required fields"
}
```

**Property Already Booked (409)**
```json
{
  "error": "Property is already booked for these dates"
}
```

**Property Unavailable (409)**
```json
{
  "error": "Property is unavailable for these dates"
}
```

**Database Error (400)**
```json
{
  "error": "Failed to create booking: {details}"
}
```

---

## Direct Database Operations

### Check Availability

```typescript
const { data: available } = await supabase
  .from('bookings')
  .select('id')
  .eq('property_id', propertyId)
  .in('status', ['pending', 'confirmed'])
  .or(`and(check_in_date.lte.${checkOutDate},check_out_date.gte.${checkInDate})`);

const isAvailable = !available || available.length === 0;
```

### Get User's Bookings

```typescript
const { data: bookings } = await supabase
  .from('bookings')
  .select('*')
  .eq('user_id', userId)
  .order('check_in_date', { ascending: false });
```

### Get Booking with Payment Details

```typescript
const { data: booking } = await supabase
  .from('bookings')
  .select(`
    *,
    booking_payments (
      id,
      payment_status,
      amount,
      currency
    )
  `)
  .eq('id', bookingId)
  .single();
```

### Get Booking History

```typescript
const { data: history } = await supabase
  .from('booking_history')
  .select('*')
  .eq('booking_id', bookingId)
  .order('timestamp', { ascending: false });
```

### Update Booking Status

```typescript
const { data: booking } = await supabase
  .from('bookings')
  .update({ status: 'confirmed' })
  .eq('id', bookingId)
  .select()
  .single();

// Add history entry
await supabase
  .from('booking_history')
  .insert({
    booking_id: bookingId,
    action: 'confirmed',
    previous_status: 'pending',
    new_status: 'confirmed',
    timestamp: new Date().toISOString(),
    notes: 'Booking confirmed',
  });
```

### Cancel Booking

```typescript
const { error } = await supabase
  .from('bookings')
  .update({ status: 'cancelled' })
  .eq('id', bookingId)
  .eq('status', 'pending'); // Only pending bookings can be cancelled

if (!error) {
  await supabase
    .from('booking_history')
    .insert({
      booking_id: bookingId,
      action: 'cancelled',
      previous_status: 'pending',
      new_status: 'cancelled',
      timestamp: new Date().toISOString(),
      notes: 'Cancelled by user',
    });
}
```

### Update Payment Status

```typescript
const { data: payment } = await supabase
  .from('booking_payments')
  .update({
    payment_status: 'completed',
    payment_method: 'credit_card',
    payment_reference: 'txn_12345',
  })
  .eq('booking_id', bookingId)
  .select()
  .single();
```

### Add Property Unavailability (Blackout Dates)

```typescript
const { data: unavailability } = await supabase
  .from('property_unavailability')
  .insert({
    property_id: propertyId,
    start_date: '2024-03-01',
    end_date: '2024-03-10',
    reason: 'maintenance',
  })
  .select()
  .single();
```

### Get Property Availability Calendar

```typescript
const { data: unavailablePeriods } = await supabase
  .from('property_unavailability')
  .select('*')
  .eq('property_id', propertyId)
  .gte('end_date', new Date().toISOString().split('T')[0])
  .order('start_date', { ascending: true });

const { data: bookedDates } = await supabase
  .from('bookings')
  .select('check_in_date, check_out_date')
  .eq('property_id', propertyId)
  .in('status', ['pending', 'confirmed'])
  .gte('check_out_date', new Date().toISOString().split('T')[0]);
```

---

## TypeScript Interfaces

```typescript
interface BookingPayload {
  userId: string;
  propertyId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalPrice: number;
  currency: string;
  specialRequests?: string;
}

interface Booking {
  id: string;
  user_id: string;
  property_id: string;
  check_in_date: string;
  check_out_date: string;
  number_of_guests: number;
  total_price: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  special_requests?: string;
  created_at: string;
  updated_at: string;
}

interface BookingPayment {
  id: string;
  booking_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_reference?: string;
  created_at: string;
  updated_at: string;
}

interface BookingHistory {
  id: string;
  booking_id: string;
  action: 'created' | 'confirmed' | 'cancelled' | 'completed' | 'updated';
  previous_status?: string;
  new_status: string;
  notes?: string;
  changed_by?: string;
  timestamp: string;
}

interface PropertyUnavailability {
  id: string;
  property_id: string;
  start_date: string;
  end_date: string;
  reason?: string;
  created_at: string;
  updated_at: string;
}
```

---

## Common Scenarios

### Complete Booking Workflow

1. **Check Availability**
```typescript
const available = await checkPropertyAvailability({
  propertyId,
  checkInDate,
  checkOutDate,
});
```

2. **Create Booking**
```typescript
const booking = await createBooking(userId, {
  propertyId,
  checkInDate,
  checkOutDate,
  numberOfGuests,
  totalPrice,
  currency,
});
```

3. **Process Payment** (external payment processor)
```typescript
// After payment is successful
await supabase
  .from('booking_payments')
  .update({ payment_status: 'completed' })
  .eq('booking_id', booking.id);
```

4. **Confirm Booking**
```typescript
await supabase
  .from('bookings')
  .update({ status: 'confirmed' })
  .eq('id', booking.id);
```

### Handle Cancellation

1. **User initiates cancellation**
2. **Check refund eligibility** (cancellation policy)
3. **Update booking status**
```typescript
await supabase
  .from('bookings')
  .update({ status: 'cancelled' })
  .eq('id', bookingId);
```

4. **Process refund** (external processor)
5. **Update payment status**
```typescript
await supabase
  .from('booking_payments')
  .update({ payment_status: 'refunded' })
  .eq('booking_id', bookingId);
```

---

## Rate Limiting & Best Practices

1. **Validate dates** before API calls
   ```typescript
   if (new Date(checkOutDate) <= new Date(checkInDate)) {
     throw new Error('Invalid date range');
   }
   ```

2. **Cache availability** to reduce queries
   - Check availability → Create booking should be atomic

3. **Use transactions** for multi-step operations
   - Edge function handles this automatically

4. **Log all operations** via booking_history table
   - Useful for auditing and debugging

5. **Set proper error handling** in frontend
   - Handle 409 conflict errors gracefully
   - Retry on 5xx errors

---

## Deployment Checklist

- [ ] SQL queries executed in Supabase
- [ ] Edge function deployed
- [ ] Environment variables set
- [ ] RLS policies enabled
- [ ] Triggers created
- [ ] Indexes created
- [ ] Frontend updated
- [ ] Payment integration ready
- [ ] Testing completed
- [ ] Monitoring enabled

---

## Support & Documentation

- Supabase Docs: https://supabase.com/docs
- Supabase Auth: https://supabase.com/docs/guides/auth
- Supabase Functions: https://supabase.com/docs/guides/functions
- PostgreSQL Docs: https://www.postgresql.org/docs/
