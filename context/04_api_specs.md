# 04_API_Specs.md

## Overview
This document defines the Type-Safe API contract between the React Frontend and Cloudflare Functions Backend. We use **Zod** for runtime validation.

## Shared Schemas (`src/shared/schema.ts`)

```typescript
import { z } from 'zod';

export const UserQuerySchema = z.object({
  destination: z.string().optional(),      // "Where to?" field
  dates: z.string().optional(),            // "When?" field
  activity1: z.string().optional(),        // "Activity 1" field
  activity2: z.string().optional(),        // "Activity 2" field
  activity3: z.string().optional(),        // "Activity 3" field
  dealmaker: z.string().optional(),        // "Dealmaker" field
});

export const RoutingResultSchema = z.object({
  routing: z.enum(['Details', 'Options_Destinations', 'Options_Activities', 'Options_Both', 'Unknown']),
  extracted: UserQuerySchema,
});

export const ExperienceCardSchema = z.object({
  card_title: z.string(),
  hook: z.string(),
  context: z.string(),
  practical: z.string(),
  insight: z.string(),
  consider: z.string(),
});

export const OptionItemSchema = z.object({
  name: z.string(),
  subtext: z.string(), // Region or Location
  ranking: z.number().min(0).max(5),
  justification: z.string(),
  image_query: z.string(),
});

export const DestinationWithActivitiesSchema = z.object({
  name: z.string(),
  region: z.string(),
  ranking: z.number().min(0).max(5),
  justification: z.string(),
  image_query: z.string(),
  activities: z.array(z.object({
    name: z.string(),
    justification: z.string(),
  })).length(2), // Exactly 2 activities per destination
});
```

## Endpoints

### 1. Classify (`POST /api/classify`)
*   **Request**: `UserQuerySchema`
*   **Response**: `RoutingResultSchema`
*   **Errors**: 400 (Validation), 500 (Model Error)

### 2. Agent Stream (`POST /api/agent`)
*   **Request**: `RoutingResultSchema` (The refined intent)
*   **Response**: `text/event-stream` (Server Sent Events)
*   **Stream Format**:
    ```
    event: status
    data: {"phase": "searching", "tool": "weather"}

    event: status
    data: {"phase": "generating"}

    event: card
    data: {"card_title": "...", "hook": "...", ...}

    event: done
    data: {}
    ```
*   **Client Handling**: Use `EventSource` or `fetch` with `ReadableStream`.

### 3. Options (`POST /api/options/destinations` | `/api/options/activities` | `/api/options/both`)
*   **Request**: `RoutingResultSchema`
*   **Response (destinations/activities)**: `{ options: OptionItemSchema[] }`
*   **Response (both)**: `{ destinations: DestinationWithActivitiesSchema[] }` (Destinations, each with 2 nested activities)

## Tool Interfaces (Internal)

### Parallel AI Search Request Format
All tools use the Parallel AI search API. Request format:
```typescript
interface ParallelSearchRequest {
  objective: string;      // Natural language search objective
  processor: "pro" | "fast";
  max_results: number;    // Max 20
  max_chars_per_result: number; // Max 10000
}

// Example:
{
  "objective": "Find weather forecast for Queenstown next weekend",
  "processor": "pro",
  "max_results": 10,
  "max_chars_per_result": 5000
}
```

### Tool Response Format
```typescript
interface ToolResponse {
  results: Array<{
    title: string;
    description: string;
    url?: string;
    meta: Record<string, any>; // Price, Time, Address
  }>;
}
```

## Middleware (`_middleware.ts`)
```typescript
// CORS Headers for all API routes
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.APP_ENV === 'production'
    ? 'https://wondura.pages.dev'
    : 'http://localhost:5173',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export const onRequest: PagesFunction = async (context) => {
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  const response = await context.next();
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
};
```

interface ToolResponse {
  results: Array<{
    title: string;
    description: string;
    meta: Record<string, any>; // Price, Time, Address
  }>;
}
```
