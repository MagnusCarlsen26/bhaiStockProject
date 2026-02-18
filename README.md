# Stock Reminder App (React Native + Expo)

This repository implements the client requirements and UI direction for an offline-first stock reminder app.

## Current Implementation
- Expo Router app with typed TypeScript setup.
- Domain-first structure for categories, reset rules, reporting, and reminders.
- SQLite bootstrap with seeded categories and core tables.
- Dashboard and checklist screens with pastel card styling.
- Cost-aware checklist entries and report summarization primitives.
- CSV export and backup/restore service scaffolding.
- Unit test scaffolding for reset logic.

## Architecture Rules
- UI components do not access SQL directly.
- Business logic lives in `src/domain` and `src/services`.
- Persistence setup lives in `src/db`.

## Run
1. `npm install`
2. `npm run start`
3. `npm run test`

## Remote Device Access (Different Network)
Use Expo tunnel mode so phones not on your Wi-Fi can still open the app in Expo Go:
1. `npm run start:tunnel`
2. Open Expo Go on the remote device.
3. Scan the QR code (or open the generated `exp://` link).

Notes:
- Tunnel mode uses the internet and is slower than LAN, but works across networks.
- Keep the terminal running while devices are connected.

## Folder Layout
- `app/`: route-based screens
- `src/domain`: business types and scheduling rules
- `src/services`: reset/report/export/notification/backup services
- `src/db`: SQL schema and bootstrap client
- `src/features`: feature state and composition
- `src/ui`: reusable design tokens and components
