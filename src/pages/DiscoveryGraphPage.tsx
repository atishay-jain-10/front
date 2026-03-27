import React, { useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Node,
  Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  Network, 
  Shield, 
  Zap, 
  Globe, 
  Lock, 
  AlertTriangle,
  Search,
  Filter,
  Info
} from 'lucide-react';
import { apiClient, API_ROUTES, AssetSummary } from '@/src/lib/api';
import { cn, getScoreColor } from '@/src/lib/utils';

const nodeTypes = {
  asset: ({ data }: any) => (
    <div className={cn(
      "px-4 py-3 rounded-xl border-2 bg-charcoal/90 backdrop-blur-md shadow-2xl min-w-[200px]",
      data.isRoot ? "border-violet-accent" : "border-white/10"
    )}>
      <div className="flex items-center gap-3 mb-2">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center",
          data.isRoot ? "bg-violet-accent/20" : "bg-white/5"
        )}>
          {data.isRoot ? <Shield className="text-violet-accent w-4 h-4" /> : <Globe className="text-slate-500 w-4 h-4" />}
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="text-xs font-bold text-white truncate">{data.label}</span>
          <span className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">{data.type}</span>
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <div className="flex items-center gap-1">
          <div className={cn("w-1.5 h-1.5 rounded-full", data.pqcReady ? "bg-emerald-500" : "bg-amber-500")} />
          <span className="text-[8px] text-slate-400 uppercase font-bold">PQC</span>
        </div>
        <span className={cn("text-xs font-bold", getScoreColor(data.score))}>{data.score}</span>
      </div>
    </div>
  )
};

export default function DiscoveryGraphPage() {
  const { domain } = useParams<{ domain: string }>();

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

  const { initialNodes, initialEdges } = useMemo(() => {
    if (!assets) return { initialNodes: [], initialEdges: [] };

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Root node
    nodes.push({
      id: 'root',
      type: 'asset',
      position: { x: 0, y: 0 },
      data: { 
        label: domain, 
        isRoot: true, 
        type: 'Root Domain', 
        score: assets[0]?.global_enterprise_score || 0,
        pqcReady: assets[0]?.pqc_status?.pqc_detected || false
      }
    });

    // Subdomain nodes
    assets.slice(1, 20).forEach((asset, idx) => {
      const angle = (idx / Math.min(assets.length - 1, 19)) * Math.PI * 2;
      const radius = 400;
      nodes.push({
        id: asset.scan_asset_id,
        type: 'asset',
        position: { 
          x: Math.cos(angle) * radius, 
          y: Math.sin(angle) * radius 
        },
        data: { 
          label: asset.domain, 
          isRoot: false, 
          type: asset.asset_classification, 
          score: asset.global_enterprise_score,
          pqcReady: asset.pqc_status?.pqc_detected || false
        }
      });

      edges.push({
        id: `e-root-${asset.scan_asset_id}`,
        source: 'root',
        target: asset.scan_asset_id,
        animated: asset.risk_level === 'Critical',
        style: { stroke: asset.risk_level === 'Critical' ? '#ef4444' : 'rgba(255,255,255,0.1)', strokeWidth: 1 },
        markerEnd: { type: MarkerType.ArrowClosed, color: 'rgba(255,255,255,0.1)' }
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [assets, domain]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  if (!assets) return <div className="animate-pulse h-full bg-white/5 rounded-xl" />;

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-violet-accent uppercase tracking-widest">
            <Network className="w-3 h-3" /> Discovery Graph
          </div>
          <h1 className="text-3xl font-display font-bold text-white">Asset Relationship Mapping</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search nodes..."
              className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-violet-accent w-64"
            />
          </div>
          <button className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 glass-card overflow-hidden relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          colorMode="dark"
        >
          <Background color="#1e293b" gap={20} />
          <Controls className="bg-charcoal border border-white/10 fill-white" />
          <MiniMap 
            className="bg-charcoal border border-white/10" 
            nodeColor={(n: any) => n.data.isRoot ? '#8b5cf6' : '#1e293b'}
            maskColor="rgba(0,0,0,0.5)"
          />
        </ReactFlow>

        {/* Legend */}
        <div className="absolute top-6 right-6 p-4 glass-card space-y-3 pointer-events-none">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Graph Legend</span>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-violet-accent" />
              <span className="text-[10px] text-slate-400">Root Domain</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-white/10 border border-white/20" />
              <span className="text-[10px] text-slate-400">Subdomain Asset</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 bg-red-500 animate-pulse" />
              <span className="text-[10px] text-slate-400">Critical Risk Path</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
