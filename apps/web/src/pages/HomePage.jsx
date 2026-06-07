import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import HeroBanner from '@/components/HeroBanner.jsx';
import PropertyCard from '@/components/PropertyCard.jsx';
import SidebarFilters from '@/components/SidebarFilters.jsx';
import { FilterProvider, useFilter } from '@/contexts/FilterContext.jsx';

const HomePageContent = () => {
  const { 
    filters, 
    updateFilter, 
    resetFilters, 
    filteredProperties, 
    isLoading,
    refreshListings 
  } = useFilter();
  
  const [availableLocations, setAvailableLocations] = useState([]);

  useEffect(() => {
    // Extract unique locations from properties
    const fetchLocations = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/listings');
        const data = await response.json();
        if (data.success && data.data) {
          const locations = [...new Set(data.data.map(p => p.location))];
          setAvailableLocations(locations.filter(Boolean));
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
        // Fallback locations
        setAvailableLocations([
          'Rajpur Road', 'Jakhan', 'Vasant Vihar', 'Clement Town', 
          'Bidholi', 'Sahastradhara Road', 'Paltan Bazaar', 'Chakrata Road',
          'Ballupur', 'GMS Road', 'Haridwar Road', 'Mussoorie Road'
        ]);
      }
    };
    fetchLocations();
    refreshListings();
  }, []);

  return (
    <>
      {/* SEO Optimized Meta Tags */}
      <Helmet>
        <title>DoonProperties - Buy, Rent, PG & Commercial Properties in Dehradun</title>
        <meta 
          name="description" 
          content="Find best residential and commercial properties in Dehradun. Buy flats, houses, villas. Rent apartments, PG hostels, commercial spaces. Land & plots available. Verified listings, direct owner contact." 
        />
        <meta 
          name="keywords" 
          content="properties in dehradun, buy house in dehradun, rent flat dehradun, pg in dehradun, commercial property dehradun, land for sale dehradun, real estate dehradun, property dealer dehradun" 
        />
        <meta name="author" content="DoonProperties" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="DoonProperties - Properties in Dehradun" />
        <meta property="og:description" content="Find your dream property in Dehradun. Buy, rent, PG, commercial spaces." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://doonproperties.in" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="DoonProperties - Properties in Dehradun" />
        <meta name="twitter:description" content="Find your dream property in Dehradun. Buy, rent, PG, commercial spaces." />
      </Helmet>

      {/* Hero Banner Section */}
      <HeroBanner />

      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Results Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-2">
              {filters.category === 'All' && 'Explore Properties in Dehradun'}
              {filters.category === 'Buy' && 'Properties for Sale in Dehradun'}
              {filters.category === 'Rent' && 'Properties for Rent in Dehradun'}
              {filters.category === 'Land' && 'Land & Plots for Sale in Dehradun'}
              {filters.category === 'PG' && 'Top PG Accommodations in Dehradun'}
              {filters.category === 'Commercial Rent' && 'Commercial Spaces for Rent in Dehradun'}
              {filters.category === 'Commercial Buy' && 'Commercial Spaces for Sale in Dehradun'}
            </h2>
            <p className="text-muted-foreground text-sm max-w-2xl">
              {filters.location !== 'All Locations' 
                ? `Showing listings in ${filters.location}`
                : 'Discover our complete catalog of real estate listings across Dehradun.'}
            </p>
          </div>
          <div className="flex-shrink-0 text-sm font-semibold text-primary bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
            Showing {filteredProperties.length} properties
          </div>
        </div>

        {/* Filter and Property Grid - Side by Side */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar Filters */}
          <div className="lg:w-72 flex-shrink-0">
            <SidebarFilters 
              filters={filters}
              updateFilter={updateFilter}
              resetFilters={resetFilters}
              availableLocations={availableLocations}
            />
          </div>

          {/* Right Side - Property Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="text-center py-12 bg-muted/30 rounded-xl">
                <p className="text-gray-500">Loading properties...</p>
              </div>
            ) : filteredProperties.length > 0 ? (
              <motion.div 
                layout 
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {filteredProperties.map((property) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 20 }}
                      transition={{ duration: 0.3 }}
                      key={property.id}
                    >
                      <PropertyCard property={property} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="text-center py-24 bg-muted/30 rounded-2xl border border-dashed border-border flex flex-col items-center justify-center">
                <h3 className="text-xl font-bold text-foreground mb-2">No results found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or search terms to find what you're looking for.</p>
                <button 
                  onClick={resetFilters}
                  className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2.5 rounded-lg transition-colors shadow-sm"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

const HomePage = () => {
  return (
    <FilterProvider>
      <HomePageContent />
    </FilterProvider>
  );
};

export default HomePage;