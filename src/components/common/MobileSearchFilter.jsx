import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function MobileSearchFilter({ 
  searchValue = '', 
  onSearchChange = () => {},
  filterValue = 'all',
  onFilterChange = () => {},
  filterOptions = [],
  onRefresh = () => {},
  onExport = null,
  onAdd = null,
  addLink = null,
  addLabel = 'Add',
  searchPlaceholder = 'Search...',
  filterPlaceholder = 'All Status',
  loading = false,
  className = ''
}) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleFilterSelect = (value) => {
    onFilterChange(value);
    setIsFilterOpen(false);
  };

  return (
    <div className={`lg:hidden ${className}`}>
      {/* Search Bar */}
      <div className="relative mb-3">
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
        <svg className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Action Buttons Row */}
      <div className="flex items-center gap-2">
        {/* Filter Button */}
        <div className="relative">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="w-12 h-12 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors flex items-center justify-center"
            title="Filter"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
            </svg>
          </button>

          {/* Filter Dropdown */}
          {isFilterOpen && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
              <div className="py-1">
                <button
                  onClick={() => handleFilterSelect('all')}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                    filterValue === 'all' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  All Status
                </button>
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleFilterSelect(option.value)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      filterValue === option.value ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <button 
          onClick={onRefresh}
          disabled={loading}
          className="w-12 h-12 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors flex items-center justify-center disabled:opacity-50"
          title="Refresh"
        >
          <svg className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        {/* Export Button */}
        {onExport && (
          <button 
            onClick={onExport}
            className="w-12 h-12 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors flex items-center justify-center"
            title="Export"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
        )}

        {/* Add Button */}
        {onAdd ? (
          <button
            onClick={onAdd}
            className="w-12 h-12 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors flex items-center justify-center"
            title={addLabel}
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        ) : addLink ? (
          <Link
            to={addLink}
            className="w-12 h-12 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors flex items-center justify-center"
            title={addLabel}
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </Link>
        ) : null}
      </div>

      {/* Click outside to close filter */}
      {isFilterOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsFilterOpen(false)}
        />
      )}
    </div>
  );
}
