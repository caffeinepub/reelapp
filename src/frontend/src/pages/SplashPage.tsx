import { motion } from "motion/react";

interface SplashPageProps {
  onPlay: () => void;
}

// Deterministic star positions for twinkling dots
const DOTS = [
  { x: 8, y: 12, size: 2, dur: 2.1, delay: 0 },
  { x: 15, y: 5, size: 1.5, dur: 3.2, delay: 0.4 },
  { x: 25, y: 18, size: 1, dur: 2.7, delay: 0.8 },
  { x: 35, y: 8, size: 2, dur: 1.9, delay: 1.2 },
  { x: 45, y: 4, size: 1.5, dur: 3.5, delay: 0.3 },
  { x: 55, y: 10, size: 1, dur: 2.3, delay: 0.9 },
  { x: 65, y: 6, size: 2, dur: 2.8, delay: 0.5 },
  { x: 75, y: 15, size: 1.5, dur: 2.0, delay: 1.4 },
  { x: 85, y: 7, size: 1, dur: 3.1, delay: 0.2 },
  { x: 92, y: 20, size: 2, dur: 2.6, delay: 0.7 },
  { x: 5, y: 30, size: 1, dur: 3.3, delay: 1.1 },
  { x: 12, y: 45, size: 1.5, dur: 2.4, delay: 0.6 },
  { x: 90, y: 38, size: 1, dur: 2.9, delay: 1.3 },
  { x: 88, y: 55, size: 2, dur: 2.2, delay: 0.1 },
  { x: 7, y: 65, size: 1.5, dur: 3.0, delay: 0.8 },
  { x: 93, y: 70, size: 1, dur: 2.5, delay: 1.0 },
  { x: 20, y: 80, size: 2, dur: 3.4, delay: 0.4 },
  { x: 40, y: 88, size: 1.5, dur: 2.1, delay: 1.5 },
  { x: 60, y: 85, size: 1, dur: 2.8, delay: 0.3 },
  { x: 80, y: 82, size: 2, dur: 3.2, delay: 0.9 },
  { x: 30, y: 92, size: 1, dur: 2.6, delay: 0.7 },
  { x: 50, y: 95, size: 1.5, dur: 2.3, delay: 1.2 },
  { x: 70, y: 90, size: 1, dur: 3.0, delay: 0.5 },
  { x: 18, y: 72, size: 2, dur: 2.7, delay: 1.6 },
  { x: 82, y: 25, size: 1, dur: 2.4, delay: 0.2 },
];

function StarSVG() {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      role="img"
      aria-label="Reel Star logo"
    >
      <defs>
        <radialGradient id="starGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fff8c0" />
          <stop offset="30%" stopColor="#ffe566" />
          <stop offset="65%" stopColor="#f5a623" />
          <stop offset="100%" stopColor="#c97a00" />
        </radialGradient>
        <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffe566" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#f5a623" stopOpacity="0" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Glow aura */}
      <circle cx="100" cy="100" r="90" fill="url(#starGlow)" />
      {/* 5-pointed star path */}
      <path
        d="M100,15 L120,75 L185,75 L133,112 L154,172 L100,135 L46,172 L67,112 L15,75 L80,75 Z"
        fill="url(#starGrad)"
        filter="url(#glow)"
        stroke="#ffe066"
        strokeWidth="1.5"
        strokeOpacity="0.5"
      />
    </svg>
  );
}

export default function SplashPage({ onPlay }: SplashPageProps) {
  return (
    <div
      className="splash-bg relative flex flex-col items-center justify-between overflow-hidden"
      style={{ height: "100dvh", width: "100%" }}
    >
      {/* Twinkling dots */}
      {DOTS.map((dot, i) => (
        <span
          key={`dot-${dot.x}-${dot.y}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            width: `${dot.size * 2}px`,
            height: `${dot.size * 2}px`,
            background:
              i % 3 === 0
                ? "rgba(200, 180, 255, 0.9)"
                : i % 3 === 1
                  ? "rgba(255, 255, 255, 0.9)"
                  : "rgba(180, 200, 255, 0.9)",
            animation: `twinkle ${dot.dur}s ease-in-out infinite ${dot.delay}s`,
          }}
        />
      ))}

      {/* Top spacer */}
      <div className="flex-1" />

      {/* Center content: Star + Text */}
      <motion.div
        className="relative flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: "min(72vw, 340px)", height: "min(72vw, 340px)" }}
      >
        {/* Pulsing star */}
        <div className="absolute inset-0 animate-star-pulse">
          <StarSVG />
        </div>

        {/* Text overlay on star */}
        <div className="relative z-10 flex flex-col items-center justify-center select-none">
          {/* "Reel" cursive */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
            className="lavender-text"
            style={{
              fontFamily: '"Playfair Display", "Instrument Serif", serif',
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: "clamp(2.2rem, 8vw, 3.5rem)",
              lineHeight: 1,
              letterSpacing: "0.03em",
              marginBottom: "0.15em",
            }}
          >
            Reel
          </motion.div>

          {/* "STAR" block */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
            className="gold-text"
            style={{
              fontFamily: '"Bricolage Grotesque", sans-serif',
              fontWeight: 900,
              fontSize: "clamp(3rem, 12vw, 5rem)",
              lineHeight: 1,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            STAR
          </motion.div>
        </div>
      </motion.div>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        style={{
          color: "rgba(200, 175, 255, 0.75)",
          fontFamily: '"Sora", sans-serif',
          fontSize: "clamp(0.8rem, 3vw, 1rem)",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          marginTop: "1.5rem",
        }}
      >
        Short Videos · Infinite Stars
      </motion.p>

      {/* Flex grow spacer */}
      <div className="flex-1" />

      {/* PLAY NOW button */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full flex justify-center"
        style={{
          paddingBottom: "max(env(safe-area-inset-bottom), 3.5rem)",
          paddingLeft: "2rem",
          paddingRight: "2rem",
        }}
      >
        <button
          type="button"
          data-ocid="splash.primary_button"
          onClick={onPlay}
          className="btn-play-now"
          style={{
            width: "100%",
            maxWidth: "340px",
            padding: "1rem 2.5rem",
            borderRadius: "9999px",
            border: "none",
            cursor: "pointer",
            fontFamily: '"Bricolage Grotesque", sans-serif',
            fontWeight: 800,
            fontSize: "clamp(1.1rem, 4vw, 1.35rem)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#fff",
            transition: "all 0.2s ease",
          }}
        >
          Play Now
        </button>
      </motion.div>
    </div>
  );
}
