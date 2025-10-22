import React, { useEffect, useRef } from "react";

// You can tune these for your design
const SPOTLIGHT_SIZE = 220;
const FADE = "rgba(120,255,240,0.15)"; // Soft turquoise glow

const SpotlightCursor: React.FC = () => {
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (spotlightRef.current) {
        spotlightRef.current.style.left = `${e.clientX - SPOTLIGHT_SIZE/2}px`;
        spotlightRef.current.style.top = `${e.clientY - SPOTLIGHT_SIZE/2}px`;
      }
    };
    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      ref={spotlightRef}
      style={{
        position: "fixed",
        pointerEvents: "none",
        width: SPOTLIGHT_SIZE,
        height: SPOTLIGHT_SIZE,
        left: -SPOTLIGHT_SIZE,
        top: -SPOTLIGHT_SIZE,
        zIndex: 40,
        borderRadius: "50%",
        background: `radial-gradient(circle at center, ${FADE} 0%, transparent 80%)`,
        transition: "background .2s",
        mixBlendMode: "lighten",
      }}
      aria-hidden="true"
    />
  );
};

export default SpotlightCursor;