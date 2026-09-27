import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Satellite, ArrowRight, Menu, X, Sparkles } from 'lucide-react';
import { ThemeToggle } from '../theme/ThemeToggle';

interface NavbarProps {
  activeSection?: string;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', to: '/', href: '#hero' },
    { label: 'Platform', to: '/platform' },
    { label: 'Technology', href: '#approach' },
    { label: 'Multispectral', href: '#multispectral' },
    { label: 'About', href: '#challenge' },
  ];

  const handleNavClick = (item: { label: string; href?: string; to?: string }) => {
    setMobileOpen(false);
    if (item.label === 'Home') {
      if (window.location.pathname !== '/') {
        navigate('/');
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (item.to) {
      navigate(item.to);
    } else if (item.href) {
      if (window.location.pathname !== '/') {
        navigate('/' + item.href);
      } else {
        const el = document.querySelector(item.href);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || mobileOpen
          ? 'glass-panel border-b border-border/50'
          : 'bg-transparent border-b border-transparent'
        }`}
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Left: Brand / Logo */}
        <Link to="/" className="flex items-center gap-3.5 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-[0_0_15px_hsl(var(--primary)/0.2)] group-hover:shadow-[0_0_25px_hsl(var(--primary)/0.4)] transition-all duration-300">
              <Satellite size={20} className="text-primary transform group-hover:rotate-12 transition-transform duration-300" />
            </div>
            {/* Pulsing indicator dot */}
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary border-2 border-background shadow-[0_0_8px_hsl(var(--primary)/1)] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-foreground tracking-tight">TerraSR</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/20 border border-primary/30 text-primary font-bold">
                AI
              </span>
            </div>
            <div className="text-[11px] font-medium text-muted-foreground tracking-wider">
              Multispectral Intelligence
            </div>
          </div>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-background/50 border border-border/50 rounded-full px-4 py-1.5 backdrop-blur-md">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavClick(item)}
              className="px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-all duration-200"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right: Launch Platform CTA & Theme Toggle */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Link
            to="/platform"
            className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-[0_0_15px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_25px_hsl(var(--primary)/0.5)] transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <span>Launch Platform</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>

        {/* Mobile Menu Toggle & Theme */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-10 h-10 rounded-xl glass-panel border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden px-4 pt-2 pb-6 bg-background/95 backdrop-blur-2xl border-b border-border/50 flex flex-col gap-2 shadow-2xl">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavClick(item)}
              className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </button>
          ))}
          <div className="pt-4 border-t border-border/50 mt-2">
            <Link
              to="/platform"
              onClick={() => setMobileOpen(false)}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
            >
              <span>Launch Platform</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
