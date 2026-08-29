import React from 'react';
import { Outlet } from 'react-router-dom';
import { DashboardHeader } from './DashboardHeader';
import { Sidebar } from './Sidebar';

export const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-textPrimary">
      <DashboardHeader />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        <main className="flex-1 overflow-auto custom-scrollbar p-4 lg:p-6 pb-20 lg:pb-6 relative z-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
