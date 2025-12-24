import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState('India');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [currentProject, setCurrentProject] = useState(null);
  const [chargerTypes, setChargerTypes] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  // Load initial data
  useEffect(() => {
    const prefRegion = localStorage.getItem('preferredRegion');
    if (prefRegion) {
      setSelectedRegion(prefRegion);
    }
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Load user from localStorage
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }

      // Load initial charger types and vehicles for India
      const [chargersData, vehiclesData] = await Promise.all([
        api.getChargers('India'),
        api.getVehicles('India'),
      ]);

      setChargerTypes(chargersData);
      setVehicles(vehiclesData);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const updateRegion = async (region) => {
    setSelectedRegion(region);
    setSelectedState('');
    setSelectedCity('');
    localStorage.setItem('preferredRegion', region);

    try {
      // Load region-specific data
      const [chargersData, vehiclesData] = await Promise.all([
        api.getChargers(region),
        api.getVehicles(region),
      ]);

      setChargerTypes(chargersData);
      setVehicles(vehiclesData);
    } catch (error) {
      console.error('Failed to update region data:', error);
    }
  };

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userData.token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const value = {
    user,
    login,
    logout,
    selectedRegion,
    setSelectedRegion: updateRegion,
    selectedState,
    setSelectedState,
    selectedCity,
    setSelectedCity,
    currentProject,
    setCurrentProject,
    chargerTypes,
    vehicles,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
