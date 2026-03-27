import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Globe, 
  Shield, 
  Lock, 
  Zap, 
  Database, 
  FileCode, 
  ExternalLink, 
  ChevronLeft,
  Server,
  Network,
  Fingerprint,
  AlertTriangle,
  CheckCircle2,
  Info,
  ArrowRight,
  Download,
  Code
} from 'lucide-react';
import { apiClient, API_ROUTES, AssetDetail } from '@/src/lib/api';
import { cn, getScoreColor, getRiskBadgeClass } from '@/src/lib/utils';
import { format } from 'date-fns';

export default function AssetDetailPage() {
  const { domain, assetDomain } = useParams<{ domain: string, assetDomain: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: asset, isLoading } = useQuery({
    queryKey: ['asset-detail', domain, assetDomain],
    queryFn: async () => {
      const response = await apiClient.get<AssetDetail>(API_ROUTES.getAssetDetail(domain!, assetDomain!));
      return response.data;
    },
    enabled: !!domain && !!assetDomain
  });

  if (isLoading || !asset) {
    return <div className="animate-pulse space-y-8">
      <div className="h-20 bg-white/5 rounded-xl" />
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 h-[600px] bg-white/5 rounded-xl" />
        <div className="h-[600px] bg-white/5 rounded-xl" />
      </div>
    </div>;
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Globe },
    { id: 'dns', label: 'DNS & Network', icon: Network },
    { id: 'http', label: 'HTTP & Security', icon: Server },
    { id: 'tls', label: 'TLS & Crypto', icon: Lock },
    { id: 'certificates', label: 'Certificates', icon: Shield },
    { id: 'cookies', label: 'Cookies', icon: Fingerprint },
    { id: 'findings', label: 'Findings', icon: AlertTriangle },
    { id: 'raw', label: 'Raw Payloads', icon: Code },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(`/app/reports/${domain}/assets`)}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <Globe className="w-3 h-3" /> Asset Detail
            </div>
            <h1 className="text-2xl font-display font-bold text-white">{asset.domain}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={cn("px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3")}>
            <span className="text-xs font-bold text-slate-500 uppercase">Score</span>
            <span className={cn("text-xl font-display font-bold", getScoreColor(asset.global_enterprise_score))}>
              {asset.global_enterprise_score}
            </span>
          </div>
          <span className={getRiskBadgeClass(asset.risk_level)}>
            {asset.risk_level}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white/5 border border-white/10 rounded-xl overflow-x-auto scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
              activeTab === tab.id 
                ? "bg-violet-accent text-white shadow-lg" 
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="glass-card p-8 grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest border-b border-white/5 pb-2">Technical Identity</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">IP Address</span>
                      <span className="text-xs font-mono text-slate-300">{asset.ip_address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">ASN</span>
                      <span className="text-xs font-mono text-slate-300">{asset.asn}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">Network</span>
                      <span className="text-xs text-slate-300">{asset.net_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">Asset Type</span>
                      <span className="text-xs text-slate-300">{asset.asset_type}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest border-b border-white/5 pb-2">PQC & Crypto Posture</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">PQC Readiness</span>
                      <span className="text-xs font-bold text-emerald-500">{asset.pqc_status?.readiness_level || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">HNDL Risk</span>
                      <span className={cn("text-xs font-bold", asset.hndl_risk?.level === 'Critical' ? 'text-red-500' : 'text-slate-300')}>
                        {asset.hndl_risk?.level || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">Best TLS</span>
                      <span className="text-xs font-mono text-slate-300">{asset.tls_summary?.best_version || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">Forward Secrecy</span>
                      <span className="text-xs text-slate-300">{asset.tls_summary?.has_forward_secrecy ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card p-8">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Technologies Detected</h3>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(asset.technologies) ? asset.technologies : []).map(tech => (
                    <span key={tech} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300">
                      {tech}
                    </span>
                  ))}
                  {(Array.isArray(asset.technologies) ? asset.technologies : []).length === 0 && <span className="text-xs text-slate-500 italic">No technologies identified.</span>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dns' && (
            <div className="glass-card p-8 space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">DNS Records</h3>
              <pre className="bg-black/40 p-6 rounded-xl border border-white/5 text-xs font-mono text-cyan-accent/80 overflow-x-auto">
                {JSON.stringify(asset.dns_records, null, 2)}
              </pre>
            </div>
          )}

          {activeTab === 'http' && (
            <div className="space-y-8">
              <div className="glass-card p-8 space-y-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Security Headers</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(asset.security_headers || {}).map(([key, value]: [string, any]) => (
                    <div key={key} className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{key}</span>
                        {value?.present ? <CheckCircle2 className="text-emerald-500 w-3 h-3" /> : <AlertTriangle className="text-red-500 w-3 h-3" />}
                      </div>
                      <p className="text-xs text-slate-300 truncate">{value?.value || 'Missing'}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass-card p-8 space-y-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">HTTP Headers</h3>
                <pre className="bg-black/40 p-6 rounded-xl border border-white/5 text-xs font-mono text-slate-400 overflow-x-auto">
                  {JSON.stringify(asset.http_headers, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'tls' && (
            <div className="space-y-8">
              <div className="glass-card p-8 space-y-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">TLS Configuration</h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">Cipher Suite</span>
                      <span className="text-xs font-mono text-slate-300">{asset.tls_summary?.cipher_suite || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">PQC Supported</span>
                      <span className="text-xs text-slate-300">{asset.tls_summary?.pqc_supported ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">PQC Hybrid Group</span>
                      <span className="text-xs font-mono text-slate-300">{asset.tls_summary?.pqc_hybrid_group || 'None'}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">JARM Fingerprint</span>
                      <span className="text-xs font-mono text-slate-300 truncate max-w-[150px]">{asset.tls_summary?.jarm_fingerprint || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">JARM Confidence</span>
                      <span className="text-xs text-slate-300">{asset.tls_summary?.jarm_confidence || 0}/10</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="glass-card p-8 space-y-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Supported Versions</h3>
                <div className="flex gap-3">
                  {(Array.isArray(asset.tls_summary?.supported_tls_versions) ? asset.tls_summary?.supported_tls_versions : []).map(v => (
                    <span key={v} className="px-3 py-1 rounded-lg bg-violet-accent/10 border border-violet-accent/20 text-xs font-mono text-violet-accent">
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'certificates' && (
            <div className="space-y-6">
              {(Array.isArray(asset.certificates) ? asset.certificates : []).map((cert, idx) => (
                <div key={idx} className="glass-card p-8 space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Certificate Chain [{idx}]</h3>
                    {cert.cert_valid ? <CheckCircle2 className="text-emerald-500 w-5 h-5" /> : <AlertTriangle className="text-red-500 w-5 h-5" />}
                  </div>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Subject</span>
                        <p className="text-xs text-slate-300 break-all">{cert.subject_dn}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Issuer</span>
                        <p className="text-xs text-slate-300 break-all">{cert.issuer_dn}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-500">Algorithm</span>
                        <span className="text-xs text-slate-300">{cert.signature_algorithm}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-500">Key Size</span>
                        <span className="text-xs text-slate-300">{cert.public_key_size} bits</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-500">Expires</span>
                        <span className="text-xs text-slate-300">{cert.not_after ? format(new Date(cert.not_after), 'MMM dd, yyyy') : 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'cookies' && (
            <div className="glass-card p-8 space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">Cookie Analysis</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="py-3 text-[10px] font-bold text-slate-500 uppercase">Name</th>
                      <th className="py-3 text-[10px] font-bold text-slate-500 uppercase">Secure</th>
                      <th className="py-3 text-[10px] font-bold text-slate-500 uppercase">HttpOnly</th>
                      <th className="py-3 text-[10px] font-bold text-slate-500 uppercase">SameSite</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {(Array.isArray(asset.cookie_analysis) ? asset.cookie_analysis : []).map((cookie, idx) => (
                      <tr key={idx}>
                        <td className="py-3 text-xs font-mono text-slate-300">{cookie.name}</td>
                        <td className="py-3">
                          {cookie.secure ? <CheckCircle2 className="text-emerald-500 w-4 h-4" /> : <AlertTriangle className="text-red-500 w-4 h-4" />}
                        </td>
                        <td className="py-3">
                          {cookie.http_only ? <CheckCircle2 className="text-emerald-500 w-4 h-4" /> : <AlertTriangle className="text-red-500 w-4 h-4" />}
                        </td>
                        <td className="py-3 text-xs text-slate-400">{cookie.same_site || 'None'}</td>
                      </tr>
                    ))}
                    {(Array.isArray(asset.cookie_analysis) ? asset.cookie_analysis : []).length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-10 text-center text-xs text-slate-500 italic">No cookies detected.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'findings' && (
            <div className="space-y-6">
              {(Array.isArray(asset.findings) ? asset.findings : []).map((finding, idx) => (
                <div key={idx} className="glass-card p-6 border-l-4 border-l-red-500">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-widest border border-red-500/20">
                        {finding.severity}
                      </span>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{finding.category}</span>
                    </div>
                    <span className="text-xs font-bold text-red-500">Impact: -{finding.score_impact}</span>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">{finding.message}</h4>
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Remediation</span>
                    <p className="text-sm text-slate-300 leading-relaxed">{finding.remediation}</p>
                  </div>
                </div>
              ))}
              {(Array.isArray(asset.findings) ? asset.findings : []).length === 0 && (
                <div className="glass-card p-20 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="text-emerald-500 w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-white">No vulnerabilities found</h3>
                  <p className="text-sm text-slate-500">This asset meets all current QuantumShield security standards.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'raw' && (
            <div className="space-y-8">
              <div className="glass-card p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest">Raw Scanner Payload</h3>
                  <button className="text-xs font-bold text-violet-accent hover:underline">Download JSON</button>
                </div>
                <pre className="bg-black/40 p-6 rounded-xl border border-white/5 text-[10px] font-mono text-slate-400 overflow-x-auto h-[400px]">
                  {JSON.stringify(asset.raw_scanner_asset, null, 2)}
                </pre>
              </div>
              <div className="glass-card p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest">Raw Risk Payload</h3>
                  <button className="text-xs font-bold text-violet-accent hover:underline">Download JSON</button>
                </div>
                <pre className="bg-black/40 p-6 rounded-xl border border-white/5 text-[10px] font-mono text-slate-400 overflow-x-auto h-[400px]">
                  {JSON.stringify(asset.raw_risk_asset, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="glass-card p-6 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Recommendations</h3>
            <div className="space-y-4">
              {(Array.isArray(asset.recommendations) ? asset.recommendations : []).map((rec, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-accent/20 text-violet-accent flex items-center justify-center text-[10px] font-bold">
                    {idx + 1}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{rec}</p>
                </div>
              ))}
              {(asset.recommendations || []).length === 0 && <p className="text-xs text-slate-500 italic">No recommendations available.</p>}
            </div>
          </div>

          <div className="glass-card p-6 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Compliance Mapping</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                <span className="text-xs text-slate-300">PCI-DSS 4.0</span>
                {asset.pci_dss_compliant ? <CheckCircle2 className="text-emerald-500 w-4 h-4" /> : <AlertTriangle className="text-red-500 w-4 h-4" />}
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                <span className="text-xs text-slate-300">OWASP ASVS</span>
                <span className="text-xs font-bold text-cyan-accent">Level {asset.owasp_asvs_level}</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-violet-accent/10 border border-violet-accent/20 space-y-4">
            <div className="flex items-center gap-2 text-violet-accent">
              <Info className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Pro Tip</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Use the Discovery Graph to see how this asset relates to other subdomains in the {asset.root_domain} fleet.
            </p>
            <button 
              onClick={() => navigate(`/app/discovery/${domain}`)}
              className="w-full py-2 rounded-lg bg-violet-accent/20 hover:bg-violet-accent/30 text-violet-accent text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              View in Graph <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
