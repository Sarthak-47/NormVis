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
          border: `1px solid ${gravityMode ? 'rgba(64,138,113,0.5)' : 'rgba(40,90,72,0.5)'}`,
          background: gravityMode
            ? 'linear-gradient(135deg, rgba(64,138,113,0.25), rgba(49,106,87,0.15))'
            : 'linear-gradient(135deg, rgba(40,90,72,0.25), rgba(19,44,42,0.15))',
          cursor: 'pointer',
          boxShadow: gravityMode
            ? '0 0 15px rgba(64,138,113,0.3)'
            : '0 0 15px rgba(40,90,72,0.3)',
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
              ? 'linear-gradient(135deg, #B0E4CC, #408A71)'
              : 'linear-gradient(135deg, #408A71, #285A48)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: gravityMode
              ? '0 0 8px rgba(176,228,204,0.6)'
              : '0 0 8px rgba(64,138,113,0.6)',
          }}
        >
          {gravityMode
            ? <Anchor size={10} color="#1a0a3e" />
            : <Rocket size={10} color="#001a2e" />}
        </motion.div>
      </motion.button>
      <span style={{
        fontSize: 11,
        color: gravityMode ? '#B0E4CC' : '#408A71',
        fontWeight: 600,
        letterSpacing: '0.03em',
        transition: 'color 0.3s'
      }}>
        {gravityMode ? 'ON' : 'OFF'}
      </span>
    </motion.div>
  );
}
