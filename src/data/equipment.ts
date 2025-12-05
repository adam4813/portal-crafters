import type { Equipment, EquipmentRarity } from '../types';

export const EQUIPMENT: Equipment[] = [
  // Weapons
  {
    id: 'rusty_sword',
    name: 'Rusty Sword',
    slot: 'weapon',
    rarity: 'common',
    icon: '🗡️',
    description: 'An old but serviceable sword',
    portalBonus: 5,
  },
  {
    id: 'iron_sword',
    name: 'Iron Sword',
    slot: 'weapon',
    rarity: 'uncommon',
    icon: '⚔️',
    description: 'A sturdy iron blade',
    portalBonus: 10,
    elementBonus: { earth: 2 },
  },
  {
    id: 'flame_blade',
    name: 'Flame Blade',
    slot: 'weapon',
    rarity: 'rare',
    icon: '🔥',
    description: 'A sword wreathed in eternal flames',
    portalBonus: 20,
    elementBonus: { fire: 5 },
  },
  {
    id: 'storm_staff',
    name: 'Storm Staff',
    slot: 'weapon',
    rarity: 'epic',
    icon: '🌩️',
    description: 'A staff crackling with lightning',
    portalBonus: 35,
    elementBonus: { lightning: 8, air: 3 },
  },

  // Armor
  {
    id: 'leather_armor',
    name: 'Leather Armor',
    slot: 'armor',
    rarity: 'common',
    icon: '🥋',
    description: 'Basic protective gear',
    portalBonus: 3,
  },
  {
    id: 'chainmail',
    name: 'Chainmail',
    slot: 'armor',
    rarity: 'uncommon',
    icon: '🛡️',
    description: 'Linked metal rings for protection',
    portalBonus: 8,
    elementBonus: { earth: 3 },
  },
  {
    id: 'mage_robes',
    name: 'Mage Robes',
    slot: 'armor',
    rarity: 'rare',
    icon: '👘',
    description: 'Enchanted robes that enhance magic',
    portalBonus: 15,
    elementBonus: { fire: 2, water: 2, air: 2 },
  },

  // Accessories
  {
    id: 'copper_ring',
    name: 'Copper Ring',
    slot: 'accessory',
    rarity: 'common',
    icon: '💍',
    description: 'A simple copper band',
    portalBonus: 2,
  },
  {
    id: 'amulet_of_focus',
    name: 'Amulet of Focus',
    slot: 'accessory',
    rarity: 'uncommon',
    icon: '📿',
    description: 'Helps concentrate magical energies',
    portalBonus: 6,
    elementBonus: { water: 2 },
  },
  {
    id: 'elemental_crystal',
    name: 'Elemental Crystal',
    slot: 'accessory',
    rarity: 'rare',
    icon: '💎',
    description: 'A crystal resonating with elemental power',
    portalBonus: 12,
    elementBonus: { fire: 2, water: 2, earth: 2, air: 2 },
  },

  // Consumables
  {
    id: 'mana_potion',
    name: 'Mana Potion',
    slot: 'consumable',
    rarity: 'common',
    icon: '🧪',
    description: 'Restores a small amount of mana',
    portalBonus: 0,
  },
  {
    id: 'elemental_catalyst',
    name: 'Elemental Catalyst',
    slot: 'consumable',
    rarity: 'rare',
    icon: '⚗️',
    description: 'Amplifies elemental effects',
    portalBonus: 25,
    elementBonus: { fire: 5, water: 5, earth: 5, air: 5 },
  },
];

export const RARITY_COLORS: Record<EquipmentRarity, string> = {
  common: '#a0aec0',
  uncommon: '#68d391',
  rare: '#4299e1',
  epic: '#9f7aea',
  legendary: '#ed8936',
};

export function getEquipmentById(id: string): Equipment | undefined {
  return EQUIPMENT.find((eq) => eq.id === id);
}

export function getEquipmentBySlot(slot: Equipment['slot']): Equipment[] {
  return EQUIPMENT.filter((eq) => eq.slot === slot);
}

export function getEquipmentByRarity(rarity: EquipmentRarity): Equipment[] {
  return EQUIPMENT.filter((eq) => eq.rarity === rarity);
}
