import React, { useState, useEffect } from "react";
import { Sun, Moon, Wallet, Wallet2 } from "lucide-react"; // Optional: Swap for your icon set
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import'@solana/wallet-adapter-react-ui/styles.css'
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) {
        return savedTheme === "dark";
      }
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return true;
  });

  useEffect(() => {
    const htmlElement = document.documentElement;
    if (isDarkMode) {
      htmlElement.classList.add("dark");
      htmlElement.classList.remove("light");
      localStorage.setItem("theme", "dark");
    } else {
      htmlElement.classList.remove("dark");
      htmlElement.classList.add("light");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const handleWalletConnect = () => {
    alert("Wallet connection initiated!");
  };

  return (
    <header className="  z-50 bg-card/70 border-b border-border backdrop-blur-md shadow-sm mb-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
         <a href="#" className="flex items-center space-x-1">
  <span className="text-2xl font-extrabold text-primary">
    GoDec
  </span>
  <span className="text-xl font-bold  text-primary">
    .xyz
  </span>
</a>

          {/* Desktop Navigation */}
          <nav className="hidden sm:flex items-center space-x-6">
            <a href="#" className="nav-link">Home</a>
            <a href="#" className="nav-link">Explorer</a>
            <a href="#" className="nav-link">Docs</a>
            <a href="#" className="nav-link">Community</a>
          </nav>

          {/* Right Side */}
          <div className="hidden sm:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full bg-muted hover:bg-muted/70 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-blue-500" />
              )}
            </button>

            {/* Connect Wallet */}

           
          
<WalletMultiButton style={{background :'orange', color:"white" }} />
          </div>
          {/* Hamburger for mobile */}
          <div className="sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring transition"
              aria-label="Toggle menu"
            >
              <svg
                className={`${isMenuOpen ? "hidden" : "block"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isMenuOpen ? "block" : "hidden"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="sm:hidden bg-card/90 backdrop-blur-md transition-all duration-200 shadow-md">
          <div className="px-4 pt-4 pb-3 space-y-1">
            <a href="#" className="mobile-link">Home</a>
            <a href="#" className="mobile-link">Explorer</a>
            <a href="#" className="mobile-link">Docs</a>
            <a href="#" className="mobile-link">Community</a>

            <hr className="my-2 border-border" />

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Dark Mode</span>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-full bg-muted hover:bg-muted/70 transition-colors"
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-5 h-5 text-blue-500" />
                )}
              </button>
            </div>
<WalletMultiButton style={{background :'orange', color:"white" }} />
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
