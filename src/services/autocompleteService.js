import { liteClient as algoliasearch } from 'algoliasearch/lite';

// Algolia configuration
const searchClient = algoliasearch(
  'RUGQ6P8IPQ',
  '35d57c5cd4b02d8fca37ce06f445dd8d'
);

// Simple autocomplete function for basic implementation
export async function getAutocompleteSuggestions(query, limit = 5) {
  try {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const { results } = await searchClient.search([
      {
        indexName: 'productIndex',
        query: query.trim(),
        hitsPerPage: limit,
      }
    ]);

    const hits = results[0]?.hits || [];
    
    // Return both product names and query suggestions
    const suggestions = hits.map(hit => ({
      id: hit.objectID,
      name: hit.name,
      query: hit.name,
      price: hit.price,
      image: hit.image,
      category: hit.category?.name,
      type: 'product'
    }));

    return suggestions;
  } catch (error) {
    console.error('Autocomplete error:', error);
    return [];
  }
}

// Get recent searches from localStorage
export function getRecentSearches() {
  try {
    const saved = localStorage.getItem('campor_recent_searches');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error loading recent searches:', error);
    return [];
  }
}

// Save search to recent searches
export function saveRecentSearch(query) {
  try {
    const recentSearches = getRecentSearches();
    const newRecentSearches = [
      query.trim(),
      ...recentSearches.filter(s => s !== query.trim())
    ].slice(0, 5);
    
    localStorage.setItem('campor_recent_searches', JSON.stringify(newRecentSearches));
    return newRecentSearches;
  } catch (error) {
    console.error('Error saving recent search:', error);
    return [];
  }
}
