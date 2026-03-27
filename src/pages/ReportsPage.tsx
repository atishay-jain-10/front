import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  ArrowRight, 
  Calendar, 
  Clock, 
  Shield, 
  BarChart3,
  ChevronRight,
  Filter,
  Download,
  AlertTriangle
} from 'lucide-react';
import { apiClient, API_ROUTES, ReportSummary } from '@/src/lib/api';
import { cn, formatDuration, getScoreColor } from '@/src/lib/utils';
import { format } from 'date-fns';

export default function ReportsPage() {
  const navigate = useNavigate();
  const { data: reports, isLoading, error } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const response = await apiClient.get<ReportSummary[]>(API_ROUTES.listReports({ limit: 50 }));
      // Ensure we return an array even if the API structure differs
      const data = response.data;
      const reportsArray = Array.isArray(data) ? data : (data as any)?.reports;
      return Array.isArray(reportsArray) ? reportsArray : [];
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 w-48 bg-white/5 rounded-lg" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-24 bg-white/5 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-12 text-center glass-card border-red-500/20">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="text-red-500 w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Failed to load reports</h3>
        <p className="text-slate-400 mb-6">{(error as Error).message || 'An unexpected error occurred while fetching security reports.'}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const reportsList = Array.isArray(reports) ? reports : [];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-display font-bold text-white">Security Reports</h1>
          <p className="text-slate-400">Manage and review post-quantum readiness assessments for your enterprise domains.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Filter by domain..."
              className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-violet-accent"
            />
          </div>
          <button className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/2">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Domain</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cyber Rating</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Assets</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Risk Level</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Scanned At</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {reportsList.map((report) => (
                <tr 
                  key={report.risk_report_id}
                  onClick={() => navigate(`/app/reports/${report.requested_domain}`)}
                  className="group hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-accent/10 flex items-center justify-center group-hover:bg-violet-accent/20 transition-colors">
                        <Shield className="text-violet-accent w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">{report.requested_domain}</span>
                        <span className="text-[10px] text-slate-500">Job ID: {report.scan_job_id?.slice(0, 8) || 'Unknown'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-lg font-display font-bold", getScoreColor(report.enterprise_score))}>
                        {report.enterprise_score}
                      </span>
                      <div className="w-12 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full", report.enterprise_score >= 70 ? "bg-emerald-500" : "bg-amber-500")} 
                          style={{ width: `${report.enterprise_score}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-300">{report.total_assets_analyzed} Assets</span>
                      <span className="text-[10px] text-slate-500">Duration: {formatDuration(report.scan_duration_ms)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className={cn(
                      "inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                      report.fleet_risk_level === 'Critical' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                      report.fleet_risk_level === 'High' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                      "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                    )}>
                      {report.fleet_risk_level}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-300">{report.scanned_at ? format(new Date(report.scanned_at), 'MMM dd, yyyy') : 'Unknown'}</span>
                      <span className="text-[10px] text-slate-500">{report.scanned_at ? format(new Date(report.scanned_at), 'HH:mm:ss') : ''}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {reportsList.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                        <FileText className="text-slate-600 w-8 h-8" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-white">No reports found</h3>
                        <p className="text-sm text-slate-500">Run your first scan to generate a security report.</p>
                      </div>
                      <button 
                        onClick={() => navigate('/app/scanner')}
                        className="px-6 py-2 rounded-lg bg-violet-accent hover:bg-violet-600 text-white text-sm font-bold transition-all glow-violet"
                      >
                        Start Scanner
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
