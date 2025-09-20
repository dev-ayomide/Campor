import { Navbar } from '../components/layout';

export default function ChatLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F5F0' }}>
      <Navbar />
      <main className="flex-1 pt-20" style={{ backgroundColor: '#F7F5F0' }}>
        {children}
      </main>
    </div>
  );
}
