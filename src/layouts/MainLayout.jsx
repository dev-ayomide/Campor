import { Navbar, Footer } from '../components/layout';
import { useLocation } from 'react-router-dom';

export default function MainLayout({ children }) {
  const location = useLocation();
  const isMarketplace = location.pathname === '/marketplace';
  
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F5F0' }}>
      <Navbar />
      {isMarketplace ? (
        <main className="flex-1 pt-20">
          {children}
        </main>
      ) : (
        <main className="flex-1 container mx-auto px-4 py-8 pt-16">
          {children}
        </main>
      )}
      <Footer />
    </div>
  );
}
