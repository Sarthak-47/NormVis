import { motion } from 'framer-motion';

export default function NeonButton({
  children,
  onClick,
  variant = 'cyan',   // 'cyan' | 'violet' | 'ghost' | 'danger'
  size = 'md',        // 'sm' | 'md' | 'lg'
  className = '',
  disabled = false,
  icon: Icon = null,
  type = 'button',
}) {
  const variants = {
    cyan: {
      bg: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(6,182,212,0.15))',
      border: 'rgba(0,212,255,0.5)',
      text: '#00d4ff',
      shadow: '0 0 20px rgba(0,212,255,0.35)',
      hoverShadow: '0 0 35px rgba(0,212,255,0.6)',
    },
    violet: {
      bg: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(139,92,246,0.15))',
      border: 'rgba(124,58,237,0.5)',
      text: '#a78bfa',
      shadow: '0 0 20px rgba(124,58,237,0.35)',
      hoverShadow: '0 0 35px rgba(124,58,237,0.6)',
    },
    ghost: {
      bg: 'rgba(255,255,255,0.04)',
      border: 'rgba(255,255,255,0.12)',
      text: 'rgba(255,255,255,0.7)',
      shadow: 'none',
      hoverShadow: '0 0 20px rgba(255,255,255,0.1)',
    },
    danger: {
      bg: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(220,38,38,0.1))',
      border: 'rgba(239,68,68,0.4)',
      text: '#f87171',
      shadow: '0 0 15px rgba(239,68,68,0.2)',
      hoverShadow: '0 0 30px rgba(239,68,68,0.4)',
    },
  };

  const sizes = {
    sm: { padding: '6px 14px', fontSize: '12px', gap: '5px' },
    md: { padding: '10px 20px', fontSize: '14px', gap: '7px' },
    lg: { padding: '14px 32px', fontSize: '16px', gap: '9px' },
  };

  const v = variants[variant];
  const s = sizes[size];

  return (
    <motion.button
      type={type}
      className={`neon-btn relative ${className}`}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.04, boxShadow: v.hoverShadow, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      style={{
        background: disabled ? 'rgba(255,255,255,0.04)' : v.bg,
        border: `1px solid ${disabled ? 'rgba(255,255,255,0.06)' : v.border}`,
        color: disabled ? 'rgba(255,255,255,0.25)' : v.text,
        boxShadow: disabled ? 'none' : v.shadow,
        borderRadius: '10px',
        fontFamily: "'Inter', sans-serif",
        fontWeight: 600,
        letterSpacing: '0.02em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: s.gap,
        padding: s.padding,
        fontSize: s.fontSize,
        transition: 'all 0.25s ease',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      {Icon && <Icon size={size === 'sm' ? 13 : size === 'lg' ? 18 : 15} />}
      {children}
    </motion.button>
  );
}
