/**
 * カテゴリごとのデフォルト画像のマッピング
 * アイキャッチ画像が未設定の場合に使用される
 */

export type CategoryType = 'wedding' | 'event' | 'family' | 'sports' | 'travel' | 'other';

export const categoryDefaultImages: Record<CategoryType, string> = {
  wedding: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1280&h=720&fit=crop',
  event: 'https://images.unsplash.com/photo-1478147427282-58a87a120781?w=1280&h=720&fit=crop',
  family: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1280&h=720&fit=crop',
  sports: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1280&h=720&fit=crop',
  travel: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1280&h=720&fit=crop',
  other: 'https://images.unsplash.com/photo-1587955793432-7c4ff80918ba?w=1280&h=720&fit=crop',
};

/**
 * カテゴリに応じたデフォルト画像を取得
 */
export const getCategoryDefaultImage = (category: CategoryType | string | null | undefined): string => {
  if (!category || !(category in categoryDefaultImages)) {
    return categoryDefaultImages.other;
  }
  return categoryDefaultImages[category as CategoryType];
};

