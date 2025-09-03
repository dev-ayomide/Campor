import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { parsePriceRange } from '../../services/searchService';

export default function AdvancedFilters({ 
  filters, 
  onFiltersChange, 
  categories = [], 
  brands = [],
  priceRanges = [],
  isOpen = false,
  onToggle 
}) {
  const [localFilters, setLocalFilters] = useState({
    category: 'All',
    brand: 'All',
    priceRange: 'All',
    inStock: false,
    minRating: 0,
    ...filters
  });

  const [priceSliderValue, setPriceSliderValue] = useState([0, 100000]);
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const [showMoreBrands, setShowMoreBrands] = useState(false);

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(prev => ({ ...prev, ...filters }));
  }, [filters]);

  // Handle filter change
  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  // Handle price range change
  const handlePriceRangeChange = (range) => {
    handleFilterChange('priceRange', range);
    
    if (range !== 'All') {
      const { min, max } = parsePriceRange(range);
      setPriceSliderValue([min, max === Infinity ? 100000 : max]);
    }
  };

  // Handle price slider change
  const handlePriceSliderChange = (values) => {
    setPriceSliderValue(values);
    
    // Convert slider values to price range string
    const min = values[0];
    const max = values[1];
    
    if (min === 0 && max === 100000) {
      handleFilterChange('priceRange', 'All');
    } else if (max === 100000) {
      handleFilterChange('priceRange', `₦${min.toLocaleString()}+`);
    } else {
      handleFilterChange('priceRange', `₦${min.toLocaleString()} - ₦${max.toLocaleString()}`);
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    const clearedFilters = {
      category: 'All',
      brand: 'All',
      priceRange: 'All',
      inStock: false,
      minRating: 0
    };
    setLocalFilters(clearedFilters);
    setPriceSliderValue([0, 100000]);
    onFiltersChange(clearedFilters);
  };

  // Check if any filters are applied
  const hasActiveFilters = Object.values(localFilters).some(value => 
    value !== 'All' && value !== false && value !== 0
  );

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 transition-all duration-300 ${isOpen ? 'block' : 'hidden md:block'}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Backend Support Note */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-green-800">
              <p className="font-medium">All Filters Now Supported with Algolia! 🚀</p>
              <p className="text-xs mt-1">• Category • Brand • Price Range • Stock • Rating</p>
              <p className="text-xs text-green-600 mt-1">Lightning-fast search powered by Algolia.</p>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Category</h4>
          <div className="space-y-2">
            {categories.slice(0, showMoreCategories ? categories.length : 5).map((category) => {
              // Handle both string categories (legacy) and object categories (new)
              const categoryName = typeof category === 'string' ? category : category.name;
              const categoryId = typeof category === 'object' ? category.id : null;
              
              // Only show "View All" for categories with valid numeric IDs
              const hasValidId = categoryId && !isNaN(categoryId) && categoryId !== 'all';
              
              return (
                <div key={categoryName} className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer flex-1">
                    <input
                      type="radio"
                      name="category"
                      value={categoryName}
                      checked={localFilters.category === categoryName}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{categoryName}</span>
                  </label>
                  {hasValidId && categoryName !== 'All' && (
                    <Link
                      to={`/category/${categoryId}`}
                      className="text-xs text-blue-600 hover:text-blue-700 ml-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View All
                    </Link>
                  )}
                </div>
              );
            })}
            {categories.length > 5 && (
              <button
                onClick={() => setShowMoreCategories(!showMoreCategories)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {showMoreCategories ? 'Show Less' : `Show ${categories.length - 5} More`}
              </button>
            )}
          </div>
        </div>

        {/* Brand Filter */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Brand</h4>
          <div className="space-y-2">
            {brands.slice(0, showMoreBrands ? brands.length : 5).map((brand) => (
              <label key={brand} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="brand"
                  value={brand}
                  checked={localFilters.brand === brand}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{brand}</span>
              </label>
            ))}
            {brands.length > 5 && (
              <button
                onClick={() => setShowMoreBrands(!showMoreBrands)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {showMoreBrands ? 'Show Less' : `Show ${brands.length - 5} More`}
              </button>
            )}
          </div>
        </div>

        {/* Price Range Filter */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Price Range</h4>
          <div className="space-y-3">
            {/* Predefined Price Ranges */}
            <div className="space-y-2">
              {priceRanges.map((range) => (
                <label key={range} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="priceRange"
                    value={range}
                    checked={localFilters.priceRange === range}
                    onChange={(e) => handlePriceRangeChange(e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{range}</span>
                </label>
              ))}
            </div>

            {/* Custom Price Slider */}
            <div className="pt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>₦{priceSliderValue[0].toLocaleString()}</span>
                <span>₦{priceSliderValue[1].toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100000"
                step="1000"
                value={priceSliderValue[1]}
                onChange={(e) => handlePriceSliderChange([priceSliderValue[0], parseInt(e.target.value)])}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <input
                type="range"
                min="0"
                max="100000"
                step="1000"
                value={priceSliderValue[0]}
                onChange={(e) => handlePriceSliderChange([parseInt(e.target.value), priceSliderValue[1]])}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider mt-2"
              />
            </div>
          </div>
        </div>

        {/* Stock Filter */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Availability</h4>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={localFilters.inStock}
              onChange={(e) => handleFilterChange('inStock', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">In Stock Only</span>
          </label>
        </div>

        {/* Rating Filter */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Minimum Rating</h4>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => handleFilterChange('minRating', localFilters.minRating === rating ? 0 : rating)}
                className={`p-1 rounded ${
                  localFilters.minRating >= rating 
                    ? 'text-yellow-400' 
                    : 'text-gray-300'
                } hover:text-yellow-400 transition-colors duration-150`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
            {localFilters.minRating > 0 && (
              <span className="text-sm text-gray-600 ml-2">
                & up
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Toggle */}
      <div className="md:hidden p-4 border-t border-gray-200">
        <button
          onClick={onToggle}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}
