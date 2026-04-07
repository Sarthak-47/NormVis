import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, Key, ArrowRight, Layers } from 'lucide-react';
import TableCard from './TableCard.jsx';

const NF_DEFINITIONS = {
  '1NF': {
    color: '#00d4ff',
    icon: '①',
    full: 'First Normal Form',
    rule: 'All attributes contain only atomic (indivisible) values. No repeating groups or multi-valued attributes.',
    howToFix: 'Decompose multi-valued attributes into separate rows or create a separate table for repetitive groups.',
  },
  '2NF': {
    color: '#06b6d4',
    icon: '②',
    full: 'Second Normal Form',
    rule: 'Relation is in 1NF AND every non-prime attribute is fully functionally dependent on every candidate key (no partial dependencies).',
    howToFix: 'Remove attributes that depend only on part of a composite key into a separate relation.',
  },
  '3NF': {
    color: '#3b82f6',
    icon: '③',
    full: 'Third Normal Form',
    rule: 'Relation is in 2NF AND for every FD X→Y, either X is a superkey OR Y is a prime attribute (no transitive dependencies).',
    howToFix: 'Move transitively dependent attributes to a new relation with their determinant as the key.',
  },
  'BCNF': {
    color: '#8b5cf6',
    icon: 'B',
    full: 'Boyce-Codd Normal Form',
    rule: 'Relation is in 3NF AND for every non-trivial FD X→Y, X must be a superkey. Stricter than 3NF.',
    howToFix: 'Decompose using the BCNF decomposition algorithm: split on the violating FD.',
  },
  '4NF': {
    color: '#a78bfa',
    icon: '④',
    full: 'Fourth Normal Form',
    rule: 'Relation is in BCNF AND contains no non-trivial multi-valued dependencies (MVDs) where the determinant is not a superkey.',
    howToFix: 'For MVD X ↠ Y, create two relations: one for X∪Y and one for X∪(R−Y).',
  },
  '5NF': {
    color: '#ec4899',
    icon: '⑤',
    full: 'Fifth Normal Form (PJNF)',
    rule: 'Relation is in 4NF AND every non-trivial join dependency is implied by the candidate keys.',
    howToFix: 'Decompose into the components of the join dependency to eliminate redundancy caused by cyclic relationships.',
  },
};

export default function NormStepView({ tab, result, decomposition, schema, animate }) {
  if (!result) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.3)' }}>
        <Layers size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
        <p style={{ fontSize: 14 }}>Run normalization to see results</p>
      </div>
    );
  }

  const meta = NF_DEFINITIONS[tab];
  const color = meta.color;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={tab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-5"
      >
        {/* NF Title Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="flex items-center gap-3">
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: `linear-gradient(135deg, ${color}33, ${color}11)`,
              border: `1px solid ${color}55`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 800, color,
              boxShadow: `0 0 15px ${color}33`
            }}>
              {meta.icon}
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color }}>{tab} — {meta.full}</h3>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                {result.satisfied ? '✓ Satisfied' : '✗ Violated'}
              </p>
            </div>
          </div>
          <span className={result.satisfied ? 'badge-ok' : 'badge-violation'}>
            {result.satisfied ? '✓ PASSES' : '✗ FAILS'}
          </span>
        </div>

        {/* Definition */}
        <div style={{
          background: `${color}0d`, border: `1px solid ${color}22`,
          borderRadius: 10, padding: '12px 14px'
        }}>
          <div className="flex items-start gap-2">
            <Info size={14} color={color} style={{ marginTop: 1, flexShrink: 0 }} />
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>
              {meta.rule}
            </p>
          </div>
        </div>

        {/* Keys */}
        {result.candidateKeys && result.candidateKeys.length > 0 && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.07em', marginBottom: 6 }}>
              CANDIDATE KEY(S)
            </p>
            <div className="flex flex-wrap gap-2">
              {result.candidateKeys.map((ck, i) => (
                <span key={i} className="pk-badge">
                  <Key size={9} /> {'{' + ck.join(', ') + '}'}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Prime / Non-Prime Attributes */}
        {(result.primeAttributes || result.nonPrimeAttributes) && (
          <div className="flex gap-4">
            {result.primeAttributes?.length > 0 && (
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.07em', marginBottom: 5 }}>PRIME ATTRS</p>
                <div className="flex flex-wrap gap-1">
                  {result.primeAttributes.map(a => (
                    <span key={a} className="pk-badge" style={{ fontSize: 11 }}>{a}</span>
                  ))}
                </div>
              </div>
            )}
            {result.nonPrimeAttributes?.length > 0 && (
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.07em', marginBottom: 5 }}>NON-PRIME ATTRS</p>
                <div className="flex flex-wrap gap-1">
                  {result.nonPrimeAttributes.map(a => (
                    <span key={a} className="fk-badge" style={{ fontSize: 11 }}>{a}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Violations */}
        {result.violations?.length > 0 && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#f87171', letterSpacing: '0.07em', marginBottom: 8 }}>
              VIOLATIONS DETECTED ({result.violations.length})
            </p>
            <div className="flex flex-col gap-2">
              {result.violations.map((v, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  style={{
                    background: 'rgba(239,68,68,0.07)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: 8, padding: '10px 12px'
                  }}
                >
                  <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                    <XCircle size={13} color="#f87171" />
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#f87171' }}>{v.type}</span>
                    {v.determinant && (
                      <span style={{ fontFamily: 'Space Grotesk, monospace', fontSize: 11, color: '#00d4ff' }}>
                        {'{' + (Array.isArray(v.determinant) ? v.determinant.join(', ') : v.determinant) + '}'}
                        {v.determined && (
                          <>
                            <ArrowRight size={10} style={{ display: 'inline', margin: '0 3px' }} />
                            <span style={{ color: '#a78bfa' }}>{'{' + (Array.isArray(v.determined) ? v.determined.join(', ') : v.determined) + '}'}</span>
                          </>
                        )}
                        {v.components && <span style={{ color: '#a78bfa' }}> ⋈{v.components.join(', ')}</span>}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{v.reason}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Satisfied message */}
        {result.satisfied && (
          <div style={{
            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8
          }}>
            <CheckCircle size={15} color="#10b981" />
            <p style={{ fontSize: 12, color: '#10b981' }}>{result.explanation}</p>
          </div>
        )}

        {/* How to fix */}
        {!result.satisfied && (
          <div style={{
            background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'start', gap: 8
          }}>
            <AlertTriangle size={15} color="#f59e0b" style={{ marginTop: 1, flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#f59e0b', marginBottom: 3 }}>RESOLUTION</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{meta.howToFix}</p>
            </div>
          </div>
        )}

        {/* Decomposed Relations */}
        {decomposition && decomposition.length > 0 && tab !== '1NF' && (
          <div>
            <div className="neon-divider" style={{ marginBottom: 14 }} />
            <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.07em', marginBottom: 12 }}>
              DECOMPOSED RELATIONS ({tab})
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {decomposition.map((rel, i) => (
                <TableCard key={i} relation={rel} index={i} animate={animate} />
              ))}
            </div>
          </div>
        )}

        {/* MVD info for 4NF */}
        {tab === '4NF' && result.mvds?.length > 0 && (
          <div style={{ marginTop: 4 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.07em', marginBottom: 6 }}>
              MULTI-VALUED DEPENDENCIES
            </p>
            {result.mvds.map((mvd, i) => (
              <div key={i} style={{ fontFamily: 'Space Grotesk, monospace', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 3 }}>
                <span style={{ color: '#a78bfa' }}>{'{' + mvd.lhs.join(', ') + '}'}</span>
                <span style={{ margin: '0 6px', color: '#a78bfa', fontWeight: 700 }}>↠</span>
                <span style={{ color: '#00d4ff' }}>{'{' + mvd.rhs.join(', ') + '}'}</span>
              </div>
            ))}
          </div>
        )}

        {/* JD info for 5NF */}
        {tab === '5NF' && result.jds?.length > 0 && (
          <div style={{ marginTop: 4 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.07em', marginBottom: 6 }}>
              JOIN DEPENDENCIES
            </p>
            {result.jds.map((jd, i) => (
              <div key={i} style={{ fontFamily: 'Space Grotesk, monospace', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 3 }}>
                ⋈ {'{' + jd.components.map(c => c.join(', ')).join('} , {') + '}'}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
