import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import polyline from '@mapbox/polyline';

// Helper function to process route steps from OSRM API response
const processRouteSteps = (route) => {
  if (!route || !route.legs || !route.legs[0] || !route.legs[0].steps) {
    return [];
  }

  return route.legs[0].steps.map(step => ({
    instruction: step.maneuver.type === 'arrive' ? 'Arrive at destination' :
      step.maneuver.modifier ? `${capitalize(step.maneuver.type)} ${step.maneuver.modifier}` : 
      capitalize(step.maneuver.type),
    distance: step.distance,
    duration: step.duration,
    geometry: step.geometry
  }));
};

// Helper function to capitalize first letter
const capitalize = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const DEFAULT_MODE_CONFIGS = {
  driving: {
    speed: 40,
    color: '#4A90E2',
    icon: '🚗'
  },
  motorcycle: {
    speed: 35,
    color: '#F5A623',
    icon: '🏍️'
  },
  walking: {
    speed: 4.5,
    color: '#7ED321',
    icon: '🚶'
  }
};

export const useNavigation = (
  mapInstance, 
  userLocation, 
  destinationLocation, 
  routeGeometry, 
  mode = 'driving', 
  modeConfigs = DEFAULT_MODE_CONFIGS
) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [navigationInfo, setNavigationInfo] = useState(null);
  const [remainingTime, setRemainingTime] = useState(null);
  const [remainingDistance, setRemainingDistance] = useState(null);
  const userMarkerRef = useRef(null);
  const activeSegmentRef = useRef(null);
  const simulationInterval = useRef(null);

  // Calculate speed in meters per second based on mode
  const getSpeedMPS = () => {
    const configs = modeConfigs || DEFAULT_MODE_CONFIGS;
    const speedKMH = configs[mode]?.speed || 40; // Default to driving speed
    return (speedKMH * 1000) / 3600; // Convert km/h to m/s
  };
  // Function to update active segment based on current position
  const updateActiveSegment = (currentPosition, steps) => {
    if (!steps.length || !mapInstance) return;

    // Find the closest step to current position
    let minDistance = Infinity;
    let closestStepIndex = 0;

    steps.forEach((step, index) => {
      const stepCoords = polyline.decode(step.geometry);
      const startPoint = L.latLng(stepCoords[0][0], stepCoords[0][1]);
      const distance = L.latLng(currentPosition.lat, currentPosition.lng).distanceTo(startPoint);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestStepIndex = index;
      }
    });

    // Update current step if changed
    if (closestStepIndex !== currentStep) {
      setCurrentStep(closestStepIndex);
      setNavigationInfo(prev => ({
        ...prev,
        instruction: steps[closestStepIndex].instruction
      }));
    }

    // Update active segment visualization
    if (activeSegmentRef.current) {
      mapInstance.removeLayer(activeSegmentRef.current);
    }

    const stepCoords = polyline.decode(steps[closestStepIndex].geometry);
    activeSegmentRef.current = L.polyline(stepCoords, {
      color: '#4CAF50',
      weight: 6,
      opacity: 0.9
    }).addTo(mapInstance);
  };

  // Function to simulate user movement along the route
  const simulateMovement = (coordinates) => {
    let currentIndex = 0;
    const totalPoints = coordinates.length;
    const speedMPS = getSpeedMPS();

    
    simulationInterval.current = setInterval(() => {
      if (currentIndex >= totalPoints) {
        stopNavigation();
        alert("Destination reached!");
        return;
      }

      const newPosition = {
        lat: coordinates[currentIndex][0],
        lng: coordinates[currentIndex][1]
      };

      // Update user marker position
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([newPosition.lat, newPosition.lng]);
      }

      // Calculate remaining distance and time
      const remainingPoints = coordinates.slice(currentIndex);
      const distanceInMeters = calculateRouteDistance(remainingPoints);
      const distanceInKm = (distanceInMeters / 1000).toFixed(1);
      const timeInMinutes = Math.ceil(distanceInMeters / (speedMPS * 60));

      setRemainingDistance(distanceInKm);
      setRemainingTime(timeInMinutes);

      // Update active segment
      updateActiveSegment(newPosition, navigationInfo?.steps || []);

      currentIndex++;
    }, 1000); // Move every second
  };

  // Calculate total distance of remaining route
  const calculateRouteDistance = (points) => {
    let distance = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const point1 = L.latLng(points[i][0], points[i][1]);
      const point2 = L.latLng(points[i + 1][0], points[i + 1][1]);
      distance += point1.distanceTo(point2);
    }
    return distance;
  };

  const createUserMarker = (position) => {
    const currentConfig = modeConfigs[mode];
    const userIcon = L.divIcon({
      html: `<div class="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
        ${currentConfig.icon}
      </div>`,
      className: 'custom-div-icon'
    });

    return L.marker([position.lat, position.lng], {
      icon: userIcon,
      zIndexOffset: 1000
    });
  };

  // Start navigation with simulation
  const startNavigation = async () => {
    if (!mapInstance || !userLocation || !destinationLocation) return;

    setIsNavigating(true);
    setNavigationInfo({ status: 'Calculating route...' });

    try {
      const osrmProfile = modeConfigs[mode].profile;
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/${osrmProfile}/${userLocation.lng},${userLocation.lat};${destinationLocation.lng},${destinationLocation.lat}?overview=full&steps=true&geometries=polyline&alternatives=true`
      );
      const data = await response.json();
      const route = data.routes[0];
      const steps = processRouteSteps(route);
      const coordinates = polyline.decode(route.geometry);

      setNavigationInfo({
        steps,
        status: 'Navigation started',
        instruction: steps[0]?.instruction || 'Proceed to the route'
      });

      // Create or update user marker
      if (userMarkerRef.current) {
        mapInstance.removeLayer(userMarkerRef.current);
      }
      userMarkerRef.current = createUserMarker(userLocation);
      userMarkerRef.current.addTo(mapInstance);

      // Start simulation
      simulateMovement(coordinates);

    } catch (error) {
      console.error('Error starting navigation:', error);
      setNavigationInfo({ status: 'Navigation failed' });
      stopNavigation();
    }
  };

  // Stop navigation and clean up
  const stopNavigation = () => {
    if (simulationInterval.current) {
      clearInterval(simulationInterval.current);
    }
    if (activeSegmentRef.current) {
      mapInstance.removeLayer(activeSegmentRef.current);
    }
    if (userMarkerRef.current) {
      mapInstance.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }
    setIsNavigating(false);
    setNavigationInfo(null);
    setCurrentStep(0);
    setRemainingTime(null);
    setRemainingDistance(null);
  };

  useEffect(() => {
    return () => {
      if (simulationInterval.current) {
        clearInterval(simulationInterval.current);
      }
      stopNavigation();
    };
  }, []);

  return {
    isNavigating,
    navigationInfo,
    currentStep,
    remainingTime,
    remainingDistance,
    startNavigation,
    stopNavigation
  };
};