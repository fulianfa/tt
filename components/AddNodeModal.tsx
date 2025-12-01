import React, { useState } from 'react';
import { RawNodeData } from '../types';
import { X, Save } from 'lucide-react';

interface AddNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (node: RawNodeData) => void;
  nextIndex: number;
}

const AddNodeModal: React.FC<AddNodeModalProps> = ({ isOpen, onClose, onAdd, nextIndex }) => {
  const [formData, setFormData] = useState({
    role: '(O)',
    mac: '',
    tei: '',
    pco: '',
    level: 1,
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic formatting
    const teiHex = formData.tei.startsWith('0x') ? formData.tei : `0x${formData.tei}`;
    const pcoHex = formData.pco; // Usually provided as pure hex string in files "032", but let's just take input
    
    // Construct RawNodeData
    const newNode: RawNodeData = {
        index: nextIndex,
        role: formData.role,
        mac: formData.mac || '000000000000',
        tei: teiHex,
        teiDec: parseInt(teiHex, 16) || 0,
        ro: 1, // Default
        pco: pcoHex,
        pcoDec: parseInt(pcoHex, 16) || 0,
        level: Number(formData.level),
        nxh: '000',
        rssi: 0,
        snr: 0,
        rawLine: 'Manually Added',
    };

    onAdd(newNode);
    onClose();
    // Reset for next time (optional, keep some values might be useful)
    setFormData({ role: '(O)', mac: '', tei: '', pco: '', level: 1 });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-slate-800 px-6 py-4 flex justify-between items-center text-white">
          <h2 className="font-semibold">Add Manual Node</h2>
          <button onClick={onClose} className="hover:text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">TEI (Hex)</label>
                <input 
                    required name="tei" value={formData.tei} onChange={handleChange} 
                    placeholder="e.g. 02C" 
                    className="w-full text-sm p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                />
            </div>
             <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Parent PCO (Hex)</label>
                <input 
                    required name="pco" value={formData.pco} onChange={handleChange} 
                    placeholder="e.g. 001" 
                    className="w-full text-sm p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                />
            </div>
          </div>

          <div>
             <label className="block text-xs font-medium text-slate-600 mb-1">MAC Address</label>
             <input 
                required name="mac" value={formData.mac} onChange={handleChange} 
                placeholder="e.g. 7cc294ff2572" 
                className="w-full text-sm p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Level (LV)</label>
                <input 
                    type="number" required name="level" value={formData.level} onChange={handleChange} 
                    className="w-full text-sm p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                />
            </div>
            <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Role</label>
                <select 
                    name="role" value={formData.role} onChange={handleChange}
                    className="w-full text-sm p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                    <option value="(O)">(O)</option>
                    <option value="(CCO)">(CCO)</option>
                    <option value="(PCO)">(PCO)</option>
                    <option value="(STA)">(STA)</option>
                </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
             <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded">Cancel</button>
             <button type="submit" className="px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 flex items-center gap-2">
                <Save className="w-4 h-4" />
                Add Node
             </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddNodeModal;