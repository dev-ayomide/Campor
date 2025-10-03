import { useState, cloneElement } from 'react';
import { SellerSidebar, Navbar } from '../components/layout';

export default function SellerLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      {/* Unified Navbar */}
      <Navbar />
      
      <div className="flex">
        {/* Sidebar - Hidden on mobile, fixed on desktop */}
        <div className="hidden lg:block">
          <SellerSidebar />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 lg:ml-64 min-w-0 overflow-hidden">
          {/* Page Content - Scrollable */}
          <main className="pt-20 lg:pt-20 p-6 min-h-screen overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
