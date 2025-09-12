import { Navbar } from '../components/layout';

export default function ChatLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 pt-20">
        {children}
      </main>
    </div>
  );
}
