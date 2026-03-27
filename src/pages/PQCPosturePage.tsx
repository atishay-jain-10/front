import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Zap, 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  Activity,
  Cpu,
  Lock,
  ArrowRight,
  Info,
  History
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { apiClient, API_ROUTES, ReportSummary, AssetSummary } from '@/src/lib/api';
import { cn } from '@/src/lib/utils';

export default function PQCPosturePage() {
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

  const hndlHeatmapOption = {
    backgroundColor: 'transparent',
    tooltip: { position: 'top' },
    grid: { height: '50%', top: '10%' },
    xAxis: {
      type: 'category',
      data: ['Low', 'Medium', 'High', 'Critical'],
      splitArea: { show: true },
      axisLabel: { color: '#64748b' }
    },
    yAxis: {
      type: 'category',
      data: ['Threat'],
      splitArea: { show: true },
      axisLabel: { show: false }
    },
    visualMap: {
      min: 0,
      max: assets.length,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '15%',
      inRange: { color: ['#10b981', '#f59e0b', '#ef4444'] }
    },
    series: [{
      name: 'HNDL Risk',
      type: 'heatmap',
      data: [
        [0, 0, assets.filter(a => a.hndl_risk?.level === 'Low').length],
        [1, 0, assets.filter(a => a.hndl_risk?.level === 'Medium').length],
        [2, 0, assets.filter(a => a.hndl_risk?.level === 'High').length],
        [3, 0, assets.filter(a => a.hndl_risk?.level === 'Critical').length],
      ],
      label: { show: true, color: '#fff' },
      emphasis: {
        itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' }
      }
    }]
  };

  const readinessDonutOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: ['60%', '85%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#141414', borderWidth: 2 },
      label: { show: false },
      data: [
        { value: assets.filter(a => a.pqc_status?.readiness_level === 'Elite').length, name: 'Elite', itemStyle: { color: '#10b981' } },
        { value: assets.filter(a => a.pqc_status?.readiness_level === 'Standard').length, name: 'Standard', itemStyle: { color: '#06b6d4' } },
        { value: assets.filter(a => a.pqc_status?.readiness_level === 'Legacy').length, name: 'Legacy', itemStyle: { color: '#f59e0b' } },
        { value: assets.filter(a => a.pqc_status?.readiness_level === 'Critical').length, name: 'Critical', itemStyle: { color: '#ef4444' } },
      ]
    }]
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-bold text-violet-accent uppercase tracking-widest">
          <Zap className="w-3 h-3" /> PQC Posture
        </div>
        <h1 className="text-3xl font-display font-bold text-white">Post-Quantum Readiness Analytics</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-8">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-8">HNDL Severity Heat Map</h3>
            <div className="h-64">
              <ReactECharts option={hndlHeatmapOption} style={{ height: '100%' }} />
            </div>
            <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-4">
              <Info className="text-violet-accent w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400 leading-relaxed">
                <span className="font-bold text-white">Harvest Now, Decrypt Later (HNDL):</span> Adversaries are currently collecting encrypted data to decrypt once quantum computers reach sufficient scale. Assets in the "Critical" and "High" bands require immediate PQC migration.
              </p>
            </div>
          </div>

          <div className="glass-card p-8">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Classical-Only Asset Inventory</h3>
            <div className="space-y-4">
              {assets.filter(a => a.hndl_risk?.classical_only).slice(0, 10).map(a => (
                <div key={a.scan_asset_id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded bg-red-500/10 flex items-center justify-center">
                      <AlertTriangle className="text-red-500 w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">{a.domain}</span>
                      <span className="text-[10px] text-slate-500">{a.tls_summary?.cipher_suite || 'Unknown'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest block">Vulnerable</span>
                    <span className="text-xs text-slate-500">RSA Key Exchange</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass-card p-8 space-y-8">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Readiness Distribution</h3>
            <div className="flex flex-col items-center py-6">
              <div className="relative w-48 h-48">
                <ReactECharts option={readinessDonutOption} style={{ height: '100%', width: '100%' }} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-4xl font-display font-bold text-white">
                    {Math.round((assets.filter(a => a.pqc_status?.readiness_level === 'Elite').length / (assets.length || 1)) * 100)}%
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Elite Ready</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-slate-400">Elite Ready</span>
                </div>
                <span className="font-bold text-white">{assets.filter(a => a.pqc_status?.readiness_level === 'Elite').length}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-500" />
                  <span className="text-slate-400">Standard Modern</span>
                </div>
                <span className="font-bold text-white">{assets.filter(a => a.pqc_status?.readiness_level === 'Standard').length}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-slate-400">Legacy At Risk</span>
                </div>
                <span className="font-bold text-white">{assets.filter(a => a.pqc_status?.readiness_level === 'Legacy').length}</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-8 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">NIST FIPS Alignment</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">FIPS 203 (ML-KEM)</span>
                  <CheckCircle2 className="text-emerald-500 w-4 h-4" />
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">Kyber-based key encapsulation mechanism detected in hybrid KEX flows.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">FIPS 204 (ML-DSA)</span>
                  <div className="w-4 h-4 rounded-full border border-slate-700" />
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">Dilithium-based digital signatures not yet detected in certificate chains.</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-4">
            <div className="flex items-center gap-2 text-amber-500">
              <History className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Threat Horizon</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Estimated quantum threat horizon for current classical RSA-2048 assets: <span className="text-white font-bold">2029-2032</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
