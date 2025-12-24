import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Card,
  CardContent,
  Button,
  Alert,
  Chip,
  Slider,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  LocationOn,
  ElectricCar,
  Calculate,
  AttachMoney,
  Speed,
  BatteryChargingFull,
} from '@mui/icons-material';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import api from '../services/api';
import CostBreakdownChart from '../components/charts/CostBreakdownChart';

function SingleSitePlanning() {
  const [region, setRegion] = useState('India');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [siteType, setSiteType] = useState('Commercial');
  const [selectedVehicles, setSelectedVehicles] = useState(['Tata Nexon EV']);
  const [chargerType, setChargerType] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [complexity, setComplexity] = useState('medium');
  const [loadCapacity, setLoadCapacity] = useState(null);
  const [costBreakdown, setCostBreakdown] = useState(null);

  // Fetch regions, states, cities data
  const { data: regions } = useQuery(['regions'], () => api.getRegions());
  const { data: states } = useQuery(
    ['states', region],
    () => api.getStatesByRegion(region),
    { enabled: !!region }
  );
  const { data: cities } = useQuery(
    ['cities', region, state],
    () => api.getCitiesByRegionState(region, state),
    { enabled: !!region && !!state }
  );

  // Fetch vehicles
  const { data: vehicles } = useQuery(['vehicles', region], () =>
    api.getVehiclesByRegion(region)
  );

  // Fetch compatible chargers
  const { data: compatibleChargers } = useQuery(
    ['compatible-chargers', selectedVehicles, region],
    () => api.getCompatibleChargers(getCompatiblePorts(), region),
    { enabled: selectedVehicles.length > 0 }
  );

  // Calculate installation cost
  const calculateCostMutation = useMutation(
    (data) => api.calculateInstallationCost(data),
    {
      onSuccess: (data) => {
        setCostBreakdown(data);
      },
      onError: (error) => {
        toast.error('Failed to calculate cost');
      },
    }
  );

  // Get load capacity
  const getLoadCapacityMutation = useMutation(
    ({ region, location }) => api.getLoadCapacity(region, location),
    {
      onSuccess: (data) => {
        setLoadCapacity(data);
      },
      onError: (error) => {
        toast.error('Could not fetch load capacity data');
      },
    }
  );

  useEffect(() => {
    if (city) {
      getLoadCapacityMutation.mutate({ region, location: city });
    }
  }, [city, region]);

  const handleCalculateCost = () => {
    if (!chargerType || !city) {
      toast.warning('Please select charger type and location');
      return;
    }

    calculateCostMutation.mutate({
      charger_type: chargerType,
      quantity,
      site_complexity: complexity,
      region,
    });
  };

  const handleVehicleToggle = (vehicle) => {
    setSelectedVehicles((prev) =>
      prev.includes(vehicle)
        ? prev.filter((v) => v !== vehicle)
        : [...prev, vehicle]
    );
  };

  const getCompatiblePorts = () => {
    if (!vehicles) return [];
    const ports = new Set();
    selectedVehicles.forEach((vehicleName) => {
      const vehicle = vehicles.find((v) => v.name === vehicleName);
      if (vehicle) {
        ports.add(vehicle.charge_port);
      }
    });
    return Array.from(ports);
  };

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
        <ElectricCar sx={{ mr: 2, verticalAlign: 'middle' }} />
        Single Site Planning
      </Typography>

      <Grid container spacing={3}>
        {/* Left Column - Site Information */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              <LocationOn sx={{ mr: 1, verticalAlign: 'middle' }} />
              Site Information
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
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
                  <InputLabel>State</InputLabel>
                  <Select
                    value={state}
                    label="State"
                    onChange={(e) => setState(e.target.value)}
                    disabled={!states?.length}
                  >
                    {states?.map((s) => (
                      <MenuItem key={s} value={s}>
                        {s}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>City</InputLabel>
                  <Select
                    value={city}
                    label="City"
                    onChange={(e) => setCity(e.target.value)}
                    disabled={!cities?.length}
                  >
                    {cities?.map((c) => (
                      <MenuItem key={c} value={c}>
                        {c}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Site Type</InputLabel>
                  <Select
                    value={siteType}
                    label="Site Type"
                    onChange={(e) => setSiteType(e.target.value)}
                  >
                    <MenuItem value="Residential">Residential</MenuItem>
                    <MenuItem value="Commercial">Commercial</MenuItem>
                    <MenuItem value="Public">Public</MenuItem>
                    <MenuItem value="Highway">Highway</MenuItem>
                    <MenuItem value="Workplace">Workplace</MenuItem>
                    <MenuItem value="Retail">Retail</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Vehicle Selection */}
            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
              <ElectricCar sx={{ mr: 1, verticalAlign: 'middle' }} />
              Vehicle Compatibility
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Select vehicles that will use this charger:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {vehicles?.map((vehicle) => (
                  <Chip
                    key={vehicle.name}
                    label={vehicle.name}
                    onClick={() => handleVehicleToggle(vehicle.name)}
                    color={selectedVehicles.includes(vehicle.name) ? 'primary' : 'default'}
                    variant={selectedVehicles.includes(vehicle.name) ? 'filled' : 'outlined'}
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>
            </Box>

            {/* Compatible Ports */}
            {selectedVehicles.length > 0 && (
              <Alert severity="info" sx={{ mb: 3 }}>
                Compatible charging ports:{' '}
                <strong>{getCompatiblePorts().join(', ')}</strong>
              </Alert>
            )}

            {/* Charger Selection */}
            {compatibleChargers?.length > 0 && (
              <>
                <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                  <BatteryChargingFull sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Recommended Charger Types
                </Typography>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Charger Type</InputLabel>
                  <Select
                    value={chargerType}
                    label="Charger Type"
                    onChange={(e) => setChargerType(e.target.value)}
                  >
                    {compatibleChargers.map((charger) => (
                      <MenuItem key={charger.type} value={charger.type}>
                        {charger.type} ({charger.power} kW)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Charger Specifications */}
                {chargerType && (
                  <Card variant="outlined" sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Charger Specifications
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="body2" color="text.secondary">
                            Power
                          </Typography>
                          <Typography variant="h6">
                            <Speed sx={{ verticalAlign: 'middle', mr: 1 }} />
                            {
                              compatibleChargers.find(c => c.type === chargerType)
                                ?.power
                            }{' '}
                            kW
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="body2" color="text.secondary">
                            Voltage
                          </Typography>
                          <Typography variant="h6">
                            {
                              compatibleChargers.find(c => c.type === chargerType)
                                ?.voltage
                            }{' '}
                            V
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="body2" color="text.secondary">
                            Efficiency
                          </Typography>
                          <Typography variant="h6">
                            {(
                              (compatibleChargers.find(c => c.type === chargerType)
                                ?.efficiency || 0) * 100
                            ).toFixed(1)}
                            %
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="body2" color="text.secondary">
                            Amps
                          </Typography>
                          <Typography variant="h6">
                            {
                              compatibleChargers.find(c => c.type === chargerType)
                                ?.amps
                            }{' '}
                            A
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                )}

                {/* Installation Details */}
                <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                  Installation Details
                </Typography>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={6}>
                    <Typography gutterBottom>Quantity</Typography>
                    <Slider
                      value={quantity}
                      onChange={(e, value) => setQuantity(value)}
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

                {/* Calculate Button */}
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Calculate />}
                  onClick={handleCalculateCost}
                  disabled={calculateCostMutation.isLoading}
                  sx={{ mt: 2 }}
                >
                  {calculateCostMutation.isLoading ? (
                    <CircularProgress size={24} />
                  ) : (
                    'Calculate Installation Cost'
                  )}
                </Button>
              </>
            )}
          </Paper>
        </Grid>

        {/* Right Column - Load Analysis & Cost Breakdown */}
        <Grid item xs={12} md={4}>
          {/* Load Analysis */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Load Analysis
            </Typography>

            {getLoadCapacityMutation.isLoading ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <CircularProgress />
              </Box>
            ) : loadCapacity ? (
              <Box>
                <Alert
                  severity={
                    loadCapacity.outage_risk === 'Low' ? 'success' : 'warning'
                  }
                  sx={{ mb: 2 }}
                >
                  Grid Capacity: <strong>{loadCapacity.capacity}</strong>
                </Alert>

                <Alert severity="info" sx={{ mb: 2 }}>
                  Outage Risk: <strong>{loadCapacity.outage_risk}</strong>
                </Alert>

                {loadCapacity.peak_hours?.length > 0 && (
                  <Alert severity="warning">
                    Peak Hours:{' '}
                    <strong>
                      {loadCapacity.peak_hours.join(':00, ')}:00
                    </strong>
                  </Alert>
                )}
              </Box>
            ) : (
              <Alert severity="info">
                Select a city to view load analysis
              </Alert>
            )}
          </Paper>

          {/* Cost Breakdown */}
          {costBreakdown && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                <AttachMoney sx={{ mr: 1, verticalAlign: 'middle' }} />
                Cost Breakdown
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

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Range: {costBreakdown.currency}
                {costBreakdown.cost_range.min.toLocaleString()} -{' '}
                {costBreakdown.currency}
                {costBreakdown.cost_range.max.toLocaleString()}
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}

export default SingleSitePlanning;
