import * as THREE from 'three';
import type { FoldModel, ShapeModel, ShapeVert } from './origami-fold-sim';
import type { OrigamiKey } from './origami-models';

/**
 * 每個造型都從同一張正黑背白的方紙開始。logo 與紙飛機照真實摺法一步一步摺；
 * 紙鶴與紙船不照摺法，直接定義跟真的紙鶴、紙船一樣的完成造型，從方紙變形過去。
 * 座標 y 向上；logo 沿用 lincent-logo.svg 的座標（y 向下）所以用 S() 轉換。
 */

const V = (x: number, y: number) => new THREE.Vector2(x, y);
const S = (x: number, y: number) => new THREE.Vector2(x, -y);
const deg = (d: number) => (d * Math.PI) / 180;

/** 摺完後轉成「背脊在下、往上是 +x、頭朝 +y」的展示方向 */
const SIDEWAYS = new THREE.Matrix4().makeBasis(new THREE.Vector3(0, 1, 0), new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, -1));

const square = [V(-1, -1), V(1, -1), V(1, 1), V(-1, 1)];

/**
 * logo：
 * 1. 左右往後對摺到中間  2. 再往後摺成與直條同寬的長條
 * 3. 上端往後摺  4. 右上角往後摺出斜邊
 * 5. 下端沿斜線往後摺，長條轉向右上伸出一隻腳  6. 腳的尾端往後摺，剩下三角形
 * 7. 三角形沿直條右緣往前掀起
 */
const W = 104;
const logo: FoldModel = {
  sheet: [S(-156, 379.3), S(260, 379.3), S(260, -36.7), S(-156, -36.7)],
  steps: [
    [
      { a: S(-52, 0), b: S(-52, 1), side: S(-100, 0) },
      { a: S(156, 0), b: S(156, 1), side: S(200, 0) },
    ],
    [
      { a: S(0, 0), b: S(0, 1), side: S(-20, 0) },
      { a: S(W, 0), b: S(W, 1), side: S(130, 0) },
    ],
    [{ a: S(0, 8), b: S(W, 8), side: S(50, -20) }],
    [{ a: S(0, 8), b: S(W, 45.4), side: S(100, 10) }],
    [{ a: S(0, 186), b: S(W, 240), side: S(50, 300), tag: 'arm' }],
    [{ a: S(W, 134), b: S(218, 160), side: S(160, 60), only: ['arm'] }],
    [{ a: S(W, 100), b: S(W, 300), side: S(160, 200), only: ['arm'], angle: deg(32), valley: true }],
  ],
  size: 2.9,
};

/**
 * 紙飛機（經典尖頭機）：
 * 1. 上方兩角往前摺到中線  2. 斜邊再往前摺到中線  3. 沿中線往後對摺
 * 4. 兩邊機翼從機頭往外摺下  5. 機翼打開成水平
 */
const plane: FoldModel = {
  sheet: square,
  steps: [
    [
      { a: V(0, 1), b: V(-1, 0), side: V(-1, 1), valley: true },
      { a: V(0, 1), b: V(1, 0), side: V(1, 1), valley: true },
    ],
    [
      { a: V(0, 1), b: V(-0.828, -1), side: V(-1, -1), valley: true },
      { a: V(0, 1), b: V(0.828, -1), side: V(1, -1), valley: true },
    ],
    [{ a: V(0, 1), b: V(0, -1), side: V(-0.5, 0) }],
    [{ a: V(0, 1), b: V(0.22, -1), side: V(0.6, -0.9), split: true, valley: true, tag: 'wing' }],
    [{ a: V(0, 1), b: V(0.22, -1), side: V(-0.3, -0.9), split: true, angle: deg(92), only: ['wing'] }],
  ],
  orient: SIDEWAYS,
  size: 3.2,
};

type Vert = { flat: [number, number]; pos: [number, number, number] };

/**
 * 由上半邊（方紙 v ≥ 0、造型 z ≥ 0）鏡射出下半邊，組成左右對稱的造型。
 * flip：整張紙翻面，讓外側是正面（深色）。
 */
function mirrored(half: Vert[], tris: [number, number, number][], size: number, flip = false): ShapeModel {
  const verts: ShapeVert[] = half.map((v) => ({ ...v }));
  const twin = half.map((v, i) => {
    if (v.flat[1] === 0) return i;
    verts.push({ flat: [v.flat[0], -v.flat[1]], pos: [v.pos[0], v.pos[1], -v.pos[2]] });
    return verts.length - 1;
  });
  const all: [number, number, number][] = [...tris, ...tris.map(([a, b, c]) => [twin[a], twin[c], twin[b]] as [number, number, number])];
  if (!flip) return { verts, tris: all, size };
  return {
    verts: verts.map((v) => ({ ...v, flat: [v.flat[0], -v.flat[1]] })),
    tris: all.map(([a, b, c]) => [a, c, b]),
    size,
  };
}

/**
 * 紙鶴：傳統紙鶴的完成造型（x 朝頭、y 向上、z 往側邊）。
 * 方紙的四個角分別成為頭、尾、左右翼尖，紙中心在背上兩翼之間，紙邊收在肚子下方。
 * 身體有反摺回來的內層，真的紙鶴外面看不到白色，所以兩面都用深色（solid）。
 */
const CRANE_HALF: Vert[] = [
  { flat: [0, 0], pos: [0, 0.1, 0] }, // 0 背中心
  { flat: [0.3, 0], pos: [0.38, -0.02, 0] }, // 1 前肩
  { flat: [0.5, 0], pos: [0.5, -0.3, 0] }, // 2 脖子根
  { flat: [0.82, 0], pos: [1.12, 0.92, 0] }, // 3 脖子頂
  { flat: [1, 0], pos: [1.5, 0.7, 0] }, // 4 嘴尖
  { flat: [0.88, 0.12], pos: [1.1, 0.83, 0.03] }, // 5 頭後
  { flat: [0.62, 0.38], pos: [0.62, -0.2, 0.04] }, // 6 脖子根外側
  { flat: [0.3, 0.7], pos: [0.42, 0.04, 0.01] }, // 7 翅膀前緣根部
  { flat: [0, 1], pos: [-0.08, 0.55, 1.45] }, // 8 翼尖
  { flat: [0, 0.32], pos: [0, 0.07, 0.01] }, // 9 翅膀根部中點
  { flat: [0.28, 0.2], pos: [0.2, -0.34, 0.24] }, // 10 身體前側
  { flat: [-0.3, 0], pos: [-0.38, -0.02, 0] }, // 11 後肩
  { flat: [-0.5, 0], pos: [-0.5, -0.3, 0] }, // 12 尾根
  { flat: [-0.82, 0], pos: [-1.18, 0.8, 0] }, // 13 尾中
  { flat: [-1, 0], pos: [-1.48, 1.02, 0] }, // 14 尾尖
  { flat: [-0.88, 0.12], pos: [-1.2, 0.86, 0.03] }, // 15 尾外側
  { flat: [-0.62, 0.38], pos: [-0.62, -0.2, 0.04] }, // 16 尾根外側
  { flat: [-0.3, 0.7], pos: [-0.42, 0.04, 0.01] }, // 17 翅膀後緣根部
  { flat: [-0.28, 0.2], pos: [-0.2, -0.34, 0.24] }, // 18 身體後側
];
const craneFront: [number, number, number][] = [
  [9, 7, 8], // 翅膀前半
  [3, 4, 5], // 頭
  [2, 3, 5],
  [2, 5, 6], // 脖子
  [1, 2, 6],
  [1, 6, 10],
  [6, 7, 10],
  [0, 1, 10],
  [0, 10, 9],
  [10, 7, 9], // 身體側面
];
/** 後半（尾巴那側）：前半在方紙上左右鏡射，頂點換成尾巴的 */
const tailOf: Record<number, number> = { 1: 11, 2: 12, 3: 13, 4: 14, 5: 15, 6: 16, 7: 17, 10: 18 };
const craneTris = [...craneFront, ...craneFront.map(([a, b, c]) => [tailOf[a] ?? a, tailOf[c] ?? c, tailOf[b] ?? b] as [number, number, number])];
const crane: ShapeModel = { ...mirrored(CRANE_HALF, craneTris, 3.8, true), solid: true };

/**
 * 紙船：傳統報紙船的完成造型（x 為船身長度、y 向上、z 為寬度）。
 * 側看是上寬下窄的梯形船身，中間立著一片三角帆；俯看船緣張開成菱形。
 */
const BOAT_HALF: Vert[] = [
  { flat: [-1, 0], pos: [-1, 0.55, 0] }, // 0 船尾尖
  { flat: [-0.5, 0], pos: [-0.5, 0, 0] }, // 1 龍骨後端
  { flat: [0.5, 0], pos: [0.5, 0, 0] }, // 2 龍骨前端
  { flat: [1, 0], pos: [1, 0.55, 0] }, // 3 船頭尖
  { flat: [0, 1], pos: [0, 0.55, 0.42] }, // 4 船緣最寬處
  { flat: [-0.5, 0.5], pos: [-0.5, 0.55, 0.21] }, // 5 船緣後段
  { flat: [0.5, 0.5], pos: [0.5, 0.55, 0.21] }, // 6 船緣前段
];
const boatHull = mirrored(
  BOAT_HALF,
  [
    [4, 5, 1],
    [5, 0, 1],
    [4, 1, 2],
    [4, 2, 6],
    [6, 2, 3],
  ],
  3
);
/** 帆：兩片背對背的三角形，兩面都是正面；攤平時藏在紙後 */
const sail = (z: number, flipSide: boolean): { verts: ShapeVert[]; tri: [number, number, number] } => ({
  verts: [
    { flat: [-0.28, -0.18], pos: [-0.5, 0.12, z], hidden: true },
    { flat: [0.28, -0.18], pos: [0.5, 0.12, z], hidden: true },
    { flat: [0, 0.3], pos: [0, 1.3, z], hidden: true },
  ],
  tri: flipSide ? [0, 2, 1] : [0, 1, 2],
});
const boat: ShapeModel = (() => {
  const verts = [...boatHull.verts];
  const tris = [...boatHull.tris];
  for (const [z, flipSide] of [
    [0.006, false],
    [-0.006, true],
  ] as const) {
    const s = sail(z, flipSide);
    const o = verts.length;
    verts.push(...s.verts);
    tris.push(s.tri.map((i) => i + o) as [number, number, number]);
  }
  return { verts, tris, size: 3 };
})();

export const FOLD_MODELS: Record<OrigamiKey, FoldModel | ShapeModel> = { logo, crane, boat, plane };
