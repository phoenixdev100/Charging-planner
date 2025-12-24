import React from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
} from '@mui/material';
import { Dashboard as DashboardIcon, BarChart } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useAppContext } from '../context/AppContext';
import api from '../services/api';

function StatCard({ title, value }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h5">{value}</Typography>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const { selectedRegion, vehicles: ctxVehicles, chargerTypes } = useAppContext();
  const token = localStorage.getItem('token');

  const { data: projects } = useQuery(['projects'], () => api.getProjects(), {
    enabled: Boolean(token),
  });

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
        <DashboardIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <StatCard title="Region" value={selectedRegion} />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard title="Vehicles" value={ctxVehicles?.length || 0} />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard title="Charger Types" value={chargerTypes?.length || 0} />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard title="Projects" value={projects?.length || 0} />
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              <BarChart sx={{ mr: 1, verticalAlign: 'middle' }} />
              Quick Actions
            </Typography>
            <Button variant="contained" sx={{ mr: 2 }} href="/single-site">
              Plan Single Site
            </Button>
            <Button variant="outlined" href="/multi-site">
              Plan Multiple Sites
            </Button>
            {!token && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Login to view and manage projects
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;

