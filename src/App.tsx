/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LandingPage from './pages/LandingPage';
import AppShell from './components/AppShell';
import ScannerPage from './pages/ScannerPage';
import ReportsPage from './pages/ReportsPage';
import SummaryPage from './pages/SummaryPage';
import AssetInventoryPage from './pages/AssetInventoryPage';
import AssetDetailPage from './pages/AssetDetailPage';
import CyberRatingPage from './pages/CyberRatingPage';
import PQCPosturePage from './pages/PQCPosturePage';
import CBOMPage from './pages/CBOMPage';
import DiscoveryGraphPage from './pages/DiscoveryGraphPage';
import VulnerabilityPriorityPage from './pages/VulnerabilityPriorityPage';
import ReportingCenterPage from './pages/ReportingCenterPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app" element={<AppShell />}>
            <Route index element={<Navigate to="/app/scanner" replace />} />
            <Route path="scanner" element={<ScannerPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="reports/:domain" element={<SummaryPage />} />
            <Route path="reports/:domain/assets" element={<AssetInventoryPage />} />
            <Route path="reports/:domain/assets/:assetDomain" element={<AssetDetailPage />} />
            <Route path="assets" element={<Navigate to="/app/reports" replace />} />
            <Route path="cyber-rating" element={<Navigate to="/app/reports" replace />} />
            <Route path="cyber-rating/:domain" element={<CyberRatingPage />} />
            <Route path="pqc-posture" element={<Navigate to="/app/reports" replace />} />
            <Route path="pqc-posture/:domain" element={<PQCPosturePage />} />
            <Route path="cbom" element={<Navigate to="/app/reports" replace />} />
            <Route path="cbom/:domain" element={<CBOMPage />} />
            <Route path="discovery" element={<Navigate to="/app/reports" replace />} />
            <Route path="discovery/:domain" element={<DiscoveryGraphPage />} />
            <Route path="vulnerabilities" element={<Navigate to="/app/reports" replace />} />
            <Route path="vulnerabilities/:domain" element={<VulnerabilityPriorityPage />} />
            <Route path="reporting" element={<Navigate to="/app/reports" replace />} />
            <Route path="reporting/:domain" element={<ReportingCenterPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
