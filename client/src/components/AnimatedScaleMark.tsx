import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

type AnimatedScaleMarkProps = { large?: boolean };

export default function AnimatedScaleMark({ large = false }: AnimatedScaleMarkProps) {
  const rotor = useRef<SVGGElement>(null);
  const glow = useRef<SVGCircleElement>(null);

  useLayoutEffect(() => {
    if (!rotor.current || !glow.current) return;
    const rotation = gsap.to(rotor.current, { rotation: 360, transformOrigin: "50% 50%", duration: 14, repeat: -1, ease: "none" });
    const pulse = gsap.to(glow.current, { opacity: 0.18, attr: { r: 21 }, duration: 1.35, repeat: -1, yoyo: true, ease: "sine.inOut" });
    return () => { rotation.kill(); pulse.kill(); };
  }, []);

  return (
    <svg className={`animated-scale-mark ${large ? "is-large" : ""}`} viewBox="0 0 64 64" role="img" aria-label="Animated balance scale">
      <circle ref={glow} cx="32" cy="31" r="17" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.38" />
      <g ref={rotor} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M32 12v38M25 51h14M26 12h12M29 12h6" />
        <path d="M14 20h36M18 20l-7 14M18 20l7 14M46 20l-7 14M46 20l7 14" />
        <path d="M8 35c3 4 7 5 10 0M21 35c-3 4-7 5-10 0M43 35c3 4 7 5 10 0M56 35c-3 4-7 5-10 0" />
        <path d="M32 8l2.4 4h-4.8z" fill="currentColor" />
      </g>
      <circle cx="32" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}
