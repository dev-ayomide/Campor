import { useState, cloneElement } from 'react';
import SellerSidebar from '../components/SellerSidebar';
import Navbar from '../components/Navbar';

export default function SellerLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F5F0' }}>
      {/* Existing Navbar */}
      <Navbar />
      
      <div className="flex">
        {/* Sidebar - Hidden on mobile, fixed on desktop */}
        <div className="hidden lg:block">
          <SellerSidebar />
        </div>
        
        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="fixed left-0 top-20 w-64 h-[calc(100vh-5rem)] z-40 lg:hidden transform transition-transform duration-300 ease-in-out">
              <SellerSidebar onMobileClose={() => setIsMobileMenuOpen(false)} />
            </div>
          </>
        )}
        
        {/* Main Content */}
        <div className="flex-1 lg:ml-64">
          {/* Page Content - Scrollable */}
          <main className="h-[calc(100vh-5rem)] mt-20 lg:mt-20 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
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
