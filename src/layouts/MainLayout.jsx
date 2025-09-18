import { Navbar, Footer } from '../components/layout';

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F5F0' }}>
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 pt-16">
        {children}
      </main>
      <Footer />
    </div>
  );
}
