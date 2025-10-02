import { Navbar } from '../components/layout';

export default function LegalLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F5F0' }}>
      <Navbar />
      <main className="flex-1 py-8 pt-8">
        {children}
      </main>
    </div>
  );
}
