import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart3, 
  Shield, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  Activity,
  ArrowUpRight,
  TrendingUp,
  Target
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { apiClient, API_ROUTES, ReportSummary, AssetSummary } from '@/src/lib/api';
import { cn, getScoreColor } from '@/src/lib/utils';

export default function CyberRatingPage() {
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
    <div className="grid grid-cols-2 gap-8">
      <div className="h-96 bg-white/5 rounded-xl" />
      <div className="h-96 bg-white/5 rounded-xl" />
    </div>
  </div>;

  // Histogram data
  const scoreCounts = new Array(10).fill(0);
  assets.forEach(a => {
    const idx = Math.min(Math.floor(a.global_enterprise_score / 10), 9);
    scoreCounts[idx]++;
  });

  const histogramOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['0-10', '10-20', '20-30', '30-40', '40-50', '50-60', '60-70', '70-80', '80-90', '90-100'],
      axisLabel: { color: '#64748b', fontSize: 10 },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#64748b', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }
    },
    series: [{
      data: scoreCounts,
      type: 'bar',
      itemStyle: {
        color: (params: any) => {
          const score = params.dataIndex * 10;
          if (score >= 80) return '#10b981';
          if (score >= 60) return '#06b6d4';
          if (score >= 40) return '#f59e0b';
          return '#ef4444';
        },
        borderRadius: [4, 4, 0, 0]
      }
    }]
  };

  const classificationOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#141414', borderWidth: 2 },
      label: { show: false },
      data: [
        { value: report.asset_breakdown?.elite_pqc_hardened || 0, name: 'Elite PQC', itemStyle: { color: '#10b981' } },
        { value: report.asset_breakdown?.standard_modern || 0, name: 'Standard', itemStyle: { color: '#06b6d4' } },
        { value: report.asset_breakdown?.legacy_at_risk || 0, name: 'Legacy', itemStyle: { color: '#f59e0b' } },
        { value: report.asset_breakdown?.critical || 0, name: 'Critical', itemStyle: { color: '#ef4444' } },
        { value: report.asset_breakdown?.cdn_protected || 0, name: 'CDN', itemStyle: { color: '#8b5cf6' } },
      ]
    }]
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-bold text-violet-accent uppercase tracking-widest">
          <BarChart3 className="w-3 h-3" /> Cyber Rating
        </div>
        <h1 className="text-3xl font-display font-bold text-white">Enterprise Scoring & Banding</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">Asset Score Distribution</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Safe</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Warning</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Danger</span>
                </div>
              </div>
            </div>
            <div className="h-80">
              <ReactECharts option={histogramOption} style={{ height: '100%' }} />
            </div>
          </div>

          <div className="glass-card p-8">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Subdomain Ranking (Top 10)</h3>
            <div className="space-y-4">
              {[...assets].sort((a, b) => b.global_enterprise_score - a.global_enterprise_score).slice(0, 10).map((a, idx) => (
                <div key={a.scan_asset_id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 group hover:border-violet-accent/30 transition-all">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-slate-600 w-4">{idx + 1}</span>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">{a.domain}</span>
                      <span className="text-[10px] text-slate-500 italic">{a.asset_classification}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className={cn("text-sm font-bold", getScoreColor(a.global_enterprise_score))}>{a.global_enterprise_score}</span>
                      <span className="text-[10px] text-slate-500 block">Rating</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-700 group-hover:text-violet-accent transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass-card p-8 space-y-8">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Enterprise Summary</h3>
            <div className="flex flex-col items-center py-6">
              <div className="relative w-48 h-48">
                <ReactECharts option={classificationOption} style={{ height: '100%', width: '100%' }} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-4xl font-display font-bold text-white">{report.enterprise_score}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Score</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="text-emerald-500 w-5 h-5" />
                  <span className="text-xs text-slate-300">Fleet Average</span>
                </div>
                <span className="text-sm font-bold text-white">{report.fleet_average_score}</span>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Target className="text-cyan-accent w-5 h-5" />
                  <span className="text-xs text-slate-300">Risk Banding</span>
                </div>
                <span className={cn("text-sm font-bold", report.fleet_risk_level === 'Critical' ? 'text-red-500' : 'text-emerald-500')}>
                  {report.fleet_risk_level}
                </span>
              </div>
            </div>
          </div>

          <div className="glass-card p-8 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Classification Legend</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-1 h-10 bg-emerald-500 rounded-full" />
                <div>
                  <span className="text-xs font-bold text-white">Elite PQC Hardened</span>
                  <p className="text-[10px] text-slate-500">Post-quantum algorithms detected and verified.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-1 h-10 bg-cyan-accent rounded-full" />
                <div>
                  <span className="text-xs font-bold text-white">Standard Modern</span>
                  <div className="text-[10px] text-slate-500">TLS 1.3 with forward secrecy enabled.</div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-1 h-10 bg-amber-accent rounded-full" />
                <div>
                  <span className="text-xs font-bold text-white">Legacy At Risk</span>
                  <div className="text-[10px] text-slate-500">Classical-only crypto with HNDL vulnerability.</div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-1 h-10 bg-red-accent rounded-full" />
                <div>
                  <span className="text-xs font-bold text-white">Critical Exposure</span>
                  <div className="text-[10px] text-slate-500">Expired certs or legacy TLS versions.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
