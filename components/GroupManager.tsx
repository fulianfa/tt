import React, { useState } from 'react';
import { NodeGroup } from '../types';
import { Plus, Trash2, X } from 'lucide-react';

interface GroupManagerProps {
  groups: NodeGroup[];
  onUpdateGroups: (groups: NodeGroup[]) => void;
}

const GroupManager: React.FC<GroupManagerProps> = ({ groups, onUpdateGroups }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColor, setNewGroupColor] = useState('#8b5cf6'); // Violet default
  const [newGroupTeis, setNewGroupTeis] = useState('');

  const handleAddGroup = () => {
    if (!newGroupName) return;
    
    // Parse TEIs from text area (split by newline, comma, space)
    const teis = newGroupTeis
        .split(/[\n,\s]+/)
        .map(s => s.trim())
        .filter(s => s.length > 0);

    const newGroup: NodeGroup = {
      id: Date.now().toString(),
      name: newGroupName,
      color: newGroupColor,
      teis: teis,
    };

    onUpdateGroups([...groups, newGroup]);
    
    // Reset form
    setNewGroupName('');
    setNewGroupTeis('');
    setIsAdding(false);
  };

  const handleDeleteGroup = (id: string) => {
    onUpdateGroups(groups.filter(g => g.id !== id));
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 bg-slate-800 text-white flex justify-between items-center">
        <h2 className="font-bold flex items-center gap-2">
          Grouping
        </h2>
        <button 
            onClick={() => setIsAdding(true)}
            className="p-1 hover:bg-slate-700 rounded text-slate-200"
            title="Add Group"
        >
            <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        {isAdding && (
            <div className="mb-6 p-4 bg-slate-50 rounded border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-2">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-sm font-semibold text-slate-700">New Group</h3>
                    <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Group Name</label>
                        <input 
                            type="text" 
                            className="w-full text-sm p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            placeholder="e.g. Expected Layer 2"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Color</label>
                        <div className="flex gap-2">
                            <input 
                                type="color" 
                                className="h-8 w-12 cursor-pointer border-0 p-0 rounded"
                                value={newGroupColor}
                                onChange={(e) => setNewGroupColor(e.target.value)}
                            />
                            <div className="text-xs text-slate-400 flex items-center">Select group highlight color</div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">TEIs (one per line or comma separated)</label>
                        <textarea 
                            className="w-full text-xs font-mono p-2 border border-slate-300 rounded h-20 focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={newGroupTeis}
                            onChange={(e) => setNewGroupTeis(e.target.value)}
                            placeholder="0x02C, 0x033, 0x008..."
                        />
                    </div>

                    <button 
                        onClick={handleAddGroup}
                        disabled={!newGroupName}
                        className="w-full py-2 bg-indigo-600 text-white text-sm rounded font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Create Group
                    </button>
                </div>
            </div>
        )}

        {groups.length === 0 && !isAdding ? (
            <div className="text-center text-slate-400 mt-10">
                <p className="text-sm">No groups defined.</p>
                <p className="text-xs mt-1">Create a group using TEIs to verify node hierarchy.</p>
            </div>
        ) : (
            <div className="space-y-3">
                {groups.map(group => (
                    <div key={group.id} className="p-3 bg-white border border-slate-100 rounded shadow-sm flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: group.color }}></span>
                                <span className="font-medium text-sm text-slate-700">{group.name}</span>
                            </div>
                            <button 
                                onClick={() => handleDeleteGroup(group.id)}
                                className="text-slate-300 hover:text-red-500 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="bg-slate-50 p-2 rounded text-xs font-mono text-slate-500 max-h-20 overflow-y-auto break-all">
                            {group.teis.join(', ') || 'No TEIs'}
                        </div>
                        <div className="text-[10px] text-slate-400 text-right">
                            {group.teis.length} nodes
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default GroupManager;