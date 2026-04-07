import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronRight, Cpu, Database } from 'lucide-react';
import { computeClosure } from '../../lib/normalization/closure.js';

export default function ExplanationPanel({ schema, results, activeTab }) {
  if (!results || !schema) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <BookOpen size={40} style={{ margin: '0 auto 12px', color: 'rgba(255,255,255,0.15)' }} />
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
          Enter a schema and click Normalize to see step-by-step reasoning here.
        </p>
      </div>
    );
  }

  const result = results[activeTab];
  const nfOrder = ['1NF', '2NF', '3NF', 'BCNF', '4NF', '5NF'];
  const currentIdx = nfOrder.indexOf(activeTab);

  // Compute closure summary for all attributes
  const closureSummary = schema?.attributes?.slice(0, 4).map(attr => {
    const closure = computeClosure([attr], schema.fds || []);
    return { attr, closure };
  }) || [];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#408A71', letterSpacing: '0.05em' }}>
          EXPLANATION
        </h2>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
          Step-by-step reasoning for {activeTab}
        </p>
      </div>
      <div className="neon-divider" />

      {/* Normalization progress */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.07em', marginBottom: 10 }}>
          NORMALIZATION PROGRESS
        </p>
        <div className="flex flex-col gap-2">
          {nfOrder.map((nf, i) => {
            const r = results[nf];
            const isActive = nf === activeTab;
            const isPast = i < currentIdx;
            const isFuture = i > currentIdx;
            return (
              <div key={nf} className="flex items-center gap-3">
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700,
                  background: r?.satisfied
                    ? 'rgba(16,185,129,0.2)'
                    : r
                      ? 'rgba(239,68,68,0.2)'
                      : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${r?.satisfied ? '#408A71' : r ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
                  color: r?.satisfied ? '#408A71' : r ? '#f87171' : 'rgba(255,255,255,0.3)',
                }}>
                  {r?.satisfied ? '✓' : r ? '✗' : i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="flex items-center justify-between">
                    <span style={{
                      fontSize: 12, fontWeight: isActive ? 700 : 500,
                      color: isActive ? '#408A71' : isFuture ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.65)'
                    }}>
                      {nf}
                    </span>
                    {r && (
                      <span style={{ fontSize: 10, color: r.satisfied ? '#408A71' : '#f87171', fontWeight: 600 }}>
                        {r.satisfied ? 'PASS' : 'FAIL'}
                      </span>
                    )}
                  </div>
                  {isActive && r && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 2, lineHeight: 1.4 }}
                    >
                      {r.explanation}
                    </motion.p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="neon-divider" />

      {/* Attribute Closure Summary */}
      <div>
        <div className="flex items-center gap-2" style={{ marginBottom: 10 }}>
          <Cpu size={13} color="#408A71" />
          <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.07em' }}>
            ATTRIBUTE CLOSURES
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {closureSummary.map(({ attr, closure }) => (
            <motion.div
              key={attr}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 8, padding: '8px 12px',
                fontFamily: 'Space Grotesk, monospace'
              }}
            >
              <span style={{ color: '#408A71', fontWeight: 700, fontSize: 12 }}>{attr}</span>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>⁺ = </span>
              <span style={{ color: '#B0E4CC', fontSize: 12 }}>{'{'}{closure.join(', ')}{'}'}</span>
              {closure.length === schema.attributes.length && (
                <span style={{ marginLeft: 6, fontSize: 10, color: '#10b981', fontWeight: 600 }}>← SUPERKEY</span>
              )}
            </motion.div>
          ))}
          {schema.attributes.length > 4 && (
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>
              + {schema.attributes.length - 4} more attributes…
            </p>
          )}
        </div>
      </div>

      <div className="neon-divider" />

      {/* Active Step Explanation */}
      {result && (
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: 10 }}>
            <Database size={13} color="#408A71" />
            <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.07em' }}>
              {activeTab} ANALYSIS
            </p>
          </div>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: result.satisfied ? 'rgba(16,185,129,0.07)' : 'rgba(239,68,68,0.07)',
              border: `1px solid ${result.satisfied ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
              borderRadius: 10, padding: '14px'
            }}
          >
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>
              {result.explanation}
            </p>
            {result.violations?.map((v, i) => (
              <div key={i} className="flex items-start gap-2" style={{ marginTop: 10 }}>
                <ChevronRight size={13} color="#f87171" style={{ marginTop: 1, flexShrink: 0 }} />
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>{v.reason}</p>
              </div>
            ))}
          </motion.div>
        </div>
      )}
    </div>
  );
}
