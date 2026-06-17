import confetti from "canvas-confetti";

const EMERALD = "#10b981";
const CYAN = "#38bdf8";

export function fireRevealConfetti(_consensus: boolean) {
  void confetti({
    particleCount: 80,
    spread: 80,
    startVelocity: 35,
    origin: { y: 0.55 },
    colors: [EMERALD, CYAN, "#ffffff"],
    ticks: 180,
    gravity: 1.1,
    scalar: 0.9,
    disableForReducedMotion: true,
  });
}
