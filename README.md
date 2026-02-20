# 🚀 Tom's Traveller Tracker

**Space Combat v6.5** — An interactive space combat tracker for the Traveller RPG (Mongoose), built on Tom's homebrew rules.

🔗 **Live at:** [tomstravellertracker.com](https://tomstravellertracker.com)

## Features

- **📋 Turn Sequence** — Step-by-step phase tracker (Tactics → Maneuver → Attack → Crew Actions)
- **🛸 Ship Manager** — Add/edit ships with hull, armor, thrust, power, sensors, fuel
- **⚡ Power Allocation** — Per-ship EP budget with sliders for each system
- **⚔️ Combat** — Attack roll calculator with 12+ modifiers, damage resolver with auto critical hit detection
- **💥 Critical Hits** — 2D location roller, severity escalation, per-ship tracking grid
- **👥 Crew Actions** — 6-action budget tracker with quick skill checks
- **📖 Reference** — Full weapon, missile, torpedo, screen, terrain, and G-force tables

## Tech

Pure static site — HTML, CSS, JavaScript. No framework, no build step, no backend.

State persists in `localStorage` so encounters survive page refresh.

## Deploy

Upload the entire repo to any static host (Cloudflare Pages, Netlify, GitHub Pages, etc.).

## License

Private — for Tom's Traveller group.
