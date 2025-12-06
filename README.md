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
│   │   ├── EquipmentGenerator.ts # Procedural equipment generation
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
│   │   ├── attributePools.ts   # Procedural equipment attribute pools
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

## ⚔️ Procedural Equipment Generator

The game features a procedural equipment generation system that creates unique items using attribute pools. Generated equipment can be used in portal crafting, with all attributes affecting the portal's properties and rewards.

### Generation Logic

The `EquipmentGenerator` creates items by combining attributes from multiple pools:

1. **Gear Type** (required): Determines the base item (Sword, Helmet, Ring, etc.)
2. **Prefix** (optional, 60% chance): Quality modifier (Rusted, Sturdy, Enchanted)
3. **Material** (optional, 70% chance): Material type (Iron, Steel, Mithril)
4. **Suffix** (optional, 50% chance): Special effect (of Strength, of Flames)

Each attribute contributes to the item's total cost/quality score, which determines rarity.

### Item Attribute Pools & Level Scaling

| Level Range | Prefix Examples                | Materials                     | Suffix Examples              |
| ----------- | ------------------------------ | ----------------------------- | ---------------------------- |
| 1-3         | Rusted, Worn, Cracked          | Iron, Wood, Leather           | of the Novice                |
| 4-6         | Sturdy, Polished, Reinforced   | Steel, Bronze, Bone           | of Strength, of Vigor        |
| 7-9         | Tempered, Masterwork, Gleaming | Silver, Mithril, Dragonscale  | of Flames, of Frost          |
| 10+         | Enchanted, Legendary, Ancient  | Obsidian, Adamantine, Crystal | of Annihilation, of the Void |

### Attribute Cost Contribution

Each attribute adds to the item's total cost/quality score:

- **Low cost**: Rusted (-2), Worn (-1), Cracked (-1), Iron (0), Wood (0)
- **Medium cost**: Sturdy (+2), Polished (+3), Steel (+2), Bronze (+1)
- **High cost**: Tempered (+5), Masterwork (+7), Silver (+4), Mithril (+6)
- **Premium cost**: Enchanted (+10), Legendary (+15), Obsidian (+8), Adamantine (+12)
- **Suffixes**: of the Novice (+1), of Strength (+3), of Flames (+5), of Annihilation (+15)

### Rarity Calculation

Rarity is determined by total cost contribution:

| Total Cost | Rarity    |
| ---------- | --------- |
| < 5        | Common    |
| 5-9        | Uncommon  |
| 10-19      | Rare      |
| 20-34      | Epic      |
| 35+        | Legendary |

### Usage in Code

```typescript
import { equipmentGenerator } from './game/EquipmentGenerator';

// Generate a random item at level 5
const item = equipmentGenerator.generate({ level: 5 });

// Generate with specific settings
const customItem = equipmentGenerator.generate({
  level: 10,
  prefixChance: 0.8, // 80% chance for prefix
  materialChance: 1.0, // Always include material
  suffixChance: 0.6, // 60% chance for suffix
  forcedGearType: 'sword', // Force specific gear type
});

// Generate multiple items
const items = equipmentGenerator.generateMultiple(5, { level: 8 });
```

### Portal Integration

When generated equipment is used in crafting:

1. The item's `portalBonus` (based on total cost) adds to portal level
2. Element affinities from attributes contribute elemental bonuses
3. All attributes are stored on the portal for effect/reward calculations

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
