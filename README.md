# Resonance

Resonance is a zero-text, micro-interaction Progressive Web App (PWA) designed for pairs (couples, best friends) to silently communicate their current mood or bandwidth. Built with a strict **Neobrutalism** aesthetic, it uses bold geometric shapes, hard drop shadows, and vibrant colors.

## Features

- **Zero-Text Interface:** Communicate entirely through colors and haptic feedback.
- **Neobrutalist Aesthetic:** Stark contrasts, thick borders, and hard offset drop shadows.
- **Real-Time Sync:** Instant state updates across clients powered by Supabase Realtime Broadcast.
- **Micro-Interactions:** 
  - **Drag** the central Resonance Token to snap between colors:
    - **Hot Pink** (Up) = High Energy
    - **Cyan** (Down) = Chill
    - **White** (Left) = Neutral
    - **Yellow** (Right) = Busy
  - **Double-tap** the token to send a "nudge" that vibrates your partner's device and triggers a violent pop animation.
- **PWA Ready:** Installable to your home screen for a fullscreen app-like experience.

## Tech Stack

- **Frontend:** Next.js (App Router), React, TypeScript
- **Styling:** Tailwind CSS v4
- **Animations & Gestures:** Framer Motion
- **Backend/Real-time:** Supabase
- **Hardware APIs:** Web Vibration API (`navigator.vibrate`)

## Setup Instructions

1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Set up your environment variables by creating a `.env.local` file at the root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Run the development server with `npm run dev`.
5. Open [http://localhost:3000](http://localhost:3000) to view the application. Open it in two separate browser windows to test the real-time synchronization.

## License

MIT
