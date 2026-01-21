import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient} from 'react-query';
import apiService from '../api/api';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import SearchBar from '../components/SearchBar';
import ProjectCard from '../components/ProjectCard';
import EmptyState from '../components/EmptyState';
import AddProjectModal from '../components/AddProjectModal';
import ConfirmDialog from '../components/ConfirmDialog';
import ApiKeyModal from '../components/ApiKeyModal';
import { toast } from 'react-hot-toast';
import Footer from '../components/Footer';

const Dashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);


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

  const deleteProjectMutation = useMutation(
    (projectId) => apiService.projects.delete(projectId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('projects');
        toast.success('Project deleted successfully! 🎉', {
          duration: 3000,
          position: 'top-right',
        });
      },
      onError: (error) => {
        console.error('Project deletion error:', error);
        toast.error(`Failed to delete project: ${error.response?.data?.message || error.message}`, {
          duration: 4000,
          position: 'top-right',
        });
      }
    }
  );

  const handleEdit = (project, e) => {
    e.stopPropagation();
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const handleDelete = (project , e) => {
    e.stopPropagation();
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  }

  const confirmDelete = () => {
    if (projectToDelete) {
      deleteProjectMutation.mutate(projectToDelete.id);
      setProjectToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleShowApiKey = (project) => {
    setSelectedProject(project);
    setApiKeyModalOpen(true);
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
          <PageHeader
            title="Projects"
            badge={`${projects.length} Active`}
            actionText="Add New Project"
            actionIcon="add"
            onAction={() => setIsModalOpen(true)}
          />

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
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
                filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    searchQuery={searchQuery}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    onEdit={(e) => handleEdit(project, e)}
                    onDelete={(e) => handleDelete(project, e)}
                    onShowApiKey={handleShowApiKey}
                     isDeleting={deleteProjectMutation.isLoading && deleteProjectMutation.variables === project.id}
                  />
                ))
              )}
            </div>
          </div>

          {/* Footer */}
           <Footer/>
        </main>
      </div>

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setProjectToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${projectToDelete?.name}"? This will also delete all configurations in this project. This action cannot be undone.`}
        confirmText="Delete Project"
        cancelText="Cancel"
        isDangerous={true}
      />

      <AddProjectModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingProject={editingProject}
      />

      <ApiKeyModal
        isOpen={apiKeyModalOpen}
        onClose={() => {
          setApiKeyModalOpen(false);
          setSelectedProject(null);
        }}
        project={selectedProject}
      />
    </>
  );
};

export default Dashboard;