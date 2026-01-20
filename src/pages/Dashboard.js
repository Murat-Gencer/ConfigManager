import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import apiService from '../api/api';
import AddProjectModal from '../components/AddProjectModal';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = apiService.auth.getCurrentUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const { data: projects = [], isLoading, error } = useQuery(
    'projects',
    apiService.projects.getAll,
    {
      onError: (err) => {
        console.error('Projects fetch error:', err);
      }
    }
  );

  const handleLogout = () => {
    apiService.auth.logout();
    navigate('/');
  };

  const handleEdit = (project, e) => {
    e.stopPropagation();
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-dark">
        <div className="text-white">Loading projects...</div>
      </div>
    );
  }

  return (
    <>
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex font-display text-gray-900 dark:text-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 dark:border-[#233648] bg-white dark:bg-[#0d1117] flex flex-col h-screen">
        <div className="p-6 flex items-center gap-3">
          <div className="size-8 flex items-center justify-center bg-primary rounded-lg text-white">
            <span className="material-symbols-outlined text-2xl">key_visualizer</span>
          </div>
          <h2 className="text-lg font-bold tracking-tight">Config Vault</h2>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-2">Main</div>
          <a className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary" href="#">
            <span className="material-symbols-outlined text-xl">folder</span>
            <span className="font-medium text-sm">Projects</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors" href="#">
            <span className="material-symbols-outlined text-xl">layers</span>
            <span className="font-medium text-sm">Environments</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors" href="#">
            <span className="material-symbols-outlined text-xl">group</span>
            <span className="font-medium text-sm">Team Members</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors" href="#">
            <span className="material-symbols-outlined text-xl">history</span>
            <span className="font-medium text-sm">Audit Logs</span>
          </a>

          <div className="pt-8 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-2">System</div>
          <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors" href="#">
            <span className="material-symbols-outlined text-xl">settings</span>
            <span className="font-medium text-sm">Settings</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors" href="#">
            <span className="material-symbols-outlined text-xl">security</span>
            <span className="font-medium text-sm">Integrations</span>
          </a>
        </nav>

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
            >
              <span className="material-symbols-outlined text-lg">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 border-b border-gray-200 dark:border-[#233648] bg-white dark:bg-background-dark/50 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Projects</h1>
            <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-bold uppercase tracking-widest">
              {projects.length} Active
            </span>
          </div>
<div className="flex items-center gap-4">
              {/* 👇 Add New Project Button */}
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-primary/20"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Add New Project
              </button>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="relative w-full max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xl">search</span>
              <input className="w-full bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#324d67] rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all" placeholder="Search variables, keys, or descriptions..." type="text" />
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-[#324d67] text-sm font-medium hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                <span className="material-symbols-outlined text-lg">filter_list</span>
                Filter
              </button>
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-[#324d67] text-sm font-medium hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                <span className="material-symbols-outlined text-lg">sort</span>
                Sort
              </button>
            </div>
          </div>

                      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Active Projects</h3>
                  <span className="text-xs text-gray-500">{projects.length} Projects</span>
                </div>

                {projects.length === 0 ? (
                  <div className="glass-card rounded-xl p-12 text-center">
                    <span className="material-symbols-outlined text-gray-400 text-6xl mb-4">folder_off</span>
                    <h3 className="text-lg font-bold text-gray-600 dark:text-gray-400 mb-2">
                      No projects yet
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Create your first project to start managing configurations!
                    </p>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-bold transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                      Create Project
                    </button>
                  </div>
                ) : (
                  projects.map((project) => (
                    <div 
                      key={project.id} 
                      className="glass-card rounded-xl p-4 flex items-center justify-between group hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-gray-100 dark:bg-white/5 rounded-lg">
                          <span className="material-symbols-outlined text-primary">folder</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">{project.name}</h4>
                          <p className="text-xs text-gray-500">{project.description || 'No description'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-[10px] font-bold text-gray-400">
                          {new Date(project.createdAt).toLocaleDateString()}
                        </span>
                        <button 
                          className="p-2 hover:bg-white/10 rounded-lg text-gray-500 hover:text-primary transition-colors"
                          onClick={(e) => handleEdit(project, e)}
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              </div>
        </div>

        <footer className="h-10 border-t border-gray-200 dark:border-[#233648] px-8 flex items-center justify-between text-[10px] font-medium text-gray-500 uppercase tracking-widest bg-white dark:bg-background-dark/50">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              System Sync: Stable
            </span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">lock</span>
              Encryption: AES-256
            </span>
          </div>
          <div>v2.4.0-stable © 2024 Config Vault</div>
        </footer>
      </main>
    </div>
     <AddProjectModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingProject={editingProject}
      />
      </>
  );
};

export default Dashboard;