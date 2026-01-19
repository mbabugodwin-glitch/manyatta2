# Properties Database Seeding Guide

## Overview

Your `properties` table is your product catalog. It should be seeded with your actual properties before users can make bookings. This document covers the best approaches.

---

## Option 1: Manual Insertion via Supabase Dashboard (Recommended for Starting Out)

### Steps:
1. Log into your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query and paste the SQL below:

```sql
-- Clear existing properties (optional)
TRUNCATE TABLE public.properties CASCADE;

-- Insert sample properties
INSERT INTO public.properties (
  id, type, name, description, location, 
  price_per_night, capacity, bedrooms, bathrooms, 
  amenities, images, featured_image_url, 
  rating, review_count, is_available, created_at, updated_at
) VALUES
  (
    gen_random_uuid(),
    'mountain',
    'Burguret Mountainside Villa',
    'Luxurious mountain villa overlooking the Aberdare ranges with modern amenities and private gardens.',
    'Burguret, Nyeri County',
    12000.00,
    8,
    4,
    3,
    ARRAY['WiFi', 'Kitchen', 'Hot Tub', 'Fireplace', 'Mountain Views', 'Parking'],
    ARRAY['public/assets/Burguret Mountainside Villa/image1.jpg', 'public/assets/Burguret Mountainside Villa/image2.jpg'],
    'public/assets/Burguret Mountainside Villa Section/featured.jpg',
    4.8,
    24,
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'urban',
    'Alba Gardens B1702',
    'Modern apartment in the heart of Nairobi with stunning city views and premium amenities.',
    'Alba Gardens, Nairobi',
    6500.00,
    4,
    2,
    2,
    ARRAY['WiFi', 'Gym', 'Lounge', 'Parking', 'City Views', 'Concierge'],
    ARRAY['public/assets/Alba Gardens B1702/image1.jpg', 'public/assets/Alba Gardens B1702/image2.jpg'],
    'public/assets/Alba Gardens Hero/featured.jpg',
    4.6,
    18,
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'mountain',
    'Laurel Hill Suites',
    'Elegant mountain retreat with spa facilities and conference rooms. Perfect for retreats and family gatherings.',
    'Laurel Hill, Central Kenya',
    9500.00,
    12,
    6,
    5,
    ARRAY['WiFi', 'Spa', 'Conference Rooms', 'Restaurant', 'Bar', 'Parking', 'Garden'],
    ARRAY['public/assets/Laurel Hill Suites/image1.jpg', 'public/assets/Laurel Hill Suites/image2.jpg'],
    'public/assets/Laurel Hill Suites Hero/featured.jpg',
    4.9,
    32,
    true,
    NOW(),
    NOW()
  );
```

4. Click **Run** and verify the data was inserted

### Pros:
- ✅ Quick setup
- ✅ No code required
- ✅ Immediate results
- ✅ Easy to edit individual records

### Cons:
- ❌ Manual process
- ❌ Error-prone for large datasets
- ❌ Not reproducible/versionable

---

## Option 2: Seed Script via SQL Editor (Recommended for Teams)

Create a seed SQL file that team members can run:

### Step 1: Create `scripts/seed-properties.sql`

```sql
-- Seed script for properties table
-- Run this in Supabase SQL Editor after creating the database schema

-- Insert all properties at once
INSERT INTO public.properties (
  id, type, name, description, location, 
  price_per_night, capacity, bedrooms, bathrooms, 
  amenities, images, featured_image_url, 
  rating, review_count, is_available, created_at, updated_at
) VALUES
  (
    gen_random_uuid(),
    'mountain',
    'Burguret Mountainside Villa',
    'Luxurious mountain villa with panoramic views and world-class amenities.',
    'Burguret, Nyeri',
    12000.00, 8, 4, 3,
    ARRAY['WiFi', 'Kitchen', 'Hot Tub', 'Fireplace', 'Mountain Views'],
    ARRAY['image1.jpg', 'image2.jpg'],
    'featured.jpg',
    4.8, 24, true, NOW(), NOW()
  ),
  (
    gen_random_uuid(),
    'urban',
    'Alba Gardens B1702',
    'Modern apartment in central Nairobi with city views.',
    'Alba Gardens, Nairobi',
    6500.00, 4, 2, 2,
    ARRAY['WiFi', 'Gym', 'Lounge', 'Parking', 'City Views'],
    ARRAY['image1.jpg', 'image2.jpg'],
    'featured.jpg',
    4.6, 18, true, NOW(), NOW()
  ),
  (
    gen_random_uuid(),
    'mountain',
    'Laurel Hill Suites',
    'Elegant retreat with spa and conference facilities.',
    'Laurel Hill, Central Kenya',
    9500.00, 12, 6, 5,
    ARRAY['WiFi', 'Spa', 'Conference Rooms', 'Restaurant', 'Bar'],
    ARRAY['image1.jpg', 'image2.jpg'],
    'featured.jpg',
    4.9, 32, true, NOW(), NOW()
  )
ON CONFLICT (id) DO NOTHING;
```

### Step 2: Share with team
1. Commit to version control: `git add scripts/seed-properties.sql && git commit -m "Add properties seed script"`
2. Team members run the SQL in Supabase Dashboard

### Pros:
- ✅ Reproducible
- ✅ Version controlled
- ✅ Easy to share
- ✅ Scalable for large datasets

### Cons:
- ❌ Still manual Supabase Dashboard interaction
- ❌ Not automated

---

## Option 3: Programmatic Seeding via Node.js/TypeScript (Recommended for CI/CD)

### Step 1: Create `scripts/seed-db.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Use service role for admin access

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface PropertyInput {
  type: 'mountain' | 'urban' | 'safari';
  name: string;
  description: string;
  location: string;
  price_per_night: number;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  featured_image_url: string;
  rating: number;
  review_count: number;
  is_available: boolean;
}

const properties: PropertyInput[] = [
  {
    type: 'mountain',
    name: 'Burguret Mountainside Villa',
    description: 'Luxurious mountain villa with panoramic views.',
    location: 'Burguret, Nyeri',
    price_per_night: 12000,
    capacity: 8,
    bedrooms: 4,
    bathrooms: 3,
    amenities: ['WiFi', 'Kitchen', 'Hot Tub', 'Fireplace', 'Mountain Views'],
    images: ['public/assets/Burguret Mountainside Villa/image1.jpg'],
    featured_image_url: 'public/assets/Burguret Mountainside Villa Section/featured.jpg',
    rating: 4.8,
    review_count: 24,
    is_available: true,
  },
  {
    type: 'urban',
    name: 'Alba Gardens B1702',
    description: 'Modern apartment in central Nairobi.',
    location: 'Alba Gardens, Nairobi',
    price_per_night: 6500,
    capacity: 4,
    bedrooms: 2,
    bathrooms: 2,
    amenities: ['WiFi', 'Gym', 'Lounge', 'Parking', 'City Views'],
    images: ['public/assets/Alba Gardens B1702/image1.jpg'],
    featured_image_url: 'public/assets/Alba Gardens Hero/featured.jpg',
    rating: 4.6,
    review_count: 18,
    is_available: true,
  },
  {
    type: 'mountain',
    name: 'Laurel Hill Suites',
    description: 'Elegant retreat with spa and conference.',
    location: 'Laurel Hill, Central Kenya',
    price_per_night: 9500,
    capacity: 12,
    bedrooms: 6,
    bathrooms: 5,
    amenities: ['WiFi', 'Spa', 'Conference Rooms', 'Restaurant', 'Bar'],
    images: ['public/assets/Laurel Hill Suites/image1.jpg'],
    featured_image_url: 'public/assets/Laurel Hill Suites Hero/featured.jpg',
    rating: 4.9,
    review_count: 32,
    is_available: true,
  },
];

async function seedProperties() {
  try {
    console.log('🌱 Starting property seeding...');

    const { data, error } = await supabase
      .from('properties')
      .insert(properties)
      .select();

    if (error) {
      console.error('❌ Error seeding properties:', error);
      process.exit(1);
    }

    console.log(`✅ Successfully seeded ${data?.length || 0} properties`);
    console.log('Properties:', data);
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

seedProperties();
```

### Step 2: Add to `package.json`

```json
{
  "scripts": {
    "seed:properties": "tsx scripts/seed-db.ts"
  }
}
```

### Step 3: Install dependencies

```bash
npm install -D tsx dotenv
```

### Step 4: Create `.env.local`

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Step 5: Run the seed

```bash
npm run seed:properties
```

### Pros:
- ✅ Fully automated
- ✅ Version controlled
- ✅ Repeatable
- ✅ Easy to integrate with CI/CD
- ✅ Can run in production safely with service role

### Cons:
- ⚠️ Requires environment variables
- ⚠️ Service role key shouldn't be in repo

---

## Option 4: Admin Dashboard (Long-term Solution)

Once you have users and admin functionality, create an admin panel where staff can:
- Add/edit/delete properties
- Upload images
- Set availability windows
- Manage pricing

This is the **best long-term solution** but requires more development.

---

## Recommended Flow for Your Project

1. **Now (Development)**: Use **Option 1** (Manual via Dashboard) to quickly add sample properties
2. **Soon (Team Collaboration)**: Move to **Option 2** (SQL Seed Script) for version control
3. **Later (Production)**: Implement **Option 4** (Admin Dashboard) for full management
4. **CI/CD Ready**: Use **Option 3** (Node.js Script) in staging/production pipelines

---

## Important Notes

### Image Paths
Update the `images` and `featured_image_url` fields to match your actual asset paths:
- Must be accessible URLs or relative paths that Supabase can serve
- Update after you upload images to Supabase Storage

### Property Type Enum
Make sure you have the enum created:
```sql
CREATE TYPE IF NOT EXISTS public.property_category AS ENUM ('mountain_villa', 'urban_apartment', 'safari');
```

### Currency & Pricing
All prices should be in KES (Kenyan Shillings) unless otherwise specified. Update the `currency` field accordingly.

### Availability
The `property_unavailability` table can be populated separately to mark maintenance windows or blocked dates.

---

## Troubleshooting

**Error: "property_category does not exist"**
- Run the enum creation SQL first

**Error: "violates foreign key constraint"**
- Images might be inaccessible. Check paths.

**Error: "relation 'properties' does not exist"**
- Run the schema creation SQL from `BACKEND_SETUP.md` first
