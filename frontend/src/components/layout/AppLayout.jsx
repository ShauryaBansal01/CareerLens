import { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';

export function AppLayout({ children }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-bg-main">
      <Sidebar />
      <div className={`${isMobile ? '' : 'lg:pl-64'} flex flex-col min-h-screen`}>
        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
