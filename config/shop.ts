export const SHOP_ITEMS = [
  {
    id: 1,
    title: 'Refill Hearts',
    description: 'Replenish your hearts to keep solving challenges',
    hearts: 5,
    points: 0,
    byteCost: 50,
    icon: '❤️',
  },
  {
    id: 2,
    title: 'Amazon Voucher ($5)',
    description: 'Redeem your tokens for a $5 Amazon Voucher',
    hearts: 0,
    points: 0,
    byteCost: 500,
    icon: '🛍️',
  },
  {
    id: 3,
    title: 'Exclusive Badge',
    description: 'Show off your skills with this exclusive badge',
    hearts: 0,
    points: 0,
    byteCost: 1000,
    icon: '💎',
  },
  {
    id: 4,
    title: 'XP Bonus',
    description: 'Get 100 bonus XP points',
    hearts: 0,
    points: 0,
    rewardPoints: 100,
    byteCost: 0,
    icon: '⭐',
    gemsRequired: 10,
  },
] as const;

export type ShopItem = (typeof SHOP_ITEMS)[number] & { rewardPoints?: number } & {gemsRequired?: number};