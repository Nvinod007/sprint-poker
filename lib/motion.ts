import type { Transition, Variants } from "framer-motion";

export const EASE_SMOOTH = [0.4, 0, 0.2, 1] as const;

export const motionTransition = {
  fast: { duration: 0.2, ease: EASE_SMOOTH } satisfies Transition,
  medium: { duration: 0.32, ease: EASE_SMOOTH } satisfies Transition,
  slow: { duration: 0.45, ease: EASE_SMOOTH } satisfies Transition,
  spring: { type: "spring", stiffness: 420, damping: 32 } satisfies Transition,
} as const;

export const fadeVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeUpVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export const staggerContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

export const staggerItemVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: motionTransition.medium,
  },
};
