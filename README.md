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

## 🔮 Element System

Portal Crafters features a comprehensive elemental system with multiple tiers. Elements determine portal properties, contract difficulty, and reward quality.

### Element Tiers

| Tier      | Elements                                            | Unlock Method                |
| --------- | --------------------------------------------------- | ---------------------------- |
| Common    | Fire 🔥, Water 💧                                   | Starting elements            |
| Standard  | Earth 🌍, Air 💨                                    | Early research               |
| Rare      | Ice ❄️, Lightning ⚡, Metal ⚙️, Nature 🌿           | Mid-game research            |
| Exotic    | Shadow 🌑, Light ✨, Void 🕳️, Crystal 💎, Arcane ✴️ | Late-game research           |
| Legendary | Time ⏳, Chaos 🌀, Life 💚, Death 💀                | Secret recipes, rare rewards |

### Element Properties

Each element has unique properties that affect gameplay:

- **Portal Effect Multiplier**: Affects the visual intensity of portals
- **Reward Bonus Multiplier**: Increases rewards from completed portals
- **Contract Difficulty Modifier**: Affects how challenging contracts become

### Discovery Paths

1. **Starting Elements**: Fire and Water are available from the beginning
2. **Early Research**: Unlock Earth and Air by researching with Fire and Water
3. **Mid-Game Research**: Combine elements to research Ice, Lightning, Metal, and Nature
4. **Late-Game Research**: Advanced combinations unlock Shadow, Light, Void, Crystal, and Arcane
5. **Secret Recipes**: Discover legendary elements like Time and Chaos through special ingredient combinations
6. **Rare Rewards**: Life and Death elements can be unlocked as rare rewards from high-level portals

### Element Data Structure

Elements are defined in `src/data/elements.ts` with the following structure:

```typescript
interface ElementDefinition {
  type: ElementType; // Unique identifier
  name: string; // Display name
  color: number; // Hex color for visualization
  icon: string; // Emoji icon
  description: string; // Flavor text
  baseUnlocked: boolean; // Available at game start
  tier: ElementTier; // common | standard | rare | exotic | legendary
  unlockMethod: UnlockMethod; // How to unlock this element
  rarity: number; // 1-5 scale
  properties: {
    portalEffectMultiplier: number; // Visual effect intensity
    rewardBonusMultiplier: number; // Reward quality bonus
    contractDifficultyModifier: number; // Contract difficulty impact
  };
}
```

### Extending the Element System

To add a new element:

1. Add the element type to `ElementType` in `src/types/index.ts`
2. Add the element definition to `ELEMENTS` array in `src/data/elements.ts`
3. Add a research node to `RESEARCH_TREE` with prerequisites
4. Add a conversion rate to `CONVERSION_RATES`
5. Optionally add element combinations to `ELEMENT_REQUIREMENTS` in `src/data/customers.ts`

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
