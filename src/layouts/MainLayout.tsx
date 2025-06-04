import { ReactNode } from 'react';
import TopBar from '../components/TopBar';
import { useLocation } from 'react-router-dom';
import SidebarDrawer from '../components/SidebarDrawer';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const hideMenu = location.pathname === '/login';

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {!hideMenu && <TopBar />}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}