// MapComponent.jsx
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function MapComponent({ hospitalData }) {
  if (!hospitalData || hospitalData.length === 0) return null;

  const center = hospitalData[0].position;

  return (
    <div style={{ height: '400px', width: '100%', marginTop: '20px' }}>
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {hospitalData.map((hospital, index) => (
          <Marker key={index} position={hospital.position}>
            <Popup>{hospital.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default MapComponent;
