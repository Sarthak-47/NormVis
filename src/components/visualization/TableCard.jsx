import { motion } from 'framer-motion';
import { Key, Hash } from 'lucide-react';

export default function TableCard({ relation, index = 0, animate = true }) {
  const { name, attributes = [], candidateKeys = [], fds = [], note } = relation;

  const primaryKeyAttrs = new Set(candidateKeys.flat());

  const floatVariants = ['animate-float-1', 'animate-float-2', 'animate-float-3'];
  const floatClass = animate ? floatVariants[index % 3] : '';

  return (
    <motion.div
      className={`glass ${floatClass}`}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 300, damping: 25 }}
      whileHover={animate ? {
        y: -10,
        boxShadow: '0 0 40px rgba(64,138,113,0.25), 0 20px 60px rgba(0,0,0,0.5)',
        borderColor: 'rgba(64,138,113,0.4)'
      } : {}}
      style={{ overflow: 'hidden', minWidth: 220 }}
    >
      {/* Table Header */}
      <div style={{
        padding: '10px 14px',
        background: 'linear-gradient(135deg, rgba(64,138,113,0.12), rgba(40,90,72,0.1))',
        borderBottom: '1px solid rgba(64,138,113,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div className="flex items-center gap-2">
          <Hash size={14} color="#408A71" />
          <span style={{ fontFamily: 'Space Grotesk, monospace', fontWeight: 700, fontSize: 14, color: '#408A71' }}>
            {name}
          </span>
        </div>
        {candidateKeys.length > 0 && (
          <div className="flex items-center gap-1">
            <Key size={11} color="#B0E4CC" />
            <span style={{ fontSize: 10, color: '#B0E4CC', fontWeight: 600 }}>
              {candidateKeys.length} key{candidateKeys.length > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Column Headers */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6,
        padding: '10px 14px 6px',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        {attributes.map(attr => {
          const isKey = primaryKeyAttrs.has(attr.toUpperCase());
          return (
            <motion.span
              key={attr}
              whileHover={{ scale: 1.08 }}
              style={{
                fontFamily: 'Space Grotesk, monospace',
                fontSize: 12,
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: 6,
                background: isKey
                  ? 'linear-gradient(135deg, rgba(64,138,113,0.2), rgba(49,106,87,0.15))'
                  : 'rgba(255,255,255,0.05)',
                border: `1px solid ${isKey ? 'rgba(64,138,113,0.5)' : 'rgba(255,255,255,0.1)'}`,
                color: isKey ? '#B0E4CC' : 'rgba(255,255,255,0.7)',
                textDecoration: isKey ? 'underline' : 'none',
                textDecorationStyle: isKey ? 'double' : 'solid',
                textUnderlineOffset: '3px',
                display: 'flex', alignItems: 'center', gap: 3
              }}
            >
              {isKey && <Key size={8} />}
              {attr}
            </motion.span>
          );
        })}
      </div>

      {/* Sample rows (placeholder) */}
      <div style={{ padding: '6px 14px 10px' }}>
        {[1, 2].map(row => (
          <div key={row} style={{
            display: 'flex', gap: 6, padding: '4px 0',
            borderBottom: row === 1 ? '1px solid rgba(255,255,255,0.04)' : 'none'
          }}>
            {attributes.map((attr, i) => (
              <span key={attr} style={{
                flex: 1, fontFamily: 'Space Grotesk, monospace',
                fontSize: 11, color: 'rgba(255,255,255,0.35)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>
                {String.fromCharCode(97 + i)}{row}
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* FDs inside card */}
      {fds.length > 0 && (
        <div style={{ padding: '6px 14px 10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {fds.map((fd, i) => (
            <div key={i} style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 2, fontFamily: 'Space Grotesk, monospace' }}>
              <span style={{ color: '#408A71' }}>{fd.lhs?.join(', ')}</span>
              <span style={{ margin: '0 4px', color: 'rgba(255,255,255,0.2)' }}>→</span>
              <span style={{ color: '#B0E4CC' }}>{fd.rhs?.join(', ')}</span>
            </div>
          ))}
        </div>
      )}

      {/* Note */}
      {note && (
        <div style={{
          padding: '6px 14px 10px',
          background: 'rgba(64,138,113,0.03)',
          borderTop: '1px solid rgba(255,255,255,0.04)',
        }}>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>{note}</p>
        </div>
      )}

      {/* Candidate keys display */}
      {candidateKeys.length > 0 && (
        <div style={{ padding: '6px 14px 10px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em' }}>CANDIDATE KEY(S): </span>
          {candidateKeys.map((ck, i) => (
            <span key={i} className="pk-badge" style={{ marginLeft: 4, fontSize: 10 }}>
              {ck.join(', ')}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
