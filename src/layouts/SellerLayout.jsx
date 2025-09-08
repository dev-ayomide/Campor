import { useState, cloneElement } from 'react';
import { SellerSidebar, Navbar } from '../components/layout';

export default function SellerLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      {/* Navbar with seller menu toggle */}
      <Navbar 
        onSellerMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
        isSellerMenuOpen={isMobileMenuOpen}
        setIsSellerMenuOpen={setIsMobileMenuOpen}
      />
      
      <div className="flex">
        {/* Sidebar - Hidden on mobile, fixed on desktop */}
        <div className="hidden lg:block">
          <SellerSidebar />
        </div>
        
        {/* Mobile Sidebar Overlay - REMOVED, now handled in Navbar */}
        
        {/* Main Content */}
        <div className="flex-1 lg:ml-64 min-w-0 overflow-hidden">
          {/* Page Content - Scrollable */}
          <main className="h-[calc(100vh-5rem)] mt-20 lg:mt-20 p-6 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {cloneElement(children, { 
              isMobileMenuOpen, 
              setIsMobileMenuOpen,
              toggleMobileMenu: () => setIsMobileMenuOpen(!isMobileMenuOpen)
            })}
          </main>
        </div>
      </div>
    </div>
  );
}
