
import { useState, useEffect, useCallback } from 'react';
import { 
  calculateDistance, 
  calculateDrivingTime, 
  calculateWalkingTime, 
  extractCoordinatesFromLink, 
  validateCoordinates, 
  getNeighborhoodCoordinates,
  LANDMARKS
} from '@/lib/locationUtils.js';
import { toast } from 'sonner';

export const useLocationData = (property) => {
  const [currentCoordinates, setCurrentCoordinates] = useState([30.3165, 78.1322]);
  const [proximityData, setProximityData] = useState(null);

  const calculateProximity = useCallback((coords) => {
    if (!coords || coords.length !== 2) return null;
    
    const [lat, lon] = coords;
    
    const data = {};
    
    Object.entries(LANDMARKS).forEach(([key, landmark]) => {
      const distance = calculateDistance(lat, lon, landmark.coords[0], landmark.coords[1]);
      data[`${key.toLowerCase()}_distance`] = distance;
      data[`${key.toLowerCase()}_driving_time`] = calculateDrivingTime(distance);
      data[`${key.toLowerCase()}_walking_time`] = calculateWalkingTime(distance);
    });
    
    return data;
  }, []);

  useEffect(() => {
    if (!property) return;

    let coords = property.coordinates;
    
    if (!coords || coords.length !== 2) {
      // Try to extract from neighborhood
      const neighborhood = property.location?.split(',')[0]?.trim() || 'Dehradun City Center';
      coords = getNeighborhoodCoordinates(neighborhood);
    }

    if (coords && coords.length === 2) {
      setCurrentCoordinates(coords);
      setProximityData(calculateProximity(coords));
    }
  }, [property, calculateProximity]);

  const updateLocation = (input) => {
    let newCoords = null;

    // Check if input is a link
    if (input.includes('http') || input.includes('google.com/maps')) {
      newCoords = extractCoordinatesFromLink(input);
      if (!newCoords) {
        toast.error('Could not extract coordinates from the provided link.');
        return false;
      }
    } else {
      // Assume input is comma separated coordinates
      const parts = input.split(',').map(p => p.trim());
      if (parts.length === 2 && validateCoordinates(parts[0], parts[1])) {
        newCoords = [parseFloat(parts[0]), parseFloat(parts[1])];
      } else {
        toast.error('Invalid coordinates format. Use: lat, lon');
        return false;
      }
    }

    if (newCoords) {
      setCurrentCoordinates(newCoords);
      setProximityData(calculateProximity(newCoords));
      toast.success('Location updated successfully');
      return newCoords;
    }
    
    return false;
  };

  return {
    currentCoordinates,
    proximityData,
    updateLocation
  };
};
