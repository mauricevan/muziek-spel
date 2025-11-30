# Architecture Documentation

## Project Structure

This project follows a feature-based architecture pattern:

```
src/
├── features/           # Feature modules (business logic)
│   ├── game/          # Game logic feature
│   ├── audio/         # Audio services feature
│   ├── auth/          # Authentication feature
│   └── multiplayer/   # Multiplayer feature
├── components/         # UI components
│   ├── common/        # Shared/reusable components
│   └── game/          # Game-specific components
├── pages/              # Page components (orchestration)
├── contexts/           # React contexts
├── hooks/              # Global custom hooks
├── utils/              # Utility functions
└── types/              # TypeScript type definitions
```

## Features

Each feature follows this structure:

```
features/[feature-name]/
├── hooks/              # Custom hooks (business logic)
├── services/          # Pure functions (API calls, etc.)
├── types/             # Feature-specific types
└── index.ts           # Barrel file (exports)
```

## Technology Stack

- **React 16** - UI library
- **TypeScript** - Type safety
- **Material-UI v4** - Component library
- **React Router v5** - Routing
- **Webpack** - Build tool
- **Vitest** - Testing framework
- **Playwright** - E2E testing

## Architecture Decision Records

See [ADR directory](./adr/) for architecture decisions.

