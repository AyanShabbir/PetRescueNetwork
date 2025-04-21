import { useState } from "react";
import { Link, useLocation } from "wouter";
import { PawPrint } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
  };

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <PawPrint className="text-primary mr-2 h-8 w-8" />
            <h1 className="text-primary font-semibold text-xl md:text-2xl">Pet Rescue Hub</h1>
          </Link>
        </div>
        
        <div className="hidden md:flex space-x-4 items-center">
          <Link href="/find-pets" className={`px-3 py-2 rounded-md ${isActive('/find-pets') ? 'text-primary' : 'text-neutral-700 hover:text-primary'}`}>
            Find Pets
          </Link>
          <Link href="/lost-found" className={`px-3 py-2 rounded-md ${isActive('/lost-found') ? 'text-primary' : 'text-neutral-700 hover:text-primary'}`}>
            Lost & Found
          </Link>
          <Link href="/shelters" className={`px-3 py-2 rounded-md ${isActive('/shelters') ? 'text-primary' : 'text-neutral-700 hover:text-primary'}`}>
            Shelters
          </Link>
          
          <Link href="/donate" className={`px-3 py-2 rounded-md ${isActive('/donate') ? 'text-primary' : 'text-neutral-700 hover:text-primary'}`}>
            Donate
          </Link>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="flex items-center">
                  <span className="mr-1">Account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-sm text-muted-foreground capitalize">{user.role}</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>My Profile</DropdownMenuItem>
                <DropdownMenuItem>My Favorites</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button className="flex items-center">
                <span>Sign In</span>
              </Button>
            </Link>
          )}
        </div>
        
        <button 
          className="md:hidden p-2"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-md">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/find-pets" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/find-pets') ? 'text-primary' : 'text-neutral-700 hover:text-primary'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Find Pets
            </Link>
            <Link href="/lost-found" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/lost-found') ? 'text-primary' : 'text-neutral-700 hover:text-primary'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Lost & Found
            </Link>
            <Link href="/shelters" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/shelters') ? 'text-primary' : 'text-neutral-700 hover:text-primary'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Shelters
            </Link>
            <Link href="/donate" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/donate') ? 'text-primary' : 'text-neutral-700 hover:text-primary'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Donate
            </Link>
            {user ? (
              <>
                <div className="block px-3 py-2 font-medium">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-muted-foreground capitalize">{user.role}</div>
                </div>
                <button 
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-primary"
                  onClick={handleLogout}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/login" 
                className="block px-3 py-2 rounded-md text-base font-medium text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
