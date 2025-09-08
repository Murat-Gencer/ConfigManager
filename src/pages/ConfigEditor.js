import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import Editor from '@monaco-editor/react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Chip,
  Alert,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  DataObject as DataObjectIcon,
  Code as CodeIcon
} from '@mui/icons-material';
import axios from 'axios';
import toast from 'react-hot-toast';
import fileDownload from 'js-file-download';

const ConfigEditor = () => {
  const { environment } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditorDialog, setOpenEditorDialog] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [showSensitive, setShowSensitive] = useState({});
  const [bulkJsonText, setBulkJsonText] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [editorMode, setEditorMode] = useState('json'); // json, yaml, env
  const [newConfig, setNewConfig] = useState({
    key: '',
    value: '',
    description: '',
    isSensitive: false,
    isEncrypted: false
  });

  const { data: configurations = [], isLoading, refetch } = useQuery(
    ['configurations', environment],
    async () => {
      const response = await axios.get(`/api/config/${environment}`);
      return response.data;
    }
  );

  const createMutation = useMutation(
    async (config) => {
      const response = await axios.post('/api/config', {
        ...config,
        environment,
        createdBy: 'user' // TODO: Get from auth context
      });
      return response.data;
    },
    {
      onSuccess: () => {
        // Force refresh the data
        queryClient.invalidateQueries(['configurations', environment]);
        queryClient.refetchQueries(['configurations', environment]);
        toast.success('Configuration created successfully!');
        setOpenDialog(false);
        resetForm();
      },
      onError: (error) => {
        console.error('Create error:', error);
        if (error.response?.status === 409) {
          toast.error('Configuration key already exists!');
        } else {
          toast.error(`Error creating configuration: ${error.response?.data?.message || error.message}`);
        }
        // Still try to refresh data in case it was actually created
        queryClient.invalidateQueries(['configurations', environment]);
        queryClient.refetchQueries(['configurations', environment]);
      }
    }
  );

  const bulkCreateMutation = useMutation(
    async (configs) => {
      const results = [];
      const errors = [];
      
      // Process configs one by one to handle individual errors
      for (const config of configs) {
        try {
          const response = await axios.post('/api/config', {
            ...config,
            environment,
            createdBy: 'user'
          });
          results.push(response.data);
        } catch (error) {
          console.error(`Error creating config ${config.key}:`, error);
          if (error.response?.status !== 409) { // Ignore duplicate key errors
            errors.push({ key: config.key, error: error.message });
          }
        }
      }
      
      return { results, errors };
    },
    {
      onSuccess: ({ results, errors }) => {
        // Force refresh the data
        queryClient.invalidateQueries(['configurations', environment]);
        queryClient.refetchQueries(['configurations', environment]);
        
        if (results.length > 0) {
          toast.success(`${results.length} configurations created successfully!`);
        }
        if (errors.length > 0) {
          toast.warning(`${errors.length} configurations had errors. Check console for details.`);
        }
        
        setOpenEditorDialog(false);
        setBulkJsonText('');
        setEditorContent('');
      },
      onError: (error) => {
        console.error('Bulk create error:', error);
        toast.error('Error creating configurations. Please try again.');
        // Still try to refresh data in case some succeeded
        queryClient.invalidateQueries(['configurations', environment]);
        queryClient.refetchQueries(['configurations', environment]);
      }
    }
  );

  const updateMutation = useMutation(
    async ({ key, config }) => {
      const response = await axios.put(`/api/config/${environment}/${key}`, {
        ...config,
        updatedBy: 'user' // TODO: Get from auth context
      });
      return response.data;
    },
    {
      onSuccess: () => {
        // Force refresh the data
        queryClient.invalidateQueries(['configurations', environment]);
        queryClient.refetchQueries(['configurations', environment]);
        toast.success('Configuration updated successfully!');
        setOpenDialog(false);
        resetForm();
      },
      onError: (error) => {
        console.error('Update error:', error);
        toast.error(`Error updating configuration: ${error.response?.data?.message || error.message}`);
        // Still try to refresh data
        queryClient.invalidateQueries(['configurations', environment]);
        queryClient.refetchQueries(['configurations', environment]);
      }
    }
  );

  const deleteMutation = useMutation(
    async (key) => {
      await axios.delete(`/api/config/${environment}/${key}`);
    },
    {
      onSuccess: () => {
        // Force refresh the data
        queryClient.invalidateQueries(['configurations', environment]);
        queryClient.refetchQueries(['configurations', environment]);
        toast.success('Configuration deleted successfully!');
      },
      onError: (error) => {
        console.error('Delete error:', error);
        toast.error(`Error deleting configuration: ${error.response?.data?.message || error.message}`);
        // Still try to refresh data
        queryClient.invalidateQueries(['configurations', environment]);
        queryClient.refetchQueries(['configurations', environment]);
      }
    }
  );

  const resetForm = () => {
    setNewConfig({
      key: '',
      value: '',
      description: '',
      isSensitive: false,
      isEncrypted: false
    });
    setEditingConfig(null);
  };

  const handleSubmit = () => {
    if (!newConfig.key || !newConfig.value) {
      toast.error('Key and value are required');
      return;
    }

    if (editingConfig) {
      updateMutation.mutate({ 
        key: editingConfig.key, 
        config: newConfig 
      });
    } else {
      createMutation.mutate(newConfig);
    }
  };

  const handleBulkSubmit = () => {
    try {
      let parsedConfigs = [];
      
      // Try to parse as JSON first
      try {
        const jsonData = JSON.parse(bulkJsonText);
        
        if (typeof jsonData === 'object' && !Array.isArray(jsonData)) {
          // Convert object to array of configs
          parsedConfigs = Object.entries(jsonData).map(([key, value]) => ({
            key,
            value: String(value),
            description: `Imported from JSON`,
            isSensitive: false,
            isEncrypted: false
          }));
        } else if (Array.isArray(jsonData)) {
          // Handle array format
          parsedConfigs = jsonData.map(item => {
            if (typeof item === 'object' && item.key && item.value !== undefined) {
              return {
                key: item.key,
                value: String(item.value),
                description: item.description || 'Imported from JSON',
                isSensitive: item.isSensitive || false,
                isEncrypted: item.isEncrypted || false
              };
            }
            throw new Error('Invalid array format');
          });
        }
      } catch (jsonError) {
        // Try to parse as .env format
        const lines = bulkJsonText.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
        
        parsedConfigs = lines.map(line => {
          const equalIndex = line.indexOf('=');
          if (equalIndex === -1) {
            throw new Error(`Invalid line format: ${line}`);
          }
          
          const key = line.substring(0, equalIndex).trim();
          let value = line.substring(equalIndex + 1).trim();
          
          // Remove quotes if present
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          
          return {
            key,
            value,
            description: 'Imported from text',
            isSensitive: false,
            isEncrypted: false
          };
        });
      }

      if (parsedConfigs.length === 0) {
        toast.error('No valid configurations found');
        return;
      }

      bulkCreateMutation.mutate(parsedConfigs);
    } catch (error) {
      toast.error(`Parse error: ${error.message}`);
    }
  };

  const handleEditorSubmit = () => {
    try {
      let parsedConfigs = [];
      
      if (editorMode === 'json') {
        const jsonData = JSON.parse(editorContent);
        
        if (typeof jsonData === 'object' && !Array.isArray(jsonData)) {
          parsedConfigs = Object.entries(jsonData).map(([key, value]) => ({
            key,
            value: String(value),
            description: `Imported from Monaco Editor`,
            isSensitive: false,
            isEncrypted: false
          }));
        } else if (Array.isArray(jsonData)) {
          parsedConfigs = jsonData.map(item => ({
            key: item.key,
            value: String(item.value),
            description: item.description || 'Imported from Monaco Editor',
            isSensitive: item.isSensitive || false,
            isEncrypted: item.isEncrypted || false
          }));
        }
      } else if (editorMode === 'env') {
        const lines = editorContent.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
        
        parsedConfigs = lines.map(line => {
          const equalIndex = line.indexOf('=');
          if (equalIndex === -1) {
            throw new Error(`Invalid line format: ${line}`);
          }
          
          const key = line.substring(0, equalIndex).trim();
          let value = line.substring(equalIndex + 1).trim();
          
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          
          return {
            key,
            value,
            description: 'Imported from Monaco Editor',
            isSensitive: false,
            isEncrypted: false
          };
        });
      } else if (editorMode === 'yaml') {
        // Simple YAML parsing for key-value pairs
        const lines = editorContent.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
        
        parsedConfigs = lines.map(line => {
          const colonIndex = line.indexOf(':');
          if (colonIndex === -1) {
            throw new Error(`Invalid YAML line format: ${line}`);
          }
          
          const key = line.substring(0, colonIndex).trim();
          let value = line.substring(colonIndex + 1).trim();
          
          // Remove YAML quotes if present
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          
          return {
            key,
            value,
            description: 'Imported from Monaco Editor',
            isSensitive: false,
            isEncrypted: false
          };
        });
      }

      if (parsedConfigs.length === 0) {
        toast.error('No valid configurations found');
        return;
      }

      bulkCreateMutation.mutate(parsedConfigs);
      setOpenEditorDialog(false);
      setEditorContent('');
    } catch (error) {
      toast.error(`Parse error: ${error.message}`);
    }
  };

  const openCodeEditor = (mode = 'json') => {
    setEditorMode(mode);
    
    // Always populate with current configurations
    if (configurations.length > 0) {
      if (mode === 'json') {
        // Create JSON object with all current configurations
        const jsonData = configurations.reduce((acc, config) => {
          acc[config.key] = config.value;
          return acc;
        }, {});
        setEditorContent(JSON.stringify(jsonData, null, 2));
      } else if (mode === 'env') {
        // Create .env format with all current configurations
        const envContent = configurations
          .map(config => {
            // Add quotes if value contains spaces or special characters
            const value = config.value.includes(' ') || config.value.includes('#') 
              ? `"${config.value}"` 
              : config.value;
            return `${config.key}=${value}`;
          })
          .join('\n');
        setEditorContent(envContent);
      } else if (mode === 'yaml') {
        // Create YAML format with all current configurations
        const yamlContent = configurations
          .map(config => {
            // Add quotes if value contains special characters
            const value = config.value.includes(':') || config.value.includes('#') 
              ? `"${config.value}"` 
              : config.value;
            return `${config.key}: ${value}`;
          })
          .join('\n');
        setEditorContent(yamlContent);
      }
    } else {
      // Default examples when no configurations exist
      if (mode === 'json') {
        setEditorContent(`{
  "DATABASE_URL": "postgresql://localhost:5432/mydb",
  "API_KEY": "your-secret-key",
  "PORT": "3000",
  "NODE_ENV": "production"
}`);
      } else if (mode === 'env') {
        setEditorContent(`DATABASE_URL=postgresql://localhost:5432/mydb
API_KEY=your-secret-key
PORT=3000
NODE_ENV=production`);
      } else if (mode === 'yaml') {
        setEditorContent(`DATABASE_URL: postgresql://localhost:5432/mydb
API_KEY: your-secret-key
PORT: 3000
NODE_ENV: production`);
      }
    }
    
    setOpenEditorDialog(true);
  };

  const handleEdit = (config) => {
    setEditingConfig(config);
    setNewConfig({
      key: config.key,
      value: config.value,
      description: config.description || '',
      isSensitive: config.isSensitive,
      isEncrypted: config.isEncrypted
    });
    setOpenDialog(true);
  };

  const handleDelete = (key) => {
    if (window.confirm('Are you sure you want to delete this configuration?')) {
      deleteMutation.mutate(key);
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.get(`/api/config/${environment}/export/env`, {
        responseType: 'blob'
      });
      fileDownload(response.data, `${environment}.env`);
      toast.success('Configuration exported successfully!');
    } catch (error) {
      toast.error('Error exporting configuration');
    }
  };

  const toggleSensitiveVisibility = (key) => {
    setShowSensitive(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const filteredConfigurations = configurations.filter(config =>
    config.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (config.description && config.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          {environment.charAt(0).toUpperCase() + environment.slice(1)} Configuration
        </Typography>
      </Box>

      <Box className="toolbar">
        <TextField
          placeholder="Search configurations..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
          sx={{ minWidth: 300 }}
        />
        
        <Box>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            sx={{ mr: 2 }}
            disabled={configurations.length === 0}
          >
            Export .env
          </Button>
          <Button
            variant="outlined"
            startIcon={<CodeIcon />}
            onClick={() => openCodeEditor('json')}
            sx={{ mr: 2 }}
          >
            Code Editor
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Add Configuration
          </Button>
        </Box>
      </Box>

      {configurations.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          No configurations found for {environment}. Click "Add Configuration" to get started.
        </Alert>
      ) : (
        <TableContainer component={Paper} className="config-table">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Key</strong></TableCell>
                <TableCell><strong>Value</strong></TableCell>
                <TableCell><strong>Description</strong></TableCell>
                <TableCell><strong>Properties</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredConfigurations.map((config) => (
                <TableRow key={config.id}>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {config.key}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Typography 
                        variant="body2" 
                        fontFamily="monospace"
                        sx={{ 
                          maxWidth: 200, 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {config.isSensitive && !showSensitive[config.key] 
                          ? '••••••••' 
                          : config.value
                        }
                      </Typography>
                      {config.isSensitive && (
                        <IconButton 
                          size="small" 
                          onClick={() => toggleSensitiveVisibility(config.key)}
                          sx={{ ml: 1 }}
                        >
                          {showSensitive[config.key] ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {config.description || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      {config.isSensitive && (
                        <Chip label="Sensitive" color="warning" size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                      )}
                      {config.isEncrypted && (
                        <Chip label="Encrypted" color="info" size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit">
                      <IconButton 
                        size="small" 
                        onClick={() => handleEdit(config)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton 
                        size="small" 
                        onClick={() => handleDelete(config.key)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingConfig ? 'Edit Configuration' : 'Add New Configuration'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Key"
              variant="outlined"
              fullWidth
              value={newConfig.key}
              onChange={(e) => setNewConfig({ ...newConfig, key: e.target.value })}
              disabled={!!editingConfig}
              placeholder="DATABASE_URL"
            />
            <TextField
              label="Value"
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              value={newConfig.value}
              onChange={(e) => setNewConfig({ ...newConfig, value: e.target.value })}
              placeholder="postgresql://localhost:5432/mydb"
            />
            <TextField
              label="Description"
              variant="outlined"
              fullWidth
              value={newConfig.description}
              onChange={(e) => setNewConfig({ ...newConfig, description: e.target.value })}
              placeholder="Database connection URL for the application"
            />
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newConfig.isSensitive}
                    onChange={(e) => setNewConfig({ ...newConfig, isSensitive: e.target.checked })}
                  />
                }
                label="Sensitive (hide value in UI)"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newConfig.isEncrypted}
                    onChange={(e) => setNewConfig({ ...newConfig, isEncrypted: e.target.checked })}
                  />
                }
                label="Encrypted (encrypt in database)"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setOpenDialog(false);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={createMutation.isLoading || updateMutation.isLoading}
          >
            {editingConfig ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Monaco Code Editor Dialog */}
      <Dialog 
        open={openEditorDialog} 
        onClose={() => setOpenEditorDialog(false)} 
        maxWidth="xl" 
        fullWidth
        PaperProps={{
          sx: { height: '90vh', maxHeight: '90vh' }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Code Editor - Environment Variables</Typography>
            <Box>
              <Button
                size="small"
                variant={editorMode === 'json' ? 'contained' : 'outlined'}
                onClick={() => openCodeEditor('json')}
                sx={{ mr: 1 }}
              >
                JSON
              </Button>
              <Button
                size="small"
                variant={editorMode === 'env' ? 'contained' : 'outlined'}
                onClick={() => openCodeEditor('env')}
                sx={{ mr: 1 }}
              >
                .ENV
              </Button>
              <Button
                size="small"
                variant={editorMode === 'yaml' ? 'contained' : 'outlined'}
                onClick={() => openCodeEditor('yaml')}
              >
                YAML
              </Button>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <Box sx={{ mb: 2, px: 3, pt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                {editorMode === 'json' && ' - Use objects like {"KEY": "value"} or arrays with metadata'}
                {editorMode === 'env' && ' - Use KEY=value format, one per line'}
                {editorMode === 'yaml' && ' - Use KEY: value format, one per line'}
              </Typography>
            </Alert>
          </Box>
          
          <Box sx={{ flex: 1, minHeight: 0, px: 3 }}>
            <Editor
              language={editorMode === 'env' ? 'properties' : editorMode}
              theme="vs-dark"
              value={editorContent}
              onChange={(value) => setEditorContent(value || '')}
              options={{
                minimap: { enabled: true },
                fontSize: 16,
                lineNumbers: 'on',
                wordWrap: 'on',
                automaticLayout: true,
                scrollBeyondLastLine: false,
                folding: true,
                bracketMatching: 'always',
                autoIndent: 'full',
                formatOnPaste: true,
                formatOnType: true,
                suggestOnTriggerCharacters: true,
                acceptSuggestionOnEnter: 'on',
                tabCompletion: 'on',
                parameterHints: { enabled: true },
                quickSuggestions: true,
                hover: { enabled: true },
                contextmenu: true,
                selectOnLineNumbers: true,
                roundedSelection: false,
                readOnly: false,
                cursorStyle: 'line',
                smoothScrolling: true,
                cursorBlinking: 'blink',
                renderWhitespace: 'selection',
                renderIndentGuides: true,
                colorDecorators: true,
                codeLens: true,
                lightbulb: { enabled: true }
              }}
              onMount={(editor, monaco) => {
                // Configure JSON schema for better IntelliSense
                if (editorMode === 'json') {
                  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
                    validate: true,
                    allowComments: false,
                    schemas: [{
                      uri: "http://configmanager.schema.json",
                      fileMatch: ["*"],
                      schema: {
                        type: "object",
                        properties: {
                          "DATABASE_URL": { type: "string", description: "Database connection URL" },
                          "API_KEY": { type: "string", description: "API authentication key" },
                          "PORT": { type: "string", description: "Application port number" },
                          "NODE_ENV": { type: "string", enum: ["development", "staging", "production"] }
                        },
                        additionalProperties: { type: "string" }
                      }
                    }]
                  });
                }
                
                // Add custom key bindings
                editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
                  handleEditorSubmit();
                });
                
                // Focus editor
                editor.focus();
              }}
            />
          </Box>
          
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Typography variant="caption" color="text.secondary">
              💡 <strong>Tips:</strong> Press Ctrl+S to save • Use Ctrl+Space for autocomplete • 
              {editorMode === 'json' && 'Supports both object and array formats'}
              {editorMode === 'env' && 'Comments start with # and will be ignored'}
              {editorMode === 'yaml' && 'Use proper YAML indentation for nested values'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={() => {
              setOpenEditorDialog(false);
              setEditorContent('');
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleEditorSubmit} 
            variant="contained"
            disabled={bulkCreateMutation.isLoading || !editorContent.trim()}
            startIcon={<DataObjectIcon />}
          >
            {bulkCreateMutation.isLoading ? 'Creating...' : `Import ${editorMode.toUpperCase()}`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConfigEditor;
