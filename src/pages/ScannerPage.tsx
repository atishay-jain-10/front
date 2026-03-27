import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Zap, 
  Globe, 
  Cpu, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Settings2,
  ChevronRight,
  Terminal as TerminalIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient, API_ROUTES, ScanJobResponse, JobStatus } from '@/src/lib/api';
import { cn } from '@/src/lib/utils';

export default function ScannerPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [domain, setDomain] = useState(searchParams.get('domain') || "");
  const [isScanning, setIsScanning] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<ScanJobResponse | null>(null);
  
  // Config
  const [config, setConfig] = useState({
    deep: true,
    default: false,
    testssl: true,
    testssl_max: 1,
    ports: "443,8443"
  });

  const quickPorts = ["80", "443", "8080", "8443"];

  const handleStartScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain) return;

    setIsScanning(true);
    try {
      const response = await apiClient.post<ScanJobResponse>(API_ROUTES.startScan, {
        domain,
        ...config
      });
      setJobId(response.data.job_id);
      setJobStatus(response.data);
    } catch (error) {
      console.error("Failed to start scan:", error);
      setIsScanning(false);
    }
  };

  // Polling
  useEffect(() => {
    if (!jobId || jobStatus?.status === 'completed' || jobStatus?.status === 'failed') return;

    const interval = setInterval(async () => {
      try {
        const response = await apiClient.get<ScanJobResponse>(API_ROUTES.getScanByJobId(jobId));
        setJobStatus(response.data);
        
        if (response.data.status === 'completed') {
          clearInterval(interval);
          setTimeout(() => navigate(`/app/reports/${domain}`), 2000);
        } else if (response.data.status === 'failed') {
          clearInterval(interval);
          setIsScanning(false);
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [jobId, jobStatus?.status, domain, navigate]);

  const getStatusIcon = (status: JobStatus) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="text-emerald-500 w-5 h-5" />;
      case 'failed': return <AlertCircle className="text-red-500 w-5 h-5" />;
      case 'running': return <Loader2 className="text-violet-accent w-5 h-5 animate-spin" />;
      default: return <Clock className="text-slate-500 w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-display font-bold text-white">Quantum Scanner</h1>
        <p className="text-slate-400">Initiate a post-quantum readiness and cryptographic exposure scan for any enterprise domain.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleStartScan} className="glass-card p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Target Domain</label>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="e.g. enterprise.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-violet-accent transition-colors"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    disabled={isScanning}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isScanning || !domain}
                  className={cn(
                    "px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2",
                    isScanning || !domain 
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                      : "bg-violet-accent hover:bg-violet-600 text-white glow-violet"
                  )}
                >
                  {isScanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                  {isScanning ? "Scanning..." : "Start Scan"}
                </button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">Deep Scan</span>
                    <span className="text-[10px] text-slate-500">Recursive subdomain discovery</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={config.deep} 
                    onChange={e => setConfig(prev => ({ ...prev, deep: e.target.checked }))}
                    className="accent-violet-accent"
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">Default Ports</span>
                    <span className="text-[10px] text-slate-500">Only scan standard web ports</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={config.default} 
                    onChange={e => setConfig(prev => ({ ...prev, default: e.target.checked, ports: e.target.checked ? "" : prev.ports }))}
                    className="accent-violet-accent"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">TestSSL Analysis</span>
                    <span className="text-[10px] text-slate-500">Deep TLS/Cipher suite audit</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={config.testssl} 
                    onChange={e => setConfig(prev => ({ ...prev, testssl: e.target.checked }))}
                    className="accent-violet-accent"
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">TestSSL Max</span>
                    <span className="text-[10px] text-slate-500">Max assets for deep audit</span>
                  </div>
                  <input 
                    type="number" 
                    min="1"
                    max="10"
                    value={config.testssl_max}
                    onChange={e => setConfig(prev => ({ ...prev, testssl_max: parseInt(e.target.value) }))}
                    className="w-12 bg-transparent text-right text-sm font-bold text-violet-accent focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className={cn("space-y-3 transition-opacity", config.default ? "opacity-30 pointer-events-none" : "opacity-100")}>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Custom Ports</label>
              <div className="flex flex-wrap gap-2">
                {quickPorts.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setConfig(prev => ({ ...prev, ports: prev.ports.includes(p) ? prev.ports.split(',').filter(x => x !== p).join(',') : [...prev.ports.split(',').filter(x => x), p].join(',') }))}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-xs font-bold border transition-all",
                      config.ports.split(',').includes(p)
                        ? "bg-violet-accent/20 border-violet-accent text-violet-accent"
                        : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                    )}
                  >
                    {p}
                  </button>
                ))}
                <input
                  type="text"
                  placeholder="Custom (e.g. 80,443,8443)"
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-1.5 text-xs text-white focus:outline-none focus:border-violet-accent"
                  value={config.ports}
                  onChange={e => setConfig(prev => ({ ...prev, ports: e.target.value }))}
                />
              </div>
            </div>
          </form>

          {/* Status Timeline */}
          <AnimatePresence>
            {jobStatus && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-accent/10 flex items-center justify-center">
                      <TerminalIcon className="text-violet-accent w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Scan Job: {jobStatus.job_id?.slice(0, 8) || 'Unknown'}</h3>
                      <p className="text-xs text-slate-500">Target: {jobStatus.domain}</p>
                    </div>
                  </div>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                    jobStatus.status === 'completed' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                    jobStatus.status === 'failed' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                    "bg-violet-accent/10 text-violet-accent border-violet-accent/20"
                  )}>
                    {jobStatus.status}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Assets Found</span>
                    <span className="text-xl font-display font-bold text-white">{jobStatus.asset_count}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Summaries</span>
                    <span className="text-xl font-display font-bold text-white">{jobStatus.scan_summary_count}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Risk Reports</span>
                    <span className="text-xl font-display font-bold text-white">{jobStatus.risk_report_count}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 className="text-emerald-500 w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-white">Job Initialized</span>
                        <span className="text-[10px] text-slate-500">{new Date(jobStatus.created_at).toLocaleTimeString()}</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-full" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                      jobStatus.started_at ? "bg-emerald-500/20" : "bg-white/5"
                    )}>
                      {jobStatus.started_at ? <CheckCircle2 className="text-emerald-500 w-4 h-4" /> : <Clock className="text-slate-500 w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className={cn("text-xs font-bold", jobStatus.started_at ? "text-white" : "text-slate-500")}>Scanner Engine Running</span>
                        {jobStatus.started_at && <span className="text-[10px] text-slate-500">{new Date(jobStatus.started_at).toLocaleTimeString()}</span>}
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-violet-accent"
                          animate={{ width: jobStatus.status === 'running' ? '60%' : jobStatus.status === 'completed' ? '100%' : '0%' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                      jobStatus.completed_at ? "bg-emerald-500/20" : "bg-white/5"
                    )}>
                      {jobStatus.completed_at ? <CheckCircle2 className="text-emerald-500 w-4 h-4" /> : <Clock className="text-slate-500 w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className={cn("text-xs font-bold", jobStatus.completed_at ? "text-white" : "text-slate-500")}>Risk Calculation & Finalization</span>
                        {jobStatus.completed_at && <span className="text-[10px] text-slate-500">{new Date(jobStatus.completed_at).toLocaleTimeString()}</span>}
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-emerald-500"
                          animate={{ width: jobStatus.status === 'completed' ? '100%' : '0%' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {jobStatus.error && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                    <AlertCircle className="text-red-500 w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-sm font-bold text-red-500">Scan Failed</span>
                      <p className="text-xs text-red-400/80">{jobStatus.error}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Info */}
        <div className="space-y-6">
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-violet-accent" /> Scanner Intelligence
            </h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">PQC Readiness</span>
                <p className="text-xs text-slate-400 leading-relaxed">Identifies assets using classical cryptography vulnerable to future quantum decryption (HNDL risk).</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">CBOM Generation</span>
                <p className="text-xs text-slate-400 leading-relaxed">Automatically maps all cryptographic libraries, algorithms, and certificate chains detected.</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Compliance Mapping</span>
                <p className="text-xs text-slate-400 leading-relaxed">Maps findings against PCI-DSS 4.0 and OWASP ASVS Level 1-3 standards.</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-accent/20 to-cyan-accent/20 border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white">Need a sample?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">View existing reports to see the depth of QuantumShield's analysis before running your own.</p>
            <button 
              onClick={() => navigate('/app/reports')}
              className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              Browse Reports <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
