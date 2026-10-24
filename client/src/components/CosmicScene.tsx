import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import gsap from "gsap";
import config from "@/content/scene.config.json";

type Props = { route: string; dir?: "ltr" | "rtl"; opacity?: number };
type Pose = { x: number; y: number; scale: number; rotY: number };
const poseFor = (route: string): Pose => {
  const r = config.routes as Record<string, Pose>;
  const key = route === "/" ? "/" : "/" + route.split("/")[1];
  return r[key] ?? r.default;
};

const tube = (a: THREE.Vector3, b: THREE.Vector3, r: number, mat: THREE.Material) => {
  const len = a.distanceTo(b);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 6), mat);
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  return m;
};

export default function CosmicScene({ route, dir = "ltr", opacity = 0.95 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const routeRef = useRef(route);
  const flipRef = useRef(dir === "rtl" ? -1 : 1);
  useEffect(() => { flipRef.current = dir === "rtl" ? -1 : 1; }, [dir]);
  const apiRef = useRef<{ goTo: (p: Pose) => void } | null>(null);

  useEffect(() => { routeRef.current = route; apiRef.current?.goTo(poseFor(route)); }, [route]);

  useEffect(() => {
    const canvas = canvasRef.current; const host = canvas?.parentElement;
    if (!canvas || !host) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" }); }
    catch { host.classList.add("webgl-fallback"); return; }

    const P = config.palette;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;

    const camera = new THREE.PerspectiveCamera(config.camera.fov, 1, 0.1, 100);
    const camBase = new THREE.Vector3(...(config.camera.position as [number, number, number]));
    const look = new THREE.Vector3(...(config.camera.look as [number, number, number]));

    const gold = new THREE.MeshStandardMaterial({ color: P.gold, metalness: 1, roughness: 0.22 });
    const goldLight = new THREE.MeshStandardMaterial({ color: P.goldLight, metalness: 1, roughness: 0.14 });
    const goldDeep = new THREE.MeshStandardMaterial({ color: P.goldDeep, metalness: 1, roughness: 0.3 });
    const ivory = new THREE.MeshStandardMaterial({ color: P.ivory, metalness: 0.1, roughness: 0.28 });
    const marble = new THREE.MeshStandardMaterial({ color: P.marble, metalness: 0.5, roughness: 0.18 });

    scene.add(new THREE.AmbientLight(0xffffff, 0.25));
    const key = new THREE.PointLight(0xf4d487, 40, 30); key.position.set(4, 6, 6); scene.add(key);
    const rim = new THREE.PointLight(0x4a78b8, 18, 24); rim.position.set(-6, 2, -3); scene.add(rim);

    // ---- the scales ----
    const rig = new THREE.Group(); scene.add(rig);
    const scale = new THREE.Group(); rig.add(scale);

    // podium (marble steps with gold edges)
    [[2.6, 0.28, -2.6], [2.05, 0.26, -2.34], [1.5, 0.22, -2.1]].forEach(([r, h, y]) => {
      const step = new THREE.Mesh(new THREE.CylinderGeometry(r, r + 0.08, h, 64), marble); step.position.y = y; scale.add(step);
      const edge = new THREE.Mesh(new THREE.TorusGeometry(r + 0.04, 0.025, 8, 80), goldLight); edge.rotation.x = Math.PI / 2; edge.position.y = y + h / 2; scale.add(edge);
    });
    // baluster column (lathe profile, ivory marble with gold collars)
    const prof = [[0.55, 0], [0.5, 0.12], [0.3, 0.3], [0.2, 0.9], [0.17, 1.6], [0.2, 2.3], [0.3, 3.0], [0.34, 3.4], [0.22, 3.6], [0.0, 3.62]].map(([x, y]) => new THREE.Vector2(x, y));
    const column = new THREE.Mesh(new THREE.LatheGeometry(prof, 48), ivory); column.position.y = -2.0; scale.add(column);
    [[-1.98, 0.5], [1.38, 0.3], [1.15, 0.34]].forEach(([y, r]) => { const c = new THREE.Mesh(new THREE.TorusGeometry(r, 0.05, 10, 48), gold); c.rotation.x = Math.PI / 2; c.position.y = y; scale.add(c); });
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 24), gold); knob.position.y = 1.78; scale.add(knob);
    const finialBase = new THREE.Mesh(new THREE.SphereGeometry(0.15, 24, 16), goldLight); finialBase.position.y = 2.12; scale.add(finialBase);
    const finial = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.65, 24), goldLight); finial.position.y = 2.55; scale.add(finial);

    // beam assembly (tilts)
    const beam = new THREE.Group(); beam.position.y = 1.5; scale.add(beam);
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(-2.7, 0.22, 0), new THREE.Vector3(-1.3, -0.05, 0), new THREE.Vector3(0, 0.12, 0), new THREE.Vector3(1.3, -0.05, 0), new THREE.Vector3(2.7, 0.22, 0)]);
    beam.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 64, 0.07, 12, false), goldLight));
    const pans: THREE.Group[] = [];
    [-2.7, 2.7].forEach(x => {
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), gold); ball.position.set(x, 0.22, 0); beam.add(ball);
      const pan = new THREE.Group(); pan.position.set(x, -2.0, 0);
      const bowlProf = [[0, -0.02], [0.35, -0.05], [0.7, 0.0], [0.95, 0.12], [1.0, 0.16], [0.97, 0.18]].map(([a, b]) => new THREE.Vector2(a, b));
      const bowl = new THREE.Mesh(new THREE.LatheGeometry(bowlProf, 48), gold); pan.add(bowl);
      const lip = new THREE.Mesh(new THREE.TorusGeometry(0.98, 0.03, 8, 64), goldLight); lip.rotation.x = Math.PI / 2; lip.position.y = 0.17; pan.add(lip);
      [0, 120, 240].forEach(deg => { const rad = (deg * Math.PI) / 180; const rimPt = new THREE.Vector3(Math.cos(rad) * 0.95, 0.17, Math.sin(rad) * 0.95); pan.add(tube(rimPt, new THREE.Vector3(0, 1.95, 0), 0.012, goldDeep)); });
      beam.add(pan); pans.push(pan);
    });

    // gold rings + glass panels behind
    const rings: THREE.Mesh[] = [];
    [4.0, 5.0, 6.1].forEach((r, i) => { const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.012, 8, 160), new THREE.MeshBasicMaterial({ color: P.gold, transparent: true, opacity: 0.55 - i * 0.12 })); ring.position.set(0, 0.6, -1.5 - i * 0.6); rig.add(ring); rings.push(ring); });
    const panels: THREE.Group[] = [];
    [-1, 1].forEach(side => {
      const g = new THREE.Group();
      const w = 1.6, h = 6.4;
      g.add(new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.05), new THREE.MeshPhysicalMaterial({ color: P.glass, transparent: true, opacity: 0.09, roughness: 0.05, metalness: 0.2 })));
      g.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, 0.05)), new THREE.LineBasicMaterial({ color: P.gold, transparent: true, opacity: 0.7 })));
      g.position.set(side * 5.6, 0.4, -2.8); g.rotation.y = -side * 0.35; rig.add(g); panels.push(g);
    });

    // dust
    const n = config.particles.count; const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { pos[i * 3] = (Math.random() - 0.5) * 26; pos[i * 3 + 1] = (Math.random() - 0.5) * 14; pos[i * 3 + 2] = (Math.random() - 0.5) * 16 - 2; }
    const dust = new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(pos, 3)), new THREE.PointsMaterial({ color: P.goldLight, size: config.particles.size, transparent: true, opacity: config.particles.opacity, sizeAttenuation: true, depthWrite: false }));
    scene.add(dust);

    // ---- motion state ----
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    let scroll = 0, scrollT = 0;
    const pose = { ...poseFor(routeRef.current) };
    rig.position.set(pose.x * flipRef.current, pose.y, 0); rig.scale.setScalar(pose.scale); rig.rotation.y = pose.rotY * flipRef.current;
    apiRef.current = { goTo: p => gsap.to(pose, { ...p, duration: 1.6, ease: "power3.inOut" }) };

    const onMove = (e: PointerEvent) => { mouse.tx = (e.clientX / window.innerWidth) * 2 - 1; mouse.ty = (e.clientY / window.innerHeight) * 2 - 1; };
    const onScroll = () => { const max = document.documentElement.scrollHeight - window.innerHeight; scrollT = max > 0 ? window.scrollY / max : 0; };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    const resize = () => {
      const w = host.clientWidth || window.innerWidth, h = host.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
      const narrow = w < 760; rig.userData.narrow = narrow;
    };
    resize(); window.addEventListener("resize", resize);

    const clock = new THREE.Clock(); let frame = 0, disposed = false;
    const tick = () => {
      if (disposed) return; frame = requestAnimationFrame(tick);
      if (document.hidden) return;
      const t = clock.getElapsedTime();
      mouse.x += (mouse.tx - mouse.x) * 0.06; mouse.y += (mouse.ty - mouse.y) * 0.06; scroll += (scrollT - scroll) * 0.05;
      const narrow = rig.userData.narrow as boolean;

      const fl = flipRef.current;
      rig.position.set(narrow ? 0 : pose.x * fl, narrow ? pose.y + 0.4 : pose.y, 0);
      rig.scale.setScalar(narrow ? pose.scale * 0.8 : pose.scale);
      rig.rotation.y = pose.rotY * fl + mouse.x * config.mouse.tilt + scroll * 1.6 + Math.sin(t * 0.25) * 0.08;
      rig.rotation.x = mouse.y * config.mouse.tilt * 0.5;
      // beam leans with the mouse; pans stay level like a real balance
      const lean = THREE.MathUtils.clamp(mouse.x * config.mouse.beam + Math.sin(t * 0.8) * 0.035, -0.22, 0.22);
      beam.rotation.z = lean; pans.forEach((p, i) => { p.rotation.z = -lean; p.position.y = -2.0 + (i === 0 ? 1 : -1) * Math.sin(lean) * 0.0; p.rotation.x = Math.sin(t * 1.1 + i) * 0.02; });
      rings.forEach((r, i) => { r.rotation.z = t * (0.04 + i * 0.02) * (i % 2 ? -1 : 1); });
      panels.forEach((p, i) => { p.position.y = 0.4 + Math.sin(t * 0.5 + i * 2) * 0.12; });
      dust.rotation.y = t * 0.012 + mouse.x * 0.08; dust.position.y = scroll * 1.5;

      camera.position.set(camBase.x + mouse.x * config.mouse.parallax, camBase.y - mouse.y * 0.6 - scroll * 1.2, camBase.z - scroll * 1.5);
      camera.lookAt(look.x, look.y - scroll * 0.8, look.z);
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      disposed = true; cancelAnimationFrame(frame); apiRef.current = null;
      window.removeEventListener("pointermove", onMove); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", resize);
      gsap.killTweensOf(pose);
      scene.traverse(o => { const m = o as THREE.Mesh; if (m.geometry) m.geometry.dispose(); const mat = m.material as THREE.Material | THREE.Material[] | undefined; if (Array.isArray(mat)) mat.forEach(x => x.dispose()); else mat?.dispose(); });
      envTex.dispose(); pmrem.dispose(); renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="cosmic-canvas" style={{ opacity }} aria-hidden="true" />;
}
