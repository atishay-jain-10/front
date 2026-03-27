import { ReportSummary, AssetSummary, AssetDetail } from './api';

export const mockReportSummary: ReportSummary = {
  risk_report_id: "rep_123456789",
  scan_job_id: "job_987654321",
  requested_domain: "demo.enterprise.com",
  root_domain: "enterprise.com",
  scan_timestamp: new Date().toISOString(),
  enterprise_score: 82,
  fleet_average_score: 75,
  fleet_risk_level: "Medium",
  total_assets_analyzed: 142,
  compliance_summary: {
    pci_dss_passing: 120,
    pci_dss_failing: 22,
    owasp_asvs_level_3: 45,
    owasp_asvs_level_2: 60,
    owasp_asvs_level_1: 100,
    owasp_asvs_level_0: 42,
    pqc_not_ready: 85,
    hndl_critical_risk: 12,
    tls13_count: 95,
    tls12_only_count: 40,
    legacy_tls_count: 7,
    challenge_page_count: 5
  },
  asset_breakdown: {
    elite_pqc_hardened: 15,
    standard_modern: 80,
    legacy_at_risk: 35,
    critical: 12,
    cdn_protected: 110
  },
  scanned_at: new Date().toISOString(),
  scan_duration_ms: 45000
};

export const mockAssets: AssetSummary[] = [
  {
    scan_asset_id: "ast_001",
    risk_report_id: "rep_123456789",
    domain: "www.demo.enterprise.com",
    root_domain: "enterprise.com",
    ip_address: "192.168.1.100",
    global_enterprise_score: 95,
    risk_level: "Low",
    asset_classification: "Elite",
    asset_type: "Web Server",
    scan_health: "Healthy",
    open_ports: [80, 443],
    technologies: ["Nginx", "React", "Node.js"],
    tags: ["Production", "External"],
    pqc_status: {
      pqc_detected: true,
      hybrid_kex_detected: true,
      algorithm_detected: "Kyber768",
      readiness_level: "Elite",
      nist_fips_alignment: "Aligned",
      source: "TLS Handshake"
    },
    hndl_risk: {
      level: "Low",
      reason: "PQC algorithms detected",
      vulnerable_to_shors_algorithm: false,
      rsa_key_exchange_detected: false,
      classical_only: false,
      estimated_quantum_threat_horizon: "10+ years"
    },
    tls_summary: {
      best_version: "TLS 1.3",
      cipher_suite: "TLS_AES_256_GCM_SHA384",
      has_forward_secrecy: true,
      has_static_rsa_kex: false,
      certificate_issuer: "Let's Encrypt Authority X3",
      cert_valid: true,
      cert_days_remaining: 45,
      jarm_fingerprint: "27d27d27d27d27d21c27d27d27d27d...",
      jarm_confidence: 9,
      supported_tls_versions: ["TLS 1.2", "TLS 1.3"],
      pqc_supported: true,
      pqc_hybrid_group: "X25519Kyber768Draft00"
    },
    cookie_security_summary: {
      total_cookies: 5,
      secure_flag_missing: 0,
      http_only_missing: 0,
      samesite_none_count: 1,
      samesite_lax_or_strict_count: 4,
      session_cookies_insecure: 0
    },
    has_scanner_asset: true,
    has_risk_asset: true,
    scanner_only: false,
    risk_only: false
  },
  {
    scan_asset_id: "ast_002",
    risk_report_id: "rep_123456789",
    domain: "legacy.demo.enterprise.com",
    root_domain: "enterprise.com",
    ip_address: "10.0.0.55",
    global_enterprise_score: 45,
    risk_level: "Critical",
    asset_classification: "Legacy",
    asset_type: "Internal API",
    scan_health: "Warning",
    open_ports: [80, 443, 8080],
    technologies: ["Apache", "PHP", "MySQL"],
    tags: ["Legacy", "Internal"],
    pqc_status: {
      pqc_detected: false,
      hybrid_kex_detected: false,
      algorithm_detected: "None",
      readiness_level: "Legacy",
      nist_fips_alignment: "Not Aligned",
      source: "TLS Handshake"
    },
    hndl_risk: {
      level: "Critical",
      reason: "RSA Key Exchange detected",
      vulnerable_to_shors_algorithm: true,
      rsa_key_exchange_detected: true,
      classical_only: true,
      estimated_quantum_threat_horizon: "< 5 years"
    },
    tls_summary: {
      best_version: "TLS 1.2",
      cipher_suite: "TLS_RSA_WITH_AES_128_CBC_SHA",
      has_forward_secrecy: false,
      has_static_rsa_kex: true,
      certificate_issuer: "Internal CA",
      cert_valid: false,
      cert_days_remaining: -10,
      jarm_fingerprint: "000000000000000000000000000000...",
      jarm_confidence: 5,
      supported_tls_versions: ["TLS 1.0", "TLS 1.1", "TLS 1.2"],
      pqc_supported: false,
      pqc_hybrid_group: "None"
    },
    cookie_security_summary: {
      total_cookies: 3,
      secure_flag_missing: 2,
      http_only_missing: 1,
      samesite_none_count: 3,
      samesite_lax_or_strict_count: 0,
      session_cookies_insecure: 1
    },
    has_scanner_asset: true,
    has_risk_asset: true,
    scanner_only: false,
    risk_only: false
  },
  {
    scan_asset_id: "ast_003",
    risk_report_id: "rep_123456789",
    domain: "api.demo.enterprise.com",
    root_domain: "enterprise.com",
    ip_address: "192.168.1.105",
    global_enterprise_score: 88,
    risk_level: "Medium",
    asset_classification: "Standard",
    asset_type: "API Gateway",
    scan_health: "Healthy",
    open_ports: [443],
    technologies: ["Kong", "PostgreSQL"],
    tags: ["Production", "API"],
    pqc_status: {
      pqc_detected: false,
      hybrid_kex_detected: false,
      algorithm_detected: "None",
      readiness_level: "Standard",
      nist_fips_alignment: "Partial",
      source: "TLS Handshake"
    },
    hndl_risk: {
      level: "Medium",
      reason: "Classical cryptography only, but uses forward secrecy",
      vulnerable_to_shors_algorithm: true,
      rsa_key_exchange_detected: false,
      classical_only: true,
      estimated_quantum_threat_horizon: "5-10 years"
    },
    tls_summary: {
      best_version: "TLS 1.3",
      cipher_suite: "TLS_AES_128_GCM_SHA256",
      has_forward_secrecy: true,
      has_static_rsa_kex: false,
      certificate_issuer: "Amazon",
      cert_valid: true,
      cert_days_remaining: 120,
      jarm_fingerprint: "29d29d15d29d29d22c29d29d29d29d...",
      jarm_confidence: 8,
      supported_tls_versions: ["TLS 1.2", "TLS 1.3"],
      pqc_supported: false,
      pqc_hybrid_group: "None"
    },
    cookie_security_summary: {
      total_cookies: 1,
      secure_flag_missing: 0,
      http_only_missing: 0,
      samesite_none_count: 0,
      samesite_lax_or_strict_count: 1,
      session_cookies_insecure: 0
    },
    has_scanner_asset: true,
    has_risk_asset: true,
    scanner_only: false,
    risk_only: false
  }
];

export const mockAssetDetail: AssetDetail = {
  ...mockAssets[0],
  resolved_ips: ["192.168.1.100", "192.168.1.101"],
  asn: "AS15169 Google LLC",
  net_name: "GOOGLE",
  service_fingerprints: {
    "443": "nginx/1.18.0"
  },
  http_headers: {
    "Server": "nginx",
    "Content-Type": "text/html; charset=utf-8",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff"
  },
  status_code: 200,
  status_codes: [200],
  redirect_chains: [],
  page_title: "Enterprise Demo - Secure Portal",
  vulns: [],
  dns_records: {
    "A": ["192.168.1.100", "192.168.1.101"],
    "AAAA": ["2001:4860:4860::8888"],
    "MX": ["mail.enterprise.com"],
    "TXT": ["v=spf1 include:_spf.google.com ~all"]
  },
  security_headers: {
    "Strict-Transport-Security": { present: true, value: "max-age=31536000; includeSubDomains" },
    "X-Frame-Options": { present: true, value: "DENY" },
    "X-Content-Type-Options": { present: true, value: "nosniff" },
    "Content-Security-Policy": { present: false, value: null }
  },
  advanced_tls: {},
  tls_fingerprints: {},
  tls_stack: {},
  cdn_detected: true,
  cdn_details: { name: "Cloudflare" },
  is_parked: false,
  is_internal: false,
  max_score: 100,
  risk_multiplier: 1.0,
  pci_dss_compliant: true,
  owasp_asvs_level: 2,
  is_challenge_page: false,
  cryptographic_integrity: 95,
  protocol_resiliency: 90,
  attack_surface_hardening: 85,
  pqc_readiness: 100,
  findings: [
    {
      severity: "Low",
      category: "HTTP Headers",
      message: "Missing Content-Security-Policy",
      score_impact: 5,
      remediation: "Implement a strict Content-Security-Policy to mitigate XSS attacks."
    }
  ],
  recommendations: [
    "Implement Content-Security-Policy header",
    "Monitor certificate expiration (45 days remaining)"
  ],
  testssl_findings: [],
  cookie_analysis: [
    {
      name: "session_id",
      secure: true,
      http_only: true,
      same_site: "Strict"
    }
  ],
  certificates: [
    {
      subject_dn: "CN=www.demo.enterprise.com",
      issuer_dn: "CN=Let's Encrypt Authority X3, O=Let's Encrypt, C=US",
      signature_algorithm: "sha256WithRSAEncryption",
      public_key_size: 2048,
      not_after: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      cert_valid: true
    }
  ],
  raw_scanner_asset: { "status": "scanned", "timestamp": new Date().toISOString() },
  raw_risk_asset: { "risk_calculated": true, "timestamp": new Date().toISOString() }
};

export const mockReportsList = [
  {
    risk_report_id: "rep_123456789",
    scan_job_id: "job_987654321",
    requested_domain: "demo.enterprise.com",
    root_domain: "enterprise.com",
    scan_timestamp: new Date().toISOString(),
    enterprise_score: 82,
    fleet_average_score: 75,
    fleet_risk_level: "Medium",
    total_assets_analyzed: 142,
    scanned_at: new Date().toISOString()
  },
  {
    risk_report_id: "rep_987654321",
    scan_job_id: "job_123456789",
    requested_domain: "test.example.com",
    root_domain: "example.com",
    scan_timestamp: new Date(Date.now() - 86400000).toISOString(),
    enterprise_score: 65,
    fleet_average_score: 60,
    fleet_risk_level: "High",
    total_assets_analyzed: 56,
    scanned_at: new Date(Date.now() - 86400000).toISOString()
  }
];
