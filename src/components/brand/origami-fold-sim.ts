import * as THREE from 'three';

/**
 * 摺紙模擬：一張正面黑、背面白的紙，依序沿摺線把紙片整片轉動（180° 為壓平，或部分角度），
 * 紙片不會拉伸變形；同一側的紙層會一起摺，跟手摺一樣。
 * 模型的摺法定義在 origami-fold-models.ts。
 */

export type V2 = THREE.Vector2;

export type Fold = {
  a: V2;
  b: V2;
  /** 會被摺動那一側的任一點 */
  side: V2;
  /** 預設 180° 壓平 */
  angle?: number;
  /** true：往鏡頭方向摺（谷摺）；false：往後摺（山摺） */
  valley?: boolean;
  /** 前後兩半各往外摺（反摺、張開翅膀）：前面的紙層照 valley，後面的紙層反方向 */
  split?: boolean;
  /** 只摺帶有任一標記的紙片 */
  only?: string[];
  /** 不摺帶有任一標記的紙片 */
  skip?: string[];
  /** 替這次摺動的紙片加上標記 */
  tag?: string;
};

export type FoldModel = {
  /** 攤平時的紙（逆時針多邊形，y 向上） */
  sheet: V2[];
  steps: Fold[][];
  /** 摺完後轉成展示方向（最後一步一起轉過去） */
  orient?: THREE.Matrix4;
  /** 完成時的外框最大邊長（場景單位） */
  size: number;
};

type Move = { m: (t: number) => THREE.Matrix4 } | null;
type Piece = { poly: V2[]; mats: THREE.Matrix4[]; moves: Move[]; tags: Set<string> };

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function rotationAbout(point: THREE.Vector3, dir: THREE.Vector3, angle: number) {
  const m = new THREE.Matrix4().makeTranslation(point.x, point.y, point.z);
  m.multiply(new THREE.Matrix4().makeRotationAxis(dir, angle));
  return m.multiply(new THREE.Matrix4().makeTranslation(-point.x, -point.y, -point.z));
}

/** 用線性函數 f 把凸多邊形切成正、負兩半 */
function split(poly: V2[], f: (v: V2) => number, eps: number): [V2[], V2[]] | null {
  const vals = poly.map(f);
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
const centroid = (poly: V2[]) => poly.reduce((s, v) => s.add(v), new THREE.Vector2()).divideScalar(poly.length);

export type FoldSim = {
  steps: number;
  triangles: number;
  /** 依進度 F（0 = 攤平的紙，steps = 完成）寫入頂點，已換算成場景座標並置中 */
  write: (F: number, out: Float32Array) => void;
};

/** @param sheetSize 攤平時紙的邊長（場景單位），所有模型攤平時一樣大，切換時才接得上 */
export function buildFold(model: FoldModel, sheetSize: number): FoldSim {
  const ext0 = new THREE.Box2().setFromPoints(model.sheet).getSize(new THREE.Vector2());
  const unit = Math.max(ext0.x, ext0.y);
  /** 層與層之間的間距，避免重疊的紙面閃爍 */
  const gap = unit * 0.0012;
  const eps = unit * 1e-6;

  let pieces: Piece[] = [{ poly: model.sheet.map((v) => v.clone()), mats: [new THREE.Matrix4()], moves: [], tags: new Set() }];

  model.steps.forEach((folds, k) => {
    const moving = new Map<Piece, { axis: THREE.Vector3; dir: THREE.Vector3; angle: number; fold: Fold }>();

    for (const fold of folds) {
      const d = fold.b.clone().sub(fold.a).normalize();
      let n = new THREE.Vector2(-d.y, d.x);
      if (n.dot(fold.side.clone().sub(fold.a)) < 0) n = n.negate();
      const dist = (pc: Piece) => (v: V2) => {
        const w = new THREE.Vector3(v.x, v.y, 0).applyMatrix4(pc.mats[k]);
        return n.x * (w.x - fold.a.x) + n.y * (w.y - fold.a.y);
      };
      const eligible = (pc: Piece) =>
        !moving.has(pc) &&
        (!fold.only || fold.only.some((t) => pc.tags.has(t))) &&
        !fold.skip?.some((t) => pc.tags.has(t));

      const next: Piece[] = [];
      for (const pc of pieces) {
        const halves = eligible(pc) ? split(pc.poly, dist(pc), eps) : null;
        if (!halves) next.push(pc);
        else for (const poly of halves) next.push({ poly, mats: [...pc.mats], moves: [...pc.moves], tags: new Set(pc.tags) });
      }
      pieces = next;

      const group = pieces.filter((pc) => eligible(pc) && dist(pc)(centroid(pc.poly)) > eps);
      if (!group.length) continue;

      const zs = pieces.map((pc) => zOf(pc.mats[k]));
      const angle = fold.angle ?? Math.PI;
      const flat = angle >= Math.PI - 1e-6;
      const dir = new THREE.Vector3(d.x, d.y, 0);
      const r = fold.side.clone().sub(fold.a);
      const sgn = Math.sign(dir.x * r.y - dir.y * r.x) || 1;

      // split：前半與後半各自往外摺
      const zg = group.map((pc) => zOf(pc.mats[k]));
      const mid = (Math.min(...zg) + Math.max(...zg)) / 2;
      const parts: [Piece[], boolean][] = fold.split
        ? [
            [group.filter((pc) => zOf(pc.mats[k]) >= mid), !!fold.valley],
            [group.filter((pc) => zOf(pc.mats[k]) < mid), !fold.valley],
          ]
        : [[group, !!fold.valley]];

      for (const [g, valley] of parts) {
        if (!g.length) continue;
        const zm = g.map((pc) => zOf(pc.mats[k]));
        // 摺軸高度：整疊翻過去後要落在所有紙層的最前（谷摺）或最後（山摺）
        const az = valley
          ? flat
            ? (Math.max(...zs) + Math.max(...zm)) / 2 + gap
            : Math.max(...zm)
          : flat
            ? (Math.min(...zs) + Math.min(...zm)) / 2 - gap
            : Math.min(...zm);
        const axis = new THREE.Vector3(fold.a.x, fold.a.y, az);
        const signed = (valley ? 1 : -1) * sgn * angle;
        for (const pc of g) moving.set(pc, { axis, dir, angle: signed, fold });
      }
    }

    for (const pc of pieces) {
      const mv = moving.get(pc);
      if (!mv) {
        pc.mats.push(pc.mats[k]);
        pc.moves.push(null);
        continue;
      }
      const { axis, dir, angle, fold } = mv;
      const base = pc.mats[k];
      pc.moves.push({ m: (t) => rotationAbout(axis, dir, angle * t).multiply(base) });
      pc.mats.push(rotationAbout(axis, dir, angle).multiply(base));
      if (fold.tag) pc.tags.add(fold.tag);
    }
  });

  const n = model.steps.length;
  const orientQ = new THREE.Quaternion().setFromRotationMatrix(model.orient ?? new THREE.Matrix4());
  const orientAt = (F: number) =>
    new THREE.Quaternion().slerp(orientQ, easeInOut(THREE.MathUtils.clamp(F - (n - 1), 0, 1)));

  // 每一步完成時的外框中心與縮放，換步驟時平滑過渡；攤平時固定為 sheetSize
  const sizes = Array.from({ length: n + 1 }, (_, k) => {
    const q = k === n ? orientQ : new THREE.Quaternion();
    const box = new THREE.Box3();
    for (const pc of pieces)
      for (const v of pc.poly) box.expandByPoint(new THREE.Vector3(v.x, v.y, 0).applyMatrix4(pc.mats[k]).applyQuaternion(q));
    return { box, size: Math.max(box.max.x - box.min.x, box.max.y - box.min.y) };
  });
  const base = model.size / sizes[n].size;
  const frames = sizes.map(({ box, size }) => ({
    cx: (box.min.x + box.max.x) / 2,
    cy: (box.min.y + box.max.y) / 2,
    cz: (box.min.z + box.max.z) / 2,
    s: Math.min(base, sheetSize / size),
  }));

  const triangles = pieces.reduce((sum, pc) => sum + pc.poly.length - 2, 0);
  const tmp = new THREE.Vector3();

  const write = (F: number, out: Float32Array) => {
    const k = Math.min(Math.max(Math.floor(F), 0), n - 1);
    const e = easeInOut(THREE.MathUtils.clamp(F - k, 0, 1));
    const a = frames[k];
    const b = frames[k + 1];
    const lerp = (x: number, y: number) => x + (y - x) * e;
    const cx = lerp(a.cx, b.cx);
    const cy = lerp(a.cy, b.cy);
    const cz = lerp(a.cz, b.cz);
    const s = lerp(a.s, b.s);
    const q = orientAt(F);
    let o = 0;
    for (const pc of pieces) {
      const mv = pc.moves[k];
      const m = mv ? mv.m(e) : pc.mats[k];
      const pts = pc.poly.map((v) => {
        tmp.set(v.x, v.y, 0).applyMatrix4(m).applyQuaternion(q);
        return [(tmp.x - cx) * s, (tmp.y - cy) * s, (tmp.z - cz) * s] as const;
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

/**
 * 造型模型：不照真實摺法，直接定義完成時的 3D 造型。
 * 每個頂點同時有「在方紙上的位置」與「完成後的位置」，三角面共用頂點，
 * 變形時紙面連在一起、不會碎開：方紙 → 壓平的側面輪廓 → 立體完成品。
 */
export type ShapeVert = {
  /** 在攤平方紙上的位置（菱形座標，四角為 (±1,0)、(0,±1)，建構時轉成正方形） */
  flat: [number, number];
  pos: [number, number, number];
  /** 攤平時藏在紙後面（例如之後才長出來的帆） */
  hidden?: boolean;
};

export type ShapeModel = {
  verts: ShapeVert[];
  /** 頂點索引，攤平時為逆時針（正面朝鏡頭） */
  tris: [number, number, number][];
  size: number;
  /** 兩面都用正面顏色（看不到紙背） */
  solid?: boolean;
};

/** 方紙 → 壓平輪廓 → 完成品，各佔兩步 */
const SHAPE_STEPS = 4;
/** 壓平輪廓時保留的厚度比例 */
const SQUASH = 0.14;

export function buildShape(model: ShapeModel, sheetSize: number): FoldSim {
  const n = model.verts.length;
  const keys = [0, 1, 2].map(() => new Float32Array(n * 3));
  const dist = new Float32Array(n);
  model.verts.forEach((v, i) => {
    const [u, w] = v.flat;
    keys[0].set([u - w, u + w, v.hidden ? -0.02 : 0], i * 3);
    keys[1].set([v.pos[0], v.pos[1], v.pos[2] * SQUASH], i * 3);
    keys[2].set(v.pos, i * 3);
    dist[i] = Math.min(1, Math.hypot(u, w));
  });

  const frames = keys.map((k) => {
    const box = new THREE.Box3();
    for (let i = 0; i < n; i++) box.expandByPoint(new THREE.Vector3(k[i * 3], k[i * 3 + 1], k[i * 3 + 2]));
    const size = Math.max(box.max.x - box.min.x, box.max.y - box.min.y);
    return { box, size };
  });
  const base = model.size / frames[2].size;
  const fit = frames.map(({ box, size }) => ({
    c: box.getCenter(new THREE.Vector3()),
    s: Math.min(base, sheetSize / size),
  }));

  const pos = new Float32Array(n * 3);
  const write = (F: number, out: Float32Array) => {
    const seg = F < SHAPE_STEPS / 2 ? 0 : 1;
    const t = THREE.MathUtils.clamp((F - seg * (SHAPE_STEPS / 2)) / (SHAPE_STEPS / 2), 0, 1);
    const a = keys[seg];
    const b = keys[seg + 1];
    const et = easeInOut(t);
    const c = fit[seg].c.clone().lerp(fit[seg + 1].c, et);
    const s = fit[seg].s + (fit[seg + 1].s - fit[seg].s) * et;
    for (let i = 0; i < n; i++) {
      // 外圍晚一點動，像從中間往外收攏
      const e = easeInOut(THREE.MathUtils.clamp((t - dist[i] * 0.25) / 0.75, 0, 1));
      for (let j = 0; j < 3; j++) {
        const k = i * 3 + j;
        pos[k] = (a[k] + (b[k] - a[k]) * e - c.getComponent(j)) * s;
      }
    }
    let o = 0;
    for (const tri of model.tris) for (const i of tri) for (let j = 0; j < 3; j++) out[o++] = pos[i * 3 + j];
  };

  return { steps: SHAPE_STEPS, triangles: model.tris.length, write };
}
