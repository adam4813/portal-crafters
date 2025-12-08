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
- Earth/Air: 14 mana
- Ice/Lightning/Nature: 19 mana
- Metal: 24 mana
- Higher tier elements cost progressively more

### Upgrading Conversion Rates

Purchase conversion upgrades in the Shop to improve efficiency:

- **Fire Conversion** (10 levels): Each level provides a 10% efficiency multiplier (additive), reducing mana costs proportionally
- **Water Conversion** (10 levels): Each level provides a 10% efficiency multiplier (additive), reducing mana costs proportionally

**Example**: With Fire Conversion Level 1 (+10% efficiency), converting fire becomes about 9% cheaper (cost is divided by 1.1). Stack multiple levels for even better rates!

The current efficiency bonus is displayed directly on each upgrade.

### Tips for Managing Mana

1. **Plan ahead**: Check customer requirements before converting mana
2. **Upgrade early**: Conversion upgrades pay for themselves over time
3. **Balance resources**: Keep some gold for research and other upgrades
4. **Higher tiers = higher cost**: Exotic and Legendary elements require significantly more mana
5. **Stockpile elements**: Convert mana into elements during downtime to always have inventory ready

### 📖 Recipe Book

The Recipe Book keeps track of all discovered recipes and provides helpful features:

- **Visual Ingredient Status**: Recipe ingredients are displayed with visual indicators:
  - **Bright/colored icons** (🔥💧) indicate ingredients you currently own
  - **Dim/greyed icons** indicate ingredients you're missing
- **One-Click Auto-Fill**: Click on any recipe where you own all ingredients to automatically fill the crafting slots with those ingredients
- **Smart Tooltips**: Hover over recipes to see:
  - "Click to auto-fill crafting slots" when all ingredients are available
  - "Some ingredients missing" when you don't own all required items
  - "All ingredients missing" when you don't own any of the required items
- **Recipe Discovery**: Recipes are automatically discovered when you craft with 2 or more ingredients for the first time

### Crafting Interface

The crafting interface is where you combine ingredients, equipment, and elements to create portals:

#### Adding Ingredients

- Click on any ingredient or equipment in your inventory
- It will be automatically added to the first available empty crafting slot
- Alternatively, click on an empty crafting slot (marked with "+") to add items

#### Removing Ingredients

- Click on any filled crafting slot to remove the ingredient or equipment
- The item will be returned to your inventory immediately
- A red "✕" indicator appears when hovering over filled slots
- Ingredients can be freely added and removed before crafting

#### Crafting Portals

- Once you have ingredients in your crafting slots, click "Craft Portal"
- The portal is created using your selected ingredients
- Crafting slots are automatically cleared after creating a portal
- Different ingredient combinations may discover new recipes!

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

## 📜 Customer Contract System

Portal Crafters features an advanced customer contract system where adventurers request portals with varying requirements and reward tiers. The system scales with player progression through 5 tiers and includes special customer types with unique mechanics.

### Customer Templates

The game includes **10 customer templates** organized by difficulty tier:

#### Regular Customers (Tiers 1-5)

1. **Tier 1 - Novices**: Novice Mage, Apprentice Wizard, Student Alchemist
   - Base Payment: 50 gold (±20 variance)
   - Simple element requirements (Fire, Water)
   - Low modifier chances
2. **Tier 2 - Journeymen**: Battle Mage, Elemental Knight, Arcane Scholar
   - Base Payment: 100 gold (±40 variance)
   - Standard elements (Earth, Air)
   - Moderate modifier chances
3. **Tier 3 - Masters**: Master Conjurer, High Priestess, Archmage
   - Base Payment: 200 gold (±80 variance)
   - Rare elements (Ice, Lightning, Nature)
   - Higher modifier chances
4. **Tier 4 - Elite**: Void Walker, Crystal Sage, Shadow Master
   - Base Payment: 400 gold (±100 variance)
   - Exotic elements (Shadow, Light, Void)
   - Special reward chance: 10%
5. **Tier 5 - Masters**: Temporal Mage, Chaos Lord, Life Weaver
   - Base Payment: 800 gold (±200 variance)
   - Legendary elements (Time, Chaos, Life, Death)
   - Special reward chance: 15%
6. **Tier 5 - Legendary**: Planeswalker, Dimensional Archon, Cosmic Weaver
   - Base Payment: 1200 gold (±300 variance)
   - Most complex requirements
   - Special reward chance: 20%

#### Special Customers (4 Types)

Special customers have unique mechanics and appear with ~5% base probability (increases with difficulty):

1. **Wealthy Merchant** (Tier 3)
   - High payment with simpler requirements
   - 30% special reward chance
   - Prefers "bonus" and "bulk_order" modifiers
   - Icons: 💰👔🎩💎
2. **Experimental Researcher** (Tier 3)
   - Complex experimental requirements
   - 50% special reward chance (often unique items)
   - Frequently requests equipment
   - Icons: 🧪🔬📡🧬
3. **Time-Traveler** (Tier 4)
   - Unusual requirements, often urgent
   - 40% special reward chance
   - Variable reward types
   - Icons: ⏰🌀⌛🔮
4. **Ancient Entity** (Tier 5)
   - Extreme requirements, legendary rewards
   - 80% special reward chance
   - Very high payment (2000 gold base)
   - Icons: 🐲👁️🦑🌠

### Contract Requirements

Contracts can specify multiple requirement types:

#### Element Requirements

- **Specific Elements**: Must include certain elements (e.g., Fire + Water)
- **Any Elements**: Must have some elemental energy (but any type)
- **No Elements**: Must be pure mana (no elemental conversion)
- **Minimum Amount**: Required quantity of each element

#### Equipment Requirements

- **Required Slots**: Portal must include equipment from specific slots (weapon, armor, accessory)
- **Minimum Rarity**: All equipment must meet or exceed a rarity threshold (common → legendary)
- **Minimum Count**: Number of equipment pieces required

#### Other Requirements

- **Minimum Portal Level**: Based on mana invested and ingredients
- **Minimum Mana**: Raw mana requirement (before element conversion)

### Contract Modifiers

Modifiers add variety and challenge to contracts, with payment bonuses:

| Modifier          | Effect                                   | Payment Bonus | Probability Range |
| ----------------- | ---------------------------------------- | ------------- | ----------------- |
| **Urgent**        | Reduced patience, time pressure          | +30%          | 5-25%             |
| **Bonus**         | Extra gold reward for completion         | +20%          | 10-35%            |
| **Perfectionist** | Increased level and element requirements | +25%          | 5-25%             |
| **Bulk Order**    | 50% more element/mana requirements       | +40%          | 5-20%             |
| **Experimental**  | Requires specific equipment slots        | +15%          | 5-15%             |

Modifiers are assigned probabilistically based on customer template and difficulty level. Higher-tier customers and special customers have higher modifier chances.

### Reward Tiers

Every contract has a reward tier that affects the quality of special rewards:

- **Standard**: Normal rewards from regular contracts
- **Enhanced**: Better rewards from mid-tier customers with modifiers
- **Rare**: High-tier customers (4+) or complex requirements
- **Unique**: Ancient entities and legendary customers with special rewards

### Special Rewards

Special customers can offer unique rewards as partial or full payment:

- **Ingredients**: Rare elemental ingredients based on tier
- **Generated Equipment**: Procedurally generated gear appropriate to difficulty
- **Mana**: Bonus mana (50+ based on tier)
- **Extra Gold**: Additional payment (50-200% of base)

Special rewards appear alongside the regular gold payment and are shown to players before accepting contracts.

### Progression Integration

The contract system aligns with the 5-tier progression system:

1. **Tier 1** → Novice customers, common elements
2. **Tier 2** → Journeyman customers, standard elements unlocked (Earth/Air)
3. **Tier 3** → Master customers, rare elements unlocked (Ice/Lightning/Nature)
4. **Tier 4** → Elite customers, exotic elements unlocked (Shadow/Light/Void)
5. **Tier 5** → Legendary customers, legendary elements unlocked (Time/Chaos/Life/Death)

Mini-boss contracts appear at tier boundaries, and completing them unlocks the next tier.

### Contract Generation Algorithm

1. **Select Template**: Based on current difficulty level (1-5)
   - 5% chance for special customer (if appropriate tier)
   - Otherwise, select regular customer weighted by difficulty
2. **Generate Requirements**: Based on template's difficulty multiplier
   - Element requirements (65% specific, 15% undefined, 10% any, 10% none)
   - Mana requirements (40% chance)
   - Equipment requirements (if experimental modifier)
3. **Apply Modifiers**: Roll for each modifier based on template chances
4. **Determine Rewards**: Calculate reward tier and special reward
5. **Adjust for Modifiers**: Apply modifier effects to requirements and payment

### Extending the System

To add a new customer template:

1. Add template to `CUSTOMER_TEMPLATES` in `src/data/customers.ts`
2. Specify `tier` (1-5) for progression alignment
3. Define `modifierChances` for variety
4. Set `isSpecial: true` for special customers
5. Set `specialRewardChance` for unique rewards

To add a new modifier:

1. Add type to `ContractModifier` in `src/types/index.ts`
2. Add to modifier chances in customer templates
3. Implement effect in `applyModifierEffects()` in `Customer.ts`
4. Add payment bonus in `fulfillCustomerWithPortal()` in `Game.ts`

### Contract Display

The UI displays the following information for each customer:

- Customer name (adjective + base name from pool)
- Customer icon (emoji from icon pool)
- Contract requirements (elements, mana, equipment)
- Base payment + modifiers
- Special rewards (if offered)
- Patience timer (time remaining before customer leaves)
- Special customer indicator (for rare customers)

Contract completion rewards:

- Base gold payment (with modifier bonuses)
- Special rewards (if offered)
- Random portal completion rewards
- Progression tracking

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

| Attribute Quality  | Gold Multiplier | Example Attributes                  |
| ------------------ | --------------- | ----------------------------------- |
| Premium (10+ cost) | +50-60%         | Enchanted, Legendary, Ancient       |
| High (5-9 cost)    | +25-30%         | Tempered, Masterwork, Flames, Frost |
| Mid (2-4 cost)     | +10-25%         | Sturdy, Polished, Steel, Silver     |
| Low (<0 cost)      | -10%            | Rusted, Worn, Cracked               |

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

| Prefix       | Cost | Primary Effects                                      |
| ------------ | ---- | ---------------------------------------------------- |
| Enchanted    | +10  | +50% gold, +2 rarity, Magic Resonance, +50% mana     |
| Legendary    | +15  | +50% gold, +2 rarity, Legendary Aura, +20% equipment |
| Ancient      | +12  | +50% gold, +2 rarity, Ancient Power, void affinity   |
| Masterwork   | +7   | +30% gold, +1 rarity, +0.2 intensity, +5% discovery  |
| Tempered     | +5   | +30% gold, +1 rarity, +0.2 intensity                 |
| Gleaming     | +5   | +30% gold, +0.2 intensity, lighter colors            |
| Sturdy       | +2   | +15% gold, +0.1 intensity                            |
| Polished     | +3   | +15% gold, +0.1 intensity                            |
| Rusted       | -2   | -10% gold, +5% discovery (experimental learning)     |
| Worn/Cracked | -1   | -10% gold, +5% discovery                             |

#### Material Effects

| Material     | Cost | Element Affinity | Primary Effects                            |
| ------------ | ---- | ---------------- | ------------------------------------------ |
| Adamantine   | +12  | Earth            | +40% gold, Unbreakable, +20% bonus         |
| Crystal      | +10  | Light            | +40% gold, Crystal Clarity, +15% discovery |
| Obsidian     | +8   | Void             | +40% gold, Void Touch, darker colors       |
| Dragonscale  | +6   | Fire             | +25% gold, Dragon Essence, +1 rarity       |
| Mithril      | +6   | Air              | +25% gold, Mithril Glow, +0.15 intensity   |
| Silver       | +4   | Light            | +25% gold, +10% ingredients                |
| Steel        | +2   | Earth            | +10% gold                                  |
| Bronze       | +1   | Fire             | +10% gold                                  |
| Iron         | 0    | Earth            | Elemental bonus only                       |
| Wood/Leather | 0    | -                | Base stats                                 |

#### Suffix Effects

| Suffix       | Cost | Element Affinity | Effect Type | Primary Effects                                         |
| ------------ | ---- | ---------------- | ----------- | ------------------------------------------------------- |
| Annihilation | +15  | -                | Special     | +60% gold, +2 rarity, Destructive Force, +30% equipment |
| Void         | +12  | Void             | Elemental   | +60% gold, +2 rarity, Void Touched                      |
| Eternity     | +10  | Light            | Special     | +60% gold, +2 rarity, Timeless, +50% mana               |
| Flames       | +5   | Fire             | Elemental   | +30% gold, +1 rarity, Burning, warmer colors            |
| Frost        | +5   | Water            | Elemental   | +30% gold, +1 rarity, Frozen, cooler colors             |
| Storms       | +6   | Lightning        | Elemental   | +30% gold, +1 rarity, Electrified, +0.25 intensity      |
| Strength     | +3   | -                | Damage      | +15% gold, +15% bonus                                   |
| Vigor        | +3   | -                | Defense     | +15% gold, +15% mana                                    |
| Novice       | +1   | -                | Damage      | Minor bonuses                                           |

#### Combined Effects Example

**Enchanted Mithril Sword of Storms** (Legendary rarity, total cost 27)

- Portal Effects:
  - Visual: +0.7 intensity, electrified effect, lighter color
  - Gold: +115% (50% + 25% + 30% + 10% from cost tiers)
  - Mana: +50%
  - Equipment drops: +20%
  - Rarity: +6 (2 + 1 + 3 from legendary)
  - Recipe discovery: +25%
- Element Bonuses:
  - Air +5 (from Mithril)
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
