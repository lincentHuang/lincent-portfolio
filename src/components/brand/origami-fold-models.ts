import * as THREE from 'three';
import type { FoldModel } from './origami-fold-sim';
import type { OrigamiKey } from './origami-models';

/**
 * 每個造型的真實摺法：都從同一張正黑背白的方紙開始。
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

/**
 * 紙鶴：
 * 1. 菱形上方兩邊往後摺到中線（風箏摺）  2. 下方兩邊也往後摺到中線，成細長菱形
 * 3. 沿中線往後對摺  4. 前端反摺成脖子  5. 後端反摺成尾巴  6. 脖子尖端反摺成頭
 * 7. 兩側往上張開成翅膀
 */
const k = Math.tan(deg(22.5));
const neckDir = V(Math.sin(deg(30)), Math.cos(deg(30)));
/** 頭：脖子靠近尖端處再反摺一次，尖端朝前下方 */
const headAt = V(0, 0.42).add(V(Math.sin(deg(60)), Math.cos(deg(60))).multiplyScalar(0.46));
const headDir = V(Math.sin(deg(21)), Math.cos(deg(21)));
const crane: FoldModel = {
  sheet: [V(0, -1), V(1, 0), V(0, 1), V(-1, 0)],
  steps: [
    [
      { a: V(0, 1), b: V(-k, 0), side: V(-1, 0) },
      { a: V(0, 1), b: V(k, 0), side: V(1, 0) },
    ],
    [
      { a: V(0, -1), b: V(-k, 0), side: V(-0.6, -0.4) },
      { a: V(0, -1), b: V(k, 0), side: V(0.6, -0.4) },
    ],
    [{ a: V(0, 1), b: V(0, -1), side: V(-0.2, 0) }],
    [{ a: V(0, 0.42), b: V(neckDir.x, 0.42 + neckDir.y), side: V(0, 0.95), split: true, valley: true, tag: 'neck' }],
    [{ a: V(0, -0.42), b: V(neckDir.x, -0.42 - neckDir.y), side: V(0, -0.95), split: true, valley: true, tag: 'tail' }],
    [{ a: headAt, b: headAt.clone().add(headDir), side: V(0.6, 0.8), split: true, valley: true, only: ['neck'] }],
    [{ a: V(0.07, 1), b: V(0.07, -1), side: V(0.3, 0), split: true, valley: true, angle: deg(55), skip: ['neck', 'tail'] }],
  ],
  orient: SIDEWAYS,
  size: 3.5,
};

/**
 * 紙船（帆船）：
 * 1. 下緣往前摺起成船身  2. 左上角往前摺成白色前帆、右上角往後摺，摺出三角帆
 * 3. 船身兩端往後摺斜  4. 船底往後摺成底座，讓船站起來
 */
const boat: FoldModel = {
  sheet: square,
  steps: [
    [{ a: V(-1, -0.4), b: V(1, -0.4), side: V(0, -1), valley: true }],
    [
      { a: V(0, 1), b: V(-1, 0.2), side: V(-1, 1), valley: true },
      { a: V(0, 1), b: V(1, 0.2), side: V(1, 1) },
    ],
    [
      { a: V(-1, 0), b: V(-0.62, -0.4), side: V(-1, -0.4) },
      { a: V(1, 0), b: V(0.62, -0.4), side: V(1, -0.4) },
    ],
    [{ a: V(-1, -0.26), b: V(1, -0.26), side: V(0, -0.4), angle: deg(90) }],
  ],
  size: 3,
};

export const FOLD_MODELS: Record<OrigamiKey, FoldModel> = { logo, crane, boat, plane };
