<div align="center">
  <img src="public/logo.png" alt="Lexit Logo" width="120"/>
</div>

# Lexit - Personal Vocabulary Builder


<a href="https://app.devdoq.com/dashboard/1080980914?name=lexit&tab=document"><img src="https://app.devdoq.com/shields/read_docs.png" alt="Read Docs" width="120" height="45"></a>

A web app for building your personal vocabulary with AI-powered definitions and examples.

## Local Setup

### Prerequisites

- Node.js 18+
- Bun (recommended) or npm/yarn
- Convex account

### 1. Install Dependencies

```bash
bun install
# or
npm install
```

### 2. Setup Convex Backend

```bash
# Install Convex CLI globally
npm install -g convex

# Login to Convex
npx convex login

# Initialize Convex project
npx convex dev
```

### 3. Environment Variables

Create `.env.local` with:

```
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_key
```

### 4. Run Development Server

```bash
bun dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features

- Add words with AI-generated definitions and examples
- Search through your vocabulary
- Real-time database with Convex
- Google Gemini AI integration

## Tech Stack

- Next.js 16 + React 19
- Convex (database & real-time)
- Google Gemini AI
- Tailwind CSS
- TypeScript
