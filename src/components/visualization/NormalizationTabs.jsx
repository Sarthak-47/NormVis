import { motion } from 'framer-motion';

const TABS = ['1NF', '2NF', '3NF', 'BCNF', '4NF', '5NF'];

const TAB_COLORS = {
  '1NF':  { active: '#B0E4CC', shadow: 'rgba(176,228,204,0.3)' },
  '2NF':  { active: '#8eccb5', shadow: 'rgba(142,204,181,0.3)' },
  '3NF':  { active: '#6db49d', shadow: 'rgba(109,180,157,0.3)' },
  'BCNF': { active: '#4a9c86', shadow: 'rgba(74,156,134,0.3)' },
  '4NF':  { active: '#28846e', shadow: 'rgba(40,132,110,0.3)' },
  '5NF':  { active: '#066d57', shadow: 'rgba(6,109,87,0.3)' },
};

export default function NormalizationTabs({ activeTab, onTabChange, results }) {
  return (
    <div className="flex gap-2 flex-wrap justify-center">
      {TABS.map(tab => {
        const isActive = activeTab === tab;
        const color = TAB_COLORS[tab];
        const result = results?.[tab];
        const satisfied = result?.satisfied;
        const hasResult = result !== undefined;

        return (
          <motion.button
            key={tab}
            onClick={() => onTabChange(tab)}
            whileHover={{ y: -4, scale: 1.04, boxShadow: `0 0 20px ${color.shadow}` }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            style={{
              position: 'relative',
              padding: '8px 18px',
              borderRadius: 10,
              border: `1px solid ${isActive ? color.active : 'rgba(255,255,255,0.08)'}`,
              background: isActive
                ? `linear-gradient(135deg, ${color.active}22, ${color.active}11)`
                : 'rgba(255,255,255,0.03)',
              color: isActive ? color.active : 'rgba(255,255,255,0.45)',
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: '0.06em',
              cursor: 'pointer',
              boxShadow: isActive ? `0 0 20px ${color.shadow}` : 'none',
              fontFamily: "'Space Grotesk', monospace",
              transition: 'all 0.25s ease',
              backdropFilter: 'blur(10px)',
              minWidth: 70,
            }}
          >
            {tab}
            {/* Status dot */}
            {hasResult && (
              <span style={{
                position: 'absolute',
                top: 5, right: 5,
                width: 6, height: 6,
                borderRadius: '50%',
                background: satisfied ? '#408A71' : '#ef4444',
                boxShadow: satisfied ? '0 0 6px #408A71' : '0 0 6px #ef4444',
              }} />
            )}
            {/* Active underline */}
            {isActive && (
              <motion.div
                layoutId="tab-indicator"
                style={{
                  position: 'absolute',
                  bottom: -1, left: '15%',
                  width: '70%', height: 2,
                  borderRadius: 2,
                  background: color.active,
                  boxShadow: `0 0 8px ${color.active}`,
                }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
