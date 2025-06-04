import { SheetContent, SheetTitle } from './ui/sheet';
import { Link, useNavigate } from "react-router-dom";
import { Bot, Home, LayoutDashboard, Settings, LogOut, User, LogIn, Menu } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useEffect, useState } from "react";

function useSession() {
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_evt, ses) =>
      setLoggedIn(!!ses)
    );
    supabase.auth.getSession().then(r => setLoggedIn(!!r.data.session));
    return () => data.subscription.unsubscribe();
  }, []);
  return loggedIn;
}

export default function SidebarDrawer() {
  const nav = useNavigate();
  const loggedIn = useSession();

  const logout = async () => { 
    await supabase.auth.signOut(); 
    nav("/"); 
    navigate('/login');
  };

  return (
    <SheetContent side="left" className="w-64 p-4 space-y-4">
      <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        
      <nav className="flex flex-col gap-3 text-lg">
        <Link to="/" className="hover:underline">PAT</Link>
        <Link to="/dashboard" className="hover:underline">Dashboard</Link>
        <Link to="/settings" className="hover:underline">Settings</Link>
        <Link to="/profile" className="hover:underline">Profile</Link>
          
        {loggedIn && (
          <Link 
            to="/admin" 
            onClick={() => document.querySelector('button[aria-label="Close"]')?.click()}
            className="flex items-center gap-3 text-gray-700 hover:text-primary-600"
          >
            <Bot className="w-5 h-5" />
            Admin
          </Link>
        )}
          
        {loggedIn ? (
          <button onClick={logout}
                  className="flex items-center gap-2 hover:underline mt-2">
            <LogOut size={18}/> Log&nbsp;out
          </button>
        ) : (
          <Link to="/login"
                className="flex items-center gap-2 hover:underline mt-2">
            <LogIn size={18}/> Log&nbsp;in
          </Link>
        )}
      </nav>
    </SheetContent>
  );
}