# MovieDate - Watch Party Application

Watch movies with friends anywhere in the world. Synchronized playback, video chat, and shared moments.

## Features

- Real-time video call with WebRTC
- Synchronized movie playback (play, pause, seek, speed)
- Local file playback (movies never uploaded to server)
- Live chat with emoji support
- Floating reactions overlay
- Responsive design for mobile and desktop
- Premium dark theme inspired by Netflix/Discord

## Tech Stack

**Frontend:**
- Next.js 15
- TypeScript
- React
- Tailwind CSS
- Framer Motion
- Socket.io Client
- PeerJS

**Backend:**
- Node.js
- Express
- Socket.io
- PeerJS Server

## Quick Start

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Configure Environment

Create `.env.local` in the project root:
```
NEXT_PUBLIC_SERVER_URL=http://localhost:3001
```

Create `.env` in the server folder:
```
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### 3. Start the Backend Server

```bash
cd server
npm start
```

The server runs on http://localhost:3001

### 4. Start the Frontend

In a new terminal:
```bash
npm run dev
```

The app runs on http://localhost:3000

## Usage

1. Open http://localhost:3000
2. Click "Create Room" to start a new watch party
3. Enter your name and share the room code with your friend
4. Your friend clicks "Join Room" and enters the code
5. Both users select the same movie file from their devices
6. Enjoy synchronized watching!

## Deployment

### Backend - Railway

1. Create a new project on Railway
2. Connect your GitHub repository
3. Set the root directory to `server`
4. Add environment variables:
   - `PORT=3001`
   - `FRONTEND_URL=https://your-frontend.vercel.app`
   - `NODE_ENV=production`
5. Deploy

### Frontend - Vercel

1. Import your repository on Vercel
2. Add environment variable:
   - `NEXT_PUBLIC_SERVER_URL=https://your-backend.railway.app`
   - `NEXT_PUBLIC_NODE_ENV=production`
3. Deploy

## Important Notes

- Movie files are NEVER uploaded to the server
- Each user loads the same movie file from their own device
- The app only synchronizes playback timing
- For sync to work, both users must have the same movie file

## Architecture

```
Frontend (Next.js)          Backend (Express)
       |                           |
       +-- Socket.io Client --+-- Socket.io Server
       |                       |
       +-- PeerJS Client  ----+-- PeerJS Server
       |                       |
       +-- WebRTC Peer --------+-- WebRTC Signaling
```

- Socket.io handles: room management, playback sync, chat, reactions
- PeerJS handles: WebRTC video/audio calls between peers
