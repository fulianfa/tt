import React, { useState, useMemo, useEffect } from 'react';
import { TreeNode, ParseResult, NodeGroup, RawNodeData } from './types';
import { parseRawLines, buildTree } from './services/parser';
import TopologyGraph from './components/TopologyGraph';
import NodeDetails from './components/NodeDetails';
import FileUpload from './components/FileUpload';
import GroupManager from './components/GroupManager';
import AddNodeModal from './components/AddNodeModal';
import { Network, AlertCircle, Plus, LayoutGrid, Info } from 'lucide-react';

function App() {
  const [nodes, setNodes] = useState<RawNodeData[]>([]);
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [groups, setGroups] = useState<NodeGroup[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  
  // UI State
  const [activeTab, setActiveTab] = useState<'details' | 'groups'>('details');
  const [isAddNodeModalOpen, setIsAddNodeModalOpen] = useState(false);

  // Derived tree data
  const treeData = useMemo(() => {
    return buildTree(nodes);
  }, [nodes]);

  // Auto-select root on new tree
  useEffect(() => {
    if (treeData && !selectedNode) {
        setSelectedNode(treeData);
    }
  }, [treeData]);

  const handleFileUpload = (content: string, name: string) => {
    try {
      const parsedNodes = parseRawLines(content);
      if (parsedNodes.length === 0) {
        setError("No valid data found in file.");
        setNodes([]);
      } else {
        setError(null);
        setNodes(parsedNodes);
        setFileName(name);
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred while parsing the file.");
    }
  };

  const handleManualAddNode = (newNode: RawNodeData) => {
    setNodes(prev => [...prev, newNode]);
    // Optionally switch to the graph view or highlight new node logic could go here
  };

  const stats = useMemo(() => {
    if (nodes.length === 0) return null;
    const maxLevel = nodes.reduce((max, node) => Math.max(max, node.level), 0);
    const totalNodes = nodes.length;
    // PCO count approximation
    const pcoCount = nodes.filter(n => nodes.some(child => child.pcoDec === n.teiDec)).length;
    return { totalNodes, maxLevel, pcoCount };
  }, [nodes]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Network className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">RouteTopo Viz</h1>
            <p className="text-xs text-slate-500">Dynamic Routing Topology Visualization</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
             {fileName && (
                <div className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full font-medium border border-slate-200">
                    File: {fileName}
                </div>
            )}
             <button 
                onClick={() => setIsAddNodeModalOpen(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
             >
                <Plus className="w-4 h-4" />
                Add Node
             </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 flex flex-col lg:flex-row gap-6 overflow-hidden">
        
        {/* Left Column: Controls & Tree */}
        <div className="flex-1 flex flex-col gap-6 min-h-[500px]">
            
            {/* Top Bar: Upload & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <FileUpload onFileUpload={handleFileUpload} />
                </div>
                
                {/* Stats Cards */}
                <div className="md:col-span-2 grid grid-cols-3 gap-4">
                     <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                        <div className="text-xs text-slate-500 uppercase font-semibold">Total Nodes</div>
                        <div className="text-2xl font-bold text-indigo-600">{stats?.totalNodes || '-'}</div>
                     </div>
                     <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                        <div className="text-xs text-slate-500 uppercase font-semibold">Max Depth</div>
                        <div className="text-2xl font-bold text-emerald-600">{stats?.maxLevel || '-'}</div>
                     </div>
                     <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                        <div className="text-xs text-slate-500 uppercase font-semibold">Active PCOs</div>
                        <div className="text-2xl font-bold text-blue-600">{stats?.pcoCount || '-'}</div>
                     </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
                    <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                        <p className="text-red-700 font-medium">{error}</p>
                    </div>
                </div>
            )}

            {/* Graph Container */}
            <div className="flex-1 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden relative min-h-[400px]">
                <TopologyGraph 
                    data={treeData} 
                    groups={groups}
                    onNodeClick={(node) => {
                        setSelectedNode(node);
                        setActiveTab('details');
                    }} 
                />
                {!treeData && !error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50 backdrop-blur-sm pointer-events-none">
                        <div className="text-center">
                            <Network className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-400">Upload a topology file to begin</h3>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Right Column: Sidebar (Tabs for Details/Grouping) */}
        <div className="w-full lg:w-96 flex-shrink-0 flex flex-col bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
             {/* Tab Headers */}
             <div className="flex border-b border-slate-200">
                <button 
                    onClick={() => setActiveTab('details')}
                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'details' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <Info className="w-4 h-4" />
                    Details
                </button>
                <button 
                    onClick={() => setActiveTab('groups')}
                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'groups' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <LayoutGrid className="w-4 h-4" />
                    Groups
                </button>
             </div>

             {/* Tab Content */}
             <div className="flex-1 overflow-hidden relative">
                {activeTab === 'details' ? (
                     <div className="absolute inset-0">
                         <NodeDetails node={selectedNode} />
                     </div>
                ) : (
                     <div className="absolute inset-0">
                         <GroupManager groups={groups} onUpdateGroups={setGroups} />
                     </div>
                )}
             </div>
        </div>

      </main>

      <AddNodeModal 
        isOpen={isAddNodeModalOpen} 
        onClose={() => setIsAddNodeModalOpen(false)} 
        onAdd={handleManualAddNode}
        nextIndex={nodes.length + 1}
      />
    </div>
  );
}

export default App;