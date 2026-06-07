import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFilter } from '@/contexts/FilterContext';

const HeroBanner = () => {
  const navigate = useNavigate();
  const { updateFilter } = useFilter();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const suggestionRef = useRef(null);
  const inputRef = useRef(null);

  // Complete Dehradun locations list
  const allLocations = [
    'Rajpur Road', 'Sahastradhara Road', 'Mussoorie Road', 'Ballupur', 'GMS Road',
    'Haridwar Road', 'Chakrata Road', 'Clement Town', 'Vasant Vihar', 'Indira Nagar',
    'Patel Nagar', 'Nehru Colony', 'Dharampur', 'Kaulagarh Road', 'Prem Nagar',
    'Banjarawala', 'Majra', 'Shimla Bypass', 'Sewla Kalan', 'Turner Road', 'Rajpur',
    'Jakhan', 'Kishanpur', 'Malsi', 'Purkul', 'Sinaula', 'Bhagwant Pur', 'Old Mussoorie Road',
    'Sudhowala', 'Selaqui', 'Bidholi', 'Nanda Ki Chowki', 'Sahastradhara Crossing',
    'IT Park Area', 'Raipur', 'Thano Road', 'Doiwala', 'Bhaniyawala', 'Adhoiwala',
    'Araghar', 'Chukkuwala', 'Dalanwala', 'Garhi Cantt', 'Govind Garh', 'Karanpur',
    'Khurbura', 'Laxman Chowk', 'Race Course', 'Subhash Nagar'
  ];

  // Categories without icons
  const categories = [
    { id: '', name: 'All Categories' },
    { id: 'Buy', name: 'Residential Buy' },
    { id: 'Rent', name: 'Residential Rent' },
    { id: 'Land', name: 'Land & Plots' },
    { id: 'PG', name: 'PG & Hostels' },
    { id: 'Commercial Rent', name: 'Commercial Rent' },
    { id: 'Commercial Buy', name: 'Commercial Buy' }
  ];

  // Filter locations based on input
  useEffect(() => {
    if (locationInput.length > 0) {
      const filtered = allLocations.filter(loc => 
        loc.toLowerCase().includes(locationInput.toLowerCase())
      );
      setLocationSuggestions(filtered.slice(0, 8));
      setShowSuggestions(filtered.length > 0);
      setSelectedSuggestionIndex(-1);
    } else {
      setLocationSuggestions([]);
      setShowSuggestions(false);
    }
  }, [locationInput]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation for suggestions
  const handleKeyDown = (e) => {
    if (!showSuggestions) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev < locationSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
      e.preventDefault();
      selectLocation(locationSuggestions[selectedSuggestionIndex]);
    }
  };

  const handleSearch = () => {
    // Update filters in context
    if (selectedCategory) {
      updateFilter('category', selectedCategory);
    }
    if (locationInput) {
      updateFilter('location', locationInput);
    }
    if (searchKeyword) {
      updateFilter('keyword', searchKeyword);
    }
    
    // Navigate to home page with search params
    const params = new URLSearchParams();
    if (selectedCategory) params.set('category', selectedCategory);
    if (locationInput) params.set('location', locationInput);
    if (searchKeyword) params.set('q', searchKeyword);
    
    navigate(`/?${params.toString()}`);
    // Reload page to apply filters
    window.location.reload();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && selectedSuggestionIndex === -1) {
      handleSearch();
    }
  };

  const selectLocation = (location) => {
    setLocationInput(location);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    // Trigger search automatically after selection
    setTimeout(() => {
      handleSearch();
    }, 100);
  };

  return (
    <div className="relative pt-24 pb-16 md:pt-28 md:pb-20">
      {/* Background Image - No overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=2070')`
        }}
      ></div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg mb-4">
          Find Your Perfect Property in Dehradun
        </h1>
        <p className="text-white text-base md:text-lg mb-8 max-w-2xl mx-auto drop-shadow-md">
          Explore top Residential Houses, Student PGs, Commercial Spaces, and Land Plots across Dehradun
        </p>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-xl p-2 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-2">
            {/* Category Dropdown - No Icon */}
            <div className="flex-1 relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-12 px-4 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:outline-none appearance-none cursor-pointer text-gray-700"
              >
                {categories.map((cat) => (
                  <option key={cat.id || 'all'} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Location Input with Autocomplete */}
            <div className="flex-1 relative">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Enter location (e.g., Rajpur Road)"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onKeyPress={handleKeyPress}
                  className="w-full h-12 pl-10 pr-4 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:outline-none text-gray-700"
                />
              </div>
              
              {/* Autocomplete Suggestions - Darker highlight */}
              {showSuggestions && locationSuggestions.length > 0 && (
                <div 
                  ref={suggestionRef}
                  className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
                >
                  {locationSuggestions.map((loc, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectLocation(loc)}
                      className={`w-full text-left px-4 py-2 flex items-center gap-2 text-gray-700 transition-colors ${
                        idx === selectedSuggestionIndex 
                          ? 'bg-blue-100 hover:bg-blue-100' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <MapPin className="w-3 h-3 text-gray-400" />
                      {loc}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Keyword Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by keyword..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full h-12 pl-10 pr-4 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:outline-none text-gray-700"
              />
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all h-12 flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HeroBanner;
