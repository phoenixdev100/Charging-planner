import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  Delete,
  Edit,
  Map,
  Upload,
  Download,
  ShowChart,
} from '@mui/icons-material';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import api from '../services/api';
import SiteMap from '../components/maps/SiteMap';

function MultiSitePlanning() {
  const [activeTab, setActiveTab] = useState(0);
  const [sites, setSites] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);
  const [optimizationParams, setOptimizationParams] = useState({
    budget: 5000000,
    strategy: 'balanced',
    vehicle_mix: {},
    region: ''
  });
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  const { data: regions } = useQuery(['regions'], () => api.getRegions());
  const { data: vehicles } = useQuery(
    ['vehicles', optimizationParams.region],
    () => api.getVehicles(optimizationParams.region),
    { enabled: Boolean(optimizationParams.region) }
  );

  useEffect(() => {
    if (regions && regions.length && !optimizationParams.region) {
      setOptimizationParams((p) => ({ ...p, region: regions[0] }));
    }
  }, [regions]);

  const optimizationMutation = useMutation(
    (data) => api.optimizeMultiSite(data),
    {
      onSuccess: (data) => {
        setOptimizationResult(data);
        setActiveStep(2);
        toast.success('Optimization completed successfully!');
      },
      onError: (error) => {
        toast.error('Optimization failed');
      },
    }
  );

  const handleAddSite = (site) => {
    if (selectedSite) {
      // Update existing site
      setSites(sites.map(s => s.id === selectedSite.id ? { ...site, id: s.id } : s));
    } else {
      // Add new site
      setSites([...sites, { ...site, id: Date.now() }]);
    }
    setOpenDialog(false);
    setSelectedSite(null);
  };

  const handleDeleteSite = (id) => {
    setSites(sites.filter(site => site.id !== id));
  };

  const handleOptimize = () => {
    if (sites.length === 0) {
      toast.warning('Please add at least one site');
      return;
    }

    optimizationMutation.mutate({
      sites,
      ...optimizationParams,
    });
  };

  const steps = ['Add Sites', 'Configure Optimization', 'View Results'];

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
        <ShowChart sx={{ mr: 2, verticalAlign: 'middle' }} />
        Multi-Site Planning & Optimization
      </Typography>

      {/* Stepper */}
      <Box sx={{ mb: 4 }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column - Site Management */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">Site Management</Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setOpenDialog(true)}
              >
                Add Site
              </Button>
            </Box>

            {sites.length === 0 ? (
              <Alert severity="info" sx={{ mb: 3 }}>
                No sites added yet. Click "Add Site" to get started.
              </Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Location</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Complexity</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sites.map((site) => (
                      <TableRow key={site.id}>
                        <TableCell>{site.location}</TableCell>
                        <TableCell>
                          <Chip label={site.type} size="small" />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Slider
                              value={site.priority}
                              size="small"
                              disabled
                              sx={{ mx: 2, width: 100 }}
                            />
                            {site.priority}
                          </Box>
                        </TableCell>
                        <TableCell>{site.complexity}</TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedSite(site);
                              setOpenDialog(true);
                            }}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteSite(site.id)}
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Map Visualization */}
            {sites.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  <Map sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Sites Map
                </Typography>
                <SiteMap sites={sites} height={400} />
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right Column - Optimization Configuration */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Optimization Configuration
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Total Budget"
                  type="number"
                  value={optimizationParams.budget}
                  onChange={(e) =>
                    setOptimizationParams({
                      ...optimizationParams,
                      budget: parseInt(e.target.value),
                    })
                  }
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Region</InputLabel>
                  <Select
                    value={optimizationParams.region}
                    label="Region"
                    onChange={(e) =>
                      setOptimizationParams({
                        ...optimizationParams,
                        region: e.target.value,
                      })
                    }
                  >
                    {(regions || []).map((r) => (
                      <MenuItem key={r} value={r}>{r}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Optimization Strategy</InputLabel>
                  <Select
                    value={optimizationParams.strategy}
                    label="Optimization Strategy"
                    onChange={(e) =>
                      setOptimizationParams({
                        ...optimizationParams,
                        strategy: e.target.value,
                      })
                    }
                  >
                    <MenuItem value="balanced">Balanced Distribution</MenuItem>
                    <MenuItem value="high_power">High Power Priority</MenuItem>
                    <MenuItem value="cost_effective">Cost Effective</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Vehicle Mix Distribution
                </Typography>
                {vehicles?.slice(0, 4).map((vehicle, index) => (
                  <Box key={vehicle.name} sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      {vehicle.name}
                    </Typography>
                    <Slider
                      value={optimizationParams.vehicle_mix[vehicle.name] || 0}
                      onChange={(e, value) =>
                        setOptimizationParams({
                          ...optimizationParams,
                          vehicle_mix: {
                            ...optimizationParams.vehicle_mix,
                            [vehicle.name]: value,
                          },
                        })
                      }
                      min={0}
                      max={100}
                      valueLabelDisplay="auto"
                    />
                  </Box>
                ))}
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<ShowChart />}
                  onClick={handleOptimize}
                  disabled={optimizationMutation.isLoading || sites.length === 0}
                >
                  {optimizationMutation.isLoading ? (
                    <CircularProgress size={24} />
                  ) : (
                    'Optimize Deployment'
                  )}
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Optimization Results */}
          {optimizationResult && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Optimization Results
              </Typography>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        Strategy
                      </Typography>
                      <Typography variant="h6">
                        {optimizationResult.strategy}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        Budget Used
                      </Typography>
                      <Typography variant="h6">
                        ₹{(optimizationResult.total_budget - optimizationResult.remaining_budget).toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Location</TableCell>
                      <TableCell>Charger</TableCell>
                      <TableCell>Units</TableCell>
                      <TableCell>Budget</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {optimizationResult.allocations?.map((alloc, index) => (
                      <TableRow key={index}>
                        <TableCell>{alloc.location}</TableCell>
                        <TableCell>{alloc.recommended_charger}</TableCell>
                        <TableCell>{alloc.units}</TableCell>
                        <TableCell>₹{alloc.allocated_budget.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Add/Edit Site Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedSite ? 'Edit Site' : 'Add New Site'}
        </DialogTitle>
        <DialogContent>
          <SiteForm
            site={selectedSite}
            onSubmit={handleAddSite}
            onCancel={() => {
              setOpenDialog(false);
              setSelectedSite(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
}

// Site Form Component
function SiteForm({ site, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(
    site || {
      location: '',
      type: 'Commercial',
      priority: 5,
      complexity: 'medium',
    }
  );

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Box sx={{ pt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Location"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Site Type</InputLabel>
            <Select
              value={formData.type}
              label="Site Type"
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
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
        <Grid item xs={12}>
          <Typography gutterBottom>Priority: {formData.priority}</Typography>
          <Slider
            value={formData.priority}
            onChange={(e, value) =>
              setFormData({ ...formData, priority: value })
            }
            min={1}
            max={10}
            marks
            valueLabelDisplay="auto"
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Complexity</InputLabel>
            <Select
              value={formData.complexity}
              label="Complexity"
              onChange={(e) =>
                setFormData({ ...formData, complexity: e.target.value })
              }
            >
              <MenuItem value="simple">Simple</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="complex">Complex</MenuItem>
              <MenuItem value="very_complex">Very Complex</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <DialogActions sx={{ mt: 2 }}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          {site ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Box>
  );
}

export default MultiSitePlanning;
