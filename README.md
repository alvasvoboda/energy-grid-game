# Energy Grid Trading Game

A React-based simulation game that models electricity markets, grid operations, and energy storage economics. Players manage battery storage assets to earn revenue by participating in real-time electricity dispatch.

## Table of Contents
- [Background](#background)
- [Game Overview](#game-overview)
- [Getting Started](#getting-started)
- [Game Mechanics](#game-mechanics)
- [Software Architecture](#software-architecture)
- [Installation & Development](#installation--development)
- [File Structure](#file-structure)

## Background

### The Electricity Market Problem

Electricity grids face a fundamental challenge: supply must exactly match demand at every moment. Unlike most commodities, electricity cannot be easily stored at scale, making grid balancing a complex real-time optimization problem.

Modern electricity markets operate through:
- **Day-ahead markets**: Generators submit bids for next-day electricity delivery
- **Real-time markets**: Grid operators dispatch resources to match actual demand
- **Ancillary services**: Fast-responding resources maintain grid stability

The increasing penetration of renewable energy sources (solar and wind) introduces additional complexity due to their variable and unpredictable nature. This creates opportunities for flexible resources like battery storage to provide valuable grid services.

### Energy Storage Economics

Battery energy storage systems (BESS) can generate revenue through multiple value streams:
1. **Energy arbitrage**: Storing cheap electricity and selling during high-price periods
2. **Frequency regulation**: Rapid response to grid frequency deviations
3. **Capacity markets**: Providing assured availability during peak demand periods
4. **Grid services**: Voltage support and congestion management

The game simplifies these complex markets into core mechanics while preserving the fundamental economic principles.

## Game Overview

### Core Concept
Players operate battery storage assets on a simplified electricity grid, competing with NPC-controlled generation sources (solar farms and gas plants) to serve customer demand. The goal is to maximize revenue through strategic charging and discharging decisions.

### Key Learning Objectives
- Understanding electricity market dispatch order (merit order)
- Grasping the value of flexible resources in grid operations
- Learning about renewable energy integration challenges
- Experiencing real-time market dynamics

### Visual Design
The game uses a 10x10 grid where electricity flows along grid lines between generation sources and demand centers. This spatial representation helps players visualize power flow and transmission constraints.

## Game Mechanics

### Entities

#### Customers (Demand)
- **Count**: 5 per simulation
- **Demand Range**: 1-10 MWh per customer
- **Behavior**: Demand varies randomly each step
- **Visual**: Blue dots (pulse red during deficit conditions)

#### Solar Farms (Renewable Generation)
- **Count**: 3-7 per simulation
- **Output Range**: 0-5 MWh per farm
- **Behavior**: Output varies randomly (simulating weather)
- **Dispatch Priority**: Highest (marginal cost ≈ $0)
- **Visual**: Yellow sun icons

#### Gas Plants (Conventional Generation)
- **Count**: 3-5 per simulation
- **Capacity Range**: 1-5 MW per plant
- **Behavior**: Dispatch when renewable generation insufficient
- **Dispatch Priority**: Lowest (higher marginal costs)
- **Visual**: Red flame icons

#### NPC Batteries (Competing Storage)
- **Count**: 1-3 per simulation
- **Capacity Range**: 1-4 MW charge/discharge rate
- **Duration**: 4 hours (storage = 4 × capacity)
- **Efficiency**: 90% round-trip
- **Dispatch Priority**: Between renewables and gas plants
- **Visual**: Purple battery icons

#### Player Battery (User-Controlled)
- **Count**: 0-1 (user can place one)
- **Capacity Range**: 1-4 MW (randomly assigned)
- **Duration**: 4 hours
- **Starting State**: Empty (0 MWh stored)
- **Revenue Model**: 
  - Earn $100/MWh when discharging during shortages
  - Pay $20/MWh when charging during excess generation
- **Visual**: Green battery icon

### Dispatch Logic (Merit Order)

The game implements a simplified economic dispatch algorithm:

1. **Solar Generation**: Always dispatched first (zero marginal cost)
2. **Battery Discharge**: Activated during deficit conditions
   - NPC batteries discharge at maximum rate up to stored energy
   - Player battery discharges optimally based on market conditions
3. **Battery Charging**: During surplus conditions (solar > demand)
   - Batteries charge up to capacity limits
   - Player pays market rate for charging energy
4. **Gas Plants**: Last resort, dispatched only when deficit remains
   - Run at full capacity during shortage conditions
   - Represent expensive but reliable generation

### Economic Model

The simplified pricing mechanism reflects real electricity market principles:
- **Scarcity Pricing**: High prices ($100/MWh) during supply shortages
- **Surplus Pricing**: Low prices ($20/MWh) during generation excess
- **Revenue Accumulation**: Player earnings tracked across game sessions

## Software Architecture

### Technology Stack
- **Frontend**: React 18+ with Hooks
- **Styling**: Tailwind CSS utility classes
- **Icons**: Lucide React icon library
- **UI Components**: shadcn/ui component library
- **Build Tool**: Vite (recommended) or Create React App
- **Language**: TypeScript/JavaScript (ES6+)

### Component Architecture

#### Main Game Component (`EnergyGridGame`)
Central game state manager handling:
- Entity generation and placement
- Dispatch calculations
- User interactions
- State persistence

#### Key State Variables
```javascript
- customers: Array of demand points
- solarFarms: Array of renewable generators  
- gasPlants: Array of conventional generators
- batteries: Array of NPC storage systems
- playerBattery: User-controlled storage (null if unplaced)
- isDeficit: Boolean system status flag
- playerRevenue: Accumulated earnings
```

#### Core Functions
- `handleStep()`: Advances simulation, updates demands/generation, executes dispatch
- `handleReset()`: Reinitializes game state with new random configuration
- `handleAddPlayerBattery()`: Enables battery placement mode
- `updateSystemState()`: Calculates optimal dispatch given current conditions

### Dispatch Algorithm Implementation

```javascript
function calculateDispatch(demand, solar, batteries, gasPlants) {
  let remainingDeficit = demand - solar;
  
  if (remainingDeficit > 0) {
    // Discharge batteries first
    batteries.forEach(battery => {
      const discharge = Math.min(
        battery.capacity,           // MW limit
        battery.currentStorage,     // Energy available  
        remainingDeficit           // System need
      );
      battery.output = discharge;
      remainingDeficit -= discharge;
    });
    
    // Then dispatch gas plants
    gasPlants.forEach(plant => {
      if (remainingDeficit > 0) {
        const output = Math.min(plant.capacity, remainingDeficit);
        plant.output = output;
        remainingDeficit -= output;
      }
    });
  }
}
```

### User Interface Design

#### Grid Visualization
- **SVG-based grid**: Scalable vector graphics for clean lines
- **Intersection-based placement**: Entities positioned at grid line crossings
- **Hover interactions**: Tooltips reveal detailed entity information
- **Visual status indicators**: Color-coded icons reflecting operational status

#### Information Display
- **Real-time metrics**: Total demand, generation, and system balance
- **Entity summaries**: Count and aggregate statistics for each resource type
- **Player performance**: Battery status and accumulated revenue
- **System alerts**: Visual warnings during deficit conditions

## Installation & Development

### Prerequisites
- Node.js 16+ and npm/yarn
- Modern web browser with ES6+ support

### Setup Instructions

1. **Clone Repository**
```bash
git clone https://github.com/yourusername/energy-grid-game.git
cd energy-grid-game
```

2. **Install Dependencies**
```bash
npm install
# or
yarn install
```

3. **Development Server**
```bash
npm run dev
# or
yarn dev
```

4. **Build for Production**
```bash
npm run build
# or
yarn build
```

### Dependencies

#### Core Dependencies
```json
{
  "react": "^18.0.0",
  "react-dom": "^18.0.0",
  "lucide-react": "^0.263.1"
}
```

#### UI Framework (shadcn/ui components)
```json
{
  "@radix-ui/react-tooltip": "^1.0.0",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.0.0",
  "tailwind-merge": "^1.14.0"
}
```

#### Development Dependencies
```json
{
  "@types/react": "^18.0.0",
  "@types/react-dom": "^18.0.0",
  "@vitejs/plugin-react": "^4.0.0",
  "autoprefixer": "^10.4.0",
  "postcss": "^8.4.0",
  "tailwindcss": "^3.3.0",
  "typescript": "^5.0.0",
  "vite": "^4.4.0"
}
```

## File Structure

```
energy-grid-game/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── ui/           # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── tooltip.tsx
│   │   └── EnergyGridGame.tsx
│   ├── lib/
│   │   └── utils.ts      # Utility functions
│   ├── styles/
│   │   └── globals.css   # Tailwind imports
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### Key Configuration Files

#### `package.json`
```json
{
  "name": "energy-grid-game",
  "version": "1.0.0",
  "description": "Electricity market simulation game",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx"
  }
}
```

#### `tailwind.config.js`
```javascript
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      animation: {
        'pulse': 'pulse 1s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
```

#### `vite.config.ts`
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

## Future Development Opportunities

### Game Enhancements
- **Multi-player support**: Competing battery operators
- **Time-based pricing**: Realistic market price curves
- **Weather modeling**: Correlated solar/wind output patterns
- **Transmission constraints**: Limited power flow between grid regions
- **Demand response**: Customer flexibility in consumption timing

### Technical Improvements
- **State persistence**: Save game progress locally
- **Performance optimization**: Efficient rendering for larger grids
- **Mobile responsiveness**: Touch-friendly interface design
- **Data visualization**: Charts showing price and generation trends
- **AI opponents**: Machine learning-based NPC strategies

### Educational Extensions
- **Tutorial mode**: Guided introduction to electricity markets
- **Scenario library**: Historical market conditions (Texas freeze, California fires)
- **Economic analysis tools**: ROI calculators and sensitivity analysis
- **Policy modeling**: Carbon pricing and renewable incentive impacts

---

*This game is designed for educational purposes and simplifies complex electricity market dynamics. Real-world grid operations involve many additional technical and economic factors not represented in this simulation.*