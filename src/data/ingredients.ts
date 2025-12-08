import type { Ingredient } from '../types';

export const INGREDIENTS: Ingredient[] = [
  // Elemental Ingredients
  {
    id: 'fire_crystal',
    name: 'Fire Crystal',
    category: 'elemental',
    icon: '🔥',
    description: 'A crystal pulsing with fiery energy',
    elementAffinity: 'fire',
    baseValue: 25,
  },
  {
    id: 'water_essence',
    name: 'Water Essence',
    category: 'elemental',
    icon: '💧',
    description: 'Purified essence of water',
    elementAffinity: 'water',
    baseValue: 25,
  },
  {
    id: 'earth_shard',
    name: 'Earth Shard',
    category: 'elemental',
    icon: '🪨',
    description: 'A fragment of ancient stone',
    elementAffinity: 'earth',
    baseValue: 25,
  },
  {
    id: 'wind_wisp',
    name: 'Wind Wisp',
    category: 'elemental',
    icon: '💨',
    description: 'Captured breath of wind',
    elementAffinity: 'air',
    baseValue: 25,
  },
  {
    id: 'lightning_spark',
    name: 'Lightning Spark',
    category: 'elemental',
    icon: '⚡',
    description: 'A contained electric discharge',
    elementAffinity: 'lightning',
    baseValue: 35,
  },

  // Mundane Ingredients
  {
    id: 'iron_ore',
    name: 'Iron Ore',
    category: 'mundane',
    icon: '🔩',
    description: 'Raw iron ore',
    baseValue: 10,
  },
  {
    id: 'copper_wire',
    name: 'Copper Wire',
    category: 'mundane',
    icon: '🔌',
    description: 'Conductive copper wire',
    baseValue: 8,
  },
  {
    id: 'glass_lens',
    name: 'Glass Lens',
    category: 'mundane',
    icon: '🔍',
    description: 'A precisely ground glass lens',
    baseValue: 15,
  },
  {
    id: 'enchanted_ink',
    name: 'Enchanted Ink',
    category: 'mundane',
    icon: '🖋️',
    description: 'Ink infused with magical properties',
    baseValue: 20,
  },
  {
    id: 'moon_dust',
    name: 'Moon Dust',
    category: 'mundane',
    icon: '✨',
    description: 'Shimmering dust from the moon',
    baseValue: 30,
  },
  {
    id: 'ancient_rune',
    name: 'Ancient Rune',
    category: 'mundane',
    icon: '🔮',
    description: 'A stone carved with ancient symbols',
    baseValue: 40,
  },
  {
    id: 'phoenix_feather',
    name: 'Phoenix Feather',
    category: 'mundane',
    icon: '🪶',
    description: 'A feather from a mythical phoenix',
    elementAffinity: 'fire',
    baseValue: 50,
  },
  {
    id: 'dragon_scale',
    name: 'Dragon Scale',
    category: 'mundane',
    icon: '🐉',
    description: 'A scale from a mighty dragon',
    baseValue: 75,
  },

  // Shop Items
  {
    id: 'health_potion',
    name: 'Health Potion',
    category: 'mundane',
    icon: '🧪',
    description: 'A basic healing potion',
    baseValue: 25,
  },
  {
    id: 'mana_crystal',
    name: 'Mana Crystal',
    category: 'mundane',
    icon: '💎',
    description: 'A small crystal infused with mana',
    baseValue: 50,
  },
  {
    id: 'lucky_charm',
    name: 'Lucky Charm',
    category: 'mundane',
    icon: '🍀',
    description: 'Brings good fortune to the bearer',
    baseValue: 75,
  },
];

export function getIngredientById(id: string): Ingredient | undefined {
  return INGREDIENTS.find((ing) => ing.id === id);
}

export function getIngredientsByCategory(category: Ingredient['category']): Ingredient[] {
  return INGREDIENTS.filter((ing) => ing.category === category);
}
