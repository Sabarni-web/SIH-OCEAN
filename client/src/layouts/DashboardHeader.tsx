import React from 'react';
import { Waves, Bell, User, Menu } from 'lucide-react';
import { useUIStore } from '../store/useUIStore';

export const DashboardHeader: React.FC = () => {
  const { toggleSidebar } = useUIStore();

  return (
    <header className="h-16 glass-panel-elevated flex items-center justify-between px-4 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 hover:bg-white/10 rounded-md transition-colors lg:hidden"
        >
          <Menu className="w-5 h-5 text-textPrimary" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50">
            <Waves className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white leading-tight">OCEAN-VISTA</h1>
            <p className="text-xs text-textSecondary hidden md:block">Unified 3D Browser-based Ocean Model & Observation System</p>
          </div>
        </div>
      </div>
      
      <div className="hidden lg:flex flex-1 justify-center">
        <p className="text-sm font-medium text-textSecondary tracking-wide">
          See &bull; Explore &bull; Analyze &bull; Understand Our Ocean
        </p>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="hidden md:flex flex-col items-end border-r border-border pr-6">
          <span className="text-sm font-semibold text-white">INCOIS</span>
          <span className="text-xs text-primary">Smart India Hackathon</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2 hover:bg-white/10 rounded-full transition-colors">
            <Bell className="w-5 h-5 text-textSecondary hover:text-white" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-pulse"></span>
          </button>
          <button className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center border border-border hover:border-primary transition-colors">
            <User className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </header>
  );
};
