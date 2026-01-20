import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import Editor from '@monaco-editor/react';
import apiService from '../api/api';
import toast from 'react-hot-toast';

const AddConfigModal = ({ isOpen, onClose, projectId, existingConfigs = [], editingConfig = null , environment }) => {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState('form');
  const [editorMode, setEditorMode] = useState('json');
  const [editorContent, setEditorContent] = useState('');
  
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    environment: 'development',
    isSecret: false,
    isSensitive: false,
    description: ''
  });

  useEffect(() => {
    if (environment && !editingConfig) {
      setFormData(prev => ({
        ...prev,
        environment: environment
      }));
    }
  }, [environment, editingConfig]);

  // Edit modunda form'u doldur
  useEffect(() => {
    if (editingConfig) {
      setFormData({
        key: editingConfig.key || '',
        value: editingConfig.value || '',
        environment: editingConfig.environment || environment || 'development', // 👈 Fallback
        isSecret: editingConfig.isEncrypted || false,
        isSensitive: editingConfig.isSensitive || false,
        description: editingConfig.description || ''
      });
      setMode('form');
    } else {
      resetForm();
    }
  }, [editingConfig, environment]);

  // Single config mutation (Create)
  const addConfigMutation = useMutation(
    (newConfig) => apiService.configs.create(newConfig),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['configs', projectId]);
        onClose();
        resetForm();
        toast.success('Configuration created successfully! 🎉', {
          duration: 3000,
          position: 'top-right',
        });
      },
      onError: (error) => {
        console.error('Config creation error:', error);
        toast.error(`Failed to create config: ${error.response?.data?.message || error.message}`, {
          duration: 4000,
          position: 'top-right',
        });
      }
    }
  );

  // Single config mutation (Update)
  const updateConfigMutation = useMutation(
    ({ configId, configData }) => apiService.configs.update(configId, configData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['configs', projectId]);
        onClose();
        resetForm();
        toast.success('Configuration updated successfully! 🎉', {
          duration: 3000,
          position: 'top-right',
        });
      },
      onError: (error) => {
        console.error('Config update error:', error);
        toast.error(`Failed to update config: ${error.response?.data?.message || error.message}`, {
          duration: 4000,
          position: 'top-right',
        });
      }
    }
  );

  // Batch config mutation
  const batchConfigMutation = useMutation(
    (batchData) => apiService.configs.batchCreate(batchData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['configs', projectId]);
        onClose();
        setEditorContent('');
        toast.success('Configurations imported successfully! 🎉', {
          duration: 3000,
          position: 'top-right',
        });
      },
      onError: (error) => {
        console.error('Batch creation error:', error);
        toast.error(`Failed to import configs: ${error.response?.data?.message || error.message}`, {
          duration: 4000,
          position: 'top-right',
        });
      }
    }
  );

  const resetForm = () => {
    setFormData({
      key: '',
      value: '',
      environment: environment || 'development',
      isSecret: false,
      isSensitive: false,
      description: ''
    });
    setMode('form');
    setEditorContent('');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    const payload = {
      projectId: projectId,
      key: formData.key,
      value: formData.value,
      environment: formData.environment,
      description: formData.description,
      isEncrypted: formData.isSecret,
      isSensitive: formData.isSensitive
    };
    
    if (editingConfig) {
      // Update mode
      updateConfigMutation.mutate({ 
        configId: editingConfig.id, 
        configData: payload 
      });
    } else {
      // Create mode
      addConfigMutation.mutate(payload);
    }
  };

  const handleEditorSubmit = () => {
    try {
      let configs = {};
      
      if (editorMode === 'json') {
        const parsed = JSON.parse(editorContent);
        configs = typeof parsed === 'object' && !Array.isArray(parsed) 
          ? parsed 
          : Object.fromEntries(parsed.map(item => [item.key, item.value]));
      } else if (editorMode === 'env') {
        const lines = editorContent.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
        configs = Object.fromEntries(
          lines.map(line => {
            const [key, ...valueParts] = line.split('=');
            let value = valueParts.join('=').trim();
            if ((value.startsWith('"') && value.endsWith('"')) || 
                (value.startsWith("'") && value.endsWith("'"))) {
              value = value.slice(1, -1);
            }
            return [key.trim(), value];
          })
        );
      } else if (editorMode === 'yaml') {
        const lines = editorContent.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
        configs = Object.fromEntries(
          lines.map(line => {
            const [key, ...valueParts] = line.split(':');
            let value = valueParts.join(':').trim();
            if ((value.startsWith('"') && value.endsWith('"')) || 
                (value.startsWith("'") && value.endsWith("'"))) {
              value = value.slice(1, -1);
            }
            return [key.trim(), value];
          })
        );
      }

      if (Object.keys(configs).length === 0) {
        alert('No valid configurations found');
        return;
      }

      const payload = {
        environment: formData.environment,
        createdBy: 'admin',
        updatedBy: 'admin',
        configs: configs
      };

      batchConfigMutation.mutate(payload);
    } catch (error) {
      alert(`Parse error: ${error.message}`);
    }
  };

  const openEditor = (format) => {
    setEditorMode(format);
    setMode('editor');
    
    if (existingConfigs.length > 0) {
      if (format === 'json') {
        const jsonData = existingConfigs.reduce((acc, config) => {
          acc[config.key] = config.value;
          return acc;
        }, {});
        setEditorContent(JSON.stringify(jsonData, null, 2));
      } else if (format === 'env') {
        const envContent = existingConfigs
          .map(config => {
            const value = config.value.includes(' ') ? `"${config.value}"` : config.value;
            return `${config.key}=${value}`;
          })
          .join('\n');
        setEditorContent(envContent);
      } else if (format === 'yaml') {
        const yamlContent = existingConfigs
          .map(config => {
            const value = config.value.includes(':') ? `"${config.value}"` : config.value;
            return `${config.key}: ${value}`;
          })
          .join('\n');
        setEditorContent(yamlContent);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (!isOpen) return null;

  const isLoading = addConfigMutation.isLoading || updateConfigMutation.isLoading || batchConfigMutation.isLoading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#0d1117] rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-[#233648]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#233648]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <span className="material-symbols-outlined text-primary">
                {editingConfig ? 'edit' : 'add_circle'}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {editingConfig 
                  ? `Edit Configuration: ${editingConfig.key}` 
                  : mode === 'form' 
                    ? 'Add New Configuration' 
                    : 'Bulk Import Configurations'
                }
              </h2>
              <p className="text-xs text-gray-500">
                {editingConfig
                  ? 'Update the configuration values'
                  : mode === 'form' 
                    ? 'Create a single environment variable' 
                    : `Import multiple configs from ${editorMode.toUpperCase()}`
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {mode === 'editor' && !editingConfig && (
              <button
                onClick={() => setMode('form')}
                className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
              >
                ← Back to Form
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors text-gray-500"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* Body - Form Mode */}
        {mode === 'form' && (
          <form onSubmit={handleFormSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)] custom-scrollbar">
            {/* Environment Tabs */}
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-[#161b22] rounded-lg">
              {['development', 'staging', 'production'].map((env) => (
                <button
                  key={env}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, environment: env }))}
                  className={`flex-1 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
                    formData.environment === env
                      ? 'bg-primary text-white shadow-lg'
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {env}
                </button>
              ))}
            </div>

            {/* Key Name */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Key Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="key"
                value={formData.key}
                onChange={handleChange}
                required
                disabled={!!editingConfig} // Edit modunda key değiştirilemez
                placeholder="e.g. DATABASE_URL, API_KEY"
                className="w-full bg-white text-white dark:bg-[#161b22] border border-gray-200 dark:border-[#324d67] rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all font-mono disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Value */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Value <span className="text-red-500">*</span>
              </label>
              <textarea
                name="value"
                value={formData.value}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Paste your configuration value here..."
                className="w-full bg-white text-white dark:bg-[#161b22] border border-gray-200 dark:border-[#324d67] rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all font-mono resize-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description"
                className="w-full bg-white text-white dark:bg-[#161b22] border border-gray-200 dark:border-[#324d67] rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all"
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isSensitive"
                  name="isSensitive"
                  checked={formData.isSensitive}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-gray-300 dark:border-[#324d67] text-primary focus:ring-primary"
                />
                <label htmlFor="isSensitive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sensitive (hide in UI)
                </label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isSecret"
                  name="isSecret"
                  checked={formData.isSecret}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-gray-300 dark:border-[#324d67] text-primary focus:ring-primary"
                />
                <label htmlFor="isSecret" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Encrypted (encrypt in database)
                </label>
              </div>
            </div>

            {/* Bulk Import Buttons - Sadece yeni ekleme modunda göster */}
            {!editingConfig && (
              <div className="pt-4 border-t border-gray-200 dark:border-[#324d67]">
                <p className="text-xs text-gray-500 mb-3">Or import multiple configurations:</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEditor('json')}
                    className="flex-1 flex items-center text-white justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#161b22] hover:bg-gray-200 dark:hover:bg-[#1f2937] rounded-lg transition-colors text-sm font-medium"
                  >
                    <span className="material-symbols-outlined text-lg">data_object</span>
                    JSON Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditor('env')}
                    className="flex-1 flex items-center text-white justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#161b22] hover:bg-gray-200 dark:hover:bg-[#1f2937] rounded-lg transition-colors text-sm font-medium"
                  >
                    <span className="material-symbols-outlined text-lg">terminal</span>
                    .ENV Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditor('yaml')}
                    className="flex-1 flex items-center text-white justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#161b22] hover:bg-gray-200 dark:hover:bg-[#1f2937] rounded-lg transition-colors text-sm font-medium"
                  >
                    <span className="material-symbols-outlined text-lg">code</span>
                    YAML Editor
                  </button>
                </div>
              </div>
            )}
          </form>
        )}

        {/* Body - Editor Mode */}
        {mode === 'editor' && (
          <div className="flex flex-col h-[calc(90vh-180px)]">
            {/* Editor Toolbar */}
            <div className="p-4 border-b border-gray-200 dark:border-[#233648] bg-gray-50 dark:bg-[#0d1117]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditor('json')}
                    className={`px-3 py-1 text-xs font-bold uppercase rounded-md transition-all ${
                      editorMode === 'json'
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 dark:bg-[#161b22] text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    JSON
                  </button>
                  <button
                    onClick={() => openEditor('env')}
                    className={`px-3 py-1 text-xs font-bold uppercase rounded-md transition-all ${
                      editorMode === 'env'
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 dark:bg-[#161b22] text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    .ENV
                  </button>
                  <button
                    onClick={() => openEditor('yaml')}
                    className={`px-3 py-1 text-xs font-bold uppercase rounded-md transition-all ${
                      editorMode === 'yaml'
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 dark:bg-[#161b22] text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    YAML
                  </button>
                </div>
                <div className="flex gap-2 p-1 bg-gray-200 dark:bg-[#161b22] rounded-lg">
                  {['production' , 'staging' , 'development'].map((env) => (
                    <button
                      key={env}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, environment: env }))}
                      className={`px-3 py-1 text-xs font-bold uppercase rounded-md transition-all ${
                        formData.environment === env
                          ? 'bg-primary text-white'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {env}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-500">
                {editorMode === 'json' && '💡 Format: {"KEY": "value", ...}'}
                {editorMode === 'env' && '💡 Format: KEY=value (one per line)'}
                {editorMode === 'yaml' && '💡 Format: KEY: value (one per line)'}
              </p>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1 min-h-0">
              <Editor
                language={editorMode === 'env' ? 'properties' : editorMode}
                theme="vs-dark"
                value={editorContent}
                onChange={(value) => setEditorContent(value || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  wordWrap: 'on',
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  tabSize: 2,
                  insertSpaces: true,
                  formatOnPaste: true,
                  formatOnType: true
                }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-[#233648] bg-gray-50 dark:bg-[#0d1117]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={mode === 'form' ? handleFormSubmit : handleEditorSubmit}
            disabled={
              (mode === 'form' && (!formData.key || !formData.value)) ||
              (mode === 'editor' && !editorContent.trim()) ||
              isLoading
            }
            className="px-6 py-2 bg-primary hover:bg-primary/90 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all shadow-lg shadow-primary/20 text-sm"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                {editingConfig ? 'Updating...' : mode === 'form' ? 'Creating...' : 'Importing...'}
              </span>
            ) : (
              editingConfig 
                ? 'Update Configuration' 
                : mode === 'form' 
                  ? 'Create Configuration' 
                  : `Import ${editorMode.toUpperCase()}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddConfigModal;