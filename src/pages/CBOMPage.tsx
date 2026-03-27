import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Box, 
  Shield, 
  Zap, 
  Lock, 
  FileCode, 
  Download,
  Database,
  Search,
  ChevronRight,
  Info,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { apiClient, API_ROUTES, ReportSummary, AssetSummary } from '@/src/lib/api';
import { cn } from '@/src/lib/utils';

export default function CBOMPage() {
  const { domain } = useParams<{ domain: string }>();

  const { data: report } = useQuery({
    queryKey: ['report', domain],
    queryFn: async () => {
      const response = await apiClient.get<ReportSummary>(API_ROUTES.getReportSummary(domain!));
      return response.data;
    },
    enabled: !!domain
  });

  const { data: assets } = useQuery({
    queryKey: ['assets', domain],
    queryFn: async () => {
      const response = await apiClient.get<AssetSummary[]>(API_ROUTES.getReportAssets(domain!));
      const data = response.data;
      const assetsArray = Array.isArray(data) ? data : (data as any)?.assets;
      return Array.isArray(assetsArray) ? assetsArray : [];
    },
    enabled: !!domain
  });

  if (!report || !assets) return <div className="animate-pulse space-y-8">
    <div className="h-48 bg-white/5 rounded-xl" />
    <div className="grid grid-cols-3 gap-8">
      <div className="col-span-2 h-96 bg-white/5 rounded-xl" />
      <div className="h-96 bg-white/5 rounded-xl" />
    </div>
  </div>;

  const algoOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'value', axisLabel: { show: false }, splitLine: { show: false } },
    yAxis: {
      type: 'category',
      data: ['RSA-2048', 'ECDSA-P256', 'AES-256-GCM', 'Kyber-768', 'X25519'],
      axisLabel: { color: '#64748b', fontSize: 10 },
      axisLine: { show: false }
    },
    series: [{
      name: 'Usage Count',
      type: 'bar',
      data: [45, 32, 88, 12, 54],
      itemStyle: {
        color: (params: any) => {
          const name = params.name;
          if (name.includes('Kyber')) return '#10b981';
          if (name.includes('RSA')) return '#ef4444';
          return '#06b6d4';
        },
        borderRadius: [0, 4, 4, 0]
      }
    }]
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-violet-accent uppercase tracking-widest">
            <Box className="w-3 h-3" /> CBOM Intelligence
          </div>
          <h1 className="text-3xl font-display font-bold text-white">Cryptographic Bill of Materials</h1>
        </div>
        <button 
          onClick={() => window.open(API_ROUTES.getCbom(domain!), '_blank')}
          className="px-6 py-2 rounded-lg bg-violet-accent hover:bg-violet-600 text-white text-sm font-bold transition-all flex items-center gap-2 glow-violet"
        >
          <Download className="w-4 h-4" /> Download CBOM (CycloneDX)
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-8">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-8">Algorithm Inventory Frequency</h3>
            <div className="h-64">
              <ReactECharts option={algoOption} style={{ height: '100%' }} />
            </div>
          </div>

          <div className="glass-card p-8">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Cryptographic Components</h3>
            <div className="space-y-4">
              {assets.slice(0, 10).map(a => (
                <div key={a.scan_asset_id} className="p-4 rounded-xl bg-white/5 border border-white/10 group hover:border-violet-accent/30 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center">
                        <Lock className="text-slate-500 w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-white">{a.domain}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{a.tls_summary?.cipher_suite || 'Unknown'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-600 uppercase">KEX</span>
                      <p className="text-xs text-slate-400">{a.tls_summary?.pqc_hybrid_group || 'X25519'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-600 uppercase">Auth</span>
                      <p className="text-xs text-slate-400">RSA-2048</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-600 uppercase">Encryption</span>
                      <p className="text-xs text-slate-400">AES-256-GCM</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass-card p-8 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">CBOM Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <span className="text-xs text-slate-400">Total Components</span>
                <span className="text-sm font-bold text-white">{assets.length * 3}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <span className="text-xs text-slate-400">Weak Crypto Count</span>
                <span className="text-sm font-bold text-red-500">{assets.filter(a => a.hndl_risk?.level === 'Critical').length}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <span className="text-xs text-slate-400">PQC Ready Count</span>
                <span className="text-sm font-bold text-emerald-500">{assets.filter(a => a.pqc_status?.pqc_detected).length}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <span className="text-xs text-slate-400">HSTS Coverage</span>
                <span className="text-sm font-bold text-cyan-accent">84%</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-8 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">What is a CBOM?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              A Cryptographic Bill of Materials (CBOM) is a specialized SBOM that catalogs all cryptographic assets, including algorithms, certificate chains, and keys. 
            </p>
            <div className="p-4 rounded-xl bg-violet-accent/10 border border-violet-accent/20 flex items-start gap-3">
              <Info className="text-violet-accent w-4 h-4 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-400 leading-relaxed">
                QuantumShield generates CBOMs in CycloneDX format, compatible with enterprise vulnerability management systems.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
