import * as THREE from 'three';

/**
 * 首頁 logo 的真實摺紙步驟：一張正面黑、背面白的方紙，依序沿摺線把紙片整片轉 180°（或部分角度），
 * 紙不會變形，只會沿摺線翻動；同一側的所有層一起摺，跟手摺一樣。
 *
 * 步驟（座標同 lincent-logo.svg，y 向下）：
 * 1. 左右往後對摺到中間（櫥櫃摺）
 * 2. 再往後摺一次，變成與 logo 直條同寬的長條
 * 3. 上端往後摺，4. 右上角往後摺出斜邊
 * 5. 下端沿斜線往後摺，長條轉向右上（直條 + 伸出去的腳）
 * 6. 腳的尾端往後摺，剩下三角形
 * 7. 三角形沿直條右緣往前掀起，完成 logo
 */

type V2 = THREE.Vector2;
const P = (x: number, y: number) => new THREE.Vector2(x, -y);

type Fold = {
  a: V2;
  b: V2;
  /** 會被摺動那一側的任一點 */
  side: V2;
  angle?: number;
  /** true：往鏡頭方向摺（谷摺）；false：往後摺（山摺） */
  valley?: boolean;
  /** 只摺帶有此標記的紙片 */
  only?: string;
  /** 替這次摺動的紙片加上標記 */
  tag?: string;
};

const W = 104;
const STEPS: Fold[][] = [
  [
    { a: P(-52, 0), b: P(-52, 1), side: P(-100, 0) },
    { a: P(156, 0), b: P(156, 1), side: P(200, 0) },
  ],
  [
    { a: P(0, 0), b: P(0, 1), side: P(-20, 0) },
    { a: P(W, 0), b: P(W, 1), side: P(130, 0) },
  ],
  [{ a: P(0, 8), b: P(W, 8), side: P(50, -20) }],
  [{ a: P(0, 8), b: P(W, 45.4), side: P(100, 10) }],
  [{ a: P(0, 186), b: P(W, 240), side: P(50, 300), tag: 'arm' }],
  [{ a: P(W, 134), b: P(218, 160), side: P(160, 60), only: 'arm' }],
  [{ a: P(W, 100), b: P(W, 300), side: P(160, 200), only: 'arm', angle: (32 * Math.PI) / 180, valley: true }],
];

/** 方紙：寬 416 = 直條寬 ×4，下緣剛好讓腳的尾端落在三角形頂點 */
const SHEET = { x0: -156, x1: 260, y0: -36.7, y1: 379.3 };
/** 層與層之間的間距（svg 單位），避免重疊的紙面閃爍 */
const GAP = 0.5;

type Move = { m: (k: number) => THREE.Matrix4 } | null;
type Piece = { poly: V2[]; mats: THREE.Matrix4[]; moves: Move[]; tags: Set<string> };

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function rotationAbout(point: THREE.Vector3, dir: THREE.Vector3, angle: number) {
  const m = new THREE.Matrix4().makeTranslation(point.x, point.y, point.z);
  m.multiply(new THREE.Matrix4().makeRotationAxis(dir, angle));
  return m.multiply(new THREE.Matrix4().makeTranslation(-point.x, -point.y, -point.z));
}

/** 用線性函數 f 把凸多邊形切成正、負兩半 */
function split(poly: V2[], f: (v: V2) => number): [V2[], V2[]] | null {
  const vals = poly.map(f);
  const eps = 1e-6;
  if (vals.every((v) => v > -eps) || vals.every((v) => v < eps)) return null;
  const pos: V2[] = [];
  const neg: V2[] = [];
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i];
    const q = poly[(i + 1) % poly.length];
    const fp = vals[i];
    const fq = vals[(i + 1) % poly.length];
    if (fp >= 0) pos.push(p);
    if (fp <= 0) neg.push(p);
    if ((fp > 0 && fq < 0) || (fp < 0 && fq > 0)) {
      const x = p.clone().lerp(q, fp / (fp - fq));
      pos.push(x);
      neg.push(x.clone());
    }
  }
  return [pos, neg];
}

const zOf = (m: THREE.Matrix4) => m.elements[14];

export type LogoFold = {
  steps: number;
  triangles: number;
  /** 依進度 F（0 = 方紙，steps = 完成）寫入頂點，已換算成場景座標並置中 */
  write: (F: number, out: Float32Array) => void;
};

/**
 * @param scale svg 單位換算成場景單位的比例
 * @param fit 紙張外框最大邊長（場景單位），太大時整體縮小
 */
export function buildLogoFold(scale: number, fit: number): LogoFold {
  const { x0, x1, y0, y1 } = SHEET;
  let pieces: Piece[] = [
    { poly: [P(x0, y1), P(x1, y1), P(x1, y0), P(x0, y0)], mats: [new THREE.Matrix4()], moves: [], tags: new Set() },
  ];

  STEPS.forEach((folds, k) => {
    const moving = new Map<Piece, { axis: THREE.Vector3; dir: THREE.Vector3; fold: Fold }>();

    for (const fold of folds) {
      const d = fold.b.clone().sub(fold.a).normalize();
      let n = new THREE.Vector2(-d.y, d.x);
      if (n.dot(fold.side.clone().sub(fold.a)) < 0) n = n.negate();
      const toWorld = (pc: Piece, v: V2) => new THREE.Vector3(v.x, v.y, 0).applyMatrix4(pc.mats[k]);
      const dist = (pc: Piece) => (v: V2) => {
        const w = toWorld(pc, v);
        return n.x * (w.x - fold.a.x) + n.y * (w.y - fold.a.y);
      };

      const next: Piece[] = [];
      for (const pc of pieces) {
        const eligible = !moving.has(pc) && (!fold.only || pc.tags.has(fold.only));
        const halves = eligible ? split(pc.poly, dist(pc)) : null;
        if (!halves) {
          next.push(pc);
          continue;
        }
        for (const poly of halves) {
          next.push({ poly, mats: [...pc.mats], moves: [...pc.moves], tags: new Set(pc.tags) });
        }
      }
      pieces = next;

      const group = pieces.filter((pc) => {
        if (moving.has(pc) || (fold.only && !pc.tags.has(fold.only))) return false;
        const c = pc.poly.reduce((s, v) => s.add(v), new THREE.Vector2()).divideScalar(pc.poly.length);
        return dist(pc)(c) > 1e-6;
      });
      if (!group.length) continue;

      // 摺軸高度：整疊翻過去後要落在所有紙層的最前（谷摺）或最後（山摺）
      const zs = pieces.map((pc) => zOf(pc.mats[k]));
      const zm = group.map((pc) => zOf(pc.mats[k]));
      const angle = fold.angle ?? Math.PI;
      const flat = angle >= Math.PI - 1e-6;
      const az = fold.valley
        ? flat
          ? (Math.max(...zs) + Math.max(...zm)) / 2 + GAP
          : Math.max(...zm)
        : flat
          ? (Math.min(...zs) + Math.min(...zm)) / 2 - GAP
          : Math.min(...zm);
      const axis = new THREE.Vector3(fold.a.x, fold.a.y, az);
      const dir = new THREE.Vector3(d.x, d.y, 0);
      for (const pc of group) moving.set(pc, { axis, dir, fold });
    }

    for (const pc of pieces) {
      const mv = moving.get(pc);
      if (!mv) {
        pc.mats.push(pc.mats[k]);
        pc.moves.push(null);
        continue;
      }
      const { axis, dir, fold } = mv;
      const r = fold.side.clone().sub(fold.a);
      const sgn = Math.sign(dir.x * r.y - dir.y * r.x) || 1;
      const full = (fold.valley ? 1 : -1) * sgn * (fold.angle ?? Math.PI);
      const base = pc.mats[k];
      pc.moves.push({ m: (t) => rotationAbout(axis, dir, full * t).multiply(base) });
      pc.mats.push(rotationAbout(axis, dir, full).multiply(base));
      if (fold.tag) pc.tags.add(fold.tag);
    }
  });

  const n = STEPS.length;
  // 每一步完成時的外框中心與縮放，切換步驟時平滑過渡
  const frames = Array.from({ length: n + 1 }, (_, k) => {
    const box = new THREE.Box3();
    for (const pc of pieces) for (const v of pc.poly) box.expandByPoint(new THREE.Vector3(v.x, v.y, 0).applyMatrix4(pc.mats[k]));
    const size = Math.max(box.max.x - box.min.x, box.max.y - box.min.y) * scale;
    return { cx: (box.min.x + box.max.x) / 2, cy: (box.min.y + box.max.y) / 2, s: scale * Math.min(1, fit / size) };
  });

  const triangles = pieces.reduce((sum, pc) => sum + pc.poly.length - 2, 0);
  const tmp = new THREE.Vector3();

  const write = (F: number, out: Float32Array) => {
    const k = Math.min(Math.max(Math.floor(F), 0), n - 1);
    const e = easeInOut(THREE.MathUtils.clamp(F - k, 0, 1));
    const a = frames[k];
    const b = frames[k + 1];
    const cx = a.cx + (b.cx - a.cx) * e;
    const cy = a.cy + (b.cy - a.cy) * e;
    const s = a.s + (b.s - a.s) * e;
    let o = 0;
    for (const pc of pieces) {
      const mv = pc.moves[k];
      const m = mv ? mv.m(e) : pc.mats[k];
      const pts = pc.poly.map((v) => {
        tmp.set(v.x, v.y, 0).applyMatrix4(m);
        return [(tmp.x - cx) * s, (tmp.y - cy) * s, tmp.z * s] as const;
      });
      for (let i = 1; i < pts.length - 1; i++) {
        for (const p of [pts[0], pts[i], pts[i + 1]]) {
          out[o++] = p[0];
          out[o++] = p[1];
          out[o++] = p[2];
        }
      }
    }
  };

  return { steps: n, triangles, write };
}
