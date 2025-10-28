# API Documentation

Complete reference for the Scruffy Butts API, including database queries, RPC functions, storage operations, and Edge Functions.

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Database API (PostgREST)](#database-api-postgrest)
4. [RPC Functions](#rpc-functions)
5. [Storage API](#storage-api)
6. [Edge Functions](#edge-functions)
7. [Realtime Subscriptions](#realtime-subscriptions)
8. [Error Handling](#error-handling)
9. [Rate Limits](#rate-limits)

## Overview

The Scruffy Butts API is built on Supabase, providing:
- **RESTful API** via PostgREST for database operations
- **RPC Functions** for complex queries and operations
- **Storage API** for file uploads/downloads
- **Edge Functions** for serverless compute
- **Realtime** for WebSocket subscriptions

**Base URL**: `https://tuwkdsoiltdboiaghztz.supabase.co`

**API Endpoints**:
- Database: `/rest/v1/`
- Storage: `/storage/v1/`
- Auth: `/auth/v1/`
- Functions: `/functions/v1/`
- Realtime: `wss://tuwkdsoiltdboiaghztz.supabase.co/realtime/v1/`

## Authentication

All requests require authentication via JWT token in the `Authorization` header.

### Headers

```
Authorization: Bearer <JWT_TOKEN>
apikey: <SUPABASE_ANON_KEY>
Content-Type: application/json
```

### Get Token (Sign In)

**Endpoint**: `POST /auth/v1/token?grant_type=password`

**Request**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "...",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "role": "authenticated"
  }
}
```

### Refresh Token

**Endpoint**: `POST /auth/v1/token?grant_type=refresh_token`

**Request**:
```json
{
  "refresh_token": "refresh_token_here"
}
```

## Database API (PostgREST)

### Query Customers

**GET** `/rest/v1/customers`

**Query Parameters**:
- `select=*` - Select all columns
- `id=eq.{uuid}` - Filter by ID
- `email=ilike.%search%` - Search by email
- `limit=10` - Limit results
- `offset=0` - Pagination offset
- `order=created_at.desc` - Sort order

**Example**:
```bash
curl -X GET \
  'https://tuwkdsoiltdboiaghztz.supabase.co/rest/v1/customers?select=*&limit=10' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'apikey: YOUR_ANON_KEY'
```

**Response**:
```json
[
  {
    "id": "customer-uuid",
    "first_name": "Jane",
    "last_name": "Doe",
    "email": "jane@example.com",
    "phone": "555-1234",
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

### Create Customer

**POST** `/rest/v1/customers`

**Request**:
```json
{
  "first_name": "John",
  "last_name": "Smith",
  "email": "john@example.com",
  "phone": "555-5678",
  "address": "123 Main St",
  "city": "Portland",
  "state": "OR",
  "zip": "97201"
}
```

**Response**: `201 Created`
```json
{
  "id": "new-customer-uuid",
  "first_name": "John",
  "last_name": "Smith",
  "email": "john@example.com",
  "phone": "555-5678",
  "created_at": "2025-01-15T10:00:00Z",
  "updated_at": "2025-01-15T10:00:00Z"
}
```

### Update Customer

**PATCH** `/rest/v1/customers?id=eq.{uuid}`

**Request**:
```json
{
  "phone": "555-9999",
  "notes": "Prefers appointments in the morning"
}
```

**Response**: `200 OK`

### Delete Customer

**DELETE** `/rest/v1/customers?id=eq.{uuid}`

**Response**: `204 No Content`

### Query with Joins

Get customer with pets:

```bash
GET /rest/v1/customers?select=*,pets(*)&id=eq.customer-uuid
```

**Response**:
```json
{
  "id": "customer-uuid",
  "first_name": "Jane",
  "last_name": "Doe",
  "pets": [
    {
      "id": "pet-uuid",
      "name": "Max",
      "breed": "Golden Retriever",
      "size": "large"
    }
  ]
}
```

## RPC Functions

Remote Procedure Calls for complex operations.

### Get My Profile

**POST** `/rest/v1/rpc/get_my_profile`

**Request**: (No body needed)

**Response**:
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "first_name": "Jane",
  "last_name": "Doe",
  "role": "customer",
  "created_at": "2025-01-01T00:00:00Z"
}
```

### Update My Profile

**POST** `/rest/v1/rpc/update_my_profile`

**Request**:
```json
{
  "p_first_name": "Jane",
  "p_last_name": "Doe",
  "p_phone": "555-1234"
}
```

**Response**:
```json
{
  "id": "user-uuid",
  "first_name": "Jane",
  "last_name": "Doe",
  "phone": "555-1234",
  "updated_at": "2025-01-15T10:00:00Z"
}
```

### Get Appointment Details

**POST** `/rest/v1/rpc/get_appointment_details`

**Request**:
```json
{
  "p_appointment_id": "appointment-uuid"
}
```

**Response**:
```json
{
  "appointment": {
    "id": "appointment-uuid",
    "appointment_date": "2025-01-20",
    "start_time": "10:00:00",
    "end_time": "11:30:00",
    "status": "scheduled",
    "price": 65.00
  },
  "customer": {
    "id": "customer-uuid",
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane@example.com",
    "phone": "555-1234"
  },
  "pet": {
    "id": "pet-uuid",
    "name": "Max",
    "breed": "Golden Retriever",
    "size": "large"
  },
  "service": {
    "id": "service-uuid",
    "name": "Full Groom - Large Dog",
    "duration": 90,
    "price": 65.00
  },
  "staff": {
    "id": "staff-uuid",
    "firstName": "Sarah",
    "lastName": "Johnson",
    "color": "#3B82F6"
  }
}
```

### Get Appointments by Date Range

**POST** `/rest/v1/rpc/get_appointments_by_date_range`

**Request**:
```json
{
  "p_start_date": "2025-01-15",
  "p_end_date": "2025-01-20",
  "p_staff_id": "staff-uuid",
  "p_status": "scheduled"
}
```

**Response**:
```json
[
  {
    "appointment_id": "uuid",
    "customer_name": "Jane Doe",
    "pet_name": "Max",
    "service_name": "Full Groom - Large Dog",
    "staff_name": "Sarah Johnson",
    "appointment_date": "2025-01-15",
    "start_time": "10:00:00",
    "end_time": "11:30:00",
    "status": "scheduled",
    "price": 65.00
  }
]
```

### Find Appointment Conflicts

**POST** `/rest/v1/rpc/find_appointment_conflicts`

**Request**:
```json
{
  "p_staff_id": "staff-uuid",
  "p_appointment_date": "2025-01-15",
  "p_start_time": "10:00:00",
  "p_end_time": "11:30:00",
  "p_exclude_appointment_id": null
}
```

**Response**:
```json
[
  {
    "appointment_id": "conflicting-uuid",
    "customer_name": "John Smith",
    "pet_name": "Bella",
    "start_time": "10:30:00",
    "end_time": "12:00:00"
  }
]
```

### Get Revenue Summary

**POST** `/rest/v1/rpc/get_revenue_summary`

**Request**:
```json
{
  "p_start_date": "2025-01-01",
  "p_end_date": "2025-01-31"
}
```

**Response**:
```json
{
  "totalRevenue": 12500.00,
  "totalTransactions": 150,
  "averageTransaction": 83.33,
  "totalTax": 1125.00,
  "totalTips": 875.00,
  "totalDiscounts": 250.00,
  "byPaymentMethod": {
    "cash": 3500.00,
    "card": 7500.00,
    "cashapp": 1000.00,
    "chime": 500.00
  }
}
```

### Get Staff Performance

**POST** `/rest/v1/rpc/get_staff_performance`

**Request**:
```json
{
  "p_staff_id": "staff-uuid",
  "p_start_date": "2025-01-01",
  "p_end_date": "2025-01-31"
}
```

**Response**:
```json
{
  "staffId": "staff-uuid",
  "appointmentsCompleted": 45,
  "totalRevenue": 3250.00,
  "averageServiceTime": 82.5,
  "noShowRate": 2.5
}
```

### Get Low Stock Items

**POST** `/rest/v1/rpc/get_low_stock_items`

**Request**: (No parameters)

**Response**:
```json
[
  {
    "item_id": "item-uuid",
    "item_name": "Hypoallergenic Shampoo",
    "category": "shampoo",
    "current_quantity": 3,
    "reorder_level": 5,
    "reorder_quantity": 12,
    "supplier": "PetCo Wholesale"
  }
]
```

### Get Customer History

**POST** `/rest/v1/rpc/get_customer_history`

**Request**:
```json
{
  "p_customer_id": "customer-uuid"
}
```

**Response**:
```json
[
  {
    "appointment_id": "uuid",
    "pet_name": "Max",
    "service_name": "Full Groom - Large Dog",
    "appointment_date": "2025-01-15",
    "status": "completed",
    "price": 65.00,
    "staff_name": "Sarah Johnson"
  }
]
```

## Storage API

### Upload File

**POST** `/storage/v1/object/{bucket_name}/{file_path}`

**Headers**:
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: image/jpeg
```

**Body**: Binary file data

**Example** (JavaScript):
```javascript
const file = event.target.files[0];
const { data, error } = await supabase.storage
  .from('pet-photos')
  .upload(`${petId}/${file.name}`, file);
```

**Response**:
```json
{
  "Key": "pet-photos/pet-uuid/photo.jpg"
}
```

### Download File

**GET** `/storage/v1/object/{bucket_name}/{file_path}`

**Headers**:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response**: Binary file data

### Get Public URL

**GET** `/storage/v1/object/public/{bucket_name}/{file_path}`

Note: Only works for public buckets (currently all buckets are private).

### Create Signed URL

Use Supabase client:
```javascript
const { data } = await supabase.storage
  .from('receipts')
  .createSignedUrl('transaction-uuid/receipt.pdf', 3600); // 1 hour expiry
```

### Delete File

**DELETE** `/storage/v1/object/{bucket_name}/{file_path}`

**Headers**:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response**: `200 OK`

## Edge Functions

Edge Functions run on Deno Deploy for serverless compute.

### Available Functions

(Functions will be created in Phase 7)

#### Admin Operations

**POST** `/functions/v1/admin-operations`

Privileged operations requiring admin role.

#### Email Notifications

**POST** `/functions/v1/email-notifications`

Send transactional emails (appointment confirmations, reminders, etc.).

#### Webhook Handler

**POST** `/functions/v1/webhook-handler`

Handle webhooks from payment providers and external services.

## Realtime Subscriptions

Subscribe to database changes via WebSocket.

### Subscribe to Appointments

**JavaScript/TypeScript**:
```typescript
const channel = supabase
  .channel('appointments')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'appointments'
    },
    (payload) => {
      console.log('Change received!', payload);
    }
  )
  .subscribe();
```

### Subscribe to Specific Row

```typescript
const channel = supabase
  .channel(`appointment:${appointmentId}`)
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'appointments',
      filter: `id=eq.${appointmentId}`
    },
    (payload) => {
      console.log('Appointment updated!', payload.new);
    }
  )
  .subscribe();
```

### Unsubscribe

```typescript
await channel.unsubscribe();
```

## Error Handling

### HTTP Status Codes

- `200 OK` - Success
- `201 Created` - Resource created
- `204 No Content` - Success with no response body
- `400 Bad Request` - Invalid request
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Authenticated but not authorized (RLS policy violation)
- `404 Not Found` - Resource not found
- `409 Conflict` - Constraint violation
- `422 Unprocessable Entity` - Validation error
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

### Error Response Format

```json
{
  "message": "Error description",
  "code": "error_code",
  "details": "Additional details",
  "hint": "Suggested fix"
}
```

### Common Errors

**RLS Policy Violation**:
```json
{
  "message": "new row violates row-level security policy",
  "code": "42501",
  "details": "Failing row contains (...)",
  "hint": "Check that user has permission to access this resource"
}
```

**Foreign Key Violation**:
```json
{
  "message": "insert or update on table violates foreign key constraint",
  "code": "23503",
  "details": "Key (customer_id)=(uuid) is not present in table customers",
  "hint": "Ensure referenced record exists before inserting"
}
```

**Unique Constraint Violation**:
```json
{
  "message": "duplicate key value violates unique constraint",
  "code": "23505",
  "details": "Key (email)=(user@example.com) already exists",
  "hint": "Email must be unique"
}
```

## Rate Limits

**Free Tier**:
- 500 requests/second
- 2GB database storage
- 1GB file storage
- 2GB bandwidth/month

**Pro Tier**:
- 5000 requests/second
- 8GB database storage
- 100GB file storage
- 250GB bandwidth/month

**Rate Limit Headers**:
```
X-RateLimit-Limit: 500
X-RateLimit-Remaining: 450
X-RateLimit-Reset: 1642345678
```

**Rate Limit Exceeded**:
```json
{
  "message": "Rate limit exceeded",
  "code": "429"
}
```

---

## Client Examples

### JavaScript/TypeScript

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabase = createClient<Database>(
  'https://tuwkdsoiltdboiaghztz.supabase.co',
  'SUPABASE_ANON_KEY'
);

// Query customers
const { data: customers, error } = await supabase
  .from('customers')
  .select('*, pets(*)')
  .limit(10);

// Create appointment
const { data: appointment, error } = await supabase
  .from('appointments')
  .insert({
    customer_id: 'customer-uuid',
    pet_id: 'pet-uuid',
    service_id: 'service-uuid',
    appointment_date: '2025-01-20',
    start_time: '10:00:00',
    end_time: '11:30:00',
    duration: 90,
    price: 65.00
  })
  .select()
  .single();

// Call RPC function
const { data: details, error } = await supabase
  .rpc('get_appointment_details', {
    p_appointment_id: 'appointment-uuid'
  });
```

### Swift (iOS)

```swift
import Supabase

let client = SupabaseClient(
  supabaseURL: URL(string: "https://tuwkdsoiltdboiaghztz.supabase.co")!,
  supabaseKey: "SUPABASE_ANON_KEY"
)

// Query customers
let customers: [Customer] = try await client
  .from("customers")
  .select("*, pets(*)")
  .limit(10)
  .execute()
  .value

// Create appointment
struct NewAppointment: Encodable {
  let customerId: UUID
  let petId: UUID
  let serviceId: UUID
  let appointmentDate: String
  let startTime: String
  let endTime: String
  let duration: Int
  let price: Decimal
  
  enum CodingKeys: String, CodingKey {
    case customerId = "customer_id"
    case petId = "pet_id"
    case serviceId = "service_id"
    case appointmentDate = "appointment_date"
    case startTime = "start_time"
    case endTime = "end_time"
    case duration
    case price
  }
}

let appointment = try await client
  .from("appointments")
  .insert(newAppointment)
  .select()
  .single()
  .execute()
  .value
```

---

For more examples and detailed integration guides, see:
- [Web Integration Guide](../README.md#supabase-integration)
- [iOS Integration Guide](IOS_INTEGRATION.md)
- [Database Schema](DATABASE_SCHEMA.md)
- [Security Documentation](SECURITY.md)
