import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  TextField,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { AccountTree } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAppContext } from '../context/AppContext';

function Projects() {
  const token = localStorage.getItem('token');
  const queryClient = useQueryClient();
  const { selectedRegion } = useAppContext();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    region: selectedRegion || 'India',
    budget: 1000000,
  });

  const { data: projects, isLoading, isError } = useQuery(
    ['projects'],
    () => api.getProjects(),
    { enabled: Boolean(token) }
  );

  const createMutation = useMutation((payload) => api.createProject(payload), {
    onSuccess: () => {
      toast.success('Project created');
      setForm((f) => ({ ...f, name: '', description: '' }));
      queryClient.invalidateQueries(['projects']);
    },
    onError: (err) => {
      toast.error(err?.error || 'Failed to create project');
    },
  });

  if (!token) {
    return (
      <Container maxWidth="md">
        <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
          <AccountTree sx={{ mr: 2, verticalAlign: 'middle' }} />
          Projects
        </Typography>
        <Alert severity="info">Login is required to view projects</Alert>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container maxWidth="md">
        <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
          <AccountTree sx={{ mr: 2, verticalAlign: 'middle' }} />
          Projects
        </Typography>
        <CircularProgress />
      </Container>
    );
  }

  if (isError) {
    toast.error('Unable to load projects');
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
        <AccountTree sx={{ mr: 2, verticalAlign: 'middle' }} />
        Projects
      </Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Create Project
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            sx={{ flex: 1, minWidth: 240 }}
          />
          <TextField
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            sx={{ flex: 2, minWidth: 300 }}
          />
          <TextField
            label="Region"
            value={form.region}
            onChange={(e) => setForm({ ...form, region: e.target.value })}
            sx={{ flex: 1, minWidth: 180 }}
          />
          <TextField
            label="Budget"
            type="number"
            value={form.budget}
            onChange={(e) => setForm({ ...form, budget: Number(e.target.value || 0) })}
            sx={{ flex: 1, minWidth: 180 }}
          />
          <Button
            variant="contained"
            onClick={() => {
              if (!form.name.trim()) {
                toast.warning('Enter a project name');
                return;
              }
              createMutation.mutate(form);
            }}
          >
            Save
          </Button>
        </Box>
      </Paper>
      <Paper sx={{ p: 3 }}>
        {projects?.length ? (
          <List>
            {projects.map((p) => (
              <ListItem key={p._id}>
                <ListItemText
                  primary={p.name || p.project_name || 'Untitled Project'}
                  secondary={`Region: ${p.region || 'N/A'} • Budget: ${p.budget || 0}`}
                />
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSelectedProject(p);
                    setOpenDialog(true);
                  }}
                >
                  View
                </Button>
              </ListItem>
            ))}
          </List>
        ) : (
          <Alert severity="info">No projects found</Alert>
        )}
      </Paper>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Project Details</DialogTitle>
        <DialogContent dividers>
          {selectedProject ? (
            <>
              <Typography variant="subtitle1">{selectedProject.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedProject.description || 'No description'}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">Region: {selectedProject.region}</Typography>
                <Typography variant="body2">Budget: {selectedProject.budget}</Typography>
                <Typography variant="body2">Status: {selectedProject.status}</Typography>
                <Typography variant="body2">Sites: {selectedProject.site_count || (selectedProject.sites?.length || 0)}</Typography>
                <Typography variant="body2">Chargers: {selectedProject.charger_count || 0}</Typography>
              </Box>
            </>
          ) : (
            <Alert severity="info">No project selected</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Projects;
