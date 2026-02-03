# 06_Workflow.md

## Overview
Instructions for building, running, and deploying the Wondura Engine.

## Prerequisites
*   Node.js v20+
*   Wrangler CLI (`npm install -g wrangler`)
*   Cloudflare Account

## Commands

### 1. Development
Run the Frontend + Backend proxy locally.
```bash
npm run dev
# Starts Vite on port 5173
# Starts Wrangler Functions proxy on port 8788
```

### 2. Type Generation
Ensure Zod schemas and TypeScript types are synced.
```bash
npm run type-check
```

### 3. Production Build
Build the static assets and prepare functions.
```bash
npm run build
# Output -> /dist
```

### 4. Deployment
Deploy to Cloudflare Pages.
```bash
npx wrangler pages deploy dist --project-name wondura-engine
```

## Testing Guide

### Manual Testing (Ralph Wiggum Style)
1.  **"Homer Test" (Simplicity)**: Can a user get a recommendation with just one word? (e.g., "Beer").
2.  **"Wiggum Test" (Security)**: Try injecting fake JSON or SQL into the form. Should 400.
3.  **"Road Runner Test" (Speed)**: Classification should happen < 1.5s.

### Automated Testing
*   **Unit**: Vitest for utility functions and Zod schemas.
*   **E2E**: Playwright (Optional for later phase).
