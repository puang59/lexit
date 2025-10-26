import { motion, AnimatePresence, easeOut } from 'framer-motion'

const variants = {
  initial: { opacity: 0, y: 10, filter: "blur(5px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -10, filter: "blur(5px)" },
}

const transition = {
  duration: 0.3,
  ease: easeOut,
}

export default function SmoothFadeLayout({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <AnimatePresence mode="sync">

      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={transition}
        style={{
          minHeight: '100vh',
          willChange: 'opacity, transform',
        }}
        className={`relative ${className}`}
        aria-live="polite"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
