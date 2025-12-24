import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
} from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useAppContext } from '../context/AppContext';
import api from '../services/api';

function Settings() {
  const { selectedRegion, setSelectedRegion } = useAppContext();
  const [region, setRegion] = useState(selectedRegion || 'India');
  const [saved, setSaved] = useState(false);

  const { data: regions } = useQuery(['regions'], () => api.getRegions());

  useEffect(() => {
    const pref = localStorage.getItem('preferredRegion');
    if (pref) {
      setRegion(pref);
    }
  }, []);

  const handleSave = async () => {
    localStorage.setItem('preferredRegion', region);
    await setSelectedRegion(region);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
        <SettingsIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
        Settings
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Preferences
        </Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Default Region</InputLabel>
          <Select
            value={region}
            label="Default Region"
            onChange={(e) => setRegion(e.target.value)}
          >
            {(regions || []).map((r) => (
              <MenuItem key={r} value={r}>
                {r}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" onClick={handleSave}>
          Save
        </Button>
        {saved && <Alert severity="success" sx={{ mt: 2 }}>Preferences saved</Alert>}
      </Paper>
    </Container>
  );
}

export default Settings;

