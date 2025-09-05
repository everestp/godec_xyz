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

const Navbar = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState("/");

  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  const handleWalletConnect = () => {
    if (!isWalletConnected) {
      // Mock wallet connection
      setWalletAddress("0x742d...8f2e");
      setIsWalletConnected(true);
    } else {
      setWalletAddress("");
      setIsWalletConnected(false);
    }
  };

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/dashboard", icon: BarChart3, label: "Dashboard" },
    { href: "/learn-more", icon: LeafyGreen, label: "About" },
    // { href: "/swap", icon: ArrowLeftRight, label: "Swap" },
    // { href: "/marketplace", icon: ShoppingCart, label: "E-Commerce" },
    // { href: "/promotions", icon: Megaphone, label: "Promotions" },
  ];

  return (
    <nav className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-bitcoin rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold gradient-bitcoin bg-clip-text text-transparent">
              godec.xyz
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors",
                  currentPath === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </a>
            ))}
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
           <WalletMultiButton style={{background :'orange', color:"white" }}/>

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
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors w-full",
                  currentPath === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </a>
            ))}

            <Button
              onClick={handleWalletConnect}
              variant={isWalletConnected ? "outline" : "default"}
              className={cn("w-full mt-4", isWalletConnected ? "" : "bitcoin-glow")}
            >
              <Wallet className="w-4 h-4 mr-2" />
              {isWalletConnected ? (
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    {walletAddress}
                  </Badge>
                  <span>Disconnect</span>
                </div>
              ) : (
                "Connect Wallet"
              )}
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
