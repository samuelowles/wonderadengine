# 01_Project_Structure.md

## Overview
This document defines the file structure and design system for the **Wondura Engine** application. The architecture is built on **Cloudflare Pages** (Vite + React) for the frontend and **Cloudflare Functions** for the backend, adhering to the **Ralph Wiggum Framework** (Resilient, Accessible, Lightweight, Performant, Hardened).

## Design System & Principles

### 1. Visual Identity: "Editorial Nature Tech"
A precise blend of **Swiss Editorial Layouts** (reference: Flower Water) and **High-Performance Utility** (reference: Relays).

#### Color Palette (Strict)
*   **Surface / Backgrounds**
    *   `bg-paper`: `#F9F8F4` (Warm off-white, base layer).
    *   `bg-surface`: `#FFFFFF` (Card backgrounds).
    *   `bg-ink`: `#121212` (Dark mode base).
*   **Typography & Ink**
    *   `text-primary`: `#1A1C19` (Near-black, 90% opacity).
    *   `text-secondary`: `#5C5C58` (Muted organic grey).
    *   `text-inverse`: `#F2F2F0` (For dark buttons/overlays).
*   **Brand Accents**
    *   `brand-forest`: `#2D3A28` (Primary Action - Deep Olive).
    *   `brand-clay`: `#BC5D3F` (Highlights/Tags - Terracotta).
    *   `brand-mist`: `#DCE0E5` (Borders/Dividers).
*   **Functional**
    *   `glass-light`: `rgba(255, 255, 255, 0.7)` with `backdrop-filter: blur(12px)`.
    *   `glass-dark`: `rgba(20, 20, 20, 0.6)` with `backdrop-filter: blur(16px)`.

#### Typography System
*   **Headings (Serif)**: *Fraunces* (Variable) or *Playfair Display*.
    *   **H1**: 48px/1.1 (Mobile), 64px/1.1 (Desktop). Tracking: -2%. Weight: 600.
    *   **H2**: 32px/1.2. Tracking: -1%. Weight: 500.
    *   **H3**: 24px/1.3. Tracking: 0%. Weight: 400 Italic.
*   **Body / Interface (Sans)**: *Inter* or *Geist Sans*.
    *   **Body-Lg**: 18px/1.6. Weight: 400.
    *   **Body-Base**: 16px/1.5. Weight: 400.
    *   **Caption/Label**: 12px/1.1. Uppercase. Tracking: +4%. Weight: 500.

### 2. Concrete UI Physics & Shape
*   **Borders & Radius**
    *   `rounded-xl`: `24px` (Standard Cards - soft, nature-inspired).
    *   `rounded-lg`: `12px` (Inner elements, inputs).
    *   `rounded-full`: Buttons and Pills.
    *   **Border Width**: `1px` solid `brand-mist` (Light mode), None (Dark mode).
*   **Shadows (Elevation)**
    *   `shadow-sm`: `0px 2px 8px rgba(0,0,0,0.04)` (Cards at rest).
    *   `shadow-hover`: `0px 8px 24px rgba(45, 58, 40, 0.08)` (Cards active).
*   **Glassmorphism Rules**
    *   Used strictly for **Overlays** (e.g., sticky headers, modal backdrops) and **Data Visualization** (floating ranking badges).
    *   Must have a `1px` white border with `opacity-20` for separation.
*   **Animation (Relays-style)**
    *   **Spring Physics**: `stiffness: 100`, `damping: 15`. No linear easings.
    *   **Feedback**: Buttons scale down `0.98` on press. Cards lift `y: -4px` on hover.

### 3. Layout Strategy
*   **Margins**: Fixed `20px` (Mobile), `40px` (Tablet), `120px` (Desktop).
*   **Grid**: 12-column fluid grid.
*   **Whitespace**: Use specific spacing tokens. `gap-8` (32px) between major sections. Not condensed.

## File Structure

```text
/
├── .wrangler/                  # Local Wrangler state
├── functions/                  # Cloudflare Pages Functions (Backend)
│   ├── api/
│   │   ├── classify.ts         # [POST] Classifies User Intent (Gemini Router)
│   │   ├── agent.ts            # [POST] Main Wondura Agent (Streamed Response)
│   │   ├── options/
│   │   │   ├── destinations.ts # [POST] Parallel Search: Destinations
│   │   │   ├── activities.ts   # [POST] Parallel Search: Activities
│   │   │   └── both.ts         # [POST] Parallel Search: Both (Options_Both)
│   │   └── tools/
│   │       ├── weather.ts      # [Internal] Weather Helper
│   │       ├── events.ts       # [Internal] Events Helper
│   │       ├── dining.ts       # [Internal] Food & Dining Helper
│   │       ├── activities.ts   # [Internal] Activities Helper
│   │       ├── price.ts        # [Internal] Price Verification
│   │       └── venue.ts        # [Internal] Venue Verification
│   ├── _middleware.ts          # Error handling, CORS, Security Headers
│   └── types.d.ts              # Backend-specific types
│
├── public/                     # Static assets (Favicons, Robots.txt)
│
├── src/                        # React Client (Frontend)
│   ├── shared/                 # Shared Code (Schemas, Utils)
│   │   ├── schema.ts           # Zod Schemas (Shared FE/BE)
│   │   └── types.ts            # Shared TypeScript Types
│   ├── assets/                 # Images, Fonts
│   ├── components/
│   │   ├── ui/                 # Reusable Base Components (Button, Card, Input)
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Typography.tsx  # Handles Serif/Sans mixing
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   └── Layout.tsx      # Main Shell
│   │   ├── features/
│   │   │   ├── FormFlow.tsx    # The Multi-step Input Form
│   │   │   ├── ResultsFeed.tsx # Streamed Results Display
│   │   │   └── OptionCard.tsx  # Destination/Activity Cards
│   ├── lib/
│   │   ├── api-client.ts       # Type-safe Fetch Wrapper
│   │   └── utils.ts            # CN/Clsx helpers
│   ├── hooks/
│   │   └── useWondura.ts       # Main State Management Hook
│   ├── styles/
│   │   └── index.css           # Tailwind + Custom Font directives
│   ├── App.tsx
│   └── main.tsx
│
├── context/                    # Context Files (Reference)
│   ├── 01_project_structure.md
│   ├── 02_architecture.md
│   ├── 03_prompts.md
│   ├── 04_api_specs.md
│   ├── 05_security_env.md
│   └── 06_workflow.md
│
├── package.json
├── tailwind.config.ts          # Defined Design Tokens
├── tsconfig.json
├── vite.config.ts
└── wrangler.toml               # Cloudflare Configuration
```

## Key Configuration

### `tailwind.config.ts` (Conceptual)
```typescript
export default {
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Fraunces"', '"Playfair Display"', 'serif'],
        sans: ['"Inter"', '"Geist Sans"', 'sans-serif'],
      },
      colors: {
        paper: '#F9F8F4',
        surface: '#FFFFFF',
        ink: '#121212',
        primary: '#1A1C19',
        secondary: '#5C5C58',
        inverse: '#F2F2F0',
        brand: {
          forest: '#2D3A28',
          clay: '#BC5D3F',
          mist: '#DCE0E5',
        }
      },
      borderRadius: {
        'xl': '1.5rem',
        'lg': '0.75rem',
      },
      boxShadow: {
        'sm': '0px 2px 8px rgba(0,0,0,0.04)',
        'hover': '0px 8px 24px rgba(45, 58, 40, 0.08)',
      }
    }
  }
}
```

### `wrangler.toml` (Cloudflare Config)
```toml
name = "wondura-engine"
compatibility_date = "2024-01-01"
pages_build_output_dir = "./dist"

[vars]
APP_ENV = "production"

# Secrets set via: wrangler secret put GOOGLE_AI_KEY
# Secrets set via: wrangler secret put PARALLEL_API_KEY
```
