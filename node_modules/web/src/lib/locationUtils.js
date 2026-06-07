
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

export const calculateDrivingTime = (distance) => {
  // Assuming average speed of 30 km/h in Dehradun
  const timeInHours = distance / 30;
  const timeInMinutes = timeInHours * 60;
  return Math.round(timeInMinutes / 5) * 5; // Round to nearest 5 mins
};

export const calculateWalkingTime = (distance) => {
  // Assuming average walking speed of 5 km/h
  const timeInHours = distance / 5;
  const timeInMinutes = timeInHours * 60;
  return Math.round(timeInMinutes / 5) * 5; // Round to nearest 5 mins
};

export const extractCoordinatesFromLink = (link) => {
  try {
    // Match standard google maps coordinates format: @lat,lng
    const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match = link.match(regex);
    if (match && match.length >= 3) {
      return [parseFloat(match[1]), parseFloat(match[2])];
    }
    
    // Match query parameter format: q=lat,lng
    const qRegex = /q=(-?\d+\.\d+),(-?\d+\.\d+)/;
    const qMatch = link.match(qRegex);
    if (qMatch && qMatch.length >= 3) {
      return [parseFloat(qMatch[1]), parseFloat(qMatch[2])];
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

export const validateCoordinates = (lat, lon) => {
  const parsedLat = parseFloat(lat);
  const parsedLon = parseFloat(lon);
  
  if (isNaN(parsedLat) || isNaN(parsedLon)) return false;
  if (parsedLat < -90 || parsedLat > 90) return false;
  if (parsedLon < -180 || parsedLon > 180) return false;
  
  return true;
};

export const getNeighborhoodCoordinates = (neighborhood) => {
  const neighborhoods = {
    'Rajpur Road': [30.3265, 78.1322],
    'Jakhan': [30.3465, 78.0922],
    'Clement Town': [30.2965, 78.1122],
    'Mussoorie Road': [30.3565, 78.0722],
    'Dehradun City Center': [30.3165, 78.1322],
    'Saharanpur Road': [30.2865, 78.1522],
    'Prem Nagar': [30.3365, 78.1522],
    'Ballupur': [30.3765, 78.1022],
    'Vasant Vihar': [30.3350, 78.0050],
    'Bidholi': [30.4150, 77.9650],
    'Sahastradhara Road': [30.3550, 78.0850],
    'Paltan Bazaar': [30.3265, 78.1322],
    'Chakrata Road': [30.3350, 78.0250]
  };
  
  // Default to Dehradun City Center if not found
  return neighborhoods[neighborhood] || neighborhoods['Dehradun City Center'];
};

export const formatDistance = (distance) => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }
  return `${distance.toFixed(1)} km`;
};

export const formatTime = (minutes) => {
  if (minutes < 5) return '< 5 mins';
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} hr ${mins} mins` : `${hours} hr`;
  }
  return `${minutes} mins`;
};

export const LANDMARKS = {
  ISBT: { name: 'ISBT Dehradun', coords: [30.3165, 78.0322] },
  RAILWAY: { name: 'Dehradun Railway Station', coords: [30.1825, 78.1458] },
  UPES: { name: 'Graphic Era / UPES', coords: [30.3365, 78.0822] },
  CLOCK_TOWER: { name: 'Clock Tower', coords: [30.3265, 78.1322] }
};
