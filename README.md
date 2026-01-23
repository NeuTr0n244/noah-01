# Noah Universe

A fun interactive website featuring Noah, a cute 3D animated character who creates drawings on a timer. Watch Noah draw, chat with other visitors, and collect his artwork!

## Features

- **3D Animated Character**: Noah is rendered using React Three Fiber with smooth animations
- **Live Drawing Timer**: Every 60 seconds, Noah creates a new drawing
- **Real-time Sync**: All users see the same timer and drawings via Socket.io
- **Live Chat**: Chat with other visitors in real-time
- **Drawing Gallery**: View and download Noah's recent artwork
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React + Vite
- **3D Graphics**: React Three Fiber, Three.js, Drei
- **Real-time**: Socket.io
- **Styling**: CSS with Gaegu font

## How to Run Locally

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/noah.git
cd noah
```

2. Install dependencies:
```bash
npm install
```

3. Start the Socket.io server (Terminal 1):
```bash
node server.js
```

4. Start the development server (Terminal 2):
```bash
npm run dev
```

5. Open http://localhost:5173 in your browser

## Project Structure

```
noah/
├── public/
│   ├── drawings/       # Noah's artwork images
│   └── models/         # 3D model files (.glb)
├── src/
│   ├── components/     # React components
│   │   ├── Chat/       # Live chat component
│   │   ├── Layout/     # Page layout wrapper
│   │   ├── Navigation/ # Tab navigation
│   │   ├── Noah3D/     # 3D character scene
│   │   └── UserProfile/# User avatar & profile
│   ├── contexts/       # React contexts (Socket)
│   ├── pages/          # Page components
│   └── services/       # Socket.io service
├── server.js           # Socket.io backend server
└── package.json
```

## Credits

- 3D Model "Kid Boy" by oLric (sketchfab.com/selimalsk) licensed under CC-BY-4.0

## License

MIT
