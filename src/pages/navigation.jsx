import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Navigation2 } from 'lucide-react';
import L from 'leaflet';
import polyline from '@mapbox/polyline'; // For decoding polyline geometry
import { Header, StartButton } from "../components/index";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const TEST_USER_LOCATION = {
    lat: -6.875082494787949,
    lng: 107.60666831822469
  };
  
  const TEST_DESTINATION = {
    latitude: -6.89429159,
    longitude: 107.65526867,
    nama_lapak: "Sate Kambing"
  };

  useEffect(() => {
    setError(null);
    const destination = TEST_DESTINATION;
    
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
      setError('No destination coordinates provided');
      setLoading(false);
      return;
    }

    setUserLocation(TEST_USER_LOCATION);
    setLoading(false);
  }, [location.state]);

  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      try {
        mapInstanceRef.current = L.map(mapRef.current, {
          zoomControl: false
        }).setView([TEST_USER_LOCATION.lat, TEST_USER_LOCATION.lng], 12);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstanceRef.current);

        L.control.zoom({
          position: 'topright'
        }).addTo(mapInstanceRef.current);

        setTimeout(() => {
          mapInstanceRef.current.invalidateSize();
        }, 100);

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

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !userLocation || !destinationLocation) return;

    try {
      map.eachLayer((layer) => {
        if (!(layer instanceof L.TileLayer)) {
          map.removeLayer(layer);
        }
      });

      const userIcon = L.divIcon({
        html: '<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>',
        className: 'custom-div-icon',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      const destinationIcon = L.divIcon({
        html: '<div class="w-4 h-4 bg-purple-500 rounded-full border-2 border-white shadow-lg"></div>',
        className: 'custom-div-icon',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup('Your Location');

      L.marker([destinationLocation.lat, destinationLocation.lng], { icon: destinationIcon })
        .addTo(map)
        .bindPopup(TEST_DESTINATION.nama_lapak);

      fetch(`https://router.project-osrm.org/route/v1/driving/${userLocation.lng},${userLocation.lat};${destinationLocation.lng},${destinationLocation.lat}?overview=full&geometries=polyline`)
        .then(response => response.json())
        .then(data => {
          if (data.routes && data.routes[0]) {
            const route = data.routes[0];
            const coordinates = polyline.decode(route.geometry).map(([lat, lng]) => ({ lat, lng }));
            
            L.polyline(coordinates, {
              color: '#8B5CF6',
              weight: 5,
              opacity: 0.7,
              lineCap: 'round',
              lineJoin: 'round'
            }).addTo(map);

            const bounds = L.latLngBounds(coordinates);
            setTimeout(() => {
              map.fitBounds(bounds, {
                padding: [50, 50],
                maxZoom: 15
              });
              map.invalidateSize();
            }, 200);

            setRouteInfo({
              duration: Math.round(route.duration / 60),
              distance: (route.distance / 1000).toFixed(1)
            });
          }
        })
        .catch(error => {
          console.error('Error fetching route:', error);
          setError('Unable to calculate route');
        });
    } catch (err) {
      console.error('Error updating map:', err);
      setError('Error displaying route on map');
    }
  }, [userLocation, destinationLocation]);

  return (
    <div className="h-screen w-full relative bg-[#222745]">
      <Header 
        navigate={navigate} 
        loading={loading} 
        userLocation={userLocation} 
        destinationName={TEST_DESTINATION.nama_lapak} 
        error={error} 
        routeInfo={routeInfo} 
      />
      {/* Map container with lower z-index */}
      <div ref={mapRef} className="h-full w-full z-0" />

      <StartButton 
        routeInfo={routeInfo}
        mapInstance={mapInstanceRef.current}
        userLocation={userLocation}
        destinationLocation={destinationLocation}
        routeGeometry={routeInfo?.geometry}
      />
    </div>
  );
};

export default Navigation;
