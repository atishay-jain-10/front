import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Download, 
  Mail, 
  FileText, 
  Database, 
  Shield, 
  CheckCircle2, 
  Search,
  ChevronRight,
  FileCode,
  Box,
  Share2
} from 'lucide-react';
import { apiClient, API_ROUTES, ReportSummary, AssetSummary } from '@/src/lib/api';
import { cn } from '@/src/lib/utils';
import { format } from 'date-fns';

export default function ReportingCenterPage() {
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

  const handleDraftEmail = () => {
    const subject = `QuantumShield Security Report for ${domain}`;
    const body = `Hello,

Please find the latest QuantumShield security review summary for ${domain}.

This report includes enterprise cyber rating, PQC readiness posture, HNDL risk indicators, TLS and cipher posture, certificate intelligence, and subdomain-level findings.

Recommended actions and supporting report files can be reviewed from the QuantumShield dashboard and attached downloads.

Regards,
QuantumShield`;
    
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  if (!report || !assets) return <div className="animate-pulse space-y-8">
    <div className="h-48 bg-white/5 rounded-xl" />
    <div className="grid grid-cols-2 gap-8">
      <div className="h-96 bg-white/5 rounded-xl" />
      <div className="h-96 bg-white/5 rounded-xl" />
    </div>
  </div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-bold text-violet-accent uppercase tracking-widest">
          <Download className="w-3 h-3" /> Reporting Center
        </div>
        <h1 className="text-3xl font-display font-bold text-white">Export & Share Intelligence</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-8 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Executive Summary</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Enterprise Score</span>
                <div className="text-2xl font-display font-bold text-white mt-1">{report.enterprise_score}</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Risk Level</span>
                <div className="text-2xl font-display font-bold text-emerald-500 mt-1">{report.fleet_risk_level}</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Assets Analyzed</span>
                <div className="text-2xl font-display font-bold text-white mt-1">{report.total_assets_analyzed}</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Compliance</span>
                <div className="text-2xl font-display font-bold text-cyan-accent mt-1">PCI-DSS 4.0</div>
              </div>
            </div>
            <div className="p-6 rounded-xl bg-violet-accent/5 border border-violet-accent/10">
              <p className="text-sm text-slate-400 leading-relaxed italic">
                "The enterprise cryptographic posture for {domain} is currently rated as {report.fleet_risk_level}. While TLS 1.3 adoption is progressing, {report.compliance_summary?.pqc_not_ready || 0} assets remain vulnerable to HNDL threats."
              </p>
            </div>
          </div>

          <div className="glass-card p-8 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Export Options</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <button 
                onClick={() => window.open(API_ROUTES.getCbom(domain!), '_blank')}
                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-violet-accent/50 transition-all text-left group"
              >
                <Box className="text-violet-accent w-6 h-6 mb-3 group-hover:scale-110 transition-transform" />
                <span className="block text-sm font-bold text-white">CBOM (CycloneDX)</span>
                <span className="text-[10px] text-slate-500">Cryptographic Bill of Materials</span>
              </button>
              <button 
                onClick={() => window.open(API_ROUTES.getRawScanner(domain!), '_blank')}
                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-accent/50 transition-all text-left group"
              >
                <FileCode className="text-cyan-accent w-6 h-6 mb-3 group-hover:scale-110 transition-transform" />
                <span className="block text-sm font-bold text-white">Raw Scanner JSON</span>
                <span className="text-[10px] text-slate-500">Full technical discovery payload</span>
              </button>
              <button 
                onClick={() => window.open(API_ROUTES.getRawRisk(domain!), '_blank')}
                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-amber-accent/50 transition-all text-left group"
              >
                <Shield className="text-amber-accent w-6 h-6 mb-3 group-hover:scale-110 transition-transform" />
                <span className="block text-sm font-bold text-white">Raw Risk JSON</span>
                <span className="text-[10px] text-slate-500">Full vulnerability & risk payload</span>
              </button>
              <button className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-accent/50 transition-all text-left group">
                <Database className="text-emerald-accent w-6 h-6 mb-3 group-hover:scale-110 transition-transform" />
                <span className="block text-sm font-bold text-white">Asset Inventory CSV</span>
                <span className="text-[10px] text-slate-500">Structured asset table export</span>
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass-card p-8 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Share Intelligence</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Draft a professional security summary email pre-filled with QuantumShield branding and domain context.</p>
            <button 
              onClick={handleDraftEmail}
              className="w-full py-3 rounded-xl bg-violet-accent hover:bg-violet-600 text-white font-bold transition-all flex items-center justify-center gap-2 glow-violet"
            >
              <Mail className="w-5 h-5" /> Draft Email
            </button>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
              <CheckCircle2 className="text-emerald-500 w-4 h-4 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-500">Note: Browser security prevents direct attachment of files. Please attach exported JSON/CSV files manually.</p>
            </div>
          </div>

          <div className="glass-card p-8 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Report Metadata</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-xs text-slate-500">Report ID</span>
                <span className="text-xs font-mono text-slate-300">{report.risk_report_id?.slice(0, 12) || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-500">Generated At</span>
                <span className="text-xs text-slate-300">{format(new Date(report.scanned_at), 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-500">Version</span>
                <span className="text-xs text-slate-300">QS-v4.2.0-Enterprise</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
