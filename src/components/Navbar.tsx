import React, { useState, useEffect } from 'react';

// Main App component containing the responsive navigation bar
const Navbar = () => {
    // State for managing the mobile menu's open/close state
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) {
        return savedTheme === "dark";
      }
      // Optional: Default to system preference if nothing saved
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return true; // fallback default
  });

  // Sync dark mode class on HTML element and save to localStorage
  useEffect(() => {
    const htmlElement = document.documentElement;
    if (isDarkMode) {
         htmlElement.classList.remove("light");
      htmlElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      htmlElement.classList.remove("dark");
       htmlElement.classList.add("light");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);


  const handleWalletConnect = () => {
    // Placeholder for wallet connection logic
    // This is where you would integrate with a Web3 provider like Phantom or MetaMask
    console.log("Attempting to connect wallet...");
    // A simple mock for now
    alert('Wallet connection initiated!');
  };

  return (
    <div className='mb-10'>
      {/* Navbar Container */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-card/70 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex-shrink-0">
  <a href="#" className="flex items-center space-x-1">
    <span className="text-2xl font-extrabold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
      GoDec
    </span>
    <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-yellow-400 bg-clip-text text-transparent">
      .fun
    </span>
  </a>
</div>

            {/* Desktop Navigation Links */}
            <div className="hidden sm:flex sm:items-center sm:space-x-4 md:space-x-8">
              <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Home</a>
              <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Explorer</a>
              <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Docs</a>
              <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Community</a>
            </div>

            {/* Right-aligned actions (Connect Wallet & Theme Toggle) */}
            <div className="hidden sm:flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-full hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {isDarkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256"><path fill="hsl(var(--foreground))" d="M128 32a96 96 0 1 0 96 96A96.11 96.11 0 0 0 128 32m0 160a64 64 0 1 1 64-64a64.07 64.07 0 0 1-64 64m-32-64a32 32 0 1 0 32-32a32.06 32.06 0 0 0-32 32"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256"><path fill="hsl(var(--foreground))" d="M117.84 32a127.8 127.8 0 0 0-66.21 23.36a16 16 0 0 0-5.83 23.94a103.54 103.54 0 0 1-13.6 15.65a16 16 0 0 0 1.25 24.5a104.38 104.38 0 0 1 0 102.66a16 16 0 0 0-1.25 24.5a103.54 103.54 0 0 1 13.6 15.65a16 16 0 0 0 5.83 23.94A127.8 127.8 0 0 0 117.84 224a16 16 0 0 0 14.54-9.21a96 96 0 0 1 0-165.58a16 16 0 0 0-14.54-9.21"/></svg>
                )}
              </button>
              {/* Connect Wallet Button */}
              <button
                onClick={handleWalletConnect}
                className="gradient-bitcoin text-primary-foreground font-medium py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105"
              >
                Connect Wallet
              </button>
            </div>

            {/* Mobile Menu Button (Hamburger) */}
            <div className="sm:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
                aria-controls="mobile-menu"
                aria-expanded={isMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                <svg
                  className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg
                  className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        <div className={`sm:hidden ${isMenuOpen ? 'block' : 'hidden'}`} id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-card/90">
            <a href="#" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary/20 transition-colors">Home</a>
            <a href="#" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary/20 transition-colors">Explorer</a>
            <a href="#" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary/20 transition-colors">Docs</a>
            <a href="#" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary/20 transition-colors">Community</a>
            <div className="pt-2 border-t border-border mt-2">
              <button
                onClick={handleWalletConnect}
                className="w-full text-left gradient-bitcoin text-primary-foreground font-medium py-2 px-3 rounded-md transition-all"
              >
                Connect Wallet
              </button>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm font-medium text-muted-foreground">Dark Mode</span>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-full hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {isDarkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256"><path fill="hsl(var(--foreground))" d="M128 32a96 96 0 1 0 96 96A96.11 96.11 0 0 0 128 32m0 160a64 64 0 1 1 64-64a64.07 64.07 0 0 1-64 64m-32-64a32 32 0 1 0 32-32a32.06 32.06 0 0 0-32 32"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256"><path fill="hsl(var(--foreground))" d="M117.84 32a127.8 127.8 0 0 0-66.21 23.36a16 16 0 0 0-5.83 23.94a103.54 103.54 0 0 1-13.6 15.65a16 16 0 0 0 1.25 24.5a104.38 104.38 0 0 1 0 102.66a16 16 0 0 0-1.25 24.5a103.54 103.54 0 0 1 13.6 15.65a16 16 0 0 0 5.83 23.94A127.8 127.8 0 0 0 117.84 224a16 16 0 0 0 14.54-9.21a96 96 0 0 1 0-165.58a16 16 0 0 0-14.54-9.21"/></svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      
    </div>
  );
};

export default Navbar;
