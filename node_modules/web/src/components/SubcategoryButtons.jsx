import React from 'react';

const SubcategoryButtons = ({ category, selectedSubcategory, onSubcategoryChange }) => {
  // Define subcategories based on main category
  const getSubcategories = () => {
    switch (category) {
      case 'residential_sale':
      case 'residential_rent':
        return ['All', 'Flats/Apartments', 'Independent Builder Floors', 'Farmhouse', 'House & Villa', 'Duplex'];
      
      case 'land_plot':
        return ['All', 'Residential', 'Commercial', 'Agricultural', 'Industrial'];
      
      case 'pg_rent':
        return ['All', 'Guest House', 'PG'];
      
      case 'commercial_sale':
      case 'commercial_rent':
        return ['All', 'Shop', 'Office Space', 'Warehouse', 'Showroom'];
      
      default:
        return ['All'];
    }
  };

  const subcategories = getSubcategories();

  if (subcategories.length <= 1) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-6 pb-2 overflow-x-auto">
      {subcategories.map((subcat) => (
        <button
          key={subcat}
          onClick={() => onSubcategoryChange(subcat === 'All' ? '' : subcat)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
            (selectedSubcategory === subcat || (selectedSubcategory === '' && subcat === 'All'))
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {subcat}
        </button>
      ))}
    </div>
  );
};

export default SubcategoryButtons;