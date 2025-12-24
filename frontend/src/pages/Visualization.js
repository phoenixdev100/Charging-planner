import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Box,
} from '@mui/material';
import { Map } from '@mui/icons-material';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import api from '../services/api';

function Visualization() {
  const [location, setLocation] = useState('');
  const [files, setFiles] = useState([]);
  const [result, setResult] = useState(null);
  const [projectId, setProjectId] = useState('');
  const [siteId, setSiteId] = useState('');

  const visualizeMutation = useMutation(
    () => api.generate3DLayout(location, files, { projectId, siteId }),
    {
      onSuccess: (data) => {
        setResult(data);
        setFiles([]);
        toast.success('Visualization generated');
      },
      onError: () => {
        toast.error('Visualization service is unavailable');
      },
    }
  );

  const handleSubmit = () => {
    if (!location.trim()) {
      toast.warning('Enter a location');
      return;
    }
    visualizeMutation.mutate();
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
        <Map sx={{ mr: 2, verticalAlign: 'middle' }} />
        Visualization
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Upload Site Photos
        </Typography>
        <TextField
          fullWidth
          label="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Project ID (optional)"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Site ID (optional)"
          value={siteId}
          onChange={(e) => setSiteId(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button variant="outlined" component="label" sx={{ mb: 2 }}>
          Select Images
          <input
            type="file"
            multiple
            hidden
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
          />
        </Button>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {files.length} file(s) selected
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={visualizeMutation.isLoading}
        >
          Generate 3D Layout
        </Button>
        <Box sx={{ mt: 2 }}>
          {result ? (
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1">Result</Typography>
              <Typography variant="body2" color="text.secondary">
                {result.message} • Location: {result.location} • Images: {result.image_count}
              </Typography>
              {result.layout_preview_url ? (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Preview
                  </Typography>
                  <img
                    src={result.layout_preview_url}
                    alt="Layout preview"
                    style={{ maxWidth: '100%', borderRadius: 8 }}
                  />
                  <Box sx={{ mt: 1 }}>
                    <Button
                      href={result.layout_preview_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="outlined"
                    >
                      Open preview in new tab
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No preview available
                </Alert>
              )}
            </Paper>
          ) : (
            <Alert severity="info">No visualization yet</Alert>
          )}
        </Box>
      </Paper>
    </Container>
  );
}

export default Visualization;
