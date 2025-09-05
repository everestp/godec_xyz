import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  Menu,
  X,
  Home,
  BarChart3,
  ArrowLeftRight,
  ShoppingCart,
  Megaphone,
  LeafyGreen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Link, useLocation } from "react-router-dom"; // Import Link and useLocation from react-router-dom
import { useWallet } from "@solana/wallet-adapter-react"; // Import useWallet hook

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation(); // Use the useLocation hook to get the current path
  const { connected, publicKey } = useWallet(); // Get connection state and public key from the hook

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/dashboard", icon: BarChart3, label: "Dashboard" },
    { href: "/learn-more", icon: LeafyGreen, label: "About" },
    // { href: "/swap", icon: ArrowLeftRight, label: "Swap" },
    // { href: "/marketplace", icon: ShoppingCart, label: "E-Commerce" },
    // { href: "/promotions", icon: Megaphone, label: "Promotions" },
  ];

  const handleMobileMenuClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-bitcoin rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold gradient-bitcoin bg-clip-text text-transparent">
              godec.xyz
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors",
                  location.pathname === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            <WalletMultiButton style={{ background: 'orange', color: "white" }} />

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border mt-2 pt-4 pb-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors w-full",
                  location.pathname === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
                )}
                onClick={handleMobileMenuClick}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            ))}

            <div className="w-full mt-4">
            <WalletMultiButton style={{background :'orange', color:"white" }} />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;