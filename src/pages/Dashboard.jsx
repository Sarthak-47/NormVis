import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Download, ChevronLeft, ChevronRight, Cpu } from 'lucide-react';
import ParticleBackground from '../components/ui/ParticleBackground.jsx';
import LiquidEther from '../components/ui/LiquidEther.jsx';
import GlassCard from '../components/ui/GlassCard.jsx';
import NeonButton from '../components/ui/NeonButton.jsx';
import GravityToggle from '../components/ui/GravityToggle.jsx';
import SchemaInput from '../components/input/SchemaInput.jsx';
import NormalizationTabs from '../components/visualization/NormalizationTabs.jsx';
import NormStepView from '../components/visualization/NormStepView.jsx';
import ExplanationPanel from '../components/explanation/ExplanationPanel.jsx';
import { api } from '../lib/api.js';

const EXAMPLE_SCHEMA = {
  name: 'R',
  attributes: ['A', 'B', 'C', 'D', 'E'],
  fds: [
    { lhs: ['A', 'B'], rhs: ['C'] },
    { lhs: ['C'], rhs: ['D'] },
    { lhs: ['D'], rhs: ['E'] },
    { lhs: ['A'], rhs: ['B'] },
  ],
  mvds: [{ lhs: ['A'], rhs: ['B'] }],
  jds: [],
};

const ETHER_COLORS = ['#5227FF', '#FF9FFC', '#00d4ff'];

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [gravityMode, setGravityMode] = useState(false);
  const [activeTab, setActiveTab] = useState('1NF');
  const [schema, setSchema] = useState(null);
  const [results, setResults] = useState(null);
  const [decompositions, setDecompositions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [loadKey, setLoadKey] = useState(0); // force SchemaInput re-mount

  useEffect(() => {
    if (searchParams.get('example') === 'true') {
      handleNormalize(EXAMPLE_SCHEMA);
    }
  }, []);

  const handleNormalize = async (schemaData) => {
    setIsLoading(true);
    setSchema(schemaData);
    try {
      await new Promise(r => setTimeout(r, 400)); // Small delay for UX
      const { results: r, decompositions: d } = await api.normalize(schemaData);
      setResults(r);
      setDecompositions(d);
      setActiveTab('1NF');
    } catch (err) {
      console.error('Normalization error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const exportResults = () => {
    if (!results || !schema) return;
    const lines = [
      `NormViz Export — ${new Date().toLocaleString()}`,
      `${'='.repeat(50)}`,
      `Relation: ${schema.name}(${schema.attributes.join(', ')})`,
      `\nFunctional Dependencies:`,
      ...schema.fds.map(fd => `  ${fd.lhs.join(', ')} → ${fd.rhs.join(', ')}`),
      schema.mvds?.length ? `\nMulti-Valued Dependencies:` : '',
      ...(schema.mvds || []).map(m => `  ${m.lhs.join(', ')} ↠ ${m.rhs.join(', ')}`),
      `\n${'='.repeat(50)}`,
      `NORMALIZATION RESULTS:`,
      ...Object.entries(results).map(([nf, r]) =>
        `\n[${nf}] ${r.satisfied ? '✓ SATISFIED' : '✗ VIOLATED'}\n${r.explanation}\n${r.violations?.map(v => `  • ${v.reason}`).join('\n') || ''}`
      ),
    ];
    const blob = new Blob([lines.filter(Boolean).join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'normviz-results.txt';
    a.click(); URL.revokeObjectURL(url);
  };

  const TABS_ORDER = ['1NF', '2NF', '3NF', 'BCNF', '4NF', '5NF'];

  return (
    <div
      className={`space-bg ${gravityMode ? 'gravity-mode' : ''}`}
      style={{ minHeight: '100vh', position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.4 }}>
        <LiquidEther 
          colors={ETHER_COLORS}
          autoIntensity={1.5}
          autoSpeed={0.3}
        />
      </div>
      <ParticleBackground />

      {/* Top Nav */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{
          position: 'relative', zIndex: 10,
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(5,8,22,0.8)', backdropFilter: 'blur(20px)',
          padding: '0 24px', height: 58,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        {/* Left: Logo */}
        <div className="flex items-center gap-4">
          <NeonButton size="sm" variant="ghost" onClick={() => navigate('/')} icon={Home}>
            Home
          </NeonButton>
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em' }}>
            <span className="gradient-text">Norm</span>
            <span style={{ color: 'rgba(255,255,255,0.9)' }}>Viz</span>
          </span>
          {schema && (
            <span style={{
              fontFamily: 'Space Grotesk, monospace', fontSize: 13, fontWeight: 600,
              color: 'rgba(255,255,255,0.4)', letterSpacing: '0.02em'
            }}>
              / {schema.name}({schema.attributes.join(', ')})
            </span>
          )}
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-4">
          <GravityToggle gravityMode={gravityMode} onToggle={() => setGravityMode(p => !p)} />
          {results && (
            <NeonButton size="sm" variant="ghost" icon={Download} onClick={exportResults}>
              Export
            </NeonButton>
          )}
          {isLoading && (
            <div className="flex items-center gap-2">
              <Cpu size={14} color="#00d4ff" style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: 12, color: '#00d4ff' }}>Analyzing...</span>
            </div>
          )}
        </div>
      </motion.header>

      {/* Three-panel layout */}
      <div style={{
        flex: 1, display: 'flex', gap: 0,
        position: 'relative', zIndex: 2,
        overflow: 'hidden', height: 'calc(100vh - 58px)'
      }}>
        {/* LEFT PANEL — Input */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.div
              key="sidebar"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 35 }}
              style={{
                flexShrink: 0, overflow: 'hidden',
                borderRight: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div style={{
                width: 340, height: '100%',
                overflowY: 'auto', padding: 20,
                background: 'rgba(5,8,22,0.6)', backdropFilter: 'blur(20px)',
              }} className="custom-scroll">
                <SchemaInput onNormalize={handleNormalize} isLoading={isLoading} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(p => !p)}
          style={{
            position: 'absolute', left: sidebarOpen ? 340 : 0, top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 20, background: 'rgba(0,212,255,0.15)',
            border: '1px solid rgba(0,212,255,0.3)', borderLeft: 'none',
            borderRadius: '0 8px 8px 0', padding: '10px 4px', cursor: 'pointer',
            color: '#00d4ff', transition: 'left 0.3s',
          }}
        >
          {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        {/* CENTER PANEL — Visualization */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '20px' }}>
          {/* Tabs */}
          {results && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ marginBottom: 16 }}
            >
              <NormalizationTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                results={results}
              />
            </motion.div>
          )}

          {/* Norm Step View */}
          <div style={{
            flex: 1, overflowY: 'auto',
            background: 'rgba(5,8,22,0.5)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 16, padding: 24,
          }} className="custom-scroll">
            {!results && !isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ textAlign: 'center', marginTop: 80 }}
              >
                <motion.div
                  className="animate-float-2"
                  style={{ fontSize: 64, marginBottom: 20 }}
                >
                  🗄️
                </motion.div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
                  Ready to Normalize
                </h3>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.25)', maxWidth: 320, margin: '0 auto' }}>
                  Enter your relation schema and functional dependencies, then click <span style={{ color: '#00d4ff' }}>Normalize</span> to begin.
                </p>
              </motion.div>
            )}

            {isLoading && (
              <div style={{ textAlign: 'center', marginTop: 80 }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                  style={{ display: 'inline-block', marginBottom: 16 }}
                >
                  <Cpu size={48} color="#00d4ff" />
                </motion.div>
                <p style={{ color: '#00d4ff', fontSize: 16, fontWeight: 600 }}>Analyzing Schema...</p>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 6 }}>Computing closures, keys, and violations</p>
              </div>
            )}

            {results && !isLoading && (
              <NormStepView
                tab={activeTab}
                result={results[activeTab]}
                decomposition={decompositions?.[activeTab]}
                schema={schema}
                animate={!gravityMode}
              />
            )}
          </div>

          {/* Tab navigation arrows */}
          {results && (
            <div className="flex justify-between items-center" style={{ marginTop: 12 }}>
              <NeonButton
                size="sm" variant="ghost" icon={ChevronLeft}
                disabled={TABS_ORDER.indexOf(activeTab) === 0}
                onClick={() => setActiveTab(TABS_ORDER[TABS_ORDER.indexOf(activeTab) - 1])}
              >
                Previous
              </NeonButton>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
                {TABS_ORDER.indexOf(activeTab) + 1} / {TABS_ORDER.length}
              </span>
              <NeonButton
                size="sm" variant="cyan" icon={ChevronRight}
                disabled={TABS_ORDER.indexOf(activeTab) === TABS_ORDER.length - 1}
                onClick={() => setActiveTab(TABS_ORDER[TABS_ORDER.indexOf(activeTab) + 1])}
              >
                Next
              </NeonButton>
            </div>
          )}
        </div>

        {/* RIGHT PANEL — Explanation */}
        <AnimatePresence initial={false}>
          {rightOpen && (
            <motion.div
              key="right"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 35 }}
              style={{
                flexShrink: 0, overflow: 'hidden',
                borderLeft: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div style={{
                width: 300, height: '100%', overflowY: 'auto',
                padding: 20,
                background: 'rgba(5,8,22,0.6)', backdropFilter: 'blur(20px)',
              }} className="custom-scroll">
                <ExplanationPanel
                  schema={schema}
                  results={results}
                  activeTab={activeTab}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right panel toggle */}
        <button
          onClick={() => setRightOpen(p => !p)}
          style={{
            position: 'absolute', right: rightOpen ? 300 : 0, top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 20, background: 'rgba(124,58,237,0.15)',
            border: '1px solid rgba(124,58,237,0.3)', borderRight: 'none',
            borderRadius: '8px 0 0 8px', padding: '10px 4px', cursor: 'pointer',
            color: '#a78bfa', transition: 'right 0.3s',
          }}
        >
          {rightOpen ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>
    </div>
  );
}
