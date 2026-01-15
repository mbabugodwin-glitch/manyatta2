# Backend Setup Guide: Supabase Integration

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Supabase Project Setup](#supabase-project-setup)
4. [Database Schema](#database-schema)
5. [Authentication Setup](#authentication-setup)
6. [API Integration](#api-integration)
7. [Environment Variables](#environment-variables)
8. [Testing](#testing)

---

## Overview

This guide sets up a complete backend for the MANYATTAke platform using Supabase. The backend will handle:
- User authentication (email/password, OAuth)
- Booking management
- Property inventory
- Guest reviews & ratings
- CSR project tracking
- Blog content management
- Payment processing integration
- Admin dashboard data

---

## Prerequisites

- Supabase account (free tier available at [supabase.com](https://supabase.com))
- Node.js 16+
- npm or yarn
- Git

---

## Supabase Project Setup

### 1. Create a Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Sign up/login with your email
3. Click "New Project"
4. Fill in project details:
   - **Name**: `manyatta-kenya`
   - **Database Password**: Use a strong password (save it securely)
   - **Region**: Select closest to your users (e.g., eu-west-1)
5. Click "Create new project" and wait for deployment (~2 minutes)

### 2. Get Your API Keys

1. Go to **Project Settings** → **API**
2. Copy and save:
   - **Project URL** (VITE_SUPABASE_URL)
   - **anon key** (VITE_SUPABASE_ANON_KEY)
   - **service_role key** (Keep private, for server-side only)

### 3. Install Supabase Client

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-react
```

---

## Database Schema

### Create Tables via Supabase Dashboard

Go to **SQL Editor** in your Supabase dashboard and run these SQL queries:

#### 1. Users Table (extends auth.users)
```sql
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  country TEXT,
  profile_image_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id);
```

#### 2. Properties Table
```sql
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('mountain', 'safari', 'urban')),
  name TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  price_per_night DECIMAL(10, 2),
  capacity INTEGER,
  bedrooms INTEGER,
  bathrooms INTEGER,
  amenities TEXT[],
  images TEXT[],
  featured_image_url TEXT,
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Anyone can view properties
CREATE POLICY "Properties are viewable by everyone"
  ON public.properties
  FOR SELECT
  USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Only admins can manage properties"
  ON public.properties
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM public.user_profiles WHERE is_admin = TRUE
    )
  );
```

#### 3. Bookings Table
```sql
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  number_of_guests INTEGER NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  special_requests TEXT,
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  payment_method TEXT,
  transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Users can view their own bookings
CREATE POLICY "Users can view own bookings"
  ON public.bookings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create bookings
CREATE POLICY "Users can create bookings"
  ON public.bookings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update own bookings
CREATE POLICY "Users can update own bookings"
  ON public.bookings
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all bookings
CREATE POLICY "Admins can view all bookings"
  ON public.bookings
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM public.user_profiles WHERE is_admin = TRUE
    )
  );
```

#### 4. Reviews Table
```sql
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT NOT NULL,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(booking_id)
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view reviews
CREATE POLICY "Reviews are viewable by everyone"
  ON public.reviews
  FOR SELECT
  USING (true);

-- Users can create reviews
CREATE POLICY "Users can create reviews"
  ON public.reviews
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update own reviews
CREATE POLICY "Users can update own reviews"
  ON public.reviews
  FOR UPDATE
  USING (auth.uid() = user_id);
```

#### 5. Blog Posts Table
```sql
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  author_id UUID REFERENCES public.user_profiles(id),
  featured_image_url TEXT,
  category TEXT,
  tags TEXT[],
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can view published posts
CREATE POLICY "Published posts are viewable"
  ON public.blog_posts
  FOR SELECT
  USING (published = TRUE);

-- Authors/Admins can manage own posts
CREATE POLICY "Authors can manage their posts"
  ON public.blog_posts
  FOR ALL
  USING (auth.uid() = author_id OR auth.uid() IN (SELECT id FROM public.user_profiles WHERE is_admin = TRUE));
```

#### 6. Wishlist Table
```sql
CREATE TABLE public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- Enable RLS
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Users can view own wishlist
CREATE POLICY "Users can view own wishlist"
  ON public.wishlists
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can manage own wishlist
CREATE POLICY "Users can manage own wishlist"
  ON public.wishlists
  FOR ALL
  USING (auth.uid() = user_id);
```

#### 7. Contacts/Inquiries Table
```sql
CREATE TABLE public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'responded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Anyone can submit inquiries
CREATE POLICY "Anyone can submit inquiries"
  ON public.inquiries
  FOR INSERT
  WITH CHECK (true);

-- Admins can view inquiries
CREATE POLICY "Admins can view inquiries"
  ON public.inquiries
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM public.user_profiles WHERE is_admin = TRUE
    )
  );
```

---

## Authentication Setup

### 1. Enable Email Authentication

1. Go to **Authentication** → **Providers**
2. Enable "Email" provider
3. Configure email settings:
   - Go to **Email Templates**
   - Customize confirmation, password reset, magic link emails

### 2. Enable OAuth Providers (Optional)

1. Go to **Authentication** → **Providers**
2. Enable desired providers:
   - **Google**: Add OAuth credentials from Google Cloud Console
   - **GitHub**: Add OAuth credentials from GitHub
   - **Apple**: Add OAuth credentials from Apple Developer

### 3. Configure Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Add redirect URLs:
   ```
   http://localhost:5173
   http://localhost:5173/auth/callback
   https://yourdomain.com
   https://yourdomain.com/auth/callback
   ```

---

## API Integration

### 1. Create Supabase Service

Create `src/services/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Export types for easier usage
export type Database = any; // Generate via Supabase CLI for full types
```

### 2. Authentication Service

Create `src/services/auth.ts`:

```typescript
import { supabase } from './supabase';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

export const authService = {
  // Sign up
  async signUp(email: string, password: string, userData?: { firstName?: string; lastName?: string }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    if (error) throw error;
    return data;
  },

  // Sign in
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Get current session
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  // Password reset
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },

  // Update password
  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
  },

  // Listen to auth changes
  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
};
```

### 3. Bookings Service

Create `src/services/bookings.ts`:

```typescript
import { supabase } from './supabase';

export const bookingsService = {
  // Create booking
  async createBooking(booking: {
    propertyId: string;
    checkInDate: string;
    checkOutDate: string;
    numberOfGuests: number;
    totalPrice: number;
    specialRequests?: string;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('bookings')
      .insert([{
        user_id: user.id,
        property_id: booking.propertyId,
        check_in_date: booking.checkInDate,
        check_out_date: booking.checkOutDate,
        number_of_guests: booking.numberOfGuests,
        total_price: booking.totalPrice,
        special_requests: booking.specialRequests
      }])
      .select();

    if (error) throw error;
    return data[0];
  },

  // Get user bookings
  async getUserBookings() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get booking by ID
  async getBooking(id: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Update booking
  async updateBooking(id: string, updates: any) {
    const { data, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  },

  // Cancel booking
  async cancelBooking(id: string) {
    return this.updateBooking(id, { status: 'cancelled' });
  }
};
```

### 4. Properties Service

Create `src/services/properties.ts`:

```typescript
import { supabase } from './supabase';

export const propertiesService = {
  // Get all properties
  async getProperties(filters?: { type?: string }) {
    let query = supabase.from('properties').select('*');

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Get property by ID
  async getProperty(id: string) {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Get properties by type
  async getPropertiesByType(type: string) {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('type', type)
      .eq('is_available', true);

    if (error) throw error;
    return data;
  },

  // Search properties
  async searchProperties(query: string) {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .or(`name.ilike.%${query}%,location.ilike.%${query}%,description.ilike.%${query}%`);

    if (error) throw error;
    return data;
  }
};
```

### 5. Reviews Service

Create `src/services/reviews.ts`:

```typescript
import { supabase } from './supabase';

export const reviewsService = {
  // Get reviews for property
  async getPropertyReviews(propertyId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, user_profiles(first_name, last_name)')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Create review
  async createReview(review: {
    propertyId: string;
    bookingId: string;
    rating: number;
    title: string;
    content: string;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('reviews')
      .insert([{
        property_id: review.propertyId,
        user_id: user.id,
        booking_id: review.bookingId,
        rating: review.rating,
        title: review.title,
        content: review.content
      }])
      .select();

    if (error) throw error;
    return data[0];
  },

  // Update review
  async updateReview(id: string, updates: any) {
    const { data, error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  }
};
```

---

## Environment Variables

Create `.env.local` in your project root:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Service role key (for server-side operations only)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Payment Integration (Stripe/Mpesa)
VITE_STRIPE_PUBLIC_KEY=your-stripe-key
VITE_MPESA_BUSINESS_SHORT_CODE=your-mpesa-code

# App URLs
VITE_APP_URL=http://localhost:5173
VITE_API_URL=http://localhost:3000
```

**Important**: Add `.env.local` to `.gitignore` and never commit secrets.

---

## Testing

### 1. Test Authentication

```typescript
import { authService } from './services/auth';

// Sign up
await authService.signUp('test@example.com', 'password123', {
  firstName: 'John',
  lastName: 'Doe'
});

// Sign in
await authService.signIn('test@example.com', 'password123');

// Get current user
const user = await authService.getCurrentUser();
console.log(user);
```

### 2. Test Bookings

```typescript
import { bookingsService } from './services/bookings';

// Create booking
const booking = await bookingsService.createBooking({
  propertyId: 'property-id',
  checkInDate: '2024-01-15',
  checkOutDate: '2024-01-20',
  numberOfGuests: 2,
  totalPrice: 5000
});

// Get user bookings
const bookings = await bookingsService.getUserBookings();
console.log(bookings);
```

### 3. Test Properties

```typescript
import { propertiesService } from './services/properties';

// Get all properties
const properties = await propertiesService.getProperties();

// Get properties by type
const villas = await propertiesService.getPropertiesByType('mountain');

// Search properties
const results = await propertiesService.searchProperties('Nairobi');
```

---

## Best Practices

### 1. **Security**
- Never expose service role key in frontend
- Always validate user permissions on backend
- Use RLS policies for all table access
- Sanitize user inputs

### 2. **Error Handling**
```typescript
try {
  const data = await propertiesService.getProperties();
} catch (error) {
  console.error('Error fetching properties:', error);
  // Show user-friendly error message
}
```

### 3. **Caching**
```typescript
// Use React Query for better caching
import { useQuery } from '@tanstack/react-query';

function PropertyList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertiesService.getProperties()
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading properties</div>;
  
  return <div>{/* render properties */}</div>;
}
```

### 4. **File Uploads**
```typescript
// Upload images to Supabase Storage
async function uploadPropertyImage(file: File, propertyId: string) {
  const { data, error } = await supabase.storage
    .from('properties')
    .upload(`${propertyId}/${file.name}`, file);

  if (error) throw error;
  
  // Get public URL
  const { data: publicUrl } = supabase.storage
    .from('properties')
    .getPublicUrl(`${propertyId}/${file.name}`);

  return publicUrl.publicUrl;
}
```

---

## Deployment

### Vercel/Netlify Deployment

1. Set environment variables in deployment platform
2. Ensure `.env.local` is in `.gitignore`
3. Build command: `npm run build`
4. Deploy!

### Custom Server Deployment

For more control, deploy to your own server and use Supabase's REST API:

```typescript
const response = await fetch(
  `${process.env.VITE_SUPABASE_URL}/rest/v1/properties`,
  {
    headers: {
      Authorization: `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    }
  }
);
```

---

## Next Steps

1. **Set up payment processing**: Integrate Stripe/M-Pesa for bookings
2. **Create admin dashboard**: Manage properties, bookings, users
3. **Add email notifications**: Confirm bookings, password resets
4. **Implement analytics**: Track user behavior and conversions
5. **Set up monitoring**: Use Sentry for error tracking
6. **Add API rate limiting**: Protect your endpoints
7. **Create mobile app**: Use React Native with same Supabase backend

---

## Troubleshooting

### Issue: CORS errors
**Solution**: Ensure your app URL is in Supabase's allowed origins

### Issue: Auth not persisting
**Solution**: Supabase automatically persists sessions in localStorage

### Issue: RLS blocking requests
**Solution**: Check your RLS policies match your auth context

### Issue: Slow queries
**Solution**: Add indexes to frequently queried columns in Supabase dashboard

---

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase React Auth](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [SQL Editor Guide](https://supabase.com/docs/guides/database/overview)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

**Questions or issues?** Check Supabase documentation or reach out to support at support@supabase.io
