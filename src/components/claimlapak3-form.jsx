import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMapEvent } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

function ClaimForm3() {
  const [clickedLocation, setClickedLocation] = useState(null);
  const [address, setAddress] = useState('');
  const navigate = useNavigate();

  const handleNext = () => {
    console.log('Selected Location:', clickedLocation);
    console.log('Address:', address);
    navigate('/claimlapak4');
  };

  const fetchAddress = async (lat, lng) => {
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: {
          lat: lat,
          lon: lng,
          format: 'json',
          addressdetails: 1,
        },
      });
      if (response.data) {
        return `${response.data.address.road || ''}, ${response.data.address.suburb || ''}, ${response.data.address.city || ''}, ${response.data.address.state || ''}, ${response.data.address.country || ''}`;
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      return 'Unknown Address';
    }
  };

  useEffect(() => {
    if (clickedLocation) {
      fetchAddress(clickedLocation.lat, clickedLocation.lng).then(setAddress);
    }
  }, [clickedLocation]);

  function LocationMarker() {
    useMapEvent('click', (event) => {
      setClickedLocation(event.latlng);
    });

    return clickedLocation ? (
      <Marker position={clickedLocation}>
        <Popup>
          {`Latitude: ${clickedLocation.lat}, Longitude: ${clickedLocation.lng}`}
        </Popup>
      </Marker>
    ) : null;
  }

  return (
    <div style={styles.pageContainer}>
      <div style={styles.mapContainer}>
        <MapContainer center={[-6.901179, 107.623272]} zoom={13} style={styles.map}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <LocationMarker />
        </MapContainer>
      </div>

      <div style={styles.infoContainer}>
        <p style={styles.addressText}>{address || 'Klik di peta untuk memilih lokasi'}</p>
        <button onClick={handleNext} style={styles.button}>
          Lanjutkan
        </button>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    height: '100%',
    width: '100%',
  },
  infoContainer: {
    backgroundColor: '#1A1B29',
    padding: '20px',
    borderRadius: '10px',
    textAlign: 'center',
    color: '#FFFFFF',
  },
  addressText: {
    marginBottom: '20px',
    fontSize: '14px',
  },
  button: {
    padding: '10px',
    backgroundColor: '#6772E5',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    width: '100%',
  },
};

export default ClaimForm3;
