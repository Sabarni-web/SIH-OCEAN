import React from 'react';

export const UploadPage: React.FC = () => {
  return (
    <div className="max-w-[1200px] mx-auto w-full animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold text-cyan-400 mb-6">Data Upload</h1>
      <div className="p-8 rounded-xl border border-border/50 bg-surface/50 backdrop-blur-md flex flex-col items-center justify-center min-h-[400px] border-dashed border-2 hover:border-cyan-400/50 transition-colors cursor-pointer">
         <div className="text-center space-y-4">
           <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto">
             <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
           </div>
           <h3 className="text-xl font-semibold">Drag & Drop files here</h3>
           <p className="text-sm text-textSecondary">Supports NetCDF (.nc), CSV, and TXT files</p>
           <button className="px-6 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors">Select Files</button>
         </div>
      </div>
    </div>
  );
};
