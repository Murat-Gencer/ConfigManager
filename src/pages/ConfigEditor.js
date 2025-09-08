import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
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
  VisibilityOff as VisibilityOffIcon
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
  const [editingConfig, setEditingConfig] = useState(null);
  const [showSensitive, setShowSensitive] = useState({});
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
        queryClient.invalidateQueries(['configurations', environment]);
        toast.success('Configuration created successfully!');
        setOpenDialog(false);
        resetForm();
      },
      onError: (error) => {
        if (error.response?.status === 409) {
          toast.error('Configuration key already exists!');
        } else {
          toast.error('Error creating configuration');
        }
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
        queryClient.invalidateQueries(['configurations', environment]);
        toast.success('Configuration updated successfully!');
        setOpenDialog(false);
        resetForm();
      },
      onError: () => {
        toast.error('Error updating configuration');
      }
    }
  );

  const deleteMutation = useMutation(
    async (key) => {
      await axios.delete(`/api/config/${environment}/${key}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['configurations', environment]);
        toast.success('Configuration deleted successfully!');
      },
      onError: () => {
        toast.error('Error deleting configuration');
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
    </Box>
  );
};

export default ConfigEditor;
