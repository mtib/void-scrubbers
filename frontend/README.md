# Frontend - Void Scrubbers

This directory contains the client-side code for Void Scrubbers.

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) v22 (see `.nvmrc`)
- Package manager: npm, yarn, or pnpm

## 🚀 Getting Started

1. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

## 📦 Build

To build the project for production:

```bash
npm run build
# or
yarn build
# or
pnpm build
```

The built files will be in the `dist` directory.

## 🧪 Testing

```bash
npm run test
# or
yarn test
# or
pnpm test
```

## 🔧 Project Structure

```
frontend/
├── public/          # Static assets
├── src/
│   ├── assets/      # Game assets (sprites, sounds, etc.)
│   ├── components/  # Reusable UI components
│   ├── game/        # Game mechanics and logic
│   ├── scenes/      # Game scenes and levels
│   ├── network/     # WebSocket and API client
│   ├── store/       # State management
│   ├── types/       # TypeScript type definitions
│   ├── utils/       # Utility functions
│   ├── main.ts      # Application entry point
│   └── App.ts       # Main application component
├── index.html       # HTML entry point
├── vite.config.ts   # Vite configuration
└── tsconfig.json    # TypeScript configuration
```

## 🔄 Continuous Deployment

The frontend is automatically deployed to GitHub Pages when changes are pushed to the main branch. The deployment process is handled by a GitHub Actions workflow defined in the repository's root directory.
