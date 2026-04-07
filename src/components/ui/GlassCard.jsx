import { motion } from 'framer-motion';

export default function GlassCard({
  children,
  className = '',
  animate = true,
  floatVariant = 1,
  onClick,
  style = {},
  padding = true,
}) {
  const floatClass = animate
    ? `animate-float-${Math.min(Math.max(floatVariant, 1), 3)}`
    : '';

  return (
    <motion.div
      className={`glass glass-hover ${floatClass} ${padding ? 'p-5' : ''} ${className}`}
      whileHover={animate ? { y: -8, boxShadow: '0 0 40px rgba(64,138,113,0.2), 0 24px 64px rgba(0,0,0,0.5)' } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default', ...style }}
    >
      {children}
    </motion.div>
  );
}
