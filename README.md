# Contra-Style Platformer Game

A side-scrolling platformer game inspired by Contra, built with React, Three.js, and Tailwind CSS.

## Features

- 3D environment with side-scrolling gameplay
- Player movement and jumping mechanics
- Shooting mechanics
- Enemy characters with basic AI
- Platforms for jumping and traversal
- Score tracking

## Controls

- **Arrow Keys** or **WASD**: Move left/right
- **Space**: Jump
- **X/Z/Ctrl**: Shoot

## Technologies Used

- React (with TypeScript)
- Three.js for 3D rendering
- React Three Fiber and React Three Drei for React integration with Three.js
- Tailwind CSS for UI styling
- Vite for fast development and bundling

## Development

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production

```bash
# Build the application
npm run build

# Preview the built application
npm run preview
```

## Project Structure

- `src/components/Game.tsx`: Main game component
- `src/components/Player.tsx`: Player character with movement, jumping, and shooting
- `src/components/Level.tsx`: Level design with platforms, enemies, and decorations
- `src/components/Physics.tsx`: Simple physics implementation

## Future Enhancements

- Add more levels and level progression
- Implement powerups and different weapons
- Add sound effects and background music
- Add mobile support with touch controls
- Improve collision detection
- Add more enemy types with different behaviors
