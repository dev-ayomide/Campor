import React from 'react';

// Component to highlight search terms in text (like the demo)
const SearchHighlight = ({ text, highlight, className = '' }) => {
  if (!highlight || !text) {
    return <span className={className}>{text}</span>;
  }

  // Simple highlighting - you can enhance this with more sophisticated logic
  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
  
  return (
    <span className={className}>
      {parts.map((part, index) => 
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark key={index} className="bg-yellow-200 px-1 rounded">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
};

export default SearchHighlight;
