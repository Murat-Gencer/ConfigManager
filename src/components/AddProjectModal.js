import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import apiService from '../api/api';
import toast from 'react-hot-toast';

const AddProjectModal = ({ isOpen, onClose, editingProject = null }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  // Edit modunda form'u doldur
  useEffect(() => {
    if (editingProject) {
      setFormData({
        name: editingProject.name || '',
        description: editingProject.description || ''
      });
    } else {
      resetForm();
    }
  }, [editingProject]);

  // Create mutation
  const createProjectMutation = useMutation(
    (newProject) => apiService.projects.create(newProject),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['projects']);
        onClose();
        resetForm();
        toast.success('Project created successfully! 🎉', {
          duration: 3000,
          position: 'top-right',
        });
      },
      onError: (error) => {
        console.error('Project creation error:', error);
        toast.error(`Failed to create project: ${error.response?.data?.message || error.message}`, {
          duration: 4000,
          position: 'top-right',
        });
      }
    }
  );

  // Update mutation
  const updateProjectMutation = useMutation(
    ({ projectId, projectData }) => apiService.projects.update(projectId, projectData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['projects']);
        onClose();
        resetForm();
        toast.success('Project updated successfully! 🎉', {
          duration: 3000,
          position: 'top-right',
        });
      },
      onError: (error) => {
        console.error('Project update error:', error);
        toast.error(`Failed to update project: ${error.response?.data?.message || error.message}`, {
          duration: 4000,
          position: 'top-right',
        });
      }
    }
  );

  const resetForm = () => {
    setFormData({
      name: '',
      description: ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Project name is required!', {
        duration: 3000,
        position: 'top-right',
      });
      return;
    }

    if (editingProject) {
      updateProjectMutation.mutate({
        projectId: editingProject.id,
        projectData: formData
      });
    } else {
      createProjectMutation.mutate(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  const isLoading = createProjectMutation.isLoading || updateProjectMutation.isLoading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-[#0d1117] rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200 dark:border-[#233648] animate-scaleIn overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#233648]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <span className="material-symbols-outlined text-primary">
                {editingProject ? 'edit' : 'create_new_folder'}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {editingProject ? `Edit Project: ${editingProject.name}` : 'Create New Project'}
              </h2>
              <p className="text-xs text-gray-500">
                {editingProject 
                  ? 'Update project information' 
                  : 'Add a new project to manage configurations'
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors text-gray-500"
            disabled={isLoading}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Project Name */}
          <div>
            <label className="block  text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
              Project Name *
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xl">
                folder
              </span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full text-white bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#324d67] rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                placeholder="e.g., My Awesome Project"
                required
                disabled={isLoading}
                autoFocus
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Choose a descriptive name for your project
            </p>
          </div>

          {/* Project Description */}
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
              Description (Optional)
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-3 text-gray-500 text-xl">
                description
              </span>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full text-white bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#324d67] rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all resize-none"
                placeholder="Brief description of your project..."
                rows="4"
                disabled={isLoading}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Add more context about this project (optional)
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-blue-500 text-xl">info</span>
              <div>
                <p className="text-sm text-blue-400 font-medium mb-1">Quick Tip</p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  After creating the project, you'll be able to add configurations for different environments 
                  (development, staging, production).
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-[#233648] bg-gray-50 dark:bg-[#0d1117]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-6 py-2 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-all shadow-lg shadow-primary/20 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                {editingProject ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">
                  {editingProject ? 'save' : 'add_circle'}
                </span>
                {editingProject ? 'Update Project' : 'Create Project'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProjectModal;