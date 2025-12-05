# Portal Crafters

A 2D incremental/crafting game where players create portals using elemental energy, RPG equipment, and mundane items as ingredients. Built with Three.js and TypeScript.

## 🎮 Game Concept

In Portal Crafters, you run a portal crafting shop where adventurers come seeking magical portals for their quests. Your goal is to:

- **Create portals** using elemental energy, RPG equipment, and mundane items as ingredients
- **Fuel portals with mana** (primary cost driver affecting portal level)
- **Satisfy customer contracts** for payment
- **Experiment to discover recipes** (ingredient effects on portal contents/rewards)
- **Research new elemental types** (start with Fire and Water)
- **Upgrade mana-to-element conversion rates**
- **Receive random rewards** when customers "defeat" portals (usable as partial payment)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/adam4813/portal-crafters.git
cd portal-crafters

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

This will start a local development server at `http://localhost:3000` with hot reload enabled.

### Building for Production

```bash
# Build the project
npm run build

# Preview the production build
npm run preview
```

### Code Formatting

```bash
# Format all files
npm run format

# Check formatting
npm run format:check
```

## 🎯 How to Play

1. **Start with basic elements**: You begin with Fire and Water elements
2. **Craft portals**: Add ingredients and elements to your crafting slots
3. **Serve customers**: Match portal requirements to fulfill contracts
4. **Earn gold**: Complete contracts to earn gold for upgrades
5. **Research elements**: Unlock new elements like Earth, Air, and Lightning
6. **Upgrade your shop**: Improve conversion rates and unlock more crafting slots
7. **Discover recipes**: Experiment with different ingredient combinations

## 📁 Project Structure

```
portal-crafters/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions for build & deploy to gh-pages
├── src/
│   ├── main.ts                 # Entry point
│   ├── game/
│   │   ├── Game.ts             # Main game class
│   │   ├── Portal.ts           # Portal entity and rendering
│   │   ├── Customer.ts         # Customer/contract system
│   │   ├── Inventory.ts        # Inventory management
│   │   ├── CraftingSystem.ts   # Crafting logic and recipe discovery
│   │   ├── ElementSystem.ts    # Elemental energy and research
│   │   ├── ManaSystem.ts       # Mana purchasing and conversion
│   │   ├── UpgradeSystem.ts    # Purchasable upgrades
│   │   ├── RewardSystem.ts     # Random reward generation
│   │   └── SaveSystem.ts       # LocalStorage persistence
│   ├── ui/
│   │   ├── UIManager.ts        # UI orchestration
│   │   ├── CraftingUI.ts       # Crafting interface
│   │   ├── InventoryUI.ts      # Inventory display
│   │   ├── CustomerUI.ts       # Customer queue display
│   │   ├── ShopUI.ts           # Mana/upgrade shop
│   │   └── ResearchUI.ts       # Element research tree
│   ├── data/
│   │   ├── ingredients.ts      # Ingredient definitions
│   │   ├── elements.ts         # Element types and properties
│   │   ├── equipment.ts        # RPG equipment definitions
│   │   └── customers.ts        # Customer templates
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces and types
│   └── utils/
│       └── helpers.ts          # Utility functions
├── public/
│   └── assets/                 # Static assets
├── index.html                  # Main HTML file
├── style.css                   # Global styles
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite configuration
├── .prettierrc                 # Prettier configuration
├── .prettierignore             # Prettier ignore patterns
├── .gitignore                  # Git ignore patterns
├── LICENSE                     # MIT License
└── README.md                   # This file
```

## 🛠️ Tech Stack

- **Runtime**: [Three.js](https://threejs.org/) for 2D portal visualization
- **Language**: [TypeScript](https://www.typescriptlang.org/) for type-safe code
- **Build Tool**: [Vite](https://vitejs.dev/) for fast development and building
- **Formatting**: [Prettier](https://prettier.io/) for consistent code style
- **Deployment**: GitHub Actions with GitHub Pages

## 🌐 Deployment

The game is automatically deployed to GitHub Pages when changes are pushed to the `main` branch. The deployment workflow:

1. Installs dependencies with `npm ci`
2. Builds the project with `npm run build`
3. Deploys the `dist/` folder to GitHub Pages

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
