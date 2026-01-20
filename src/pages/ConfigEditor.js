import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import apiService from '../api/api';
import AddConfigModal from '../components/AddConfig';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/ConfirmDialog';
import Sidebar from '../components/Sidebar';


const ConfigEditor = () => {
  const { projectId } = useParams();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [configToDelete, setConfigToDelete] = useState(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState('development');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = apiService.auth.getCurrentUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);

  // Project bilgisini çek
  const { data: project, isLoading: projectLoading } = useQuery(
    ['project', projectId],
    () => apiService.projects.getById(projectId)
  );

  // Config verilerini çek
  const { data: configs = [], isLoading: configsLoading } = useQuery(
    ['configs', projectId, selectedEnvironment],
    () => apiService.configs.getByEnvironment(projectId, selectedEnvironment),
    {
      staleTime: 30000, // 30 saniye fresh kalır
      cacheTime: 300000, // 5 dakika cache'te kalır
      refetchOnWindowFocus: false, // Tab değiştirince yeniden çekme
    }
  );

  const filteredConfigs = configs.filter((config) => {
    if (!searchQuery) return true; // Search boşsa hepsini göster

    const query = searchQuery.toLowerCase();
    return (
      config.key?.toLowerCase().includes(query) ||
      config.value?.toLowerCase().includes(query) ||
      config.description?.toLowerCase().includes(query)
    );
  });

  // Delete mutation
  const deleteConfigMutation = useMutation(
    (configId) => apiService.configs.delete(configId, selectedEnvironment),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['configs', projectId, selectedEnvironment]);
        toast.success('Configuration deleted successfully! 🎉', {
          duration: 3000,
          position: 'top-right',
        });
      },
      onError: (error) => {
        console.error('Config deletion error:', error);
        toast.error(`Failed to delete config: ${error.response?.data?.message || error.message}`, {
          duration: 4000,
          position: 'top-right',
        });
      }
    }
  );

  const handleLogout = () => {
    apiService.auth.logout();
    navigate('/');
  };

  const handleEdit = (config) => {
    setEditingConfig(config);
    setIsModalOpen(true);
  };

  const handleDelete = (config) => {
    setConfigToDelete(config);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (configToDelete) {
      deleteConfigMutation.mutate(configToDelete.id);
      setConfigToDelete(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingConfig(null);
  };

  if (projectLoading || configsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-dark">
        <div className="text-white">Loading configuration...</div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-background-light dark:bg-background-dark min-h-screen flex font-display text-gray-900 dark:text-gray-100 overflow-hidden">

        <Sidebar />

        <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          <header className="h-16 border-b border-gray-200 dark:border-[#233648] bg-white dark:bg-background-dark/50 flex items-center justify-between px-8">
            <div className="flex items-center gap-4">
              <button
                className="text-gray-500 hover:text-white transition-colors"
                onClick={() => navigate('/dashboard')}
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <h1 className="text-xl font-bold">{project?.name || 'Project'}</h1>
              <span className="px-2 py-0.5 rounded bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-bold uppercase tracking-widest">
                {selectedEnvironment}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-primary/20"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Add New Config
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="flex items-center justify-between gap-6 mb-8">
              {/* Environment Tabs */}
              <div className="flex gap-3 p-1 bg-gray-100 dark:bg-[#161b22] rounded-xl">
                {[
                  { env: 'production', icon: '🚀', color: 'green' },
                  { env: 'staging', icon: '🔧', color: 'yellow' },
                  { env: 'development', icon: '💻', color: 'blue' }
                ].map(({ env, icon, color }) => (
                  <button
                    key={env}
                    onClick={() => {
                      setSelectedEnvironment(env);
                      setSearchQuery('');
                    }}
                    className={`group relative px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${selectedEnvironment === env
                        ? color === 'green'
                          ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                          : color === 'yellow'
                            ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/20'
                            : 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-lg">{icon}</span>
                      {env}
                      {configs.length > 0 && selectedEnvironment === env && (
                        <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20">
                          {configs.length}
                        </span>
                      )}
                    </span>
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xl">search</span>
                <input
                  className="w-full bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#324d67] rounded-lg pl-10 pr-10 py-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                  placeholder={`Search in ${selectedEnvironment}...`}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {/* 👇 Clear button */}
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                )}
              </div>
            </div>


            {/* Config List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                  {selectedEnvironment} Variables
                </h3>
                <span className="text-xs text-gray-500">{configs.length} Variables</span>
              </div>

              {filteredConfigs.length === 0 ? (
                <div className="glass-card rounded-xl p-12 text-center">
                  <span className="material-symbols-outlined text-gray-400 text-6xl mb-4">key_off</span>
                  <h3 className="text-lg font-bold text-gray-600 dark:text-gray-400 mb-2">
                    No configurations in {selectedEnvironment}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Add your first {selectedEnvironment} config to get started!
                  </p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-bold transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Add Config
                  </button>
                </div>
              ) : (
                filteredConfigs.map((config) => (
                  <div
                    key={config.id}
                    className="glass-card rounded-xl p-4 flex items-center justify-between group hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-gray-100 dark:bg-white/5 rounded-lg">
                        <span className="material-symbols-outlined text-primary">key</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm font-mono">
                          {highlightText(config.key, searchQuery)}
                        </h4>
                        <p className="text-xs text-gray-500 font-mono">
                          {config.isSensitive ? '••••••••' : highlightText(config.value, searchQuery)}
                        </p>
                        {config.description && (
                          <p className="text-xs text-gray-400 mt-1">{highlightText(config.description, searchQuery)}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {config.isSensitive && (
                        <span className="px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-500 text-[10px] font-bold">
                          <span className="material-symbols-outlined text-xs">visibility_off</span>
                        </span>
                      )}
                      {config.isEncrypted && (
                        <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-500 text-[10px] font-bold">
                          <span className="material-symbols-outlined text-xs">lock</span>
                        </span>
                      )}
                      <button
                        onClick={() => handleEdit(config)}
                        className="p-2 hover:bg-white/10 rounded-lg text-gray-500 hover:text-primary transition-colors"
                        disabled={deleteConfigMutation.isLoading}
                      >
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(config)}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-gray-500 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={deleteConfigMutation.isLoading}
                      >
                        {deleteConfigMutation.isLoading && deleteConfigMutation.variables === config.id ? (
                          <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                        ) : (
                          <span className="material-symbols-outlined text-lg">delete</span>
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
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

      <AddConfigModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        projectId={projectId}
        existingConfigs={configs}
        editingConfig={editingConfig}
        environment={selectedEnvironment}
      />

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setConfigToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Configuration"
        message={`Are you sure you want to delete "${configToDelete?.key}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
      />
    </>
  );
};

function highlightText(text, query) {
  if (!query || !text) return text;

  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={index} className="bg-yellow-200 dark:bg-yellow-500/30 text-gray-900 dark:text-white rounded px-1">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
}

export default ConfigEditor;