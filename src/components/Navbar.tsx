import React, { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { supabase } from '@/lib/supabase';

export function Navbar() {
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const { data } = await supabase.from('studio_settings').select('logo_url').eq('id', 1).single();
        if (data?.logo_url) setLogoUrl(data.logo_url);
      } catch (err) {
        console.error("Error loading header logo:", err);
      }
    };
    fetchLogo();
  }, []);

  const preventDownloadAction = (e: React.MouseEvent | React.DragEvent) => {
    e.preventDefault();
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gold/20 bg-[#FCFBF7]/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        
        {/* Logo / Branding Block */}
        <Link to="/" className="flex items-center gap-3 group" onClick={closeMenu}>
          {logoUrl ? (
            <img 
              src={logoUrl} 
              className="h-10 w-10 rounded-full object-cover border border-gold select-none pointer-events-none" 
              alt="Logo" 
              onContextMenu={preventDownloadAction}
              onDragStart={preventDownloadAction}
            />
          ) : (
            <span className="grid h-10 w-10 place-items-center rounded-full border border-gold text-gold font-display text-base">॥</span>
          )}
          <div className="flex flex-col leading-tight">
            <span className="font-display tracking-[0.15em] text-primary group-hover:text-maroon-deep transition-colors">SRI SARVESAN</span>
            <span className="font-serif text-[10px] uppercase tracking-[0.3em] text-gold">Arts</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 font-serif text-sm tracking-wider uppercase">
          <Link to="/" activeProps={{ className: "text-maroon-deep font-bold" }} className="text-foreground/80 hover:text-gold transition-colors">Home</Link>
          <Link to="/about" activeProps={{ className: "text-maroon-deep font-bold" }} className="text-foreground/80 hover:text-gold transition-colors">About</Link>
          <Link to="/portfolio" activeProps={{ className: "text-maroon-deep font-bold" }} className="text-foreground/80 hover:text-gold transition-colors">Portfolio</Link>
          <Link to="/commissions" activeProps={{ className: "text-maroon-deep font-bold" }} className="text-foreground/80 hover:text-gold transition-colors">Commission an Artwork</Link>
          <Link to="/" hash="reviews" className="text-foreground/80 hover:text-gold transition-colors">Devotee Experiences</Link>
          <Link to="/contact" activeProps={{ className: "text-maroon-deep font-bold" }} className="text-foreground/80 hover:text-gold transition-colors">Contact</Link>
        </nav>

        {/* Mobile Menu Action Toggle Button */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className="block md:hidden text-primary hover:text-gold transition-colors p-2"
          aria-label="Toggle navigation sections menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

      </div>

      {/* Animated Dropdown Expansion for Small Screen Views */}
      {isMobileMenuOpen && (
        <nav className="block md:hidden border-t border-gold/10 bg-[#FCFBF7] px-6 py-6 space-y-4 font-serif text-sm tracking-widest uppercase transition-all duration-300 ease-in-out">
          <Link to="/" onClick={closeMenu} activeProps={{ className: "text-maroon-deep font-bold" }} className="block text-foreground/80 hover:text-gold py-1">Home</Link>
          <Link to="/about" onClick={closeMenu} activeProps={{ className: "text-maroon-deep font-bold" }} className="block text-foreground/80 hover:text-gold py-1">About</Link>
          <Link to="/portfolio" onClick={closeMenu} activeProps={{ className: "text-maroon-deep font-bold" }} className="block text-foreground/80 hover:text-gold py-1">Portfolio</Link>
          <Link to="/commissions" onClick={closeMenu} activeProps={{ className: "text-maroon-deep font-bold" }} className="block text-foreground/80 hover:text-gold py-1">Commission an Artwork</Link>
          <Link to="/" hash="reviews" onClick={closeMenu} className="block text-foreground/80 hover:text-gold py-1">Devotee Experiences</Link>
          <Link to="/contact" onClick={closeMenu} activeProps={{ className: "text-maroon-deep font-bold" }} className="block text-foreground/80 hover:text-gold py-1">Contact</Link>
        </nav>
      )}
    </header>
  );
}
