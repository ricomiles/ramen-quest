// Categories are per food type so other foods can define their own later.
export type CategoryDef = { key: string; en: string; jp: string }

export const FOOD_TYPES: Record<string, { categories: CategoryDef[]; styles: { en: string; jp?: string }[] }> = {
  ramen: {
    categories: [
      { key: 'broth', en: 'Broth', jp: 'スープ' },
      { key: 'noodles', en: 'Noodles', jp: '麺' },
      { key: 'toppings', en: 'Toppings', jp: '具' },
      { key: 'vibe', en: 'Vibe', jp: '雰囲気' },
      { key: 'value', en: 'Value', jp: 'コスパ' },
    ],
    styles: [
      { en: 'Tonkotsu', jp: '豚骨' },
      { en: 'Shoyu', jp: '醤油' },
      { en: 'Miso', jp: '味噌' },
      { en: 'Shio', jp: '塩' },
      { en: 'Tsukemen', jp: 'つけ麺' },
      { en: 'Other' },
    ],
  },
}

export const categoriesFor = (foodType: string) => (FOOD_TYPES[foodType] ?? FOOD_TYPES.ramen).categories

export const styleJp = (style?: string | null) =>
  Object.values(FOOD_TYPES).flatMap((f) => f.styles).find((s) => s.en === style)?.jp ?? style ?? ''
