import React from 'react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-[1200px] mx-auto w-full animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold text-cyan-400 mb-6">About SIH-OCEAN</h1>
      <div className="p-8 rounded-xl border border-border/50 bg-surface/50 backdrop-blur-md space-y-6 text-textSecondary leading-relaxed">
         <section>
           <h2 className="text-xl font-semibold mb-2 text-white">Project Overview</h2>
           <p>
             SIH-OCEAN is a web-based interactive 3D visualization platform that integrates numerical ocean model outputs and in-situ observations. 
             Developed for Problem Statement 26067.
           </p>
         </section>
      </div>
    </div>
  );
};
