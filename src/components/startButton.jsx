import React from 'react';
import { useNavigation } from '../hooks/useNavigation';

const StartButton = ({ 
  routeInfo, 
  mapInstance, 
  userLocation, 
  destinationLocation, 
  mode = 'driving', 
  modeConfigs 
}) => {
    const {
      isNavigating,
      navigationInfo,
      currentStep,
      remainingTime,
      remainingDistance,
      startNavigation,
      stopNavigation
    } = useNavigation(
      mapInstance, 
      userLocation, 
      destinationLocation, 
      null, 
      mode, 
      modeConfigs
    );
  
    return (
      <div className="absolute bottom-8 left-0 right-0 z-20 flex flex-col items-center px-4 gap-4">
        {navigationInfo && (
          <div className="bg-white rounded-lg p-4 shadow-lg w-full max-w-md">
            <p className="font-semibold text-gray-800">
              {navigationInfo.status || navigationInfo.steps?.[currentStep]?.instruction || 'Calculating...'}
            </p>
            {remainingTime && remainingDistance && (
              <div className="flex justify-between mt-2 text-sm text-gray-600">
                <span>{modeConfigs[mode].icon} {remainingTime} min</span>
                <span>📍 {remainingDistance} km</span>
              </div>
            )}
          </div>
        )}
        <button
          onClick={() => isNavigating ? stopNavigation() : startNavigation()}
          className={`w-full max-w-md py-3 rounded-full font-semibold shadow-lg ${
            isNavigating
              ? 'bg-red-500 text-white'
              : 'bg-purple-500 text-white'
          }`}
        >
          {isNavigating ? 'Stop Navigation' : 'Start Navigation'}
        </button>
      </div>
    );
  };
  
export default StartButton;