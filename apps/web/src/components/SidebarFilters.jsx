import React from 'react';
import { SlidersHorizontal, X } from 'lucide-react';

const toPriceInputValue = (value) => (value === 0 || value == null ? '' : String(value));

const SidebarFilters = ({ 
  filters, 
  updateFilter, 
  resetFilters,
  availableLocations 
}) => {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [minLocal, setMinLocal] = React.useState(toPriceInputValue(filters.priceMin));
  const [maxLocal, setMaxLocal] = React.useState(toPriceInputValue(filters.priceMax));

  React.useEffect(() => {
    setMinLocal(toPriceInputValue(filters.priceMin));
  }, [filters.priceMin]);

  React.useEffect(() => {
    setMaxLocal(toPriceInputValue(filters.priceMax));
  }, [filters.priceMax]);

  const commitPriceFilter = (key, value) => {
    updateFilter(key, value.trim() === '' ? 0 : Number(value));
  };

  const sortOptions = ['Newest Listings', 'Price: Low to High', 'Price: High to Low'];
  const bhkOptions = ['1', '2', '3', '4', '5'];
  const parkingOptions = ['1', '2', '3', '4', '5'];
  const sellerTypeOptions = ['Owner', 'Dealer', 'Builder'];

  const renderFilterContent = () => (
    <div className="space-y-6">
      {/* Category Filter */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Category</h3>
        <select
          value={filters.category}
          onChange={(e) => updateFilter('category', e.target.value)}
          className="w-full border rounded-lg p-2 text-sm"
        >
          <option value="All">All Categories</option>
          <option value="Buy">Residential - For Sale</option>
          <option value="Rent">Residential - For Rent</option>
          <option value="Land">Land & Plots</option>
          <option value="PG">PG & Guesthouse</option>
          <option value="Commercial Rent">Commercial - For Rent</option>
          <option value="Commercial Buy">Commercial - For Sale</option>
        </select>
      </div>

      {/* Location Filter */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Location</h3>
        <select
          value={filters.location}
          onChange={(e) => updateFilter('location', e.target.value)}
          className="w-full border rounded-lg p-2 text-sm"
        >
          <option value="All Locations">All Locations</option>
          {availableLocations.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>

      {/* BHK Filter */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">BHK</h3>
        <select
          value={filters.bhk || ''}
          onChange={(e) => updateFilter('bhk', e.target.value)}
          className="w-full border rounded-lg p-2 text-sm"
        >
          <option value="">All BHK</option>
          {bhkOptions.map(bhk => (
            <option key={bhk} value={bhk}>{bhk} {parseInt(bhk) === 5 ? '+ BHK' : 'BHK'}</option>
          ))}
        </select>
      </div>

      {/* Car Parking Filter */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Car Parking</h3>
        <select
          value={filters.carParking || ''}
          onChange={(e) => updateFilter('carParking', e.target.value)}
          className="w-full border rounded-lg p-2 text-sm"
        >
          <option value="">All Parking</option>
          {parkingOptions.map(opt => (
            <option key={opt} value={opt}>{opt} {parseInt(opt) === 5 ? '+ Parking' : ''}</option>
          ))}
        </select>
      </div>

      {/* Listed By Filter - NEW */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Listed By</h3>
        <select
          value={filters.sellerType || ''}
          onChange={(e) => updateFilter('sellerType', e.target.value)}
          className="w-full border rounded-lg p-2 text-sm"
        >
          <option value="">All</option>
          {sellerTypeOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* Price Range Filter - No Cursor Jump */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Price Range ({'\u20b9'})</h3>
        
        {/* Min and Max Inputs */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">Minimum</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={minLocal}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*$/.test(val)) {
                  setMinLocal(val);
                }
              }}
              onBlur={() => commitPriceFilter('priceMin', minLocal)}
              className="w-full border rounded-lg p-2 text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">Maximum</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Any"
              value={maxLocal}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*$/.test(val)) {
                  setMaxLocal(val);
                }
              }}
              onBlur={() => commitPriceFilter('priceMax', maxLocal)}
              className="w-full border rounded-lg p-2 text-sm"
            />
          </div>
        </div>
        
        <p className="text-xs text-gray-400 mt-1">
          {'\u{1F4A1}'} Enter any amount (e.g., 15000 or 125000000)
        </p>
      </div>

      {/* Sort By */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Sort By</h3>
        <select
          value={filters.sortBy}
          onChange={(e) => updateFilter('sortBy', e.target.value)}
          className="w-full border rounded-lg p-2 text-sm"
        >
          {sortOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* Keyword Search */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Keyword Search</h3>
        <input
          type="text"
          placeholder="Search by title, description..."
          value={filters.keyword}
          onChange={(e) => updateFilter('keyword', e.target.value)}
          className="w-full border rounded-lg p-2 text-sm"
        />
      </div>

      {/* Reset Button */}
      <button
        onClick={resetFilters}
        className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
      >
        Reset All Filters
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile Filter Toggle Button */}
      <div className="lg:hidden fixed bottom-4 right-4 z-30">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-72 flex-shrink-0">
        <div className="sticky top-24 bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">Filters</h2>
            <button onClick={resetFilters} className="text-sm text-blue-600 hover:text-blue-800">
              Reset All
            </button>
          </div>
          {renderFilterContent()}
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end lg:hidden">
          <div className="bg-white w-full max-h-[80vh] rounded-t-2xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-lg font-bold">Filters</h2>
              <button onClick={() => setIsMobileOpen(false)} className="p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              {renderFilterContent()}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SidebarFilters;