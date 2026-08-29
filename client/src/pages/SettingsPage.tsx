import React from 'react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="max-w-[1200px] mx-auto w-full animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold text-cyan-400 mb-6">Settings</h1>
      <div className="p-6 rounded-xl border border-border/50 bg-surface/50 backdrop-blur-md space-y-6">
         <section>
           <h2 className="text-xl font-semibold mb-4 text-white">Application Mode</h2>
           <div className="flex items-center justify-between p-4 bg-surface/30 rounded-lg border border-border/30">
             <div>
               <p className="font-medium">Demo Mode</p>
               <p className="text-sm text-textSecondary">Use built-in mock data for demonstration purposes.</p>
             </div>
             {/* Toggle switch will go here */}
           </div>
         </section>
      </div>
    </div>
  );
};
