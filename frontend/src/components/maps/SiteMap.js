import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function SiteMap({ sites, height = 500 }) {
  // Default to Mumbai coordinates if no sites
  const defaultCenter = [19.0760, 72.8777];
  
  // Calculate center based on sites
  const calculateCenter = () => {
    if (sites.length === 0) return defaultCenter;
    
    const sumLat = sites.reduce((sum, site) => sum + (site.lat || defaultCenter[0]), 0);
    const sumLng = sites.reduce((sum, site) => sum + (site.lng || defaultCenter[1]), 0);
    
    return [sumLat / sites.length, sumLng / sites.length];
  };

  const center = calculateCenter();

  // Custom charger icon
  const chargerIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4CAF50" width="32" height="32">
        <path d="M0 0h24v24H0z" fill="none"/>
        <path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4zM11 20v-5.5H9L13 7v5.5h2L11 20z"/>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  return (
    <div style={{ height, width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
      <MapContainer
        center={center}
        zoom={sites.length > 1 ? 10 : 12}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {sites.map((site, index) => (
          <Marker
            key={index}
            position={[site.lat || defaultCenter[0], site.lng || defaultCenter[1]]}
            icon={chargerIcon}
          >
            <Popup>
              <div>
                <strong>{site.location}</strong>
                <br />
                Type: {site.type}
                <br />
                Priority: {site.priority || 'N/A'}
                <br />
                Complexity: {site.complexity || 'N/A'}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default SiteMap;