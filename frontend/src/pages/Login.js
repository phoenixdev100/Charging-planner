import React, { useState } from 'react';
import { Container, Paper, Typography, TextField, Button, Alert } from '@mui/material';
import { Lock } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAppContext } from '../context/AppContext';

function Login() {
  const navigate = useNavigate();
  const { login } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const loginMutation = useMutation(
    ({ email, password }) => api.login(email, password),
    {
      onSuccess: (data) => {
        if (data?.token) {
          login({ token: data.token, user: data.user });
          toast.success('Logged in');
          navigate('/dashboard');
        } else {
          setError('Login failed');
        }
      },
      onError: (err) => {
        setError(err?.error || 'Invalid credentials');
      },
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Enter email and password');
      return;
    }
    loginMutation.mutate({ email, password });
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
        <Lock sx={{ mr: 2, verticalAlign: 'middle' }} />
        Login
      </Typography>
      <Paper sx={{ p: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 3 }}
          />
          <Button type="submit" variant="contained" fullWidth disabled={loginMutation.isLoading}>
            Sign In
          </Button>
        </form>
      </Paper>
    </Container>
  );
}

export default Login;
