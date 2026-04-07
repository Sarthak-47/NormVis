import { motion } from 'framer-motion';
import { Rocket, Anchor } from 'lucide-react';

export default function GravityToggle({ gravityMode, onToggle }) {
  return (
    <motion.div
      className="flex items-center gap-3"
      whileHover={{ scale: 1.03 }}
    >
      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 500, letterSpacing: '0.05em' }}>
        GRAVITY
      </span>
      <motion.button
        onClick={onToggle}
        style={{
          position: 'relative',
          width: 52,
          height: 28,
          borderRadius: 14,
          border: `1px solid ${gravityMode ? 'rgba(124,58,237,0.5)' : 'rgba(0,212,255,0.5)'}`,
          background: gravityMode
            ? 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(139,92,246,0.15))'
            : 'linear-gradient(135deg, rgba(0,212,255,0.25), rgba(6,182,212,0.15))',
          cursor: 'pointer',
          boxShadow: gravityMode
            ? '0 0 15px rgba(124,58,237,0.3)'
            : '0 0 15px rgba(0,212,255,0.3)',
          transition: 'all 0.4s ease',
          backdropFilter: 'blur(10px)',
        }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{ x: gravityMode ? 26 : 3 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{
            position: 'absolute',
            top: 3, left: 0,
            width: 20, height: 20,
            borderRadius: '50%',
            background: gravityMode
              ? 'linear-gradient(135deg, #a78bfa, #7c3aed)'
              : 'linear-gradient(135deg, #00d4ff, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: gravityMode
              ? '0 0 8px rgba(124,58,237,0.6)'
              : '0 0 8px rgba(0,212,255,0.6)',
          }}
        >
          {gravityMode
            ? <Anchor size={10} color="#1a0a3e" />
            : <Rocket size={10} color="#001a2e" />}
        </motion.div>
      </motion.button>
      <span style={{
        fontSize: 11,
        color: gravityMode ? '#a78bfa' : '#00d4ff',
        fontWeight: 600,
        letterSpacing: '0.03em',
        transition: 'color 0.3s'
      }}>
        {gravityMode ? 'ON' : 'OFF'}
      </span>
    </motion.div>
  );
}
