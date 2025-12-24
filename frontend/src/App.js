import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout
import Layout from './components/Layout';

// Pages
import SingleSitePlanning from './pages/SingleSitePlanning';
import MultiSitePlanning from './pages/MultiSitePlanning';
import CostAnalysis from './pages/CostAnalysis';
import Reports from './pages/Reports';
import Visualization from './pages/Visualization';
import Projects from './pages/Projects';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Login from './pages/Login';

// Context
import { AppProvider } from './context/AppContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4CAF50',
      light: '#81C784',
      dark: '#388E3C',
    },
    secondary: {
      main: '#2196F3',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/single-site" />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/single-site" element={<SingleSitePlanning />} />
              <Route path="/multi-site" element={<MultiSitePlanning />} />
              <Route path="/cost-analysis" element={<CostAnalysis />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/visualization" element={<Visualization />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Layout>
          <ToastContainer position="top-right" autoClose={3000} />
        </Router>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
