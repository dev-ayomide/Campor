import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { getAutocompleteSuggestions, getRecentSearches, saveRecentSearch } from '../../services/autocompleteService';
import { debounce } from '../../services/searchService';

export default function AutocompleteSearchBox({ placeholder = "What are you looking for?", className = "" }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);
  const navigate = useNavigate();

  // Calculate dropdown position
  const updateDropdownPosition = useCallback(() => {
    if (searchRef.current) {
      const rect = searchRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, []);

  // Load recent searches from localStorage
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Update dropdown position on window resize/scroll
  useEffect(() => {
    const handleResize = () => {
      if (showSuggestions) {
        updateDropdownPosition();
      }
    };

    const handleScroll = () => {
      if (showSuggestions) {
        updateDropdownPosition();
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [showSuggestions, updateDropdownPosition]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery) => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await getAutocompleteSuggestions(searchQuery, 8);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Search error:', error);
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
    setSelectedIndex(-1);
    updateDropdownPosition();
    
    if (value.trim().length >= 2) {
      debouncedSearch(value);
    } else {
      setSuggestions([]);
      setShowSuggestions(value.trim().length > 0);
    }
  };

  // Handle search submission
  const handleSearch = (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    // Save to recent searches
    saveRecentSearch(searchQuery.trim());
    setRecentSearches(getRecentSearches());
    
    // Navigate to search results page
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    const searchTerm = suggestion.query || suggestion.name;
    setQuery(searchTerm);
    handleSearch(searchTerm);
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

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    const totalItems = suggestions.length + recentSearches.length;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < totalItems - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSuggestionClick(suggestions[selectedIndex]);
      } else if (selectedIndex >= suggestions.length && selectedIndex < totalItems) {
        const recentIndex = selectedIndex - suggestions.length;
        handleRecentSearchClick(recentSearches[recentIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target) &&
          suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when suggestions are shown
  const handleFocus = () => {
    updateDropdownPosition();
    if (query.trim().length >= 2 || recentSearches.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className={`relative w-full ${className}`} ref={searchRef} style={{ zIndex: 99999 }}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex bg-white rounded-full shadow-lg overflow-hidden min-h-[58px] w-full">
          <div className="flex-1 flex items-center px-4 sm:px-6 py-4 min-w-0">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                // Delay hiding suggestions to allow clicks
                setTimeout(() => {
                  if (!suggestionsRef.current?.contains(document.activeElement)) {
                    setShowSuggestions(false);
                    setSelectedIndex(-1);
                  }
                }, 150);
              }}
              placeholder={placeholder}
              className="flex-1 text-gray-900 text-base focus:outline-none bg-transparent placeholder-gray-400 min-w-0"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              style={{ fontSize: '16px' }}
            />
            {isSearching && (
              <div className="ml-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-2 sm:py-3 m-1 text-sm sm:text-base font-semibold transition-colors rounded-full flex-shrink-0"
          >
            Search
          </button>
        </div>
      </form>

      {/* Search Suggestions & Recent Searches - Portal */}
      {showSuggestions && (suggestions.length > 0 || recentSearches.length > 0) && createPortal(
        <div 
          ref={suggestionsRef}
          className="fixed bg-white border border-gray-300 rounded-lg shadow-xl max-h-80 overflow-y-auto z-[99999]"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width
          }}
        >
          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide px-2 py-1">
                Products
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id || index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors duration-150 flex items-center space-x-3 ${
                    selectedIndex === index 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-md flex items-center justify-center">
                    {suggestion.image ? (
                      <img 
                        src={suggestion.image} 
                        alt={suggestion.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                    ) : (
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {suggestion.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {suggestion.category && `${suggestion.category} • `}₦{suggestion.price?.toLocaleString()}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="p-2 border-t border-gray-100">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide px-2 py-1">
                Recent Searches
              </div>
              {recentSearches.map((recentQuery, index) => (
                <button
                  key={recentQuery}
                  onClick={() => handleRecentSearchClick(recentQuery)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors duration-150 flex items-center space-x-3 ${
                    selectedIndex === suggestions.length + index 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-700 truncate">
                      {recentQuery}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
