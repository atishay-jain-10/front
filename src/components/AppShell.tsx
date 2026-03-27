import React from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Shield, 
  Search, 
  FileText, 
  BarChart3, 
  Zap, 
  Box, 
  Network, 
  Database, 
  AlertTriangle, 
  Download,
  Home,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Search, label: 'Scanner', path: '/app/scanner' },
  { icon: FileText, label: 'Reports', path: '/app/reports' },
  { icon: BarChart3, label: 'Cyber Rating', path: '/app/cyber-rating' },
  { icon: Zap, label: 'PQC Posture', path: '/app/pqc-posture' },
  { icon: Box, label: 'CBOM', path: '/app/cbom' },
  { icon: Network, label: 'Discovery', path: '/app/discovery' },
  { icon: Database, label: 'Asset Inventory', path: '/app/assets' },
  { icon: AlertTriangle, label: 'Vulnerability Priority', path: '/app/vulnerabilities' },
  { icon: Download, label: 'Reporting', path: '/app/reporting' },
];

export default function AppShell() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract domain from URL if present
  const pathParts = location.pathname.split('/');
  const domainIndex = pathParts.findIndex(part => 
    ['reports', 'cyber-rating', 'pqc-posture', 'cbom', 'discovery', 'vulnerabilities', 'reporting'].includes(part)
  );
  
  // Handle /app/reports/:domain/assets case
  let currentDomain = 'demo.enterprise.com';
  if (domainIndex !== -1 && pathParts.length > domainIndex + 1) {
    currentDomain = pathParts[domainIndex + 1];
    // If it's just "assets" (e.g. /app/assets), it won't match the above, but that's fine since it redirects.
  }

  const getNavPath = (basePath: string) => {
    if (!currentDomain) return basePath;
    
    if (basePath === '/app/assets') {
      return `/app/reports/${currentDomain}/assets`;
    }
    
    if (['/app/cyber-rating', '/app/pqc-posture', '/app/cbom', '/app/discovery', '/app/vulnerabilities', '/app/reporting'].includes(basePath)) {
      return `${basePath}/${currentDomain}`;
    }
    
    return basePath;
  };

  return (
    <div className="flex h-screen bg-obsidian text-slate-200 overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={cn(
          "relative z-40 flex flex-col border-r border-white/5 bg-charcoal/50 backdrop-blur-xl transition-all duration-300",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="flex h-20 items-center px-6">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex-shrink-0 w-8 h-8 bg-violet-accent rounded flex items-center justify-center glow-violet">
              <Shield className="text-white w-5 h-5" />
            </div>
            {isSidebarOpen && (
              <span className="text-lg font-display font-bold tracking-tighter text-white whitespace-nowrap">
                QUANTUM<span className="text-violet-accent">SHIELD</span>
              </span>
            )}
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const resolvedPath = getNavPath(item.path);
            // Check if active, considering dynamic paths
            const isActive = location.pathname === resolvedPath || 
                             (item.path !== '/' && item.path !== '/app/scanner' && item.path !== '/app/reports' && location.pathname.startsWith(item.path));
            
            return (
              <NavLink
                key={item.path}
                to={resolvedPath}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group",
                  isActive 
                    ? "bg-violet-accent/10 text-violet-accent border border-violet-accent/20" 
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                )}
              >
                <item.icon className={cn("w-5 h-5 flex-shrink-0", isSidebarOpen ? "" : "mx-auto")} />
                {isSidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                {!isSidebarOpen && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-charcoal border border-white/10 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                    {item.label}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-colors"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Bar */}
        <header className="h-16 flex-shrink-0 border-b border-white/5 bg-obsidian/50 backdrop-blur-md flex items-center justify-between px-8 z-30">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search assets, jobs, or findings..."
                className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:border-violet-accent/50 transition-colors"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-widest">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              System Healthy
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-accent to-cyan-accent flex items-center justify-center text-xs font-bold text-white shadow-lg">
              AJ
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
