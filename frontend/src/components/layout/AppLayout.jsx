import { Sidebar } from './Sidebar';

export function AppLayout({ children }) {
  // No JS breakpoint tracking here on purpose. `lg:pl-64` already applies only
  // at >=1024px, so mirroring that in state added nothing except an
  // unthrottled resize listener that re-rendered the whole app subtree on
  // every pixel of a window drag.
  return (
    <div className="min-h-screen bg-bg-main">
      {/* Keyboard users land here first and can jump past the nav. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-bg-card focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-text-main focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
      >
        Skip to main content
      </a>

      <Sidebar />

      <div className="flex min-h-screen flex-col lg:pl-64">
        <main id="main-content" tabIndex={-1} className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
