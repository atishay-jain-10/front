import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, Stars, PerspectiveCamera } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Shield, Zap, Globe, Cpu, ArrowRight, Terminal as TerminalIcon, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';

function CyberGlobe() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
      meshRef.current.rotation.x += 0.001;
    }
  });

  return (
    <group>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <Sphere ref={meshRef} args={[1, 64, 64]}>
          <MeshDistortMaterial
            color="#8b5cf6"
            speed={2}
            distort={0.3}
            radius={1}
            wireframe
            opacity={0.4}
            transparent
          />
        </Sphere>
      </Float>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.5, 0.01, 16, 100]} />
        <meshBasicMaterial color="#06b6d4" opacity={0.2} transparent />
      </mesh>
      <mesh rotation={[0, Math.PI / 4, 0]}>
        <torusGeometry args={[1.8, 0.005, 16, 100]} />
        <meshBasicMaterial color="#8b5cf6" opacity={0.1} transparent />
      </mesh>
    </group>
  );
}

function TerminalSimulation() {
  const [lines, setLines] = useState<string[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);

  const logs = [
    "Initializing QuantumShield Scanner v4.2.0...",
    "Loading PQC Readiness Engine [NIST FIPS 203/204]...",
    "Connecting to Global Asset Discovery Network...",
    "Scanning cryptographic surface: example.com",
    "Detected: TLS 1.3, Hybrid KEX (X25519 + Kyber768)",
    "Analyzing HNDL Risk: Harvest Now, Decrypt Later...",
    "CBOM Generation in progress...",
    "Risk Score Calculated: 94/100 (Elite)",
    "Scan Complete. Surfacing findings...",
  ];

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < logs.length) {
        setLines(prev => [...prev, logs[i]]);
        i++;
      } else {
        setLines([]);
        i = 0;
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div className="bg-black/80 border border-violet-accent/30 rounded-lg p-4 font-mono text-xs text-violet-accent/80 h-64 overflow-hidden shadow-2xl">
      <div className="flex items-center gap-2 mb-3 border-b border-violet-accent/20 pb-2">
        <div className="w-2 h-2 rounded-full bg-red-500" />
        <div className="w-2 h-2 rounded-full bg-amber-500" />
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
        <span className="ml-2 text-[10px] uppercase tracking-widest opacity-50">QuantumShield Terminal</span>
      </div>
      <div ref={terminalRef} className="space-y-1">
        {lines.map((line, idx) => (
          <div key={idx} className="flex gap-2">
            <span className="text-cyan-accent opacity-50">[{new Date().toLocaleTimeString()}]</span>
            <span className={idx === lines.length - 1 ? "animate-pulse" : ""}>{line}</span>
          </div>
        ))}
        <div className="flex gap-2">
          <span className="text-cyan-accent opacity-50">[{new Date().toLocaleTimeString()}]</span>
          <span className="animate-pulse">_</span>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [domain, setDomain] = useState("");

  const handleStartScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (domain) {
      navigate(`/app/scanner?domain=${domain}`);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-obsidian/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-accent rounded-lg flex items-center justify-center glow-violet">
              <Shield className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-display font-bold tracking-tighter text-white">QUANTUM<span className="text-violet-accent">SHIELD</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Platform</a>
            <a href="#solutions" className="hover:text-white transition-colors">Solutions</a>
            <a href="#pqc" className="hover:text-white transition-colors">PQC Readiness</a>
            <button onClick={() => navigate('/app/reports')} className="px-5 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-white">
              Dashboard
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative h-screen flex items-center pt-20">
        <div className="absolute inset-0 z-0">
          <Canvas>
            <PerspectiveCamera makeDefault position={[0, 0, 5]} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <CyberGlobe />
          </Canvas>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-accent/10 border border-violet-accent/20 text-violet-accent text-xs font-bold uppercase tracking-widest mb-6">
              <Zap className="w-3 h-3" /> Post-Quantum Readiness Platform
            </div>
            <h1 className="text-6xl lg:text-8xl font-display font-bold leading-[0.9] text-white mb-6">
              SECURE THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-accent to-cyan-accent">FUTURE</span> OF CRYPTO.
            </h1>
            <p className="text-lg text-slate-400 max-w-xl mb-10 leading-relaxed">
              QuantumShield provides enterprise-grade cryptographic intelligence, CBOM visibility, and HNDL risk mitigation for the post-quantum era.
            </p>

            <form onSubmit={handleStartScan} className="flex flex-col sm:flex-row gap-3 p-2 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl max-w-lg">
              <div className="flex-1 flex items-center gap-3 px-4 py-3">
                <Globe className="text-slate-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Enter enterprise domain..."
                  className="bg-transparent border-none outline-none text-white w-full placeholder:text-slate-600"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                />
              </div>
              <button type="submit" className="bg-violet-accent hover:bg-violet-600 text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 glow-violet">
                Start Scan <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            
            <div className="mt-8 flex items-center gap-6">
              <button onClick={() => navigate('/app/reports')} className="text-sm font-bold text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
                View Sample Reports <ArrowRight className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-white/10" />
              <button className="text-sm font-bold text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
                Download CBOM Spec <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:block"
          >
            <TerminalSimulation />
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card p-8 group hover:border-violet-accent/50 transition-all">
              <div className="w-12 h-12 bg-violet-accent/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Cpu className="text-violet-accent w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Enterprise Cyber Rating</h3>
              <p className="text-slate-400 leading-relaxed">
                Calculate real-time risk scores across your entire domain fleet using our proprietary Rust-based analysis engine.
              </p>
            </div>
            <div className="glass-card p-8 group hover:border-cyan-accent/50 transition-all">
              <div className="w-12 h-12 bg-cyan-accent/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="text-cyan-accent w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">PQC Readiness Posture</h3>
              <p className="text-slate-400 leading-relaxed">
                Assess your vulnerability to Shor's algorithm and identify assets requiring immediate post-quantum migration.
              </p>
            </div>
            <div className="glass-card p-8 group hover:border-emerald-accent/50 transition-all">
              <div className="w-12 h-12 bg-emerald-accent/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Search className="text-emerald-accent w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">CBOM Intelligence</h3>
              <p className="text-slate-400 leading-relaxed">
                Generate full Cryptographic Bill of Materials (CBOM) to track every algorithm, key, and certificate in your stack.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
            <Shield className="text-violet-accent w-6 h-6" />
            <span className="text-lg font-display font-bold text-white">QUANTUMSHIELD</span>
          </div>
          <div className="flex gap-10 text-sm text-slate-500">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">API Documentation</a>
            <a href="#" className="hover:text-white">Contact Sales</a>
          </div>
          <p className="text-xs text-slate-600">© 2026 QuantumShield Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
