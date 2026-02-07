## Gwendoline MAALSI - Collector Frontend

# Collector Frontend

React + TypeScript frontend for the Collector marketplace application with real-time chat functionality.
Based on the group project. Implémenting a real-time chat feature using WebSocket, integrated with Keycloak for authentication.

## Tech Stack

- React 18 with TypeScript
- Vite 6 (build tool)
- Vitest 2 (testing)
- Keycloak (authentication)
- WebSocket (real-time chat)
- CSS Modules

## Prerequisites

- Node.js 18+ or 20+
- npm 9+
- Backend services running (API Gateway, User Service, Chat Service)

## Getting Started

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file:

```env
# Local development
VITE_API_BASE=http://localhost:3000
VITE_KEYCLOAK_URL=http://localhost:8080
VITE_KEYCLOAK_REALM=collector
VITE_KEYCLOAK_CLIENT_ID=collector-client

# Production (Vercel with Kubernetes backend)
# VITE_API_BASE=https://api.gw-collector.fr
# VITE_KEYCLOAK_URL=https://auth.gw-collector.fr
# VITE_KEYCLOAK_REALM=collector
# VITE_KEYCLOAK_CLIENT_ID=collector-client


### Development

```bash
npm run dev
```

Application runs on `http://localhost:5173`

### Build

```bash
npm run build
```

Output in `dist/` directory.

## Testing

### Run Tests

```bash
npm test

### Coverage Report

```bash
npm run test:coverage
```

Coverage reports generated in `coverage/` directory.

## Code Conventions

- TypeScript strict mode enabled
- ESLint for code quality
- Component naming: PascalCase
- File naming: PascalCase for components, camelCase for utilities
- Types: Separate `.d.ts` files in `src/types/`
- API calls: Centralized in `src/api.ts`

## Architecture

```
src/
├── components/          # React components
│   ├── ChatPanel.tsx   # Real-time chat with WebSocket
│   ├── ItemList.tsx    # Marketplace item listing
│   ├── ItemDetail.tsx  # Item details view
│   └── ...
├── types/              # TypeScript type definitions
├── auth/               # Keycloak configuration
├── api.ts              # API client functions
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```

## Features

- User authentication via Keycloak
- Marketplace item browsing
- Real-time 1-to-1 chat between buyers and sellers
- Context-aware chat (auto-select conversation based on selected item)
- WebSocket with automatic reconnection
- Online user status indicator

## Backend Integration

### Expected Backend Services

#### API Gateway (port 80)
- Validates JWT tokens
- Injects `x-user-id` and `x-user-username` headers
- Routes requests to microservices

#### Chat Service (port 4004)
- WebSocket endpoint: `ws://gateway/ws?token=<JWT>`
- REST endpoints:
  - `GET /conversations/:userId` - Fetch conversation history
  - `POST /conversations/:userId` - Send message
  - `GET /online-users` - Get online user IDs

#### User Service (port 4001)
- `GET /users/:id` - Get user details
- `GET /users` - List users

### CORS Configuration

Backend must allow:
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

For production (Vercel):
```
Access-Control-Allow-Origin: https://collector-frontend.vercel.app
# Or with custom domain: https://gw-collector.fr
```

### WebSocket Authentication

Token passed as query parameter:
```
ws://gateway/ws?token=<JWT>
```

## CI/CD

GitHub Actions workflow (`.github/workflows/frontend-ci.yml`):

### Triggers
- Push to `main` or `develop`
- Pull requests to `main`

### Jobs
1. **build-and-test**
   - Linting
   - Unit tests
   - Coverage report
   - Build verification
   - Security audit

2. **security-scan**
   - Trivy vulnerability scanning
   - SARIF upload to GitHub Security


## Project Structure Notes

- **Authentication**: JWT tokens stored in memory (not localStorage for security)
- **State Management**: React hooks (useState, useEffect, useRef)
- **WebSocket**: Native WebSocket API with exponential backoff reconnection
- **Type Safety**: All API responses and props fully typed

## Troubleshooting

### WebSocket Connection Fails
- Verify backend is running
- Check `VITE_API_BASE` environment variable
- Ensure CORS is properly configured
- Verify JWT token is valid

## License

Private project for educational purposes.
