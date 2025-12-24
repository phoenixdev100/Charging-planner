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
import { Description } from '@mui/icons-material';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import api from '../services/api';

function Reports() {
  const [title, setTitle] = useState('');
  const [lastReportId, setLastReportId] = useState(null);

  const generateMutation = useMutation(
    (payload) => api.generateReport(payload),
    {
      onSuccess: (data) => {
        setLastReportId(data?.id || null);
        toast.success('Report generated');
      },
      onError: () => {
        toast.error('Reports service is unavailable');
      },
    }
  );

  const handleGenerate = () => {
    if (!title.trim()) {
      toast.warning('Enter a title');
      return;
    }
    generateMutation.mutate({ title });
  };
  
  const handleDownload = async () => {
    if (!lastReportId) return;
    try {
      const blob = await api.downloadReport(lastReportId);
      const filename = `${title || 'report'}.pdf`;
      const blobObj = new Blob([blob], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blobObj);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Download started');
    } catch (err) {
      toast.error('Download failed');
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
        <Description sx={{ mr: 2, verticalAlign: 'middle' }} />
        Reports
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Generate Report
        </Typography>
        <TextField
          fullWidth
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          onClick={handleGenerate}
          disabled={generateMutation.isLoading}
        >
          Generate
        </Button>
        {lastReportId && (
          <Button
            sx={{ ml: 2 }}
            variant="outlined"
            onClick={handleDownload}
          >
            Download PDF
          </Button>
        )}
        <Box sx={{ mt: 2 }}>
          {lastReportId ? (
            <Alert severity="success">Last report ID: {lastReportId}</Alert>
          ) : (
            <Alert severity="info">No report generated yet</Alert>
          )}
        </Box>
      </Paper>
    </Container>
  );
}

export default Reports;
