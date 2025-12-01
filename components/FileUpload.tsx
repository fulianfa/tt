import React, { useCallback } from 'react';
import { UploadCloud, FileText } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (content: string, fileName: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        onFileUpload(content, file.name);
      }
    };
    reader.readAsText(file);
    
    // Reset input to allow selecting the same file again
    event.target.value = '';
  }, [onFileUpload]);

  return (
    <div className="relative border-2 border-dashed border-slate-300 rounded-lg p-6 hover:bg-slate-50 transition-colors group text-center cursor-pointer">
       <input 
        type="file" 
        accept=".txt,.log" 
        onChange={handleFileChange} 
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
        <div className="p-3 bg-indigo-50 rounded-full group-hover:bg-indigo-100 transition-colors">
          <UploadCloud className="w-6 h-6 text-indigo-600" />
        </div>
        <div className="text-sm font-medium text-slate-700">
          Click to upload or drag and drop
        </div>
        <div className="text-xs text-slate-500">
          TXT or LOG files supported
        </div>
      </div>
    </div>
  );
};

export default FileUpload;