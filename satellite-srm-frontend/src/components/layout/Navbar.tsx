import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Satellite, Menu, X, ChevronRight } from 'lucide-react';
import { ThemeToggle } from '../theme/ThemeToggle';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Platform', to: '/platform' },
  { label: 'Use Cases', to: '/use-cases' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'About', to: '/about' },
];

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const isActive = (to: string) => {
    if (to === '/') return location.pathname === '/';
    if (to === '/platform') return location.pathname === '/platform' || location.pathname === '/enhance';
    return location.pathname.startsWith(to);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
          scrolled || menuOpen
            ? 'glass-nav shadow-sm'
            : 'bg-transparent border-b border-border/10'
        }`}
        style={{ height: 'var(--nav-height)' }}
      >
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center shadow-[0_0_15px_hsl(var(--primary)/0.2)]">
              <Satellite size={16} className="text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <div className="text-[15px] font-bold text-foreground leading-none">TerraSR</div>
              <div className="text-[11px] text-muted-foreground leading-none mt-0.5">
                Satellite Super-Resolution
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-3 py-2 text-[13px] font-medium rounded-md transition-colors duration-150 ${
                  isActive(link.to)
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.label}
                {isActive(link.to) && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden lg:flex items-center gap-1.5">
            <ThemeToggle />
            <div className="w-px h-4 bg-border mx-2" />
            <button
              onClick={() => navigate('/platform')}
              className="btn-primary text-[13px] py-2 px-4"
            >
              Launch platform
            </button>
          </div>

          {/* Mobile */}
          <div className="flex lg:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => navigate('/platform')}
              className="btn-primary text-xs py-2 px-3"
            >
              Platform
            </button>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-150"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden glass-panel border-t border-border px-4 py-3 space-y-0.5 anim-fade-in shadow-xl">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center justify-between px-3 py-2.5 rounded-md text-[13px] font-medium transition-colors duration-150 ${
                  isActive(link.to)
                    ? 'bg-muted/50 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {link.label}
                <ChevronRight size={13} className="opacity-30" />
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Spacer removed because parent layout uses pt-[var(--nav-height)] */}
    </>
  );
};
