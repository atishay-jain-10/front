import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  Filter, 
  ChevronRight, 
  Shield, 
  Globe, 
  Zap, 
  Lock, 
  ArrowUpDown,
  ExternalLink,
  MoreVertical,
  Database
} from 'lucide-react';
import { 
  useReactTable, 
  getCoreRowModel, 
  getSortedRowModel, 
  getFilteredRowModel,
  flexRender,
  createColumnHelper
} from '@tanstack/react-table';
import { apiClient, API_ROUTES, AssetSummary } from '@/src/lib/api';
import { cn, getScoreColor, getRiskBadgeClass } from '@/src/lib/utils';

const columnHelper = createColumnHelper<AssetSummary>();

export default function AssetInventoryPage() {
  const { domain } = useParams<{ domain: string }>();
  const navigate = useNavigate();
  const [globalFilter, setGlobalFilter] = useState('');

  const { data: assets, isLoading } = useQuery({
    queryKey: ['assets', domain],
    queryFn: async () => {
      const response = await apiClient.get<AssetSummary[]>(API_ROUTES.getReportAssets(domain!));
      const data = response.data;
      const assetsArray = Array.isArray(data) ? data : (data as any)?.assets;
      return Array.isArray(assetsArray) ? assetsArray : [];
    },
    enabled: !!domain
  });

  const columns = useMemo(() => [
    columnHelper.accessor('domain', {
      header: 'Asset Domain',
      cell: info => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center">
            <Globe className="w-4 h-4 text-slate-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white">{info.getValue()}</span>
            <span className="text-[10px] text-slate-500">{info.row.original.ip_address}</span>
          </div>
        </div>
      )
    }),
    columnHelper.accessor('global_enterprise_score', {
      header: 'Score',
      cell: info => (
        <div className="flex items-center gap-2">
          <span className={cn("text-sm font-bold", getScoreColor(info.getValue()))}>
            {info.getValue()}
          </span>
          <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
            <div 
              className={cn("h-full", info.getValue() >= 70 ? "bg-emerald-500" : "bg-amber-500")} 
              style={{ width: `${info.getValue()}%` }}
            />
          </div>
        </div>
      )
    }),
    columnHelper.accessor('risk_level', {
      header: 'Risk',
      cell: info => (
        <span className={getRiskBadgeClass(info.getValue())}>
          {info.getValue()}
        </span>
      )
    }),
    columnHelper.accessor('pqc_status.readiness_level', {
      header: 'PQC Readiness',
      cell: info => (
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            info.getValue() === 'Elite' ? "bg-emerald-500" :
            info.getValue() === 'Standard' ? "bg-cyan-500" :
            "bg-amber-500"
          )} />
          <span className="text-xs text-slate-300">{(info.getValue() as string) || 'Unknown'}</span>
        </div>
      )
    }),
    columnHelper.accessor('tls_summary.best_version', {
      header: 'TLS',
      cell: info => (
        <span className="text-xs font-mono text-slate-400">
          {info.getValue() || 'N/A'}
        </span>
      )
    }),
    columnHelper.accessor('asset_classification', {
      header: 'Classification',
      cell: info => (
        <span className="text-xs text-slate-500 italic">
          {info.getValue()}
        </span>
      )
    }),
    columnHelper.display({
      id: 'actions',
      cell: info => (
        <div className="flex justify-end">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/app/reports/${domain}/assets/${info.row.original.domain}`);
            }}
            className="p-2 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )
    })
  ], [domain, navigate]);

  const table = useReactTable({
    data: assets || [],
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (isLoading) {
    return <div className="space-y-8 animate-pulse">
      <div className="h-10 w-48 bg-white/5 rounded-lg" />
      <div className="h-[600px] bg-white/5 rounded-xl" />
    </div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-violet-accent uppercase tracking-widest">
            <Database className="w-3 h-3" /> Asset Inventory
          </div>
          <h1 className="text-3xl font-display font-bold text-white">{domain}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search assets..."
              className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-violet-accent w-64"
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
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
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="border-b border-white/5 bg-white/2">
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <div 
                        className={cn(
                          "flex items-center gap-2 cursor-pointer select-none",
                          header.column.getCanSort() ? "hover:text-white" : ""
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && <ArrowUpDown className="w-3 h-3" />}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-white/5">
              {table.getRowModel().rows.map(row => (
                <tr 
                  key={row.id}
                  onClick={() => navigate(`/app/reports/${domain}/assets/${row.original.domain}`)}
                  className="group hover:bg-white/5 cursor-pointer transition-colors"
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
              {assets?.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-20 text-center text-slate-500">
                    No assets discovered for this domain.
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
