import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import L from 'leaflet';
import polyline from '@mapbox/polyline';
import { Header, StartButton } from "../components/index";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('driving'); // Default mode
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const routeLayerRef = useRef(null);

  const modeConfigs = {
    driving: {
      speed: 40,
      color: '#4A90E2',
      icon: '🚗',
      profile: 'car' // OSRM profile for cars
    },
    motorcycle: {
      speed: 35,
      color: '#F5A623',
      icon: '🏍️',
      profile: 'bike' // OSRM profile for motorcycles/bikes
    },
    walking: {
      speed: 4.5,
      color: '#7ED321',
      icon: '🚶',
      profile: 'foot' // OSRM profile for pedestrians
    }
  };

  // Fetch destination from `location.state`
  useEffect(() => {
    const destination = location.state?.destination;
    // destination.latitude = -6.85656970;
    // destination.longitude = 107.63610491;
    console.log(destination);
      // console.log(destination.latitude);
    if (destination?.latitude && destination?.longitude) {
      const lat = parseFloat(destination.latitude);
      const lng = parseFloat(destination.longitude);

      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        setDestinationLocation({ lat, lng });
      } else {
        setError('Invalid destination coordinates provided');
        setLoading(false);
        return;
      }
    } else {
      // console.log(location.state?.destination?.nama_lapak);
      // console.log(destination.latitude);
      setError('No destination coordinates provided');
      setLoading(false);
      return;
    }

    setLoading(false);
  }, [location.state]);

  // Fetch user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to fetch current location');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser');
    }
  }, []);

  // Initialize the map
  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      try {
        mapInstanceRef.current = L.map(mapRef.current, {
          zoomControl: false,
        }).setView([0, 0], 12);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
        }).addTo(mapInstanceRef.current);

        L.control.zoom({ position: 'topright' }).addTo(mapInstanceRef.current);
      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Failed to initialize map');
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map and fetch route
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation || !destinationLocation) return;

    const map = mapInstanceRef.current;

    // Remove existing layers except tiles
    map.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) {
        map.removeLayer(layer);
      }
    });

    // Add markers for user and destination
    const userIcon = L.divIcon({
      html: '<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>',
      className: 'custom-div-icon',
    });

    const destinationIcon = L.divIcon({
      html: '<div class="w-4 h-4 bg-purple-500 rounded-full border-2 border-white shadow-lg"></div>',
      className: 'custom-div-icon',
    });

    L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map);
    L.marker([destinationLocation.lat, destinationLocation.lng], { icon: destinationIcon }).addTo(map);

    const osrmProfile = modeConfigs[mode].profile;

     // Fetch route from OSRM API
     fetch(`https://router.project-osrm.org/route/v1/${osrmProfile}/${userLocation.lng},${userLocation.lat};${destinationLocation.lng},${destinationLocation.lat}?overview=full&geometries=polyline&alternatives=true`)
     .then((response) => response.json())
      .then((data) => {
        if (data.routes && data.routes[0]) {
          const route = data.routes[0];
          const coordinates = polyline.decode(route.geometry).map(([lat, lng]) => ({ lat, lng }));

          // Remove existing route layer if it exists
          if (routeLayerRef.current) {
            map.removeLayer(routeLayerRef.current);
          }

          // Add new route layer with mode-specific color
          routeLayerRef.current = L.polyline(coordinates, {
            color: modeConfigs[mode].color,
            weight: 5,
            opacity: 0.7,
            lineCap: 'round',
            lineJoin: 'round',
          }).addTo(map);

          const bounds = L.latLngBounds(coordinates);
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });

          // Calculate ETA based on mode-specific speed
          const distanceKm = route.distance / 1000;
          const speedKmh = modeConfigs[mode].speed;
          const estimatedMinutes = Math.round((distanceKm / speedKmh) * 60);

          setRouteInfo({
            duration: estimatedMinutes,
            distance: distanceKm.toFixed(1),
            mode: mode
          });
        }
      })
      .catch((error) => {
        console.error('Error fetching route:', error);
        setError('Unable to calculate route');
      });
  }, [userLocation, destinationLocation, mode]);

 return (
    <div className="h-screen w-full relative bg-[#222745]">
      <Header
        navigate={navigate}
        loading={loading}
        userLocation={userLocation}
        destinationName={location.state?.destination?.nama_lapak}
        error={error}
        routeInfo={routeInfo}
        currentMode={mode}
        setMode={setMode}
        modeConfigs={modeConfigs}
      />
      <div ref={mapRef} className="h-full w-full z-0" />
      <StartButton
        routeInfo={routeInfo}
        mapInstance={mapInstanceRef.current}
        userLocation={userLocation}
        destinationLocation={destinationLocation}
        mode={mode}
        modeConfigs={modeConfigs}
      />
    </div>
  );
};

export default Navigation;
