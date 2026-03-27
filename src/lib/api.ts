import axios from 'axios';
import { mockReportSummary, mockAssets, mockAssetDetail, mockReportsList } from './mockData';

export const API_BASE_URL = ''; // Relative to same origin

export const API_ROUTES = {
  health: "/health",
  startScan: "/api/v1/scan",
  getScanByJobId: (jobId: string) => `/api/v1/scan/${jobId}`,
  listReports: (params?: { limit?: number; cursor?: string }) => {
    const search = new URLSearchParams();
    if (params?.limit) search.set("limit", String(params.limit));
    if (params?.cursor) search.set("cursor", params.cursor);
    const qs = search.toString();
    return `/api/v1/reports${qs ? `?${qs}` : ""}`;
  },
  getReportSummary: (domain: string) => `/api/v1/report/${domain}`,
  getReportAssets: (domain: string) => `/api/v1/report/${domain}/assets`,
  getAssetDetail: (domain: string, assetDomain: string) => `/api/v1/report/${domain}/assets/${assetDomain}`,
  getRawScanner: (domain: string) => `/api/v1/report/${domain}/raw/scanner`,
  getRawRisk: (domain: string) => `/api/v1/report/${domain}/raw/risk`,
  getCbom: (domain: string) => `/api/v1/report/${domain}/cbom`,
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add mock interceptor for development/demo purposes
apiClient.interceptors.request.use((config) => {
  // Force all requests to fail so the response interceptor catches them and returns mock data.
  // This ensures the UI is fully populated and clickable for demonstration.
  if (config.url && !config.url.startsWith('/api/mock-force-fail')) {
    config.url = '/api/mock-force-fail' + config.url;
  }
  return config;
});

const getMockDataForUrl = (url: string) => {
  if (url.includes('/raw/scanner')) {
    return { status: "scanned", timestamp: new Date().toISOString() };
  }
  if (url.includes('/raw/risk')) {
    return { risk_calculated: true, timestamp: new Date().toISOString() };
  }
  if (url.includes('/cbom')) {
    return { bomFormat: "CycloneDX", specVersion: "1.4", components: [] };
  }
  if (url.includes('/api/v1/reports')) {
    return { reports: mockReportsList, next_cursor: null };
  }
  if (url.includes('/assets/') && !url.endsWith('/assets')) {
    return mockAssetDetail;
  }
  if (url.includes('/assets')) {
    return mockAssets;
  }
  if (url.includes('/report/')) {
    return mockReportSummary;
  }
  if (url.includes('/api/v1/scan/')) {
    return { 
      job_id: "job_mock_" + Date.now(), 
      domain: "demo.enterprise.com", 
      status: "completed",
      asset_count: 142,
      created_at: new Date().toISOString(),
      scan_summary_count: 1,
      risk_report_count: 1
    };
  }
  if (url.includes('/scan')) {
    return { 
      job_id: "job_mock_" + Date.now(), 
      domain: "demo.enterprise.com", 
      status: "running",
      asset_count: 0,
      created_at: new Date().toISOString(),
      scan_summary_count: 0,
      risk_report_count: 0
    };
  }
  return null;
};

apiClient.interceptors.response.use(
  (response) => {
    const url = response.config?.url || '';
    if (url.includes('/api/mock-force-fail')) {
      const mockData = getMockDataForUrl(url);
      if (mockData) {
        return { ...response, data: mockData };
      }
    }
    return response;
  },
  (error) => {
    const url = error.config?.url || '';
    
    console.log('API Error intercepted, returning mock data for:', url);
    
    const mockData = getMockDataForUrl(url);
    if (mockData) {
      return Promise.resolve({ data: mockData });
    }
    
    return Promise.reject(error);
  }
);

// Types
export type JobStatus = "queued" | "running" | "completed" | "failed";

export interface ScanJobResponse {
  job_id: string;
  domain: string;
  status: JobStatus;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  error?: string;
  scan_summary_count: number;
  risk_report_count: number;
  asset_count: number;
  reports?: any[];
  result?: any[];
}

export interface ComplianceSummary {
  pci_dss_passing: number;
  pci_dss_failing: number;
  owasp_asvs_level_3: number;
  owasp_asvs_level_2: number;
  owasp_asvs_level_1: number;
  owasp_asvs_level_0: number;
  pqc_not_ready: number;
  hndl_critical_risk: number;
  tls13_count: number;
  tls12_only_count: number;
  legacy_tls_count: number;
  challenge_page_count: number;
}

export interface AssetBreakdown {
  elite_pqc_hardened: number;
  standard_modern: number;
  legacy_at_risk: number;
  critical: number;
  cdn_protected: number;
}

export interface ReportSummary {
  risk_report_id: string;
  scan_job_id: string;
  requested_domain: string;
  root_domain: string;
  scan_timestamp: string;
  enterprise_score: number;
  fleet_average_score: number;
  fleet_risk_level: string;
  total_assets_analyzed: number;
  compliance_summary: ComplianceSummary;
  asset_breakdown: AssetBreakdown;
  raw_report?: any;
  scanned_at: string;
  scan_duration_ms: number;
}

export interface PQCStatus {
  pqc_detected: boolean;
  hybrid_kex_detected: boolean;
  algorithm_detected: string;
  readiness_level: string;
  nist_fips_alignment: string;
  source: string;
}

export interface HNDLRisk {
  level: string;
  reason: string;
  vulnerable_to_shors_algorithm: boolean;
  rsa_key_exchange_detected: boolean;
  classical_only: boolean;
  estimated_quantum_threat_horizon: string;
}

export interface TLSSummary {
  best_version: string;
  cipher_suite: string;
  has_forward_secrecy: boolean;
  has_static_rsa_kex: boolean;
  certificate_issuer: string;
  cert_valid: boolean;
  cert_days_remaining: number;
  jarm_fingerprint: string;
  jarm_confidence: number;
  supported_tls_versions: string[];
  pqc_supported: boolean;
  pqc_hybrid_group: string;
}

export interface CookieSecuritySummary {
  total_cookies: number;
  secure_flag_missing: number;
  http_only_missing: number;
  samesite_none_count: number;
  samesite_lax_or_strict_count: number;
  session_cookies_insecure: number;
}

export interface Finding {
  severity: string;
  category: string;
  message: string;
  score_impact: number;
  remediation: string;
}

export interface AssetSummary {
  scan_asset_id: string;
  risk_report_id: string;
  domain: string;
  root_domain: string;
  ip_address: string;
  global_enterprise_score: number;
  risk_level: string;
  asset_classification: string;
  asset_type: string;
  scan_health: string;
  open_ports: number[];
  technologies: string[];
  tags: string[];
  pqc_status: PQCStatus;
  hndl_risk: HNDLRisk;
  tls_summary: TLSSummary;
  cookie_security_summary: CookieSecuritySummary;
  has_scanner_asset: boolean;
  has_risk_asset: boolean;
  scanner_only: boolean;
  risk_only: boolean;
}

export interface AssetDetail extends AssetSummary {
  resolved_ips: string[];
  asn: string;
  net_name: string;
  service_fingerprints: any;
  http_headers: Record<string, string>;
  status_code: number;
  status_codes: number[];
  redirect_chains: string[];
  page_title: string;
  vulns: any[];
  dns_records: any;
  security_headers: any;
  advanced_tls: any;
  tls_fingerprints: any;
  tls_stack: any;
  cdn_detected: boolean;
  cdn_details: any;
  is_parked: boolean;
  is_internal: boolean;
  max_score: number;
  risk_multiplier: number;
  pci_dss_compliant: boolean;
  owasp_asvs_level: number;
  is_challenge_page: boolean;
  cryptographic_integrity: number;
  protocol_resiliency: number;
  attack_surface_hardening: number;
  pqc_readiness: number;
  findings: Finding[];
  recommendations: string[];
  testssl_findings: any[];
  cookie_analysis: any[];
  certificates: any[];
  raw_scanner_asset: any;
  raw_risk_asset: any;
}
