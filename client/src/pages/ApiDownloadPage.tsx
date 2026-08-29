import React from 'react';

export const ApiDownloadPage: React.FC = () => {
  return (
    <div className="max-w-[1600px] mx-auto w-full animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold text-cyan-400 mb-6">API & Developer Access</h1>
      <div className="grid grid-cols-1 gap-6">
        <div className="p-6 rounded-xl border border-border/50 bg-surface/50 backdrop-blur-md">
           <h2 className="text-xl font-semibold mb-4">Available Endpoints</h2>
           {/* API documentation list will go here */}
           <div className="space-y-4">
             <div className="p-4 border border-border/30 rounded-lg bg-surface/30">
               <div className="flex items-center space-x-3 mb-2">
                 <span className="px-2 py-1 text-xs font-bold bg-green-500/20 text-green-400 rounded">GET</span>
                 <code className="text-sm">/api/v1/datasets</code>
               </div>
               <p className="text-sm text-textSecondary">Retrieve a list of available oceanographic datasets.</p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};
