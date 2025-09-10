// Utility functions for number and price formatting

/**
 * Format a number with commas and decimal places
 * @param {number|string} value - The value to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted number string
 */
export const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined || value === '') return '0.00';
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0.00';
  
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

/**
 * Format a price with Naira symbol and proper formatting
 * @param {number|string} price - The price to format
 * @returns {string} Formatted price string with ₦ symbol
 */
export const formatPrice = (price) => {
  if (price === null || price === undefined || price === '') return '₦0.00';
  
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num)) return '₦0.00';
  
  return `₦${formatNumber(num, 2)}`;
};

/**
 * Format a price range with Naira symbol
 * @param {number|string} minPrice - Minimum price
 * @param {number|string} maxPrice - Maximum price
 * @returns {string} Formatted price range string
 */
export const formatPriceRange = (minPrice, maxPrice) => {
  const min = formatPrice(minPrice);
  const max = formatPrice(maxPrice);
  return `${min} - ${max}`;
};

/**
 * Parse a formatted price string back to a number
 * @param {string} priceString - Formatted price string (e.g., "₦1,234.56")
 * @returns {number} Parsed number
 */
export const parsePrice = (priceString) => {
  if (!priceString) return 0;
  
  // Remove currency symbols and commas, then parse
  const cleaned = priceString.replace(/[₦,]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

/**
 * Format input value as user types (adds commas)
 * @param {string} value - Input value
 * @returns {string} Formatted value with commas
 */
export const formatInputValue = (value) => {
  if (!value) return '';
  
  // Remove any non-numeric characters except decimal point
  const cleaned = value.replace(/[^\d.]/g, '');
  
  // Split by decimal point
  const parts = cleaned.split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];
  
  // Add commas to integer part
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  // Combine with decimal part if it exists
  return decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
};

/**
 * Validate and format price input
 * @param {string} value - Input value
 * @param {number} maxDecimals - Maximum decimal places allowed
 * @returns {string} Formatted and validated value
 */
export const formatPriceInput = (value, maxDecimals = 2) => {
  if (!value) return '';
  
  // Remove any non-numeric characters except decimal point
  let cleaned = value.replace(/[^\d.]/g, '');
  
  // Ensure only one decimal point
  const decimalParts = cleaned.split('.');
  if (decimalParts.length > 2) {
    cleaned = decimalParts[0] + '.' + decimalParts.slice(1).join('');
  }
  
  // Limit decimal places
  if (decimalParts.length === 2 && decimalParts[1].length > maxDecimals) {
    cleaned = decimalParts[0] + '.' + decimalParts[1].substring(0, maxDecimals);
  }
  
  // Format with commas
  return formatInputValue(cleaned);
};
