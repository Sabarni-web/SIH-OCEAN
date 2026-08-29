import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Waves, 
  Layers, 
  Navigation, 
  Plane, 
  Activity, 
  Anchor, 
  BarChart3, 
  GitCompare, 
  Upload, 
  Code2, 
  Settings, 
  Info,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useUIStore } from '../store/useUIStore';
import clsx from 'clsx';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/ocean', label: '3D Ocean View', icon: Waves },
  { path: '/model-data', label: 'Model Data', icon: Layers },
];

const OBS_ITEMS = [
  { path: '/observations/argo', label: 'Argo Floats', icon: Navigation },
  { path: '/observations/gliders', label: 'Gliders', icon: Plane },
  { path: '/observations/ctd', label: 'CTD', icon: Activity },
  { path: '/observations/moorings', label: 'Moorings', icon: Anchor },
];

const TOOL_ITEMS = [
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/compare', label: 'Compare', icon: GitCompare },
  { path: '/upload', label: 'Data Upload', icon: Upload },
  { path: '/api-download', label: 'API & Download', icon: Code2 },
];

const BOTTOM_ITEMS = [
  { path: '/settings', label: 'Settings', icon: Settings },
  { path: '/about', label: 'About', icon: Info },
];

export const Sidebar: React.FC = () => {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  const NavItem = ({ item }: { item: any }) => (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        clsx(
          "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group relative",
          isActive 
            ? "bg-primary/10 text-primary border-l-2 border-primary" 
            : "text-textSecondary hover:bg-white/5 hover:text-white border-l-2 border-transparent"
        )
      }
      title={!sidebarOpen ? item.label : undefined}
    >
      <item.icon className="w-5 h-5 flex-shrink-0" />
      {sidebarOpen && <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>}
    </NavLink>
  );

  return (
    <aside 
      className={clsx(
        "glass-panel flex flex-col h-[calc(100vh-4rem)] sticky top-16 transition-all duration-300 z-40",
        sidebarOpen ? "w-64" : "w-16"
      )}
    >
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 space-y-6 custom-scrollbar">
        
        <div className="space-y-1">
          {NAV_ITEMS.map(item => <NavItem key={item.path} item={item} />)}
        </div>

        <div>
          {sidebarOpen && <p className="px-3 text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">Observations</p>}
          <div className="space-y-1">
            {OBS_ITEMS.map(item => <NavItem key={item.path} item={item} />)}
          </div>
        </div>

        <div>
          {sidebarOpen && <p className="px-3 text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">Tools & Analytics</p>}
          <div className="space-y-1">
            {TOOL_ITEMS.map(item => <NavItem key={item.path} item={item} />)}
          </div>
        </div>
      </div>

      <div className="p-2 border-t border-border/50 space-y-1">
        {BOTTOM_ITEMS.map(item => <NavItem key={item.path} item={item} />)}
      </div>

      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-surfaceElevated border border-border flex items-center justify-center text-textSecondary hover:text-white hover:border-primary transition-colors shadow-lg z-50 hidden lg:flex"
      >
        {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
    </aside>
  );
};
