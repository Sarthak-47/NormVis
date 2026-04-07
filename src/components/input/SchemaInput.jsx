import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Zap, RotateCcw, ArrowRight, GitBranch } from 'lucide-react';
import NeonButton from '../ui/NeonButton.jsx';

const EXAMPLE_SCHEMA = {
  relation: 'R',
  attributes: 'A, B, C, D, E',
  fds: [
    { lhs: ['A', 'B'], rhs: ['C'] },
    { lhs: ['C'], rhs: ['D'] },
    { lhs: ['D'], rhs: ['E'] },
    { lhs: ['A'], rhs: ['B'] },
  ],
  mvds: [
    { lhs: ['A'], rhs: ['B'] },
  ],
  jds: [],
};

function parseFDString(str) {
  const parts = str.split('->');
  if (parts.length !== 2) return null;
  const lhs = parts[0].split(',').map(s => s.trim()).filter(Boolean);
  const rhs = parts[1].split(',').map(s => s.trim()).filter(Boolean);
  return { lhs, rhs };
}

export default function SchemaInput({ onNormalize, isLoading }) {
  const [relation, setRelation] = useState('R');
  const [attributes, setAttributes] = useState('');
  const [fds, setFds] = useState([{ lhs: '', rhs: '' }]);
  const [mvds, setMvds] = useState([{ lhs: '', rhs: '' }]);
  const [jds, setJds] = useState([{ components: '' }]);
  const [showMvd, setShowMvd] = useState(false);
  const [showJd, setShowJd] = useState(false);
  const [errors, setErrors] = useState({});

  const loadExample = () => {
    setRelation(EXAMPLE_SCHEMA.relation);
    setAttributes(EXAMPLE_SCHEMA.attributes);
    setFds(EXAMPLE_SCHEMA.fds.map(fd => ({ lhs: fd.lhs.join(', '), rhs: fd.rhs.join(', ') })));
    setMvds(EXAMPLE_SCHEMA.mvds.map(m => ({ lhs: m.lhs.join(', '), rhs: m.rhs.join(', ') })));
    setJds([{ components: '' }]);
    setShowMvd(true);
    setErrors({});
  };

  const reset = () => {
    setRelation('R');
    setAttributes('');
    setFds([{ lhs: '', rhs: '' }]);
    setMvds([{ lhs: '', rhs: '' }]);
    setJds([{ components: '' }]);
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};
    const attrList = attributes.split(',').map(s => s.trim()).filter(Boolean);
    if (attrList.length === 0) newErrors.attrs = 'Please enter at least one attribute';
    const validFds = fds.filter(fd => fd.lhs.trim() && fd.rhs.trim());
    if (validFds.length === 0) newErrors.fds = 'Please enter at least one functional dependency';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNormalize = () => {
    if (!validate()) return;
    const attrList = attributes.split(',').map(s => s.trim()).filter(Boolean);
    const parsedFds = fds
      .filter(fd => fd.lhs.trim() && fd.rhs.trim())
      .map(fd => ({
        lhs: fd.lhs.split(',').map(s => s.trim()).filter(Boolean),
        rhs: fd.rhs.split(',').map(s => s.trim()).filter(Boolean),
      }));
    const parsedMvds = showMvd ? mvds
      .filter(m => m.lhs.trim() && m.rhs.trim())
      .map(m => ({
        lhs: m.lhs.split(',').map(s => s.trim()).filter(Boolean),
        rhs: m.rhs.split(',').map(s => s.trim()).filter(Boolean),
      })) : [];
    const parsedJds = showJd ? jds
      .filter(j => j.components.trim())
      .map(j => ({
        components: j.components.split(';').map(c =>
          c.split(',').map(s => s.trim()).filter(Boolean)
        ).filter(c => c.length > 0)
      })) : [];

    onNormalize({
      name: relation || 'R',
      attributes: attrList,
      fds: parsedFds,
      mvds: parsedMvds,
      jds: parsedJds,
    });
  };

  const addFd = () => setFds([...fds, { lhs: '', rhs: '' }]);
  const removeFd = (i) => setFds(fds.filter((_, idx) => idx !== i));
  const updateFd = (i, field, val) => {
    const updated = [...fds];
    updated[i][field] = val;
    setFds(updated);
  };

  const addMvd = () => setMvds([...mvds, { lhs: '', rhs: '' }]);
  const removeMvd = (i) => setMvds(mvds.filter((_, idx) => idx !== i));
  const updateMvd = (i, field, val) => {
    const updated = [...mvds];
    updated[i][field] = val;
    setMvds(updated);
  };

  const addJd = () => setJds([...jds, { components: '' }]);
  const removeJd = (i) => setJds(jds.filter((_, idx) => idx !== i));
  const updateJd = (i, val) => {
    const updated = [...jds];
    updated[i].components = val;
    setJds(updated);
  };

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#408A71', letterSpacing: '0.05em' }}>
            SCHEMA INPUT
          </h2>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
            Define your relation and dependencies
          </p>
        </div>
        <div className="flex gap-2">
          <NeonButton size="sm" variant="ghost" onClick={loadExample} icon={Zap}>Example</NeonButton>
          <NeonButton size="sm" variant="danger" onClick={reset} icon={RotateCcw}>Reset</NeonButton>
        </div>
      </div>
      <div className="neon-divider" />

      {/* Relation name */}
      <div>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 6, letterSpacing: '0.08em' }}>
          RELATION NAME
        </label>
        <input
          className="neon-input"
          value={relation}
          onChange={e => setRelation(e.target.value)}
          placeholder="R"
          style={{ width: '100%' }}
        />
      </div>

      {/* Attributes */}
      <div>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 6, letterSpacing: '0.08em' }}>
          ATTRIBUTES <span style={{ color: 'rgba(255,255,255,0.25)', fontWeight: 400 }}>(comma-separated)</span>
        </label>
        <input
          className="neon-input"
          value={attributes}
          onChange={e => { setAttributes(e.target.value); setErrors(p => ({ ...p, attrs: undefined })); }}
          placeholder="A, B, C, D, E"
        />
        {errors.attrs && (
          <p style={{ fontSize: 11, color: '#f87171', marginTop: 4 }}>{errors.attrs}</p>
        )}
        {attributes && (
          <div className="flex flex-wrap gap-1" style={{ marginTop: 6 }}>
            {attributes.split(',').map(a => a.trim()).filter(Boolean).map(attr => (
              <span key={attr} style={{
                background: 'rgba(64,138,113,0.1)', border: '1px solid rgba(64,138,113,0.25)',
                borderRadius: 5, padding: '2px 8px', fontSize: 12, color: '#B0E4CC', fontFamily: 'Space Grotesk, monospace'
              }}>
                {attr}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Functional Dependencies */}
      <div className="flex-1">
        <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em' }}>
            FUNCTIONAL DEPENDENCIES
          </label>
          <NeonButton size="sm" variant="cyan" onClick={addFd} icon={Plus}>Add FD</NeonButton>
        </div>
        {errors.fds && (
          <p style={{ fontSize: 11, color: '#f87171', marginBottom: 6 }}>{errors.fds}</p>
        )}
        <div className="flex flex-col gap-2" style={{ maxHeight: 200, overflowY: 'auto' }}>
          <AnimatePresence>
            {fds.map((fd, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-2"
              >
                <input
                  className="neon-input"
                  value={fd.lhs}
                  onChange={e => updateFd(i, 'lhs', e.target.value)}
                  placeholder="A, B"
                  style={{ flex: 1 }}
                />
                <div style={{ display: 'flex', alignItems: 'center', color: '#B0E4CC' }}>
                  <ArrowRight size={16} />
                </div>
                <input
                  className="neon-input"
                  value={fd.rhs}
                  onChange={e => updateFd(i, 'rhs', e.target.value)}
                  placeholder="C"
                  style={{ flex: 1 }}
                />
                <motion.button
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => removeFd(i)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(239,68,68,0.6)', padding: 4 }}
                  disabled={fds.length === 1}
                >
                  <Trash2 size={14} />
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* MVD Section */}
      <div>
        <button
          onClick={() => setShowMvd(!showMvd)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            color: showMvd ? '#B0E4CC' : 'rgba(255,255,255,0.4)',
            fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
            marginBottom: showMvd ? 8 : 0, transition: 'color 0.2s'
          }}
        >
          <GitBranch size={12} />
          MVDs FOR 4NF {showMvd ? '▲' : '▼'}
          <span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 400 }}>(optional)</span>
        </button>
        <AnimatePresence>
          {showMvd && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div className="flex flex-col gap-2">
                {mvds.map((mvd, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input className="neon-input" value={mvd.lhs} onChange={e => updateMvd(i, 'lhs', e.target.value)} placeholder="A" style={{ flex: 1 }} />
                    <span style={{ color: '#B0E4CC', fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap' }}>↠</span>
                    <input className="neon-input" value={mvd.rhs} onChange={e => updateMvd(i, 'rhs', e.target.value)} placeholder="B, C" style={{ flex: 1 }} />
                    <motion.button whileHover={{ scale: 1.1 }} onClick={() => removeMvd(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(239,68,68,0.6)', padding: 4 }}>
                      <Trash2 size={14} />
                    </motion.button>
                  </div>
                ))}
                <NeonButton size="sm" variant="ghost" onClick={addMvd} icon={Plus}>Add MVD</NeonButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* JD Section */}
      <div>
        <button
          onClick={() => setShowJd(!showJd)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            color: showJd ? '#408A71' : 'rgba(255,255,255,0.4)',
            fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
            marginBottom: showJd ? 8 : 0, transition: 'color 0.2s'
          }}
        >
          <GitBranch size={12} />
          JOIN DEPENDENCIES FOR 5NF {showJd ? '▲' : '▼'}
          <span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 400 }}>(optional)</span>
        </button>
        <AnimatePresence>
          {showJd && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>
                Format: A,B ; B,C,D (semicolon separates components)
              </p>
              <div className="flex flex-col gap-2">
                {jds.map((jd, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input className="neon-input" value={jd.components} onChange={e => updateJd(i, e.target.value)} placeholder="A,B ; B,C ; A,C" style={{ flex: 1 }} />
                    <motion.button whileHover={{ scale: 1.1 }} onClick={() => removeJd(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(239,68,68,0.6)', padding: 4 }}>
                      <Trash2 size={14} />
                    </motion.button>
                  </div>
                ))}
                <NeonButton size="sm" variant="ghost" onClick={addJd} icon={Plus}>Add JD</NeonButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Normalize Button */}
      <NeonButton
        variant="cyan"
        size="lg"
        onClick={handleNormalize}
        disabled={isLoading}
        icon={Zap}
        className="w-full"
      >
        {isLoading ? 'Analyzing...' : 'Normalize'}
      </NeonButton>
    </div>
  );
}
