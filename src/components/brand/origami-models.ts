/** 首頁摺紙可切換的模型（順序即點擊切換順序）；幾何定義在 origami-fold-3d.tsx */
export const ORIGAMI_MODELS = [
  { key: 'logo', label: { zh: 'Lincent', en: 'Lincent' } },
  { key: 'crane', label: { zh: '紙鶴', en: 'Crane' } },
  { key: 'boat', label: { zh: '紙船', en: 'Boat' } },
  { key: 'plane', label: { zh: '紙飛機', en: 'Plane' } },
] as const;

export type OrigamiKey = (typeof ORIGAMI_MODELS)[number]['key'];
