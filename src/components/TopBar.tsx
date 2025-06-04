import { Sheet, SheetTrigger } from './ui/sheet';
import { Menu } from 'lucide-react';
import SidebarDrawer from './SidebarDrawer';
import { Dialog } from '@radix-ui/react-dialog';

export default function TopBar() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between px-4 py-2">
        <Dialog>
          <Sheet>
          <SheetTrigger asChild>
            <button
              aria-label="Open menu"
              className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SidebarDrawer />
          </Sheet>
        </Dialog>
        
        <h1 className="text-lg font-semibold">HiPat</h1>
        
        <div className="w-10" /> {/* Spacer to center title */}
      </div>
    </header>
  );
}