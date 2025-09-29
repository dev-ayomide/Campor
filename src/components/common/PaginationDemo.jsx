import React, { useState } from 'react';
import Pagination from './Pagination';

const PaginationDemo = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10;

  const handlePageChange = (page) => {
    setCurrentPage(page);
    console.log(`Navigating to page ${page}`);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Pagination Component Demo</h1>
        
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Current Page: {currentPage}</h2>
          <p className="text-gray-600 mb-6">
            This is a demo of the new pagination component that matches the design you requested. 
            It includes smart ellipsis handling, proper disabled states, and clean styling.
          </p>
          
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Features</h3>
          <ul className="space-y-2 text-gray-600">
            <li>• Clean, modern design matching your specifications</li>
            <li>• Smart ellipsis handling for large page counts</li>
            <li>• Proper disabled states for first/last pages</li>
            <li>• Accessible with proper ARIA labels</li>
            <li>• Responsive design</li>
            <li>• Consistent styling with your app's design system</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PaginationDemo;
