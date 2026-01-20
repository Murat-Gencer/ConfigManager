import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import apiService from '../api/api';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import SearchBar from '../components/SearchBar';
import ProjectCard from '../components/ProjectCard';
import EmptyState from '../components/EmptyState';
import AddProjectModal from '../components/AddProjectModal';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: projects = [], isLoading } = useQuery(
    'projects',
    apiService.projects.getAll,
    {
      onError: (err) => {
        console.error('Projects fetch error:', err);
      }
    }
  );

  const filteredProjects = projects.filter((project) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (project.name && project.name.toLowerCase().includes(query)) ||
      (project.description && project.description.toLowerCase().includes(query))
    );
  });

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
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-primary text-5xl animate-spin">
            progress_activity
          </span>
          <div className="text-white">Loading projects...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-background-light dark:bg-background-dark min-h-screen flex font-display text-gray-900 dark:text-gray-100 overflow-hidden">
        <Sidebar />

        <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          {/* 👇 PageHeader Component */}
          <PageHeader
            title="Projects"
            badge={`${projects.length} Active`}
            actionText="Add New Project"
            actionIcon="add"
            onAction={() => setIsModalOpen(true)}
          />

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {/* Search & Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              {/* 👇 SearchBar Component */}
              <SearchBar
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects by name or description..."
              />

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

            {/* Projects List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                  Active Projects
                </h3>
                <span className="text-xs text-gray-500">
                  {searchQuery ? `${filteredProjects.length} / ${projects.length}` : `${projects.length} Projects`}
                </span>
              </div>

              {filteredProjects.length === 0 ? (
                // 👇 EmptyState Component
                <EmptyState
                  icon={searchQuery ? 'search_off' : 'folder_off'}
                  title={searchQuery ? `No results for "${searchQuery}"` : 'No projects yet'}
                  description={
                    searchQuery
                      ? 'Try a different search term or clear the filter.'
                      : 'Create your first project to start managing configurations!'
                  }
                  buttonText={searchQuery ? 'Clear Search' : 'Create Project'}
                  buttonIcon={searchQuery ? 'close' : 'add'}
                  onButtonClick={() => searchQuery ? setSearchQuery('') : setIsModalOpen(true)}
                />
              ) : (
                // 👇 ProjectCard Component
                filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    searchQuery={searchQuery}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    onEdit={(e) => handleEdit(project, e)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Footer */}
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