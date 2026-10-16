'use client';

import React from 'react';
import * as THREE from 'three';
import { ORIGAMI_MODELS, type OrigamiKey } from './origami-models';

/**
 * 首頁 hero 的 Three.js 摺紙：同一張紙在 logo、紙鶴、紙船、紙飛機之間變形。
 * 每個模型都切成相同數量的三角面；切換時先攤回一張方紙，再一面一面摺成下一個模型。
 * 點一下就摺成下一個，偏好減少動態時直接切換、不播摺紙過程。
 */

type V = [number, number, number];
type Tri = [V, V, V];

/** 每個模型統一切成的三角面數 */
const FACES = 96;
const UNFOLD_S = 0.9;
const FOLD_S = 1.35;
/** 每片紙開始摺的時間錯開比例，讓摺紙一片接一片發生 */
const STAGGER = 0.45;

/** 把每個三角面的繞向調成朝 +z，讓正面（深色）對著鏡頭 */
function faceCamera(tris: Tri[]): Tri[] {
  return tris.map(([a, b, c]) => {
    const nz = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
    return nz >= 0 ? [a, b, c] : [a, c, b];
  });
}

// ---------- 模型（單位約 3，y 向上、+z 朝鏡頭） ----------

/** logo：與 lincent-logo.svg 相同比例，右側三角翻摺出來 */
function logoModel(): Tri[] {
  const s = 3.1 / 248;
  const p = (x: number, y: number, z = 0): V => [(x - 111) * s, -(y - 124) * s, z];
  const tris: Tri[] = [
    [p(0, 8), p(100, 44), p(100, 240)],
    [p(0, 8), p(100, 240), p(0, 204)],
  ];
  // 翻摺的三角：以 x=104 為摺線，往鏡頭方向掀起約 35°
  const hinge = 104;
  const lift = (x: number, y: number): V => {
    const d = (x - hinge) * s;
    const a = (35 * Math.PI) / 180;
    return [(hinge - 111) * s + d * Math.cos(a), -(y - 124) * s, d * Math.sin(a)];
  };
  tris.push([lift(108, 134), lift(218, 160), lift(108, 240)]);
  return faceCamera(tris);
}

function planeModel(): Tri[] {
  const N: V = [1.75, 0.05, 0];
  const C: V = [-1.35, 0.1, 0];
  const L: V = [-1.45, 0.32, 1.15];
  const R: V = [-1.45, 0.32, -1.15];
  const K: V = [-1.3, -0.5, 0];
  const WL: V = [-1.35, 0.55, 1.18];
  const WR: V = [-1.35, 0.55, -1.18];
  return [
    [N, C, L],
    [N, R, C],
    [N, K, C],
    [N, C, K],
    // 翼尖小折邊
    [L, WL, [0.2, 0.3, 0.42]],
    [R, [0.2, 0.3, -0.42], WR],
  ];
}

function boatModel(): Tri[] {
  const A: V = [-1.7, 0, 0.42];
  const B: V = [1.7, 0, 0.42];
  const A2: V = [-1.7, 0, -0.42];
  const B2: V = [1.7, 0, -0.42];
  const C: V = [0.85, -0.75, 0];
  const D: V = [-0.85, -0.75, 0];
  const S: V = [0, 1.35, 0];
  return [
    [A, D, C],
    [A, C, B],
    [A2, B2, C],
    [A2, C, D],
    [A, A2, D],
    [B, C, B2],
    [[-0.95, 0, 0.14], [0.95, 0, 0.14], S],
    [[0.95, 0, -0.14], [-0.95, 0, -0.14], S],
    [[-0.95, 0, 0.14], S, [-0.95, 0, -0.14]],
    [[0.95, 0, 0.14], [0.95, 0, -0.14], S],
  ];
}

function craneModel(): Tri[] {
  const P1: V = [-0.62, -0.1, 0];
  const P2: V = [0.62, -0.1, 0];
  const T: V = [0, 0.28, 0];
  const Bm: V = [0, -0.62, 0];
  const Zp: V = [0, -0.18, 0.28];
  const Zm: V = [0, -0.18, -0.28];
  const wing = (side: 1 | -1): Tri[] => {
    const b1: V = [-0.4, 0.08, 0.04 * side];
    const b2: V = [0.38, 0.08, 0.04 * side];
    const m: V = [0.0, 0.55, 0.78 * side];
    const tip: V = [-0.35, 0.95, 1.65 * side];
    return [
      [b1, b2, m],
      [b1, m, tip],
      [m, b2, [0.15, 0.7, 1.2 * side]],
      [m, [0.15, 0.7, 1.2 * side], tip],
    ];
  };
  return [
    // 身體：上下兩個菱錐
    [P1, Bm, Zp],
    [Bm, P2, Zp],
    [P1, Zm, Bm],
    [Bm, Zm, P2],
    [P1, Zp, T],
    [T, Zp, P2],
    [P1, T, Zm],
    [T, P2, Zm],
    // 脖子＋頭
    [[0.32, -0.08, 0.05], P2, [1.3, 0.95, 0]],
    [P2, [0.32, -0.08, -0.05], [1.3, 0.95, 0]],
    [[1.3, 0.95, 0], [1.22, 1.02, 0.04], [1.62, 0.78, 0]],
    [[1.3, 0.95, 0], [1.62, 0.78, 0], [1.22, 1.02, -0.04]],
    // 尾巴
    [[-0.32, -0.08, 0.05], [-1.38, 0.92, 0], P1],
    [P1, [-1.38, 0.92, 0], [-0.32, -0.08, -0.05]],
    ...wing(1),
    ...wing(-1),
  ];
}

/** 攤平的方紙，用來當兩個模型之間的過渡 */
function sheetModel(): Tri[] {
  const h = 1.35;
  return [
    [[-h, -h, 0], [h, -h, 0], [h, h, 0]],
    [[-h, -h, 0], [h, h, 0], [-h, h, 0]],
  ];
}

// ---------- 幾何工具 ----------

const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const len = (a: V) => Math.hypot(a[0], a[1], a[2]);
const mid = (a: V, b: V): V => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
const area = ([a, b, c]: Tri) => {
  const u = sub(b, a);
  const v = sub(c, a);
  return len([u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]) / 2;
};

/** 反覆把最大的三角面沿最長邊對半切，直到面數剛好等於 count */
function subdivide(tris: Tri[], count: number): Tri[] {
  const out = tris.map((t) => t.map((v) => [...v]) as Tri);
  while (out.length < count) {
    let k = 0;
    for (let i = 1; i < out.length; i++) if (area(out[i]) > area(out[k])) k = i;
    const [a, b, c] = out[k];
    const edges: [V, V, V][] = [
      [a, b, c],
      [b, c, a],
      [c, a, b],
    ];
    edges.sort((e1, e2) => len(sub(e2[0], e2[1])) - len(sub(e1[0], e1[1])));
    const [p, q, r] = edges[0];
    const m = mid(p, q);
    out.splice(k, 1, [p, m, r], [m, q, r]);
  }
  return out;
}

/** 依重心由上到下、由左到右排序，讓不同模型之間對應的面位置相近 */
function order(tris: Tri[]): Tri[] {
  const c = (t: Tri) => [(t[0][0] + t[1][0] + t[2][0]) / 3, (t[0][1] + t[1][1] + t[2][1]) / 3] as const;
  return [...tris].sort((t1, t2) => {
    const a = c(t1);
    const b = c(t2);
    const rowA = Math.round(a[1] * 3);
    const rowB = Math.round(b[1] * 3);
    return rowB - rowA || a[0] - b[0];
  });
}

function flatten(tris: Tri[]) {
  const arr = new Float32Array(FACES * 9);
  tris.forEach((t, i) => t.forEach((v, j) => arr.set(v, i * 9 + j * 3)));
  return arr;
}

/** 每個模型最好看的展示角度 [y 旋轉, x 傾斜] */
const POSES: Record<OrigamiKey, [number, number]> = {
  logo: [-0.5, 0.08],
  crane: [-0.4, 0.38],
  boat: [-0.45, 0.18],
  plane: [-0.65, 0.5],
};

const BUILDERS: Record<OrigamiKey, () => Tri[]> = {
  logo: logoModel,
  crane: craneModel,
  boat: boatModel,
  plane: planeModel,
};

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

type Props = {
  className?: string;
  /** 目前要顯示的模型索引（由外部控制） */
  index: number;
  onClick?: () => void;
  front?: string;
  back?: string;
};

export function OrigamiFold3D({ className, index, onClick, front = '#2a2a33', back = '#f4f4f1' }: Props) {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const targetRef = React.useRef(index);
  targetRef.current = index;

  React.useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const models = ORIGAMI_MODELS.map((m) => flatten(order(subdivide(BUILDERS[m.key](), FACES))));
    const sheet = flatten(order(subdivide(sheetModel(), FACES)));

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.display = 'block';
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
    camera.position.set(0, 0.35, 8.4);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x9aa0aa, 1.1));
    const key = new THREE.DirectionalLight(0xffffff, 3.2);
    key.position.set(-1.5, 7, 3);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.radius = 6;
    Object.assign(key.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 0.5, far: 20 });
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xdfe6ff, 0.8);
    rim.position.set(4, 1, -3);
    scene.add(rim);

    // 一張雙面紙：正面深色、背面米白
    const positions = new Float32Array(models[targetRef.current]);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.computeVertexNormals();
    const mat = new THREE.MeshStandardMaterial({ color: front, roughness: 0.85, metalness: 0, side: THREE.DoubleSide, flatShading: true });
    const backColor = new THREE.Color(back);
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uBack = { value: backColor };
      shader.fragmentShader = shader.fragmentShader
        .replace('uniform vec3 diffuse;', 'uniform vec3 diffuse;\nuniform vec3 uBack;')
        .replace('vec4 diffuseColor = vec4( diffuse, opacity );', 'vec4 diffuseColor = vec4( gl_FrontFacing ? diffuse : uBack, opacity );');
    };
    const paper = new THREE.Mesh(geo, mat);
    paper.castShadow = true;
    const group = new THREE.Group();
    group.add(paper);
    scene.add(group);

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.ShadowMaterial({ opacity: 0.12 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.95;
    ground.receiveShadow = true;
    scene.add(ground);

    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      camera.aspect = width / height;
      // 窄容器拉遠，避免紙鶴翅膀被切
      camera.position.z = 8.4 / Math.min(1, Math.max(camera.aspect, 0.55));
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const pointer = { x: 0, y: 0 };
    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      pointer.x = THREE.MathUtils.clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1.5, 1.5);
      pointer.y = THREE.MathUtils.clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1.5, 1.5);
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(host);

    // 摺紙狀態：from（起點快照）→ sheet → to
    let shown = targetRef.current;
    let from = new Float32Array(positions);
    let to = models[shown];
    let start = -1;
    const clock = new THREE.Clock();
    let raf = 0;

    const writeBlend = (a: Float32Array, b: Float32Array, k: number, liftDir: number) => {
      for (let f = 0; f < FACES; f++) {
        const delay = (f / FACES) * STAGGER;
        const e = easeInOut(THREE.MathUtils.clamp((k - delay) / (1 - STAGGER), 0, 1));
        // 摺的途中往鏡頭方向掀起，像紙片被翻過去
        const arc = Math.sin(e * Math.PI) * 0.35 * liftDir;
        for (let j = 0; j < 9; j++) {
          const i = f * 9 + j;
          positions[i] = a[i] + (b[i] - a[i]) * e + (j % 3 === 2 ? arc : 0);
        }
      }
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) {
        clock.getDelta();
        return;
      }
      const t = clock.getElapsedTime();

      if (targetRef.current !== shown) {
        shown = targetRef.current;
        from = new Float32Array(positions);
        to = models[shown];
        start = t;
      }

      if (start >= 0) {
        const local = t - start;
        if (reduced) {
          positions.set(to);
          start = -1;
        } else if (local < UNFOLD_S) {
          writeBlend(from, sheet, local / UNFOLD_S, 1);
        } else if (local < UNFOLD_S + FOLD_S) {
          writeBlend(sheet, to, (local - UNFOLD_S) / FOLD_S, -1);
        } else {
          positions.set(to);
          start = -1;
        }
        geo.attributes.position.needsUpdate = true;
        geo.computeVertexNormals();
      }

      const [poseY, poseX] = POSES[ORIGAMI_MODELS[shown].key];
      const sway = reduced ? 0 : Math.sin(t * 0.5) * 0.3;
      group.rotation.y += (poseY + sway + pointer.x * 0.45 - group.rotation.y) * 0.05;
      group.rotation.x += (poseX + pointer.y * 0.18 - group.rotation.x) * 0.05;
      group.position.y = reduced ? 0 : Math.sin(t * 1.1) * 0.06;
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      geo.dispose();
      mat.dispose();
      ground.geometry.dispose();
      (ground.material as THREE.Material).dispose();
      renderer.dispose();
      host.removeChild(renderer.domElement);
    };
  }, [front, back]);

  return <div ref={hostRef} className={className} onClick={onClick} aria-hidden="true" />;
}
