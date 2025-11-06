// Shop Items Configuration
export const SHOP_ITEMS = [
  {
    id: 1,
    title: 'Refill Hearts',
    description: 'Replenish your hearts to keep solving challenges',
    hearts: 5,
    points: 50,
    icon: '❤️',
  },
  {
    id: 2,
    title: 'Extra Hearts',
    description: 'Get 10 hearts to power through more problems',
    hearts: 10,
    points: 90,
    icon: '💝',
  },
  {
    id: 3,
    title: 'Heart Booster',
    description: 'Maximum hearts boost - 20 hearts!',
    hearts: 20,
    points: 160,
    icon: '💖',
  },
  {
    id: 4,
    title: 'XP Bonus',
    description: 'Get 100 bonus XP points',
    hearts: 0,
    points: 0, // Free with gems
    icon: '⭐',
    gemsRequired: 10,
  },
] as const

export type ShopItem = (typeof SHOP_ITEMS)[number]
