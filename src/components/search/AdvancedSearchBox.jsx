import { useState, useEffect, useRef, useCallback } from 'react';
import { instantSearch, getSearchSuggestions, debounce } from '../../services/searchService';

export default function AdvancedSearchBox({ onSearch, placeholder = "Search products..." }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('campor_recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
      }
    }
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery) => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await getSearchSuggestions(searchQuery, 5);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.trim().length >= 2) {
      debouncedSearch(value);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle search submission
  const handleSearch = (searchQuery = query) => {
    if (!searchQuery.trim()) return;
    
    // Add to recent searches
    const newRecentSearches = [
      searchQuery.trim(),
      ...recentSearches.filter(s => s !== searchQuery.trim())
    ].slice(0, 5);
    
    setRecentSearches(newRecentSearches);
    localStorage.setItem('campor_recent_searches', JSON.stringify(newRecentSearches));
    
    // Perform search
    onSearch(searchQuery.trim());
    setShowSuggestions(false);
    setSuggestions([]);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.name);
    handleSearch(suggestion.name);
  };

  // Handle recent search click
  const handleRecentSearchClick = (recentQuery) => {
    setQuery(recentQuery);
    handleSearch(recentQuery);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target) &&
          suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (query.trim().length >= 2 || recentSearches.length > 0) {
                setShowSuggestions(true);
              }
            }}
            placeholder={placeholder}
            className="w-full px-4 py-3 pl-12 pr-4 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
          
          {/* Search Icon */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Search Button */}
          <button
            type="submit"
            className="absolute inset-y-0 right-0 px-4 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Search
          </button>
          
          {/* Loading Indicator */}
          {isSearching && (
            <div className="absolute inset-y-0 left-10 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
      </form>

      {/* Search Suggestions & Recent Searches */}
      {showSuggestions && (suggestions.length > 0 || recentSearches.length > 0) && (
        <div 
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto"
        >
          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide px-2 py-1">
                Search Results
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id || index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md transition-colors duration-150 flex items-center space-x-3"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-md flex items-center justify-center">
                    {suggestion.imageUrls && suggestion.imageUrls[0] ? (
                      <img 
                        src={suggestion.imageUrls[0]} 
                        alt={suggestion.name}
                        className="w-6 h-6 object-cover rounded"
                      />
                    ) : (
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {suggestion.name}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      ₦{parseFloat(suggestion.price).toLocaleString()}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="p-2 border-t border-gray-200">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide px-2 py-1">
                Recent Searches
              </div>
              {recentSearches.map((recentQuery, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearchClick(recentQuery)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md transition-colors duration-150 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-gray-700">{recentQuery}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}






