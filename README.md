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
2. **Buy mana with gold**: Use the Shop's "Buy Mana" section to purchase mana
3. **Convert mana to elements**: Use the "Convert Mana to Elements" panel to transform mana into elemental energy
4. **Craft portals**: Add ingredients and elements to your crafting slots
5. **Serve customers**: Match portal requirements to fulfill contracts
6. **Earn gold**: Complete contracts to earn gold for upgrades
7. **Upgrade conversion rates**: Purchase Fire/Water Conversion upgrades for better efficiency
8. **Research elements**: Unlock new elements like Earth, Air, and Lightning
9. **Upgrade your shop**: Improve conversion rates and unlock more crafting slots
10. **Discover recipes**: Experiment with different ingredient combinations

## 💎 Mana System

The mana system is the core economic loop of Portal Crafters. Understanding how to efficiently manage your mana and element conversion is key to success.

### Purchasing Mana

**Exchange Rate**: 10 mana per 1 gold (default)

The Shop's "Buy Mana" section offers three convenient packages:

- **Small Mana Pack**: 10 gold → 100 mana
- **Medium Mana Pack**: 50 gold → 500 mana
- **Large Mana Pack**: 100 gold → 1000 mana

The exchange rate is displayed at the top of the mana shop for transparency.

### Converting Mana to Elements

Once you have mana, use the "Convert Mana to Elements" panel to transform it into elemental energy:

1. **Select an element**: Click on an unlocked element (Fire, Water, etc.)
2. **Choose amount**: Use +/- buttons or type the amount you want to convert
3. **Quick conversion**: Use "Min" for 1 unit, "Max" to convert all available mana
4. **Conversion details**: The panel shows:
   - Cost per unit of the element
   - Your available mana
   - Maximum possible conversion
   - Total cost and what you'll receive

**Base Conversion Costs** (per unit):

- Fire/Water: 10 mana
- Earth/Air: 13 mana (rounded from 12/0.9)
- Ice/Lightning/Nature: 19 mana
- Metal: 24 mana
- Higher tier elements cost progressively more

### Upgrading Conversion Rates

Purchase conversion upgrades in the Shop to improve efficiency:

- **Fire Conversion** (10 levels): Each level reduces mana cost for fire elements by 10%
- **Water Conversion** (10 levels): Each level reduces mana cost for water elements by 10%

**Example**: With Fire Conversion Level 1 (+10% efficiency), converting fire becomes ~10% cheaper. Stack multiple levels for even better rates!

The current efficiency bonus is displayed directly on each upgrade.

### Tips for Managing Mana

1. **Plan ahead**: Check customer requirements before converting mana
2. **Upgrade early**: Conversion upgrades pay for themselves over time
3. **Balance resources**: Keep some gold for research and other upgrades
4. **Higher tiers = higher cost**: Exotic and Legendary elements require significantly more mana
5. **Stockpile elements**: Convert mana into elements during downtime to always have inventory ready

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

// Generate a random item at default level (1)
const lowLevelItem = equipmentGenerator.generate();

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
