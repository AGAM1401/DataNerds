import React, { useRef, useState } from 'react';
import { UploadCloud, FileSpreadsheet, Sparkles, Loader2 } from 'lucide-react';
import { uploadFile } from '../services/api';
import { Dataset } from '../types';

interface FileUploaderProps {
  onDatasetLoaded: (dataset: Dataset) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onDatasetLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await uploadFile(file);
      onDatasetLoaded(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to upload and parse Excel sheet.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleSampleLoad = async () => {
    // Generate a default Superstore CSV file blob for immediate trial
    const sampleCsv = `OrderDate,Region,Representative,Product,Quantity,UnitCost,TotalRevenue
2026-01-05,East,Sarah,Laptops,15,450,12000
2026-01-12,West,Michael,Monitors,24,180,6720
2026-01-18,Central,Emma,Keyboards,50,45,3750
2026-01-25,East,Sarah,Printers,10,210,3500
2026-02-02,South,David,Laptops,18,460,14400
2026-02-09,West,Michael,Keyboards,65,42,4550
2026-02-15,Central,Emma,Monitors,30,175,8100
2026-02-22,East,James,Laptops,12,450,9600
2026-03-01,South,David,Headphones,80,35,4800
2026-03-08,Central,Emma,Laptops,22,440,17600
2026-03-15,West,Michael,Printers,14,220,4900
2026-03-22,East,Sarah,Headphones,95,30,5700
2026-04-05,Central,Emma,Monitors,28,180,7840
2026-04-12,South,David,Keyboards,40,45,3000
2026-04-19,West,Michael,Laptops,20,450,16000`;

    const sampleFile = new File([sampleCsv], "Sample_Superstore_Sales.csv", { type: "text/csv" });
    await handleFileProcess(sampleFile);
  };

  return (
    <div className="max-w-2xl mx-auto my-12 text-center">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-10 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-50/50 scale-[1.01]'
            : 'border-slate-300 hover:border-blue-400 bg-white shadow-sm'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".xlsx, .xls, .csv"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileProcess(e.target.files[0]);
            }
          }}
        />

        <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
          {isLoading ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : (
            <UploadCloud className="w-8 h-8" />
          )}
        </div>

        <h3 className="text-lg font-semibold text-slate-800">
          {isLoading ? 'Processing your data...' : 'Drop your Excel or CSV file here'}
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Supports multi-sheet workbooks (.xlsx, .xls) and CSVs
        </p>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
            {error}
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-center gap-3">
        <span className="text-xs text-slate-400 font-medium">or test immediately with</span>
        <button
          onClick={handleSampleLoad}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors border border-indigo-200"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Load Sample Sales Dataset
        </button>
      </div>
    </div>
  );
};
