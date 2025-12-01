import React from 'react';
import { TreeNode } from '../types';
import { Activity, Wifi, Signal, GitCommit, Monitor } from 'lucide-react';

interface NodeDetailsProps {
  node: TreeNode | null;
}

const DetailRow: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
    <div className="flex items-center gap-2 text-slate-500">
      {icon}
      <span className="text-sm">{label}</span>
    </div>
    <span className="font-mono text-sm text-slate-700">{value}</span>
  </div>
);

const NodeDetails: React.FC<NodeDetailsProps> = ({ node }) => {
  if (!node) {
    return (
      <div className="bg-white rounded-lg shadow p-6 h-full flex flex-col items-center justify-center text-slate-400 text-center">
        <Monitor className="w-12 h-12 mb-2 opacity-20" />
        <p>Select a node in the graph to view details</p>
      </div>
    );
  }

  const { attributes: attr } = node;

  return (
    <div className="bg-white rounded-lg shadow flex flex-col h-full overflow-hidden">
      <div className="p-4 bg-indigo-600 text-white">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <GitCommit className="w-5 h-5" />
          Node {attr.tei}
        </h2>
        <p className="text-indigo-200 text-xs font-mono mt-1">{attr.mac}</p>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="space-y-1">
            <DetailRow icon={<Activity className="w-4 h-4"/>} label="Role" value={attr.role || 'Unknown'} />
            <DetailRow icon={<Wifi className="w-4 h-4"/>} label="Level (LV)" value={attr.level} />
            <DetailRow icon={<GitCommit className="w-4 h-4"/>} label="TEI (Dec)" value={attr.teiDec} />
            <DetailRow icon={<GitCommit className="w-4 h-4"/>} label="Parent (PCO)" value={attr.pco} />
            <DetailRow icon={<Signal className="w-4 h-4"/>} label="RSSI" value={`${attr.rssi} dBm`} />
            <DetailRow icon={<Activity className="w-4 h-4"/>} label="SNR" value={attr.snr} />
            <DetailRow icon={<Activity className="w-4 h-4"/>} label="Index" value={attr.index} />
        </div>

        <div className="mt-6">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Raw Data</h3>
            <div className="bg-slate-50 p-3 rounded border border-slate-200">
                <code className="text-xs text-slate-600 break-all font-mono block">
                    {attr.rawLine}
                </code>
            </div>
        </div>
      </div>
    </div>
  );
};

export default NodeDetails;