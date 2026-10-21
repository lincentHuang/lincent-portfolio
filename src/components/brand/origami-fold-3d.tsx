'use client';

import React from 'react';
import * as THREE from 'three';
import { ORIGAMI_MODELS, type OrigamiKey } from './origami-models';
import { buildFold } from './origami-fold-sim';
import { FOLD_MODELS } from './origami-fold-models';

/**
 * 首頁 hero 的 Three.js 摺紙：logo、紙鶴、紙船、紙飛機都從同一張正黑背白的方紙，
 * 照真實步驟一摺一摺完成（摺法見 origami-fold-models.ts）。
 * 切換時先把目前的造型攤回方紙，再摺成下一個；開場也會從方紙摺一次。
 * 偏好減少動態時直接切換、不播摺紙過程。
 */

/** 每一摺的秒數（摺）與攤開時每一摺的秒數 */
const STEP_S = 0.62;
const UNSTEP_S = 0.16;
/** 攤成方紙後、開始摺下一個之前的停頓 */
const FLAT_HOLD_S = 0.25;
/** 攤平時紙的邊長（場景單位），所有造型共用 */
const SHEET_SIZE = 3;

/** 每個模型最好看的展示角度 [y 旋轉, x 傾斜]；摺的過程用 FOLDING 讓紙面朝向鏡頭 */
const POSES: Record<OrigamiKey, [number, number]> = {
  logo: [-0.5, 0.08],
  crane: [-0.55, 0.42],
  boat: [-0.5, 0.12],
  plane: [-0.7, 0.45],
};
const FOLDING: [number, number] = [-0.3, 0.1];

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
    const mat = new THREE.MeshStandardMaterial({ color: front, roughness: 0.85, metalness: 0, side: THREE.DoubleSide, flatShading: true });
    const backColor = new THREE.Color(back);
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uBack = { value: backColor };
      shader.fragmentShader = shader.fragmentShader
        .replace('uniform vec3 diffuse;', 'uniform vec3 diffuse;\nuniform vec3 uBack;')
        .replace('vec4 diffuseColor = vec4( diffuse, opacity );', 'vec4 diffuseColor = vec4( gl_FrontFacing ? diffuse : uBack, opacity );');
    };

    const group = new THREE.Group();
    scene.add(group);
    const papers = ORIGAMI_MODELS.map((m) => {
      const sim = buildFold(FOLD_MODELS[m.key], SHEET_SIZE);
      const positions = new Float32Array(sim.triangles * 9);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      mesh.visible = false;
      group.add(mesh);
      return { sim, positions, geo, mesh };
    });

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

    // 目前顯示的造型與摺紙進度 F（0 = 方紙，steps = 完成）
    let cur = targetRef.current;
    let F = reduced ? papers[cur].sim.steps : 0;
    let written = -1;
    let hold = reduced ? 0 : 0.5;
    papers[cur].mesh.visible = true;

    const clock = new THREE.Clock();
    let raf = 0;
    let t = 0;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(clock.getDelta(), 0.1);
      if (!visible) return;
      t += dt;
      const target = targetRef.current;

      if (reduced && target !== cur) {
        papers[cur].mesh.visible = false;
        cur = target;
        F = papers[cur].sim.steps;
        papers[cur].mesh.visible = true;
      } else if (target !== cur) {
        // 先攤回方紙，攤平後換成下一個造型
        F = Math.max(0, F - dt / UNSTEP_S);
        if (F === 0) {
          papers[cur].mesh.visible = false;
          cur = target;
          papers[cur].mesh.visible = true;
          written = -1;
          hold = FLAT_HOLD_S;
        }
      } else if (hold > 0) {
        hold -= dt;
      } else {
        F = Math.min(papers[cur].sim.steps, F + dt / STEP_S);
      }

      const p = papers[cur];
      if (F !== written) {
        p.sim.write(F, p.positions);
        p.geo.attributes.position.needsUpdate = true;
        p.geo.computeVertexNormals();
        written = F;
      }

      const done = F > p.sim.steps - 1 && target === cur;
      const [poseY, poseX] = done ? POSES[ORIGAMI_MODELS[cur].key] : FOLDING;
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
      papers.forEach((p) => p.geo.dispose());
      mat.dispose();
      ground.geometry.dispose();
      (ground.material as THREE.Material).dispose();
      renderer.dispose();
      host.removeChild(renderer.domElement);
    };
  }, [front, back]);

  return <div ref={hostRef} className={className} onClick={onClick} aria-hidden="true" />;
}
