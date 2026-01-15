# Supabase Backend Setup Guide for Authentication

## Overview
This guide provides comprehensive setup instructions for your Supabase backend to support the login/signup functionality. We'll cover database schemas, RLS policies, and server functions.

---

## Part 1: Database Schema Setup

### 1.1 Create User Profiles Table

This table extends Supabase's built-in `auth.users` table with additional user information.

```sql
-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID NOT NULL PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Foreign key reference to auth.users
  CONSTRAINT fk_user_id FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS user_profiles_email_idx ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS user_profiles_created_at_idx ON public.user_profiles(created_at);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
```

### 1.2 Create User Preferences Table

Store user preferences for the booking system.

```sql
-- Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  user_id UUID NOT NULL UNIQUE,
  newsletter_subscription BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  preferred_currency TEXT DEFAULT 'KES',
  preferred_language TEXT DEFAULT 'en',
  theme BOOLEAN DEFAULT false, -- false for light, true for dark
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  CONSTRAINT fk_user_preferences_user_id FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE
);

-- Create index
CREATE INDEX IF NOT EXISTS user_preferences_user_id_idx ON public.user_preferences(user_id);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
```

### 1.3 Create User Sessions Table (Optional - for advanced session management)

```sql
-- Create user_sessions table for session tracking
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  user_id UUID NOT NULL,
  device_info TEXT,
  ip_address INET,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  CONSTRAINT fk_user_sessions_user_id FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE
);

-- Create index
CREATE INDEX IF NOT EXISTS user_sessions_user_id_idx ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS user_sessions_last_active_idx ON public.user_sessions(last_active);

-- Enable RLS
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
```

### 1.4 Create Bookings Table (For Future Use)

```sql
-- Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  user_id UUID NOT NULL,
  property_id TEXT NOT NULL,
  property_type TEXT NOT NULL, -- 'mountain', 'safari', 'urban'
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  number_of_guests INT NOT NULL,
  total_price DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'KES',
  status TEXT DEFAULT 'pending', -- pending, confirmed, cancelled, completed
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  CONSTRAINT fk_bookings_user_id FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS bookings_user_id_idx ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON public.bookings(status);
CREATE INDEX IF NOT EXISTS bookings_check_in_date_idx ON public.bookings(check_in_date);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
```

---

## Part 2: Row-Level Security (RLS) Policies

### 2.1 User Profiles RLS Policies

```sql
-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view their own profile"
ON public.user_profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy 2: Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON public.user_profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 3: New users can insert their profile during signup
CREATE POLICY "Users can insert their own profile"
ON public.user_profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Policy 4: Enable public read access for user avatars and names (optional)
CREATE POLICY "Public profiles are viewable by everyone"
ON public.user_profiles
FOR SELECT
USING (true);
```

### 2.2 User Preferences RLS Policies

```sql
-- Policy 1: Users can view their own preferences
CREATE POLICY "Users can view their own preferences"
ON public.user_preferences
FOR SELECT
USING (auth.uid() = user_id);

-- Policy 2: Users can update their own preferences
CREATE POLICY "Users can update their own preferences"
ON public.user_preferences
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can insert their own preferences
CREATE POLICY "Users can insert their own preferences"
ON public.user_preferences
FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

### 2.3 User Sessions RLS Policies

```sql
-- Policy 1: Users can view their own sessions
CREATE POLICY "Users can view their own sessions"
ON public.user_sessions
FOR SELECT
USING (auth.uid() = user_id);

-- Policy 2: Users can delete their own sessions
CREATE POLICY "Users can delete their own sessions"
ON public.user_sessions
FOR DELETE
USING (auth.uid() = user_id);

-- Policy 3: System can insert sessions
CREATE POLICY "System can insert sessions"
ON public.user_sessions
FOR INSERT
WITH CHECK (true);
```

### 2.4 Bookings RLS Policies

```sql
-- Policy 1: Users can view their own bookings
CREATE POLICY "Users can view their own bookings"
ON public.bookings
FOR SELECT
USING (auth.uid() = user_id);

-- Policy 2: Users can insert their own bookings
CREATE POLICY "Users can insert their own bookings"
ON public.bookings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own bookings
CREATE POLICY "Users can update their own bookings"
ON public.bookings
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can cancel their own bookings
CREATE POLICY "Users can delete their own bookings"
ON public.bookings
FOR DELETE
USING (auth.uid() = user_id AND status IN ('pending', 'confirmed'));
```

---

## Part 3: Database Functions

### 3.1 Function to Create User Profile on Signup

This function automatically creates a user profile when a new user signs up.

```sql
-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email)
  VALUES (new.id, new.email);
  
  INSERT INTO public.user_preferences (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
```

### 3.2 Function to Update User Updated_At Timestamp

```sql
-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$;

-- Create triggers for all tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

### 3.3 Function to Get Current User Profile

```sql
-- Create function to get current user's profile
CREATE OR REPLACE FUNCTION public.get_current_user_profile()
RETURNS TABLE (
  id UUID,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    user_profiles.id,
    user_profiles.email,
    user_profiles.first_name,
    user_profiles.last_name,
    user_profiles.phone,
    user_profiles.avatar_url,
    user_profiles.bio,
    user_profiles.created_at,
    user_profiles.updated_at
  FROM public.user_profiles
  WHERE user_profiles.id = auth.uid();
END;
$$;
```

### 3.4 Function to Log User Session

```sql
-- Create function to log user session
CREATE OR REPLACE FUNCTION public.log_user_session(
  device_info TEXT DEFAULT NULL,
  ip_address INET DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  session_id UUID;
BEGIN
  INSERT INTO public.user_sessions (user_id, device_info, ip_address)
  VALUES (auth.uid(), device_info, ip_address)
  RETURNING id INTO session_id;
  
  RETURN session_id;
END;
$$;
```

### 3.5 Function to Update Last Active Time

```sql
-- Create function to update session last_active
CREATE OR REPLACE FUNCTION public.update_session_last_active(session_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.user_sessions
  SET last_active = TIMEZONE('utc'::text, NOW())
  WHERE id = session_id AND user_id = auth.uid();
END;
$$;
```

### 3.6 Function to Check Email Existence

```sql
-- Create function to check if email exists
CREATE OR REPLACE FUNCTION public.check_email_exists(email_input TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users WHERE email = email_input
  );
END;
$$;
```

---

## Part 4: Authentication Configuration

### 4.1 Configure Supabase Auth Settings

1. **Go to Supabase Dashboard** → Your Project → Authentication → Providers

2. **Email/Password Provider Settings:**
   - Enable "Email" provider
   - Set "Autoconfirm email" to `true` for development (disable for production)
   - Set "Confirm email" to `true` for production
   - Enable "Double confirm changes" for security

3. **Session Settings:**
   - Session timeout: 24 hours (default)
   - Refresh token rotation: Enabled
   - Single session per user: Disabled (allows multiple sessions)

4. **Security Settings:**
   - Require email confirmation: `false` (development) or `true` (production)
   - Protect sign up: `false` (development) or `true` (production with captcha)
   - Enable PKCE: `true`

### 4.2 Configure Email Templates

1. Go to Authentication → Email Templates
2. Customize these templates:
   - **Confirm signup email**
   - **Password reset email**
   - **Change email address**
   - **Magic link**

---

## Part 5: Edge Functions (Optional - For Advanced Features)

### 5.1 Edge Function for Email Verification

Create a new Edge Function called `send-verification-email`:

```typescript
// supabase/functions/send-verification-email/index.ts
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { email, userId } = await req.json();

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update user profile with email verification token
    const { error } = await supabase
      .from("user_profiles")
      .update({ email_verified: true })
      .eq("id", userId);

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, message: "Email verified" }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
});
```

### 5.2 Edge Function for User Profile Initialization

```typescript
// supabase/functions/init-user-profile/index.ts
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { userId, email } = await req.json();

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Initialize user profile
    const { data, error } = await supabase
      .from("user_profiles")
      .upsert({
        id: userId,
        email: email,
        created_at: new Date().toISOString(),
      })
      .select();

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
});
```

---

## Part 6: Implementation Steps

### Step 1: Execute SQL in Supabase SQL Editor
1. Open Supabase Dashboard → SQL Editor
2. Create new query
3. Copy and paste each SQL block from Parts 1-3
4. Execute each block in order

### Step 2: Configure Auth Settings
1. Go to Authentication → Providers
2. Configure email/password settings
3. Customize email templates

### Step 3: Enable Storage (Optional - For Avatars)
1. Go to Storage → Create new bucket called "avatars"
2. Make it public
3. Add RLS policies:

```sql
-- Policy 1: Users can upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Policy 2: Users can update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Policy 3: Everyone can view avatars
CREATE POLICY "Anyone can view avatars"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');
```

---

## Part 7: Testing the Backend

### Test 1: Create a New User
```bash
curl -X POST https://YOUR_SUPABASE_URL/auth/v1/signup \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_ANON_KEY" \
  -d '{
    "email": "test@example.com",
    "password": "securepassword123"
  }'
```

### Test 2: Sign In
```bash
curl -X POST https://YOUR_SUPABASE_URL/auth/v1/token?grant_type=password \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_ANON_KEY" \
  -d '{
    "email": "test@example.com",
    "password": "securepassword123"
  }'
```

### Test 3: Get Current User Profile
```bash
curl -X POST https://YOUR_SUPABASE_URL/rest/v1/rpc/get_current_user_profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

---

## Part 8: Security Checklist

- [ ] Row-Level Security (RLS) enabled on all tables
- [ ] RLS policies configured for each table
- [ ] Email confirmation enabled in production
- [ ] Strong password requirements set
- [ ] Rate limiting enabled for auth endpoints
- [ ] HTTPS enforced
- [ ] CORS configured properly
- [ ] Service role key kept secret (never expose in frontend)
- [ ] Anon key used only for frontend
- [ ] API key rotation scheduled

---

## Part 9: Environment Variables

Add these to your `.env.local`:

```bash
VITE_SUPABASE_URL=https://nombxgiacoicjzhpktwx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_Jyqp5x3WeVgLVQ71L2tJ5w_ncLtNq1v

# For server-side operations (never expose in frontend)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

---

## Troubleshooting

### Issue: New users not getting profiles created
**Solution**: Check if the trigger `on_auth_user_created` exists and is enabled.

```sql
SELECT * FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';
```

### Issue: RLS policies blocking legitimate queries
**Solution**: Verify that `auth.uid()` matches the user ID in your policies.

### Issue: Email not being sent
**Solution**: Check email template configuration and SMTP settings in Auth settings.

---

## Next Steps

1. Execute all SQL scripts in Supabase SQL Editor
2. Test authentication flow
3. Configure email templates
4. Set up storage for user avatars
5. Add OAuth providers (Google, GitHub, etc.)
6. Implement password reset functionality
7. Set up webhook notifications
