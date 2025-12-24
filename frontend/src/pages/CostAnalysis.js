import React, { useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Slider,
  Button,
  Alert,
  Divider,
  Box,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import { AttachMoney, Calculate } from '@mui/icons-material';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import api from '../services/api';
import CostBreakdownChart from '../components/charts/CostBreakdownChart';

function CostAnalysis() {
  const [region, setRegion] = useState('India');
  const [chargerType, setChargerType] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [complexity, setComplexity] = useState('medium');
  const [costBreakdown, setCostBreakdown] = useState(null);

  const { data: regions } = useQuery(['regions'], () => api.getRegions());
  const { data: chargers } = useQuery(['chargers', region], () => api.getChargers(region));

  const calculateCostMutation = useMutation(
    (payload) => api.calculateInstallationCost(payload),
    {
      onSuccess: (data) => {
        setCostBreakdown(data);
        toast.success('Cost calculated');
      },
      onError: () => {
        toast.error('Unable to calculate cost');
      },
    }
  );

  const handleCalculate = () => {
    if (!chargerType) {
      toast.warning('Select a charger type');
      return;
    }
    calculateCostMutation.mutate({
      charger_type: chargerType,
      quantity,
      site_complexity: complexity,
      region,
    });
  };

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
        <AttachMoney sx={{ mr: 2, verticalAlign: 'middle' }} />
        Cost Analysis
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Inputs
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Region</InputLabel>
                  <Select
                    value={region}
                    label="Region"
                    onChange={(e) => setRegion(e.target.value)}
                  >
                    {regions?.map((r) => (
                      <MenuItem key={r} value={r}>
                        {r}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Charger Type</InputLabel>
                  <Select
                    value={chargerType}
                    label="Charger Type"
                    onChange={(e) => setChargerType(e.target.value)}
                  >
                    {chargers?.map((c) => (
                      <MenuItem key={c.type} value={c.type}>
                        {c.type} ({c.power}kW)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography gutterBottom>Quantity: {quantity}</Typography>
                <Slider
                  value={quantity}
                  onChange={(e, v) => setQuantity(v)}
                  min={1}
                  max={10}
                  marks
                  valueLabelDisplay="auto"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Site Complexity</InputLabel>
                  <Select
                    value={complexity}
                    label="Site Complexity"
                    onChange={(e) => setComplexity(e.target.value)}
                  >
                    <MenuItem value="simple">Simple</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="complex">Complex</MenuItem>
                    <MenuItem value="very_complex">Very Complex</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Button
              variant="contained"
              size="large"
              startIcon={<Calculate />}
              onClick={handleCalculate}
              disabled={calculateCostMutation.isLoading}
              sx={{ mt: 2 }}
            >
              {calculateCostMutation.isLoading ? <CircularProgress size={24} /> : 'Calculate'}
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          {costBreakdown ? (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Result
              </Typography>
              <CostBreakdownChart data={costBreakdown} />
              <Divider sx={{ my: 2 }} />
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary" gutterBottom>
                  {costBreakdown.currency}
                  {costBreakdown.total_cost.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Installation Cost
                </Typography>
              </Box>
            </Paper>
          ) : (
            <Alert severity="info">Run a calculation to see results</Alert>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}

export default CostAnalysis;

