import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Shield, 
  BarChart3, 
  Zap, 
  Box, 
  Network, 
  Database, 
  AlertTriangle, 
  Download,
  ArrowUpRight,
  Activity,
  Lock,
  Globe,
  Clock,
  ChevronRight
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { apiClient, API_ROUTES, ReportSummary } from '@/src/lib/api';
import { cn, formatDuration, getScoreColor } from '@/src/lib/utils';
import { format } from 'date-fns';

export default function SummaryPage() {
  const { domain } = useParams<{ domain: string }>();
  const navigate = useNavigate();

  const { data: report, isLoading } = useQuery({
    queryKey: ['report', domain],
    queryFn: async () => {
      const response = await apiClient.get<ReportSummary>(API_ROUTES.getReportSummary(domain!));
      return response.data;
    },
    enabled: !!domain
  });

  if (isLoading || !report) {
    return <div className="animate-pulse space-y-8">
      <div className="h-20 bg-white/5 rounded-xl" />
      <div className="grid grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white/5 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="h-64 bg-white/5 rounded-xl" />
        <div className="h-64 bg-white/5 rounded-xl" />
      </div>
    </div>;
  }

  const gaugeOption = {
    series: [{
      type: 'gauge',
      startAngle: 180,
      endAngle: 0,
      min: 0,
      max: 100,
      splitNumber: 10,
      itemStyle: {
        color: report.enterprise_score >= 80 ? '#10b981' : report.enterprise_score >= 60 ? '#06b6d4' : '#ef4444',
      },
      progress: { show: true, width: 12 },
      pointer: { show: false },
      axisLine: { lineStyle: { width: 12, color: [[1, 'rgba(255,255,255,0.05)']] } },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      detail: {
        offsetCenter: [0, -10],
        valueAnimation: true,
        formatter: '{value}',
        color: '#fff',
        fontSize: 40,
        fontWeight: 'bold',
        fontFamily: 'Space Grotesk'
      },
      data: [{ value: report.enterprise_score }]
    }]
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between bg-charcoal/40 border border-white/5 p-6 rounded-2xl backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-violet-accent/20 rounded-xl flex items-center justify-center">
            <Shield className="text-violet-accent w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-white">{report.requested_domain}</h1>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Scanned {report.scanned_at ? format(new Date(report.scanned_at), 'MMM dd, HH:mm') : 'Unknown'}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Activity className="w-3 h-3" /> Duration: {formatDuration(report.scan_duration_ms)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(`/app/reporting/${domain}`)}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-bold text-white hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export Report
          </button>
          <button 
            onClick={() => navigate(`/app/scanner?domain=${domain}`)}
            className="px-4 py-2 rounded-lg bg-violet-accent hover:bg-violet-600 text-sm font-bold text-white transition-all flex items-center gap-2 glow-violet"
          >
            <Zap className="w-4 h-4" /> Re-scan
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-violet-accent" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Enterprise Score</span>
          <div className="h-32 w-full">
            <ReactECharts option={gaugeOption} style={{ height: '140px', marginTop: '-10px' }} />
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Fleet Average: {report.fleet_average_score}</p>
        </div>

        <div className="glass-card p-6 space-y-4">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Risk Posture</span>
          <div className="flex flex-col gap-1">
            <span className={cn("text-3xl font-display font-bold", 
              report.fleet_risk_level === 'Critical' ? 'text-red-accent' : 
              report.fleet_risk_level === 'High' ? 'text-amber-accent' : 'text-emerald-accent'
            )}>
              {report.fleet_risk_level}
            </span>
            <p className="text-xs text-slate-400">Overall enterprise risk banding</p>
          </div>
          <div className="pt-4 border-t border-white/5">
            <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
              <span>ASSETS ANALYZED</span>
              <span>{report.total_assets_analyzed}</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-accent w-full" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 space-y-4">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Compliance Status</span>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">PCI-DSS Passing</span>
              <span className="text-xs font-bold text-emerald-500">{report.compliance_summary?.pci_dss_passing || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">PCI-DSS Failing</span>
              <span className="text-xs font-bold text-red-500">{report.compliance_summary?.pci_dss_failing || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">OWASP ASVS L3</span>
              <span className="text-xs font-bold text-cyan-accent">{report.compliance_summary?.owasp_asvs_level_3 || 0}</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 space-y-4">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">PQC Readiness</span>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">PQC Not Ready</span>
              <span className="text-xs font-bold text-amber-500">{report.compliance_summary?.pqc_not_ready || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">HNDL Critical</span>
              <span className="text-xs font-bold text-red-500">{report.compliance_summary?.hndl_critical_risk || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">TLS 1.3 Adoption</span>
              <span className="text-xs font-bold text-emerald-500">{report.compliance_summary?.tls13_count || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to={`/app/reports/${domain}/assets`} className="glass-card p-6 group hover:border-violet-accent/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-violet-accent/10 rounded-lg flex items-center justify-center">
              <Database className="text-violet-accent w-5 h-5" />
            </div>
            <ArrowUpRight className="text-slate-600 group-hover:text-violet-accent transition-colors" />
          </div>
          <h3 className="font-bold text-white mb-1">Asset Inventory</h3>
          <p className="text-xs text-slate-500">Full technical breakdown of {report.total_assets_analyzed} subdomains and endpoints.</p>
        </Link>

        <Link to={`/app/cyber-rating/${domain}`} className="glass-card p-6 group hover:border-cyan-accent/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-cyan-accent/10 rounded-lg flex items-center justify-center">
              <BarChart3 className="text-cyan-accent w-5 h-5" />
            </div>
            <ArrowUpRight className="text-slate-600 group-hover:text-cyan-accent transition-colors" />
          </div>
          <h3 className="font-bold text-white mb-1">Cyber Rating</h3>
          <p className="text-xs text-slate-500">Enterprise and subdomain scoring distribution and risk banding.</p>
        </Link>

        <Link to={`/app/pqc-posture/${domain}`} className="glass-card p-6 group hover:border-amber-accent/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-amber-accent/10 rounded-lg flex items-center justify-center">
              <Zap className="text-amber-accent w-5 h-5" />
            </div>
            <ArrowUpRight className="text-slate-600 group-hover:text-amber-accent transition-colors" />
          </div>
          <h3 className="font-bold text-white mb-1">PQC Posture</h3>
          <p className="text-xs text-slate-500">Post-quantum readiness analytics and HNDL threat horizon.</p>
        </Link>

        <Link to={`/app/cbom/${domain}`} className="glass-card p-6 group hover:border-emerald-accent/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-emerald-accent/10 rounded-lg flex items-center justify-center">
              <Box className="text-emerald-accent w-5 h-5" />
            </div>
            <ArrowUpRight className="text-slate-600 group-hover:text-emerald-accent transition-colors" />
          </div>
          <h3 className="font-bold text-white mb-1">CBOM Intelligence</h3>
          <p className="text-xs text-slate-500">Cryptographic Bill of Materials and algorithm inventory.</p>
        </Link>

        <Link to={`/app/discovery/${domain}`} className="glass-card p-6 group hover:border-violet-accent/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-violet-accent/10 rounded-lg flex items-center justify-center">
              <Network className="text-violet-accent w-5 h-5" />
            </div>
            <ArrowUpRight className="text-slate-600 group-hover:text-violet-accent transition-colors" />
          </div>
          <h3 className="font-bold text-white mb-1">Discovery Graph</h3>
          <p className="text-xs text-slate-500">Visual attack surface mapping and asset relationship graph.</p>
        </Link>

        <Link to={`/app/vulnerabilities/${domain}`} className="glass-card p-6 group hover:border-red-accent/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-red-accent/10 rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-red-accent w-5 h-5" />
            </div>
            <ArrowUpRight className="text-slate-600 group-hover:text-red-accent transition-colors" />
          </div>
          <h3 className="font-bold text-white mb-1">Vulnerability Priority</h3>
          <p className="text-xs text-slate-500">Highest priority fixes and remediation recommendations.</p>
        </Link>
      </div>

      {/* Asset Breakdown */}
      <div className="glass-card p-8">
        <h3 className="text-lg font-bold text-white mb-6">Asset Classification Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Elite PQC</span>
            <div className="text-2xl font-display font-bold text-white">{report.asset_breakdown?.elite_pqc_hardened || 0}</div>
            <div className="h-1 bg-emerald-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${((report.asset_breakdown?.elite_pqc_hardened || 0) / (report.total_assets_analyzed || 1)) * 100}%` }} />
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-cyan-accent uppercase tracking-widest">Standard Modern</span>
            <div className="text-2xl font-display font-bold text-white">{report.asset_breakdown?.standard_modern || 0}</div>
            <div className="h-1 bg-cyan-accent/20 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-accent" style={{ width: `${((report.asset_breakdown?.standard_modern || 0) / (report.total_assets_analyzed || 1)) * 100}%` }} />
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-amber-accent uppercase tracking-widest">Legacy At Risk</span>
            <div className="text-2xl font-display font-bold text-white">{report.asset_breakdown?.legacy_at_risk || 0}</div>
            <div className="h-1 bg-amber-accent/20 rounded-full overflow-hidden">
              <div className="h-full bg-amber-accent" style={{ width: `${((report.asset_breakdown?.legacy_at_risk || 0) / (report.total_assets_analyzed || 1)) * 100}%` }} />
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-red-accent uppercase tracking-widest">Critical</span>
            <div className="text-2xl font-display font-bold text-white">{report.asset_breakdown?.critical || 0}</div>
            <div className="h-1 bg-red-accent/20 rounded-full overflow-hidden">
              <div className="h-full bg-red-accent" style={{ width: `${((report.asset_breakdown?.critical || 0) / (report.total_assets_analyzed || 1)) * 100}%` }} />
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CDN Protected</span>
            <div className="text-2xl font-display font-bold text-white">{report.asset_breakdown?.cdn_protected || 0}</div>
            <div className="h-1 bg-slate-400/20 rounded-full overflow-hidden">
              <div className="h-full bg-slate-400" style={{ width: `${((report.asset_breakdown?.cdn_protected || 0) / (report.total_assets_analyzed || 1)) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
