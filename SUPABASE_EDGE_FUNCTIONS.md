# Supabase Edge Functions Setup Guide

## Understanding the Error

The error occurs because Deno (used by Supabase Edge Functions) requires explicit import paths for external packages. You cannot use Node.js-style relative imports like `import { createClient } from '@supabase/supabase-js'`.

---

## Solution: Fix Edge Function Imports

### Option 1: Use ESM.sh URLs (Recommended for Deno)

Use full URLs to import packages from JSR or npm:

```typescript
// supabase/functions/init-user-profile/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

### Option 2: Use Deno JSR Packages

If you prefer JSR, add the package first:

```bash
cd supabase/functions/init-user-profile
deno add jsr:@supabase/supabase-js
```

Then import normally:

```typescript
import { createClient } from "@supabase/supabase-js";
```

---

## Complete Edge Function Examples

### 1. Send Verification Email Function

**File**: `supabase/functions/send-verification-email/index.ts`

```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { email, userId } = await req.json();

    if (!email || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing email or userId" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update user as verified
    const { error } = await supabase
      .from("user_profiles")
      .update({ email_verified: true })
      .eq("id", userId);

    if (error) throw error;

    // Here you would send an email using a service like SendGrid, Mailgun, etc.
    console.log(`Verification email sent to ${email}`);

    return new Response(
      JSON.stringify({ success: true, message: "Verification email sent" }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
});
```

### 2. Create User Profile on Signup Function

**File**: `supabase/functions/handle-new-user/index.ts`

```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface WebhookPayload {
  type: string;
  record: {
    id: string;
    email: string;
  };
}

serve(async (req) => {
  const payload: WebhookPayload = await req.json();

  try {
    // This function is called via webhook from auth.users table changes
    if (payload.type === "INSERT") {
      const { id, email } = payload.record;

      const supabase = createClient(supabaseUrl, supabaseKey);

      // Create user profile
      const { error } = await supabase
        .from("user_profiles")
        .insert([
          {
            id,
            email,
            created_at: new Date().toISOString(),
          },
        ]);

      if (error) {
        console.error("Error creating profile:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      console.log(`User profile created for ${email}`);

      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: { "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
});
```

### 3. Update User Session Function

**File**: `supabase/functions/update-session/index.ts`

```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { userId, sessionId, deviceInfo, ipAddress } = await req.json();

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update or create session
    const { error } = await supabase
      .from("user_sessions")
      .upsert({
        id: sessionId,
        user_id: userId,
        device_info: deviceInfo,
        ip_address: ipAddress,
        last_active: new Date().toISOString(),
      });

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true }),
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

### 4. Send Booking Confirmation Email Function

**File**: `supabase/functions/send-booking-confirmation/index.ts`

```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { bookingId, userId, propertyName, checkInDate, checkOutDate } =
      await req.json();

    if (!bookingId || !userId || !propertyName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user email
    const { data: userData, error: userError } = await supabase
      .from("user_profiles")
      .select("email")
      .eq("id", userId)
      .single();

    if (userError) throw userError;

    const userEmail = userData?.email;

    // Here you would send the email using SendGrid, Mailgun, etc.
    console.log(`Booking confirmation email would be sent to ${userEmail}`);
    console.log(`Booking ${bookingId} confirmed for ${propertyName}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Booking confirmation sent",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
});
```

### 5. Process Payment Function

**File**: `supabase/functions/process-payment/index.ts`

```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const {
      bookingId,
      amount,
      currency,
      paymentMethod,
      transactionId,
    } = await req.json();

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update booking payment status
    const { error } = await supabase
      .from("bookings")
      .update({
        payment_status: "paid",
        payment_method: paymentMethod,
        transaction_id: transactionId,
        status: "confirmed",
      })
      .eq("id", bookingId);

    if (error) throw error;

    console.log(
      `Payment processed for booking ${bookingId}: ${amount} ${currency}`
    );

    return new Response(
      JSON.stringify({ success: true, message: "Payment processed" }),
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

## Deploying Edge Functions

### Step 1: Create Function File

```bash
# Create new function directory
mkdir -p supabase/functions/my-function

# Create index.ts file
touch supabase/functions/my-function/index.ts
```

### Step 2: Add Your Function Code

Copy the function code into `supabase/functions/my-function/index.ts`

### Step 3: Deploy Function

```bash
# Deploy specific function
supabase functions deploy my-function

# Deploy all functions
supabase functions deploy

# Deploy with specific environment
supabase functions deploy my-function --project-ref <project-ref>
```

### Step 4: Set Environment Variables

```bash
# List environment variables
supabase secrets list

# Set environment variable
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-key-here

# Set for specific project
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-key-here --project-ref <project-ref>
```

---

## Testing Edge Functions Locally

### 1. Start Supabase Locally

```bash
supabase start
```

### 2. Serve Functions Locally

```bash
supabase functions serve
```

### 3. Test with curl

```bash
# Test init-user-profile function
curl -i --location --request POST http://localhost:54321/functions/v1/init-user-profile \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "email": "test@example.com"
  }'
```

---

## Common Issues and Solutions

### Issue 1: Import Path Error

**Error**: `Relative import path not prefixed with / or ./ or ../`

**Solution**: Use full URLs for imports:

```typescript
// ❌ Wrong
import { createClient } from "@supabase/supabase-js";

// ✅ Correct
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
```

### Issue 2: Missing Environment Variables

**Error**: `Deno.env.get() returns undefined`

**Solution**: Set variables in Supabase dashboard:

```bash
supabase secrets set SUPABASE_URL=your-url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-key
```

### Issue 3: CORS Issues

**Solution**: Add proper CORS headers:

```typescript
const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

return new Response(JSON.stringify(data), {
  headers,
  status: 200,
});
```

### Issue 4: Function Timeout

**Solution**: Increase timeout or optimize function:

- Default timeout: 10 seconds
- Maximum timeout: 60 seconds (Pro plan)
- Optimize queries and reduce dependencies

---

## Available Deno Modules

### Standard Library
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
```

### Supabase
```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
```

### Third-party Libraries
```typescript
// Use esm.sh for npm packages
import jwt from "https://esm.sh/jsonwebtoken@9";
import crypto from "https://deno.land/std@0.168.0/crypto/mod.ts";
```

---

## Best Practices

### 1. **Error Handling**
```typescript
try {
  // Function logic
} catch (error) {
  console.error("Error details:", error);
  return new Response(
    JSON.stringify({ error: error.message }),
    { status: 500, headers: { "Content-Type": "application/json" } }
  );
}
```

### 2. **Input Validation**
```typescript
const { email, password } = await req.json();

if (!email || !password) {
  return new Response(
    JSON.stringify({ error: "Missing required fields" }),
    { status: 400, headers: { "Content-Type": "application/json" } }
  );
}
```

### 3. **Security**
- Never expose secrets in logs
- Validate authorization headers
- Sanitize inputs
- Use environment variables for sensitive data

### 4. **Performance**
```typescript
// Reuse Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Use select to limit data
const { data } = await supabase
  .from("users")
  .select("id, email") // Only fetch needed fields
  .limit(10);
```

---

## Calling Edge Functions from Frontend

```typescript
// src/services/edgeFunctions.ts
export async function callEdgeFunction(
  functionName: string,
  payload: any
) {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Edge function error");
  }

  return data;
}

// Usage
import { callEdgeFunction } from "./services/edgeFunctions";

// Call function
const result = await callEdgeFunction("init-user-profile", {
  userId: user.id,
  email: user.email,
});
```

---

## Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Deno Manual](https://deno.land/manual)
- [ESM.sh Package Registry](https://esm.sh)
- [JSR Package Registry](https://jsr.io)

---

## Summary

✅ **Do's**:
- Use full import URLs: `https://esm.sh/@supabase/supabase-js@2`
- Store secrets in environment variables
- Validate all inputs
- Handle errors properly
- Test functions locally before deploying

❌ **Don'ts**:
- Don't use relative imports like `import { x } from '@package'`
- Don't hardcode secrets in code
- Don't ignore error handling
- Don't use unvalidated user input
- Don't log sensitive information
