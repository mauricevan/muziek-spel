# Getting Started

## Prerequisites

- Node.js 14+ and npm
- Git

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Development

### Start Development Server

```bash
npm start
```

This will start the webpack-dev-server on http://localhost:8080

### Start Backend Server

```bash
npm run server
```

This starts the Express proxy server on http://localhost:3001

### Run Both (Development + Server)

```bash
npm run dev
```

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Testing

### Run Unit Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Run E2E Tests

```bash
npm run test:e2e
```

## Project Structure

See [Architecture Documentation](../02-architecture/README.md) for detailed project structure.

