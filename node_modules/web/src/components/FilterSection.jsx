
import React from 'react';
import { useFilter, CATEGORY_PRICE_RANGES } from '@/contexts/FilterContext.jsx';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X, SlidersHorizontal } from 'lucide-react';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

const FilterSection = () => {
  const { filters, updateFilter, resetFilters } = useFilter();
  const activeRange = CATEGORY_PRICE_RANGES[filters.category] || CATEGORY_PRICE_RANGES.All;

  // Derive active tags for visual summary
  const activeTags = [];
  if (filters.location !== 'All Locations') activeTags.push(filters.location);
  if (filters.category !== 'All') activeTags.push(filters.category);
  if (filters.keyword) activeTags.push(`"${filters.keyword}"`);
  
  const isCustomPrice = filters.priceMin > activeRange.min || filters.priceMax < activeRange.max;
  if (isCustomPrice) {
    activeTags.push(`${formatCurrency(filters.priceMin)} - ${formatCurrency(filters.priceMax)}`);
  }

  const handleSliderChange = (values) => {
    updateFilter('priceMin', values[0]);
    updateFilter('priceMax', values[1]);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm mb-8 space-y-6">
      
      {/* Top Row: Price Slider & Sort */}
      <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
        
        {/* Price Range Controls */}
        <div className="flex-1 w-full space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-wide">
              <SlidersHorizontal className="w-4 h-4 text-primary" />
              Price Range
            </h3>
            <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded-md">
              {formatCurrency(filters.priceMin)} - {formatCurrency(filters.priceMax)}
            </span>
          </div>
          
          <div className="px-2">
            <Slider
              min={activeRange.min}
              max={activeRange.max}
              step={filters.category === 'Buy' || filters.category === 'All' ? 50000 : 1000}
              value={[filters.priceMin, filters.priceMax]}
              onValueChange={handleSliderChange}
              className="mt-2"
            />
          </div>
          
          <div className="flex items-center gap-4 pt-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">₹</span>
              <Input
                type="number"
                value={filters.priceMin}
                onChange={(e) => updateFilter('priceMin', Number(e.target.value) || 0)}
                className="pl-7 font-medium"
                aria-label="Minimum Price"
              />
            </div>
            <span className="text-muted-foreground font-medium text-sm">to</span>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">₹</span>
              <Input
                type="number"
                value={filters.priceMax}
                onChange={(e) => updateFilter('priceMax', Number(e.target.value) || 0)}
                className="pl-7 font-medium"
                aria-label="Maximum Price"
              />
            </div>
          </div>
        </div>

        {/* Sorting Dropdown */}
        <div className="w-full lg:w-64 space-y-3">
          <label className="text-sm font-bold text-foreground uppercase tracking-wide block">
            Sort By
          </label>
          <Select value={filters.sortBy} onValueChange={(val) => updateFilter('sortBy', val)}>
            <SelectTrigger className="w-full font-medium">
              <SelectValue placeholder="Sort order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Newest Listings">Newest Listings</SelectItem>
              <SelectItem value="Price: Low to High">Price: Low to High</SelectItem>
              <SelectItem value="Price: High to Low">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bottom Row: Active Filters Summary & Reset */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t border-border gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground font-medium mr-1">Active Filters:</span>
          {activeTags.length > 0 ? (
            activeTags.map((tag, idx) => (
              <span key={idx} className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full border border-primary/20">
                {tag}
              </span>
            ))
          ) : (
            <span className="text-sm text-muted-foreground italic">None</span>
          )}
        </div>
        
        {activeTags.length > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetFilters}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <X className="w-4 h-4 mr-1.5" />
            Clear All
          </Button>
        )}
      </div>

    </div>
  );
};

export default FilterSection;
