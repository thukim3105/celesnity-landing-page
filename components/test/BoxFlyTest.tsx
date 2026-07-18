"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * Real-time weight test, scroll-driven. Loads /models/test.glb into a live
 * Three.js scene; scrolling the page flies the camera around the model (orbit +
 * push-in), no auto-rotate, no drag. An on-screen HUD prints the numbers that
 * decide whether a 3D page is "heavy": FPS, draw calls, triangles, counts, GLB
 * bytes, JS heap.
 */

const MODEL_URL = "/models/test.glb";
const SCROLL_VH = 400; // page height in svh — the scroll track length

export function BoxFlyTest() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const hud = {
    fps: useRef<HTMLSpanElement | null>(null),
    fpsBig: useRef<HTMLDivElement | null>(null),
    gpu: useRef<HTMLSpanElement | null>(null),
    calls: useRef<HTMLSpanElement | null>(null),
    tris: useRef<HTMLSpanElement | null>(null),
    objs: useRef<HTMLSpanElement | null>(null),
    geos: useRef<HTMLSpanElement | null>(null),
    texs: useRef<HTMLSpanElement | null>(null),
    size: useRef<HTMLSpanElement | null>(null),
    heap: useRef<HTMLSpanElement | null>(null),
    verdict: useRef<HTMLSpanElement | null>(null),
  };

  useEffect(() => {
    const mount = mountRef.current;
    const track = trackRef.current;
    if (!mount || !track) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05060f);

    const camera = new THREE.PerspectiveCamera(
      45,
      mount.clientWidth / mount.clientHeight,
      0.01,
      1000,
    );

    const renderer = new THREE.WebGLRenderer({
      antialias: false, // cheapest path — helps weak / software-rendered GPUs
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(1); // no DPR multiplier — fewest pixels to shade

    // Detect software rendering (no GPU accel) — the usual cause of 5fps freezes.
    let gpuInfo = "unknown";
    try {
      const gl = renderer.getContext();
      const dbg = gl.getExtension("WEBGL_debug_renderer_info");
      if (dbg)
        gpuInfo = String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || "");
    } catch {
      /* ignore */
    }
    const software = /swiftshader|software|llvmpipe|basic render/i.test(gpuInfo);
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x223044, 1.1));
    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(4, 6, 3);
    scene.add(key);

    // Orbit target + radius, filled in once the model is framed.
    const target = new THREE.Vector3();
    let R = 1;
    let framed = false;

    let objCount = 0;
    let geoCount = 0;
    let texCount = 0;
    let glbBytes = 0;
    let disposed = false;
    let raf = 0;

    const loader = new GLTFLoader();
    loader.load(
      MODEL_URL,
      (gltf) => {
        if (disposed) return;
        const root = gltf.scene;
        scene.add(root);

        const box = new THREE.Box3().setFromObject(root);
        box.getCenter(target);
        const size = box.getSize(new THREE.Vector3());
        R = Math.max(size.x, size.y, size.z) * 0.5 || 1;
        camera.near = R / 100;
        camera.far = R * 100;
        camera.updateProjectionMatrix();
        framed = true;

        const geos = new Set<THREE.BufferGeometry>();
        const texs = new Set<THREE.Texture>();
        root.traverse((o) => {
          const m = o as THREE.Mesh;
          if (m.isMesh) {
            objCount++;
            geos.add(m.geometry);
            const mats = Array.isArray(m.material) ? m.material : [m.material];
            for (const mat of mats)
              for (const v of Object.values(mat as object))
                if (v && (v as THREE.Texture).isTexture)
                  texs.add(v as THREE.Texture);
          }
        });
        geoCount = geos.size;
        texCount = texs.size;
      },
      (ev) => {
        if (ev.total) glbBytes = ev.total;
      },
      (err) => console.error("GLB load error", err),
    );

    // Scroll → progress [0..1] over the tall track.
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const scrollProgress = () => {
      const rect = track.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      if (travel <= 0) return 0;
      return Math.max(0, Math.min(1, -rect.top / travel));
    };

    const easeInOut = (t: number) => t * t * (3 - 2 * t);
    let shown = reduced ? 0.35 : 0; // smoothed progress actually rendered

    // Map progress → camera position on a sphere around the target.
    const placeCamera = (p: number) => {
      const e = easeInOut(p);
      const az = -Math.PI * 0.35 + e * Math.PI * 3.0; // ~1.5 turns
      const el = THREE.MathUtils.lerp(0.85, 0.28, e); // high → lower arc
      const dist = THREE.MathUtils.lerp(3.1, 1.5, e) * R; // far → push in
      const y = target.y + Math.sin(el) * dist;
      const horiz = Math.cos(el) * dist;
      camera.position.set(
        target.x + Math.cos(az) * horiz,
        y,
        target.z + Math.sin(az) * horiz,
      );
      camera.lookAt(target);
    };

    let frames = 0;
    let last = performance.now();
    let fps = 0;
    let lastRendered = -1;
    let everRendered = false;
    const fmt = (n: number) => n.toLocaleString("en-US");
    const setText = (
      ref: React.RefObject<HTMLSpanElement | null>,
      v: string,
    ) => {
      if (ref.current) ref.current.textContent = v;
    };

    let hudLast = 0;
    const updateHud = (now: number) => {
      if (now - hudLast < 250) return;
      hudLast = now;
      const info = renderer.info;
      const fpsR = Math.round(fps);
      setText(hud.fps, String(fpsR));
      if (hud.fpsBig.current) {
        hud.fpsBig.current.textContent = fps > 0 ? String(fpsR) : "…";
        const col =
          fpsR >= 55 ? "#4ade80" : fpsR >= 40 ? "#fbbf24" : "#f87171";
        hud.fpsBig.current.style.color = col;
      }
      setText(
        hud.gpu,
        software ? "❌ Phần mềm (CPU!)" : "✅ GPU " + (gpuInfo.slice(0, 22) || ""),
      );
      setText(hud.calls, fmt(info.render.calls));
      setText(hud.tris, fmt(info.render.triangles));
      setText(hud.objs, fmt(objCount));
      setText(hud.geos, fmt(geoCount));
      setText(hud.texs, fmt(texCount));
      setText(
        hud.size,
        glbBytes ? (glbBytes / 1024 / 1024).toFixed(2) + " MB" : "…",
      );
      const mem = (
        performance as unknown as { memory?: { usedJSHeapSize: number } }
      ).memory;
      setText(
        hud.heap,
        mem ? (mem.usedJSHeapSize / 1024 / 1024).toFixed(0) + " MB" : "n/a",
      );
      let verdict = "…";
      if (fps >= 55) verdict = "NHẸ ✅ (mượt 60fps)";
      else if (fps >= 40) verdict = "OK 🟡 (chấp nhận được)";
      else if (fps >= 25) verdict = "NẶNG 🟠 (bắt đầu giật)";
      else if (fps > 0) verdict = "RẤT NẶNG 🔴 (giật rõ)";
      setText(hud.verdict, verdict);
    };

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const now = performance.now();
      frames++;
      if (now - last >= 500) {
        fps = (frames * 1000) / (now - last);
        frames = 0;
        last = now;
      }
      // Only render when the view actually changed (scrolling) — an idle static
      // frame shouldn't keep hammering a weak GPU and freezing the machine.
      let moved = false;
      if (framed) {
        shown = reduced ? 0.35 : scrollProgress();
        if (Math.abs(shown - lastRendered) > 0.0005 || lastRendered < 0) {
          placeCamera(shown);
          lastRendered = shown;
          moved = true;
        }
      }
      if (moved || !everRendered) {
        renderer.render(scene, camera);
        everRendered = true;
      }
      updateHud(now);
    };
    animate();

    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) {
          m.geometry?.dispose();
          const mats = Array.isArray(m.material) ? m.material : [m.material];
          mats.forEach((mat) => mat?.dispose());
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === mount)
        mount.removeChild(renderer.domElement);
    };
  }, []);

  const row = (label: string, ref: React.RefObject<HTMLSpanElement | null>) => (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
      <span style={{ opacity: 0.65 }}>{label}</span>
      <span
        ref={ref}
        style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}
      >
        …
      </span>
    </div>
  );

  return (
    // Tall scroll track — scrolling it drives the camera.
    <div ref={trackRef} style={{ position: "relative", height: `${SCROLL_VH}svh` }}>
      {/* Sticky viewport-filling stage: the canvas stays put while you scroll. */}
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100svh",
          overflow: "hidden",
        }}
      >
        <div ref={mountRef} style={{ position: "absolute", inset: 0 }} />
        <div
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            padding: "14px 16px",
            minWidth: 240,
            borderRadius: 16,
            background: "rgba(10,12,24,0.72)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#e7ebff",
            font: "13px/1.6 ui-monospace, SFMono-Regular, Menlo, monospace",
            pointerEvents: "none",
          }}
        >
          <div
            style={{ fontWeight: 700, marginBottom: 8, letterSpacing: "0.02em" }}
          >
            Đo hiệu năng real-time
          </div>
          {/* Giant, colour-coded FPS — impossible to miss. */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 10,
              margin: "4px 0 12px",
            }}
          >
            <div
              ref={hud.fpsBig}
              style={{
                fontSize: 56,
                fontWeight: 800,
                lineHeight: 1,
                letterSpacing: "-0.03em",
                color: "#9aa3c0",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              …
            </div>
            <div style={{ fontSize: 15, opacity: 0.7, fontWeight: 600 }}>FPS</div>
          </div>
          {row("GPU", hud.gpu)}
          {row("Draw calls", hud.calls)}
          {row("Triangles", hud.tris)}
          {row("Objects", hud.objs)}
          {row("Geometries", hud.geos)}
          {row("Textures", hud.texs)}
          {row("GLB size", hud.size)}
          {row("JS heap", hud.heap)}
          <div
            style={{
              marginTop: 10,
              paddingTop: 10,
              borderTop: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <span style={{ opacity: 0.65 }}>Kết luận</span>
            <span ref={hud.verdict} style={{ fontWeight: 700 }}>
              …
            </span>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: 16,
            color: "rgba(231,235,255,0.5)",
            font: "12px/1.5 ui-monospace, monospace",
          }}
        >
          Cuộn chuột để camera bay quanh khối
        </div>
      </div>
    </div>
  );
}
