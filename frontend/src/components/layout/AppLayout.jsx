import { Sidebar } from './Sidebar';

export function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-bg-main">
      <Sidebar />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
