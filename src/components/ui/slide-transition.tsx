import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SlideTransitionProps {
  children: React.ReactNode;
  direction?: 'left' | 'right';
  isVisible?: boolean;
  className?: string;
  duration?: number;
}

const slideVariants = {
  left: {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 }
  },
  right: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 }
  }
};

export const SlideTransition: React.FC<SlideTransitionProps> = ({
  children,
  direction = 'right',
  isVisible = true,
  className,
  duration = 0.3
}) => {
  const variants = slideVariants[direction];

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial="initial"
          animate="animate"
          exit="exit"
          variants={variants}
          transition={{ 
            duration,
            ease: [0.4, 0.0, 0.2, 1] // cubic-bezier for smooth motion
          }}
          className={cn("w-full", className)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SlideTransition;