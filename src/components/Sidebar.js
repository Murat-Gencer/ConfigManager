import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiService from '../api/api';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = apiService.auth.getCurrentUser();

  const handleLogout = () => {
    apiService.auth.logout();
    navigate('/');
  };

  // Active link kontrolü
  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const menuItems = [
    {
      section: 'Main',
      items: [
        { path: '/dashboard', icon: 'folder', label: 'Projects' },
        { path: '/environments', icon: 'layers', label: 'Environments' },
        { path: '/team', icon: 'group', label: 'Team Members' },
        { path: '/audit', icon: 'history', label: 'Audit Logs' },
      ]
    },
    {
      section: 'System',
      items: [
        { path: '/settings', icon: 'settings', label: 'Settings' },
        { path: '/integrations', icon: 'security', label: 'Integrations' },
      ]
    }
  ];

  return (
    <aside className="w-64 border-r border-gray-200 dark:border-[#233648] bg-white dark:bg-[#0d1117] flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="size-8 flex items-center justify-center bg-primary rounded-lg text-white">
          <span className="material-symbols-outlined text-2xl">key_visualizer</span>
        </div>
        <h2 className="text-lg font-bold tracking-tight">Config Vault</h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-2">
              {section.section}
            </div>
            {section.items.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
              >
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            ))}
            {sectionIndex < menuItems.length - 1 && <div className="pt-8" />}
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200 dark:border-[#233648]">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
            {user?.username?.substring(0, 2).toUpperCase() || 'JD'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user?.username || 'Jane Developer'}</p>
            <p className="text-[10px] text-gray-500 truncate">Pro Account</p>
          </div>
          <button
            className="text-gray-500 hover:text-white transition-colors"
            onClick={handleLogout}
            title="Logout"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;