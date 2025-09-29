import { ChevronLeft, ChevronRight } from 'lucide-react';

// Updated pagination component v2.0 - all elements styled as buttons
const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  className = "",
  showEllipsis = true,
  maxVisiblePages = 5 
}) => {
  // Don't render if there's only one page or no pages
  if (totalPages <= 1) return null;

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    // Always show first page
    pages.push(1);
    
    if (currentPage <= halfVisible + 1) {
      // Show first few pages
      for (let i = 2; i <= Math.min(maxVisiblePages - 1, totalPages - 1); i++) {
        pages.push(i);
      }
    } else if (currentPage >= totalPages - halfVisible) {
      // Show last few pages
      for (let i = Math.max(2, totalPages - maxVisiblePages + 2); i <= totalPages - 1; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      const start = Math.max(2, currentPage - halfVisible + 1);
      const end = Math.min(totalPages - 1, currentPage + halfVisible - 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    // Always show last page if it's not already included
    if (totalPages > 1 && !pages.includes(totalPages)) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();
  const isPrevDisabled = currentPage <= 1;
  const isNextDisabled = currentPage >= totalPages;

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <nav className="flex items-center gap-1">
        {/* Previous Button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={isPrevDisabled}
          className={`
            w-10 h-10 rounded-lg flex items-center justify-center transition-colors
            ${isPrevDisabled 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
              : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
            }
          `}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Numbers */}
        {visiblePages.map((page, index) => {
          const isCurrentPage = page === currentPage;
          const showEllipsisBefore = showEllipsis && 
            index > 0 && 
            page - visiblePages[index - 1] > 1;
          
          return (
            <div key={page} className="flex items-center">
              {/* Ellipsis before this page */}
              {showEllipsisBefore && (
                <button
                  onClick={() => handlePageChange(Math.floor((page + visiblePages[index - 1]) / 2))}
                  className="w-10 h-10 rounded-lg bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 flex items-center justify-center transition-colors font-semibold"
                  aria-label="More pages"
                >
                  <span className="text-sm">...</span>
                </button>
              )}
              
              {/* Page Number */}
              <button
                onClick={() => handlePageChange(page)}
                className={`
                  w-10 h-10 rounded-lg flex items-center justify-center transition-colors font-semibold
                  ${isCurrentPage
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                  }
                `}
                aria-label={`Page ${page}`}
                aria-current={isCurrentPage ? 'page' : undefined}
              >
                {page}
              </button>
            </div>
          );
        })}

        {/* Next Button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={isNextDisabled}
          className={`
            w-10 h-10 rounded-lg flex items-center justify-center transition-colors
            ${isNextDisabled 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
              : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
            }
          `}
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </nav>
    </div>
  );
};

export default Pagination;
