import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";

type CosmicSceneProps = { opacity?: number; className?: string };

function createChain(points: THREE.Vector3[], color: number) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  return new THREE.Line(geometry, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.72 }));
}

function createPan(material: THREE.Material) {
  const group = new THREE.Group();
  const pan = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.92, 0.12, 32), material);
  pan.position.y = -0.03;
  group.add(pan);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.83, 0.035, 8, 32), material);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.035;
  group.add(rim);
  return group;
}

export default function CosmicScene({ opacity = 0.88, className = "" }: CosmicSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const host = canvas.parentElement;
    if (!host) return;

    let frame = 0;
    let disposed = false;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    } catch {
      host.classList.add("webgl-fallback");
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 1.5, 13);
    camera.lookAt(0, 0.8, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    const gold = new THREE.MeshStandardMaterial({ color: 0xd9b45b, metalness: 0.86, roughness: 0.2, emissive: 0x6b4c13, emissiveIntensity: 0.22 });
    const goldLight = new THREE.MeshStandardMaterial({ color: 0xf4d487, metalness: 0.72, roughness: 0.16, emissive: 0x8b6418, emissiveIntensity: 0.26 });
    const darkGold = new THREE.MeshStandardMaterial({ color: 0x8a6a27, metalness: 0.82, roughness: 0.28 });

    scene.add(new THREE.AmbientLight(0x9b8c6a, 0.7));
    const key = new THREE.PointLight(0xf4d487, 26, 18);
    key.position.set(3.8, 5, 5);
    scene.add(key);
    const fill = new THREE.PointLight(0x294b73, 14, 16);
    fill.position.set(-5, 1, 3);
    scene.add(fill);

    const starCount = 1500;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i += 1) {
      const t = i * 12.9898;
      starPositions[i * 3] = Math.sin(t) * 12;
      starPositions[i * 3 + 1] = (Math.cos(t * 0.7) * 0.5 + 0.5) * 11 - 5;
      starPositions[i * 3 + 2] = Math.cos(t * 1.3) * 9 - 3;
    }
    const stars = new THREE.Points(
      new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(starPositions, 3)),
      new THREE.PointsMaterial({ color: 0xd9b45b, size: 0.025, transparent: true, opacity: 0.64, sizeAttenuation: true }),
    );
    scene.add(stars);

    const scale = new THREE.Group();
    scale.position.set(0, -0.85, 0);
    scale.rotation.y = -0.22;
    scene.add(scale);

    const base = new THREE.Mesh(new THREE.CylinderGeometry(2.15, 2.45, 0.32, 48), darkGold);
    base.position.y = -2.1;
    scale.add(base);
    const baseRing = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.06, 10, 48), goldLight);
    baseRing.rotation.x = Math.PI / 2;
    baseRing.position.y = -1.92;
    scale.add(baseRing);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.35, 4.2, 24), goldLight);
    stem.position.y = -0.05;
    scale.add(stem);
    const crown = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 16), gold);
    crown.position.y = 2.0;
    scale.add(crown);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.21, 0.7, 4), goldLight);
    tip.position.y = 2.55;
    scale.add(tip);
    const beam = new THREE.Mesh(new THREE.BoxGeometry(5.7, 0.18, 0.26), goldLight);
    beam.position.y = 1.72;
    scale.add(beam);
    const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 2.1, 12), darkGold);
    leftArm.rotation.z = Math.PI / 2 - 0.03;
    leftArm.position.set(-2.05, 1.55, 0);
    scale.add(leftArm);
    const rightArm = leftArm.clone();
    rightArm.position.x = 2.05;
    scale.add(rightArm);
    const leftPan = createPan(gold);
    const rightPan = createPan(gold);
    leftPan.position.set(-2.05, 0.15, 0);
    rightPan.position.set(2.05, 0.15, 0);
    scale.add(leftPan, rightPan);
    scale.add(createChain([new THREE.Vector3(-2.05, 1.58, 0), new THREE.Vector3(-2.05, 0.22, 0)], darkGold.color.getHex()));
    scale.add(createChain([new THREE.Vector3(2.05, 1.58, 0), new THREE.Vector3(2.05, 0.22, 0)], darkGold.color.getHex()));
    const halo = new THREE.Mesh(new THREE.TorusGeometry(4.15, 0.018, 8, 96), new THREE.MeshBasicMaterial({ color: 0xd9b45b, transparent: true, opacity: 0.32 }));
    halo.rotation.x = Math.PI / 2.1;
    halo.position.y = 0.25;
    scale.add(halo);

    // Use the supplied realistic scale artwork as the visual focal point. The
    // procedural model remains as a WebGL fallback, while the artwork receives
    // a restrained cinematic sway rather than a cartoon-like full spin.
    let photoTexture: THREE.Texture | null = null;
    const photoMaterial = new THREE.SpriteMaterial({ color: 0xffffff, transparent: true, opacity: 0.78, depthWrite: false });
    const photoSprite = new THREE.Sprite(photoMaterial);
    const portrait = window.innerWidth < 680;
    photoSprite.position.set(0, portrait ? 0.25 : 0.1, 0.85);
    photoSprite.scale.set(portrait ? 5.1 : 8.6, portrait ? 8.9 : 5.7, 1);
    photoSprite.renderOrder = 2;
    scene.add(photoSprite);
    const photoUrl = portrait ? "/assets/hero-scales-portrait.png" : "/assets/hero-scales.jpg";
    new THREE.TextureLoader().load(photoUrl, texture => {
      if (disposed) { texture.dispose(); return; }
      texture.colorSpace = THREE.SRGBColorSpace;
      photoTexture = texture;
      photoMaterial.map = texture;
      photoMaterial.needsUpdate = true;
      scale.visible = false;
    });

    const pointer = { x: 0, y: 0 };
    const onPointer = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth - 0.5) * 0.55;
      pointer.y = (event.clientY / window.innerHeight - 0.5) * 0.3;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    const resize = () => {
      const width = host.clientWidth || window.innerWidth;
      const height = host.clientHeight || window.innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    const spin = gsap.to(scale.rotation, { y: scale.rotation.y + Math.PI * 2, duration: 26, repeat: -1, ease: "none" });
    const swingLeft = gsap.to(leftPan.rotation, { z: 0.04, duration: 2.8, repeat: -1, yoyo: true, ease: "sine.inOut" });
    const swingRight = gsap.to(rightPan.rotation, { z: -0.04, duration: 3.2, repeat: -1, yoyo: true, ease: "sine.inOut" });
    const photoSway = gsap.to(photoSprite.rotation, { z: 0.018, duration: 5.8, repeat: -1, yoyo: true, ease: "sine.inOut" });
    const photoFloat = gsap.to(photoSprite.position, { y: photoSprite.position.y + 0.16, duration: 6.6, repeat: -1, yoyo: true, ease: "sine.inOut" });

    const animate = () => {
      if (disposed) return;
      frame = requestAnimationFrame(animate);
      stars.rotation.y += 0.00018;
      scale.rotation.x += (pointer.y - scale.rotation.x) * 0.018;
      scale.rotation.z += (pointer.x - scale.rotation.z) * 0.018;
      photoSprite.position.x += (pointer.x * 0.42 - photoSprite.position.x) * 0.01;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", resize);
      spin.kill(); swingLeft.kill(); swingRight.kill(); photoSway.kill(); photoFloat.kill();
      photoTexture?.dispose();
      scene.traverse(object => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points || object instanceof THREE.Line) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) object.material.forEach(material => material.dispose());
          else object.material.dispose();
        }
      });
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className={`cosmic-canvas ${className}`} style={{ opacity }} aria-hidden="true" />;
}
