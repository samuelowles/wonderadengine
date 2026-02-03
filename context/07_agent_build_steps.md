# 07_Agent_Build_Steps.md

## Overview
This document provides **exact, sequential steps** for a coding agent to build the Wondura Engine app. Each step references the relevant context file and includes verification criteria.

---

## Phase 1: Project Scaffolding

### Step 1.1: Initialize Vite + React + TypeScript
```bash
npx -y create-vite@latest ./ --template react-ts
npm install
```
**Verify**: `npm run dev` starts without errors.

### Step 1.2: Install Dependencies
```bash
npm install zod tailwindcss postcss autoprefixer
npm install -D @cloudflare/workers-types wrangler
npx tailwindcss init -p
```

### Step 1.3: Create Directory Structure
Create folders per `01_project_structure.md`:
```
mkdir -p functions/api/options functions/api/tools
mkdir -p src/shared src/components/ui src/components/layout src/components/features
mkdir -p src/lib src/hooks src/styles src/assets
```

### Step 1.4: Configure Tailwind
Copy `tailwind.config.ts` from `01_project_structure.md`. Update `content` paths:
```typescript
content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
```

### Step 1.5: Create `wrangler.toml`
Copy from `01_project_structure.md`. Create `.dev.vars` (gitignored):
```
GOOGLE_AI_KEY=your_key_here
PARALLEL_API_KEY=your_key_here
```

**Phase 1 Checkpoint**: Project runs with `npm run dev`.

---

## Phase 2: Shared Schemas & Types

### Step 2.1: Create `src/shared/schema.ts`
Copy all Zod schemas from `04_api_specs.md`:
- `UserQuerySchema`
- `RoutingResultSchema`
- `ExperienceCardSchema`
- `OptionItemSchema`
- `DestinationWithActivitiesSchema`

### Step 2.2: Create `src/shared/types.ts`
Export inferred types:
```typescript
import { z } from 'zod';
import * as schemas from './schema';

export type UserQuery = z.infer<typeof schemas.UserQuerySchema>;
export type RoutingResult = z.infer<typeof schemas.RoutingResultSchema>;
// ... etc
```

**Phase 2 Checkpoint**: `npm run type-check` passes.

---

## Phase 3: Backend Functions

### Step 3.1: Create `functions/_middleware.ts`
Copy CORS middleware from `04_api_specs.md`.

### Step 3.2: Create `functions/api/classify.ts`
1. Parse request body with `UserQuerySchema`.
2. Call Gemini Flash with Classifier Prompt from `03_prompts.md`.
3. Parse LLM response with `RoutingResultSchema`.
4. Return JSON.

### Step 3.3: Create Tool Helpers
For each tool in `functions/api/tools/`:
- `weather.ts`
- `events.ts`
- `dining.ts`
- `activities.ts`
- `price.ts`
- `venue.ts`

Each tool:
1. Accepts `{ location, query }`.
2. Calls Parallel AI with format from `04_api_specs.md`.
3. Returns `ToolResponse`.

### Step 3.4: Create `functions/api/agent.ts`
1. Parse request with `RoutingResultSchema`.
2. Execute tools concurrently: `Promise.all([weather(), events(), dining(), activities()])`.
3. Assemble context string.
4. Stream Gemini Pro response using SSE format from `04_api_specs.md`.
5. Parse each chunk into `ExperienceCardSchema`.

### Step 3.5: Create Options Endpoints
- `functions/api/options/destinations.ts`
- `functions/api/options/activities.ts`
- `functions/api/options/both.ts`

Use prompts from `03_prompts.md`. Return JSON (not streamed).

**Phase 3 Checkpoint**: Test each endpoint with `curl` or Postman.

---

## Phase 4: Frontend Components

### Step 4.1: Create Base UI Components
Per `01_project_structure.md` design system:

**`src/components/ui/Button.tsx`**
- Variants: `primary` (forest), `secondary` (outline).
- Spring animation on press (`scale: 0.98`).

**`src/components/ui/Card.tsx`**
- `rounded-xl`, `shadow-sm`, lift on hover.
- Glassmorphism variant for overlays.

**`src/components/ui/Typography.tsx`**
- `<Heading>` (Serif: Fraunces).
- `<Body>` (Sans: Inter).

### Step 4.2: Create Layout Components
**`src/components/layout/Layout.tsx`**
- Paper background, responsive margins per `01_project_structure.md`.

**`src/components/layout/Header.tsx`**
- Logo, minimal nav (optional).

### Step 4.3: Create Feature Components

**`src/components/features/FormFlow.tsx`**
- Fields: Destination, When, Activity 1/2/3, Dealmaker.
- Submit calls `/api/classify`.
- On response, routes to Results or Options view.

**`src/components/features/ResultsFeed.tsx`**
- Connects to `/api/agent` via `EventSource`.
- Renders `ExperienceCard` components as they stream.

**`src/components/features/OptionCard.tsx`**
- Displays destination/activity option with ranking badge.
- Image placeholder (uses `image_query` for future search).

### Step 4.4: Create State Hook
**`src/hooks/useWondura.ts`**
- State: `phase` (form | loading | options | results).
- State: `routingResult`, `experienceCards`, `options`.
- Actions: `submitQuery()`, `selectOption()`.

### Step 4.5: Wire Up `App.tsx`
- Render `Layout` > conditional `FormFlow` | `ResultsFeed` | `OptionsList`.

**Phase 4 Checkpoint**: Form submits, loading state shows, mock data renders.

---

## Phase 5: Integration & Polish

### Step 5.1: Connect Real APIs
- Replace mock responses with actual `/api/*` calls.
- Handle errors gracefully (show toast/alert).

### Step 5.2: Apply Visual Polish
- Import Google Fonts (Fraunces, Inter).
- Add transitions per animation specs in `01_project_structure.md`.
- Test dark mode (if applicable).

### Step 5.3: Verify Security
Per `05_security_env.md`:
- Test CORS (should block unauthorized origins).
- Test Zod validation (malformed input returns 400).
- Confirm secrets are NOT in client bundle.

**Phase 5 Checkpoint**: Full flow works end-to-end.

---

## Phase 6: Deployment

### Step 6.1: Build
```bash
npm run build
```

### Step 6.2: Deploy to Cloudflare Pages
```bash
npx wrangler pages deploy dist --project-name wondura-engine
```

### Step 6.3: Set Production Secrets
```bash
wrangler secret put GOOGLE_AI_KEY
wrangler secret put PARALLEL_API_KEY
```

### Step 6.4: Verify Production
- Visit `https://wondura-engine.pages.dev`.
- Submit a test query.
- Confirm results stream correctly.

---

## Verification Tests (Ralph Wiggum)

| Test | Command/Action | Expected |
|---|---|---|
| **Homer Test** | Submit "Beer" only | Gets options or results |
| **Wiggum Test** | Submit `{"hack": true}` | Returns 400 |
| **Road Runner Test** | Time classification | < 1.5s |

---

## Visual Reference Checklist

| Element | Spec from `01_project_structure.md` |
|---|---|
| Headings | Fraunces, 48-64px, -2% tracking |
| Body | Inter, 16-18px |
| Card Radius | 24px |
| Card Shadow | `0px 2px 8px rgba(0,0,0,0.04)` |
| Hover Lift | `y: -4px` |
| Button Press | `scale: 0.98` |
| Background | `#F9F8F4` (paper) |
| Primary Action | `#2D3A28` (forest) |
