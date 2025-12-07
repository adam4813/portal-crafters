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

## ✨ Attribute-Based Portal Effects

Equipment attributes directly affect portal behavior, rewards, and outcomes. When you craft a portal using generated equipment, **all attributes are consumed** and influence the resulting portal's properties.

### How Attributes Affect Portals

#### 🎨 Visual Effects

- **Color Shifts**: Elemental suffixes and special materials change portal colors
  - Flames: Warmer colors (+15° hue shift)
  - Frost: Cooler colors (-60° hue shift)
  - Obsidian: Darker tones (-45° hue shift)
  - Gleaming: Lighter appearance (+30° hue shift)
- **Intensity**: High-quality prefixes and special effects increase visual intensity
  - Enchanted/Legendary/Ancient prefixes: +0.3 intensity
  - Storms suffix: +0.25 intensity
  - Materials like Mithril: +0.15 intensity

#### 💰 Reward Multipliers

Equipment quality directly scales rewards:

| Attribute Quality | Gold Multiplier | Example Attributes                       |
| ----------------- | --------------- | ---------------------------------------- |
| Premium (10+ cost)| +50-60%         | Enchanted, Legendary, Ancient            |
| High (5-9 cost)   | +25-30%         | Tempered, Masterwork, Flames, Frost      |
| Mid (2-4 cost)    | +10-25%         | Sturdy, Polished, Steel, Silver          |
| Low (<0 cost)     | -10%            | Rusted, Worn, Cracked                    |

**Special Material Bonuses:**
- Adamantine: +20% gold
- Dragonscale: +25% gold, +1 rarity
- Obsidian/Crystal: +40% gold

**Mana Multipliers:**
- Enchanted prefix: +50% mana
- Eternity suffix: +50% mana
- Defense-type suffixes: +5% per effect value

#### 🎲 Drop Rate Modifiers

Attributes increase the chance of specific reward types:

- **Ingredient Drop Chance:**
  - Elemental suffixes: +2% per effect value
  - Mid-tier materials (Silver, Mithril): +10%
  - High-tier prefixes: +5-15%
  
- **Equipment Drop Chance:**
  - Legendary prefix: +20%
  - Premium suffixes (Annihilation, Void): +25-30%
  - High-cost materials: +15%

- **Rarity Bonuses** (affects reward quality):
  - Legendary equipment: +3 rarity
  - Epic equipment: +2 rarity
  - Ancient/Void effects: +1-2 rarity

#### 🔬 Recipe Discovery

Experimenting with different equipment attributes teaches you more:

- **Discovery Bonus:**
  - Premium prefixes (Enchanted, Legendary): +10-15%
  - Crystal material: +15%
  - Low-quality items (Rusted, Worn): +5% (experimentation bonus)
  - Special effect suffixes: +1% per effect value

Recipe discovery bonuses also give a chance to "rediscover" known recipes with better understanding (max 30% chance for high-bonus items).

### Attribute-to-Effect Mapping

#### Prefix Effects

| Prefix     | Cost | Primary Effects                                         |
| ---------- | ---- | ------------------------------------------------------- |
| Enchanted  | +10  | +50% gold, +2 rarity, Magic Resonance, +50% mana        |
| Legendary  | +15  | +50% gold, +2 rarity, Legendary Aura, +20% equipment    |
| Ancient    | +12  | +50% gold, +2 rarity, Ancient Power, void affinity      |
| Masterwork | +7   | +30% gold, +1 rarity, +0.2 intensity, +5% discovery     |
| Tempered   | +5   | +30% gold, +1 rarity, +0.2 intensity                    |
| Gleaming   | +5   | +30% gold, +0.2 intensity, lighter colors               |
| Sturdy     | +2   | +15% gold, +0.1 intensity                               |
| Polished   | +3   | +15% gold, +0.1 intensity                               |
| Rusted     | -2   | -10% gold, +5% discovery (experimental learning)        |
| Worn/Cracked | -1 | -10% gold, +5% discovery                                |

#### Material Effects

| Material    | Cost | Element Affinity | Primary Effects                        |
| ----------- | ---- | ---------------- | -------------------------------------- |
| Adamantine  | +12  | Earth            | +40% gold, Unbreakable, +20% bonus     |
| Crystal     | +10  | Light            | +40% gold, Crystal Clarity, +15% discovery |
| Obsidian    | +8   | Void             | +40% gold, Void Touch, darker colors   |
| Dragonscale | +6   | Fire             | +25% gold, Dragon Essence, +1 rarity   |
| Mithril     | +6   | Air              | +25% gold, Mithril Glow, +0.15 intensity |
| Silver      | +4   | Light            | +25% gold, +10% ingredients            |
| Steel       | +2   | Earth            | +10% gold                              |
| Bronze      | +1   | Fire             | +10% gold                              |
| Iron        | 0    | Earth            | Elemental bonus only                   |
| Wood/Leather | 0   | -                | Base stats                             |

#### Suffix Effects

| Suffix         | Cost | Element Affinity | Effect Type | Primary Effects                    |
| -------------- | ---- | ---------------- | ----------- | ---------------------------------- |
| Annihilation   | +15  | -                | Special     | +60% gold, +2 rarity, Destructive Force, +30% equipment |
| Void           | +12  | Void             | Elemental   | +60% gold, +2 rarity, Void Touched |
| Eternity       | +10  | Light            | Special     | +60% gold, +2 rarity, Timeless, +50% mana |
| Flames         | +5   | Fire             | Elemental   | +30% gold, +1 rarity, Burning, warmer colors |
| Frost          | +5   | Water            | Elemental   | +30% gold, +1 rarity, Frozen, cooler colors |
| Storms         | +6   | Lightning        | Elemental   | +30% gold, +1 rarity, Electrified, +0.25 intensity |
| Strength       | +3   | -                | Damage      | +15% gold, +15% bonus              |
| Vigor          | +3   | -                | Defense     | +15% gold, +15% mana               |
| Novice         | +1   | -                | Damage      | Minor bonuses                      |

#### Combined Effects Example

**Enchanted Mithril Sword of Storms** (Legendary rarity, total cost ~36)

- Portal Effects:
  - Visual: +0.7 intensity, electrified effect, lighter color
  - Gold: +130% (50% + 25% + 30% + 25% from rarity)
  - Mana: +50%
  - Equipment drops: +25%
  - Rarity: +5 (2 + 1 + 2 from legendary)
  - Recipe discovery: +11%
- Element Bonuses:
  - Air +3 (from Mithril)
  - Lightning +6 (from Storms suffix)
- Special Effects:
  - Magical Resonance
  - Mithril Glow
  - Electrified

### Compatibility with Random Equipment

The attribute system is fully compatible with procedurally generated equipment:

- Equipment generation uses level-appropriate attribute pools
- All attributes (prefix, material, suffix) are optional
- Cost contributions stack to determine final rarity
- Every combination creates unique portal effects
- System encourages experimentation with different equipment types

### Using Attributes in Portal Crafting

1. **Add Equipment to Crafting Slots**: Place generated or static equipment in crafting slots
2. **Attributes Are Consumed**: When you craft the portal, all equipment attributes are consumed and stored
3. **Effects Are Applied**: The portal gains visual effects, reward bonuses, and special properties
4. **Complete Contracts**: When customers complete the portal, attributes affect reward calculation
5. **Rewards Reflect Quality**: Higher-quality equipment = better rewards and more interesting effects

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
