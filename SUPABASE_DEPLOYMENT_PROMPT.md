# Supabase AI Assistant Deployment Prompt

## Comprehensive Prompt for Edge Functions & Database Functions Deployment

Use this prompt with Supabase AI Assistant to generate deployment-ready functions:

---

### Master Deployment Prompt

```
I need to deploy serverless functions to Supabase for my MANYATTAke property rental platform.

PROJECT CONTEXT:
- Platform: Property booking platform (Safaris, Mountain Villas, Urban Apartments)
- Database: Supabase PostgreSQL with RLS policies
- Frontend: React + TypeScript
- Auth: Email/Password + OAuth
- Tables: user_profiles, properties, bookings, reviews, blog_posts, wishlists, inquiries

FUNCTION REQUIREMENTS:

1. AUTHENTICATION & USER FUNCTIONS
   - Handle user signup with profile creation
   - Verify email confirmations
   - Sync user data to user_profiles table
   - Update user profile information
   - Handle OAuth callback processing
   - Generate JWT tokens for API access

2. BOOKING FUNCTIONS
   - Create new booking with validation (check-in < check-out)
   - Calculate total price (nights × price_per_night + taxes)
   - Send booking confirmation emails to users
   - Update property availability status
   - Handle booking cancellations with refund processing
   - Generate booking invoices/receipts
   - Validate booking conflicts (overlapping dates)

3. PAYMENT FUNCTIONS
   - Process booking payments (integration with Stripe/M-Pesa)
   - Handle payment webhooks
   - Update payment_status in bookings table
   - Send payment confirmation emails
   - Handle payment failures and retries
   - Generate payment receipts

4. REVIEW & RATING FUNCTIONS
   - Create reviews only for completed bookings
   - Validate rating (1-5 scale)
   - Update property rating average (aggregate from reviews)
   - Update review_count on properties table
   - Send review notification emails to property admins
   - Handle review moderation (spam/inappropriate content)
   - Flag helpful reviews (helpful_count increment)

5. NOTIFICATION FUNCTIONS
   - Send booking confirmation emails
   - Send payment receipts
   - Send password reset emails
   - Send new booking alerts to admins
   - Send review notifications
   - Send inquiry response notifications
   - Weekly newsletter for wishlisted properties

6. INQUIRY MANAGEMENT FUNCTIONS
   - Accept contact form submissions
   - Store inquiries in database
   - Send confirmation email to inquirer
   - Notify admin of new inquiry
   - Send response emails from admin
   - Update inquiry status (unread → read → responded)

7. WISHLIST FUNCTIONS
   - Add/remove properties from wishlist
   - Prevent duplicate wishlist entries
   - Fetch user's wishlist with property details
   - Send price drop notifications for wishlisted items

8. ADMIN FUNCTIONS
   - Create/update/delete properties
   - Generate booking analytics
   - Generate revenue reports
   - Export booking data (CSV)
   - Bulk update property availability
   - Manage user accounts
   - View platform statistics

9. CRON/SCHEDULED FUNCTIONS
   - Send reminder emails 24 hours before check-in
   - Send review request emails 3 days after checkout
   - Generate daily/weekly platform reports
   - Clean up abandoned bookings (older than 7 days, unpaid)
   - Sync external calendar data

REQUIREMENTS FOR EACH FUNCTION:
- ✅ Full error handling with meaningful error messages
- ✅ Input validation (email format, date ranges, numeric values)
- ✅ RLS-aware queries (check auth.uid())
- ✅ Database transaction handling for multi-step operations
- ✅ Detailed logging for debugging
- ✅ Type safety (TypeScript with proper interfaces)
- ✅ Security: Never expose sensitive data in responses
- ✅ Rate limiting considerations
- ✅ Proper HTTP status codes (201 for created, 400 for bad request, etc.)
- ✅ CORS headers for frontend requests
- ✅ Comprehensive JSDoc comments
- ✅ Environment variable usage for API keys/secrets

RESPONSE FORMAT:
For each function, provide:
1. Function name and purpose
2. Full TypeScript code with error handling
3. Environment variables needed
4. Deployment instructions
5. Testing examples (curl commands)
6. Security considerations
7. Performance tips
8. Known limitations

ADDITIONAL REQUIREMENTS:
- Use @supabase/supabase-js client library
- Follow PostgreSQL best practices
- Include database function calls where appropriate
- Support both Edge Functions and Database Functions where relevant
- Implement proper async/await patterns
- Use environment-specific configurations
- Include retry logic for external API calls
- Add request validation with detailed error messages

DEPLOYMENT STRATEGY:
- One function per specific feature/responsibility
- Modular code for reusability
- Shared utility functions for common operations (email sending, logging, validation)
- Proper secret management via environment variables
- Development vs Production environment handling
```

---

## Specific Function Deployment Prompts

### 1. Email & Notification System

```
Create a robust email notification system for Supabase Edge Functions that:
- Sends booking confirmation emails with booking details
- Sends payment receipts with transaction information
- Sends password reset links with secure tokens
- Sends review request emails to previous guests
- Supports email templates with HTML formatting
- Uses environment variables for SendGrid/Mailgun API keys
- Includes retry logic for failed sends
- Logs all email transactions
- Handles invalid email addresses gracefully
- Prevents duplicate email sends

Provide functions for: sendBookingConfirmation, sendPaymentReceipt, sendPasswordReset, sendReviewRequest
Include Handlebars templates for professional email design.
```

### 2. Payment Processing & Webhooks

```
Create payment processing functions that:
- Accept Stripe/M-Pesa webhook events
- Verify webhook signatures for security
- Update booking payment_status in database
- Handle payment failures with retry logic
- Send payment confirmation/failure emails
- Process refunds on cancellations
- Track transaction IDs for reconciliation
- Log all payment events
- Handle currency conversion if needed
- Update user payment history

Handle webhook events: payment_intent.succeeded, payment_intent.failed, charge.refunded
Include proper error handling and idempotency for duplicate webhook calls.
```

### 3. Booking Management System

```
Create a complete booking management system that:
- Validates booking dates and availability
- Prevents double-booking of properties
- Calculates accurate pricing with taxes/fees
- Updates property availability status
- Creates booking records with proper status tracking
- Sends confirmation emails immediately
- Implements booking cancellation with refunds
- Handles special requests
- Validates guest capacity
- Enforces minimum/maximum stay lengths

Include validation for: date ranges, guest count, property capacity, payment info
Provide transaction handling for atomic operations (booking + payment + notification).
```

### 4. Review & Rating System

```
Create a review management system that:
- Allows reviews only for completed bookings
- Validates ratings (1-5 scale)
- Calculates average property ratings
- Updates review counts dynamically
- Prevents duplicate reviews from same user
- Implements review moderation (flagging inappropriate content)
- Notifies property owners of new reviews
- Tracks review helpfulness votes
- Generates review analytics
- Prevents review spam

Include fields: rating, title, content, helpful_count, moderation_status
Ensure reviews cannot be created for future/pending bookings.
```

### 5. Analytics & Reporting

```
Create analytics functions that:
- Generate daily/weekly/monthly booking reports
- Calculate revenue metrics
- Track property performance metrics
- Generate occupancy rates
- Create guest statistics (new vs returning)
- Export data in CSV format
- Generate admin dashboards data
- Track platform KPIs
- Create forecast reports
- Analyze review trends

Include time-range filtering, aggregation by property/category, and export capabilities.
Ensure admin-only access with proper authorization checks.
```

---

## Pre-Deployment Checklist Prompt

```
Before deploying Supabase functions, verify:

SECURITY:
- [ ] All env variables are properly configured
- [ ] No secrets hardcoded in function code
- [ ] RLS policies are properly enforced
- [ ] Auth checks on all protected operations
- [ ] Input validation on all parameters
- [ ] CORS headers configured correctly
- [ ] Rate limiting implemented for public endpoints

PERFORMANCE:
- [ ] Database queries are optimized
- [ ] Indexes exist on frequently queried columns
- [ ] Connection pooling configured
- [ ] Caching strategy implemented
- [ ] Response times are acceptable (<1s for most operations)
- [ ] No N+1 query problems

RELIABILITY:
- [ ] Error handling covers all scenarios
- [ ] Retry logic for external API calls
- [ ] Proper logging of all operations
- [ ] Graceful handling of timeouts
- [ ] Transaction handling for critical operations
- [ ] Webhook signature verification

TESTING:
- [ ] Unit tests for business logic
- [ ] Integration tests with database
- [ ] Load testing for performance
- [ ] Security testing (SQL injection, auth bypass)
- [ ] Error scenario testing

MONITORING:
- [ ] Error tracking configured (Sentry/LogRocket)
- [ ] Performance monitoring enabled
- [ ] Health check endpoints
- [ ] Alert thresholds set
```

---

## Usage Instructions

1. **For complete function setup**: Use the Master Deployment Prompt
2. **For specific features**: Use the Specific Function Deployment Prompts
3. **Before deploying**: Run through the Pre-Deployment Checklist
4. **For troubleshooting**: Reference specific function requirements

---

## Quick Function Templates

### Edge Function Template

```
Generate an Edge Function that:
- Endpoint: /function/[name]
- Method: [POST/GET/PUT/DELETE]
- Auth: [Required/Optional/None]
- Request body: [JSON schema]
- Response: [Success/Error format]
- Error codes: [Specific codes for each failure scenario]
- Rate limit: [Requests per second]
- Timeout: [Duration]
- Logs: [What to log]
- Security: [Validation rules]
```

### Database Function Template

```
Generate a PostgreSQL function that:
- Trigger: [Before/After] [INSERT/UPDATE/DELETE]
- Logic: [What should happen]
- Rollback conditions: [When to fail]
- Notifications: [RLS notifications]
- Performance: [Indexed columns used]
- Testing: [Sample data for testing]
```

---

## Notes for AI Assistant

- Use TypeScript for type safety
- Follow Supabase naming conventions
- Use meaningful error messages
- Include comprehensive JSDoc documentation
- Provide curl examples for testing
- Consider database transaction handling
- Implement idempotency where needed (webhooks)
- Use parameterized queries to prevent SQL injection
- Handle timezone conversions properly
- Validate all external data (emails, phone numbers, etc.)
