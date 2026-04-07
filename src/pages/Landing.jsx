import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Database, Layers, GitBranch, Zap } from 'lucide-react';
import ParticleBackground from '../components/ui/ParticleBackground.jsx';
import LiquidEther from '../components/ui/LiquidEther.jsx';
import NeonButton from '../components/ui/NeonButton.jsx';

const features = [
  { icon: Database, label: '1NF → 5NF', desc: 'All six normal forms with real algorithms', color: '#00d4ff' },
  { icon: GitBranch, label: 'MVD & JD', desc: 'Multi-valued and join dependencies for 4NF & 5NF', color: '#a78bfa' },
  { icon: Layers, label: 'Decomposition', desc: 'Step-by-step table splitting with visual cards', color: '#10b981' },
  { icon: Zap, label: 'Instant', desc: 'Real-time analysis as you type', color: '#f59e0b' },
];

const ETHER_COLORS = ['#285A48', '#408A71', '#B0E4CC'];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="space-bg" style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.6 }}>
        <LiquidEther 
          colors={ETHER_COLORS}
          mouseForce={25}
          cursorSize={120}
          autoSpeed={0.4}
        />
      </div>
      <ParticleBackground />

      {/* Floating orbs */}
      <div style={{
        position: 'absolute', top: '15%', left: '8%',
        width: 320, height: 320, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 1
      }} className="animate-float-2" />
      <div style={{
        position: 'absolute', top: '10%', right: '10%',
        width: 280, height: 280, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,212,255,0.1) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 1
      }} className="animate-float-1" />
      <div style={{
        position: 'absolute', bottom: '15%', right: '15%',
        width: 200, height: 200, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 1
      }} className="animate-float-3" />

      {/* Main content */}
      <div style={{
        position: 'relative', zIndex: 2,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', padding: '40px 24px', textAlign: 'center'
      }}>
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(64,138,113,0.08)', border: '1px solid rgba(64,138,113,0.2)',
            borderRadius: 20, padding: '6px 16px', marginBottom: 32,
            fontSize: 12, fontWeight: 600, color: '#408A71', letterSpacing: '0.08em'
          }}
          className="animate-float-1"
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#408A71', boxShadow: '0 0 8px #408A71', display: 'inline-block' }} />
          DATABASE NORMALIZATION VISUALIZER
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.35, type: 'spring', stiffness: 200 }}
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: 'clamp(56px, 10vw, 110px)',
            fontWeight: 900,
            lineHeight: 1,
            marginBottom: 20,
            letterSpacing: '-0.03em',
          }}
        >
          <span className="gradient-text">Norm</span>
          <span style={{ color: '#B0E4CC' }}>Viz</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 'clamp(16px, 2.5vw, 22px)',
            color: 'rgba(255,255,255,0.55)',
            maxWidth: 540,
            lineHeight: 1.6,
            marginBottom: 48,
            fontWeight: 400,
          }}
        >
          Visualize Database Normalization{' '}
          <span style={{ color: '#408A71', fontWeight: 600 }}>Like Never Before</span>
          <br />
          <span style={{ fontSize: '0.8em', color: 'rgba(255,255,255,0.35)' }}>
            1NF → 2NF → 3NF → BCNF → 4NF → 5NF
          </span>
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="flex gap-4 flex-wrap justify-center"
          style={{ marginBottom: 80 }}
        >
          <motion.div className="animate-pulse-glow" style={{ borderRadius: 12 }}>
            <NeonButton
              variant="cyan"
              size="lg"
              onClick={() => navigate('/dashboard')}
              icon={ArrowRight}
            >
              Start Visualizing
            </NeonButton>
          </motion.div>
          <NeonButton
            variant="ghost"
            size="lg"
            onClick={() => navigate('/dashboard?example=true')}
          >
            Load Example
          </NeonButton>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16, maxWidth: 800, width: '100%'
          }}
        >
          {features.map((f, i) => (
            <motion.div
              key={f.label}
              className={`glass animate-float-${(i % 3) + 1}`}
              whileHover={{ y: -8, borderColor: `${f.color}44`, boxShadow: `0 0 30px ${f.color}22` }}
              style={{ padding: '20px 18px', cursor: 'default', textAlign: 'left', transition: 'border-color 0.3s' }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 9,
                background: `${f.color}18`, border: `1px solid ${f.color}33`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 12
              }}>
                <f.icon size={17} color={f.color} />
              </div>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginBottom: 4 }}>{f.label}</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* NF tags row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="flex gap-2 flex-wrap justify-center"
          style={{ marginTop: 48 }}
        >
          {['1NF', '2NF', '3NF', 'BCNF', '4NF', '5NF'].map((nf, i) => (
            <motion.span
              key={nf}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1 + i * 0.07 }}
              whileHover={{ scale: 1.15, y: -4 }}
              style={{
                fontFamily: 'Space Grotesk, monospace',
                padding: '4px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.4)',
                cursor: 'default',
              }}
            >
              {nf}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
