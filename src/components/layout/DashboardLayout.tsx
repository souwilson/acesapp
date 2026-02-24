import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Sidebar />
      {/* Mobile: pt-16 for mobile header, full width */}
      {/* Desktop: left padding for sidebar */}
      <main className="pt-16 lg:pt-0 lg:pl-[260px] transition-all duration-200">
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
