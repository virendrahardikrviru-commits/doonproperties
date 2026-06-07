import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { propertiesData as initialProperties } from '@/data/properties.js';
import { 
  calculateDistance, 
  calculateDrivingTime, 
  calculateWalkingTime, 
  getNeighborhoodCoordinates,
  LANDMARKS
} from '@/lib/locationUtils.js';
import { listingsApi } from '@/lib/api.js';

const FilterContext = createContext();

export const CATEGORY_PRICE_RANGES = {
  All: { min: 0, max: 20000000 },
  Buy: { min: 5000000, max: 20000000 },
  Rent: { min: 15000, max: 50000 },
  PG: { min: 6000, max: 10000 },
  Commercial: { min: 40000, max: 250000 },
  Land: { min: 500000, max: 50000000 }
};

export const FilterProvider = ({ children }) => {
  const [propertiesList, setPropertiesList] = useState(initialProperties);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useBackend, setUseBackend] = useState(false);
  
  // Add selectedSubcategory state
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  
  // ✅ Updated filters with bhk, carParking, and sellerType
  const [filters, setFilters] = useState({
    location: 'All Locations',
    category: 'All',
    keyword: '',
    priceMin: CATEGORY_PRICE_RANGES.All.min,
    priceMax: CATEGORY_PRICE_RANGES.All.max,
    sortBy: 'Newest Listings',
    bhk: '',
    carParking: '',
    sellerType: ''  // ✅ New: Listed By filter
  });

  // Try to fetch from backend on mount
  useEffect(() => {
    const fetchFromBackend = async () => {
      try {
        setIsLoading(true);
        const response = await listingsApi.getAll();
        if (response.success && response.data.length > 0) {
          setPropertiesList(response.data);
          setUseBackend(true);
        }
        setError(null);
      } catch (err) {
        console.log('Backend not available, using local data');
        setUseBackend(false);
        setError(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFromBackend();
  }, []);

  const updateFilter = (key, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      if (key === 'category') {
        const range = CATEGORY_PRICE_RANGES[value] || CATEGORY_PRICE_RANGES.All;
        newFilters.priceMin = range.min;
        newFilters.priceMax = range.max;
      }
      return newFilters;
    });
  };

  const resetFilters = () => {
    setFilters({
      location: 'All Locations',
      category: 'All',
      keyword: '',
      priceMin: CATEGORY_PRICE_RANGES.All.min,
      priceMax: CATEGORY_PRICE_RANGES.All.max,
      sortBy: 'Newest Listings',
      bhk: '',
      carParking: '',
      sellerType: ''  // ✅ Reset sellerType
    });
    setSelectedSubcategory('');
  };

  // Update subcategory
  const updateSubcategory = (subcategory) => {
    setSelectedSubcategory(subcategory);
  };

  const calculateProximityData = (coords) => {
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
  };

  // Add property - works with both backend and local storage
  const addProperty = async (newProperty) => {
    // Calculate location data if not provided
    let coords = newProperty.coordinates;
    if (!coords) {
      const neighborhood = newProperty.location?.split(',')[0]?.trim() || 'Dehradun City Center';
      coords = getNeighborhoodCoordinates(neighborhood);
      newProperty.coordinates = coords;
    }
    
    if (!newProperty.proximity_data) {
      newProperty.proximity_data = calculateProximityData(coords);
    }

    if (useBackend) {
      try {
        const response = await listingsApi.create(newProperty);
        if (response.success) {
          setPropertiesList(prev => [response.data, ...prev]);
          return response.data;
        }
      } catch (err) {
        console.error('Failed to create listing on backend:', err);
        // Fall back to local storage
        setPropertiesList(prev => [newProperty, ...prev]);
        return newProperty;
      }
    } else {
      setPropertiesList(prev => [newProperty, ...prev]);
      return newProperty;
    }
  };

  // Update property
  const updateProperty = async (id, updatedData) => {
    if (useBackend) {
      try {
        const response = await listingsApi.update(id, updatedData);
        if (response.success) {
          setPropertiesList(prev => prev.map(p => {
            if (p.id === id) {
              const merged = { ...p, ...updatedData };
              if (updatedData.coordinates) {
                merged.proximity_data = calculateProximityData(updatedData.coordinates);
              }
              return merged;
            }
            return p;
          }));
          return response.data;
        }
      } catch (err) {
        console.error('Failed to update listing on backend:', err);
      }
    }
    
    setPropertiesList(prev => prev.map(p => {
      if (p.id === id) {
        const merged = { ...p, ...updatedData };
        if (updatedData.coordinates) {
          merged.proximity_data = calculateProximityData(updatedData.coordinates);
        }
        return merged;
      }
      return p;
    }));
  };

  // Delete property
  const deleteProperty = async (id) => {
    if (useBackend) {
      try {
        await listingsApi.delete(id);
      } catch (err) {
        console.error('Failed to delete listing on backend:', err);
      }
    }
    setPropertiesList(prev => prev.filter(p => p.id !== id));
  };

  const markAsReported = (id) => {
    setPropertiesList(prev => prev.map(p => p.id === id ? { ...p, reported: true } : p));
  };

  // Refresh listings from backend
  const refreshListings = async () => {
    try {
      setIsLoading(true);
      const response = await listingsApi.getAll();
      if (response.success) {
        setPropertiesList(response.data);
        setUseBackend(true);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to refresh listings:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProperties = useMemo(() => {
    let filtered = propertiesList.filter(property => {
      // Category filter
      if (filters.category !== 'All') {
        let categoryMatch = false;
        switch (filters.category) {
          case 'Buy':
            categoryMatch = property.category === 'residential_sale';
            break;
          case 'Rent':
            categoryMatch = property.category === 'residential_rent';
            break;
          case 'Land':
            categoryMatch = property.category === 'land_plot';
            break;
          case 'PG':
            categoryMatch = property.category === 'pg_rent';
            break;
          case 'Commercial Rent':
            categoryMatch = property.category === 'commercial_rent';
            break;
          case 'Commercial Buy':
            categoryMatch = property.category === 'commercial_sale';
            break;
          default:
            categoryMatch = true;
        }
        if (!categoryMatch) return false;
      }
      
      // Location filter
      if (filters.location !== 'All Locations' && !property.location.includes(filters.location)) return false;
      
      // Keyword search
      if (filters.keyword.trim() !== '') {
        const searchTerms = filters.keyword.toLowerCase().split(' ');
        const textToSearch = `${property.title} ${property.description} ${property.location}`.toLowerCase();
        const matchesKeyword = searchTerms.every(term => textToSearch.includes(term));
        if (!matchesKeyword) return false;
      }
      
      // Price filter
      const priceValue = parseFloat(property.price);
      if (priceValue < filters.priceMin || priceValue > filters.priceMax) return false;
      
      // Subcategory filter - property_type
      if (selectedSubcategory && selectedSubcategory !== '') {
        const propertyType = property.property_type || property.propertyType || '';
        if (propertyType !== selectedSubcategory) return false;
      }
      
      // ✅ BHK Filter
      if (filters.bhk && filters.bhk !== '') {
        const propertyBHK = property.bhk?.toString() || '';
        if (filters.bhk === '5') {
          // 5+ means 5 or more
          if (!(parseInt(propertyBHK) >= 5)) return false;
        } else {
          if (propertyBHK !== filters.bhk) return false;
        }
      }
      
      // ✅ Car Parking Filter
      if (filters.carParking && filters.carParking !== '') {
        const propertyParking = property.car_parking || property.carParking || '';
        if (filters.carParking === '5') {
          if (!(parseInt(propertyParking) >= 5)) return false;
        } else {
          if (propertyParking !== filters.carParking) return false;
        }
      }
      
      // ✅ Seller Type Filter (Listed By)
      if (filters.sellerType && filters.sellerType !== '') {
        const propertySellerType = property.seller_type || property.sellerType || '';
        if (propertySellerType !== filters.sellerType) return false;
      }
      
      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'Price: Low to High') return parseFloat(a.price) - parseFloat(b.price);
      if (filters.sortBy === 'Price: High to Low') return parseFloat(b.price) - parseFloat(a.price);
      return new Date(b.createdDate || b.created_at || 0) - new Date(a.createdDate || a.created_at || 0);
    });
    
    return filtered;
  }, [filters, propertiesList, selectedSubcategory]);

  return (
    <FilterContext.Provider value={{ 
      filters, 
      updateFilter, 
      resetFilters, 
      filteredProperties, 
      propertiesList,
      addProperty,
      updateProperty,
      deleteProperty,
      markAsReported,
      refreshListings,
      isLoading,
      error,
      useBackend,
      selectedSubcategory,
      updateSubcategory
    }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
};