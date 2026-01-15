import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Phone, Calendar } from 'lucide-react';
import { NAVIGATION_LINKS, APP_NAME, CONTACT_PHONE } from '../constants';
import { TYPOGRAPHY, SPACING, COLORS, Z_INDEX, TRANSITIONS, MEDIA_QUERIES } from '../tokens';
import OptimizedImage from './OptimizedImage';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrolled(scrollPosition > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    setActiveDropdown(null);
  }, [location]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveDropdown(null);
    }
  };

  // Smooth scroll to top when clicking logo
  const handleLogoClick = (e: React.MouseEvent) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle dropdown hover
  const handleDropdownEnter = (name: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(name);
  };

  const handleDropdownLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 200);
  };

  const isActiveLink = useCallback((path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  }, [location.pathname]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/98 backdrop-blur-lg shadow-lg py-3 border-b border-gray-100/20' 
          : 'bg-gradient-to-b from-black/20 to-transparent py-6'
      }`}
      style={{ zIndex: Z_INDEX.fixed }}
      role="navigation"
      aria-label="Main navigation"
      onKeyDown={handleKeyDown}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center gap-6">
          {/* Desktop Navigation & CTA - Left Side */}
          <div className="hidden lg:flex items-center gap-4 flex-1 order-1">
            {/* Desktop Navigation */}
            <div className="flex items-center space-x-1">
              {NAVIGATION_LINKS.map((link) => (
                <div
                  key={link.name}
                  className="relative"
                  onMouseEnter={() => link.submenu && handleDropdownEnter(link.name)}
                  onMouseLeave={handleDropdownLeave}
                >
                  <Link
                    to={link.path}
                    className={`text-sm font-medium tracking-wider uppercase px-5 py-2.5 rounded-xl transition-all duration-300 group relative ${
                      scrolled 
                        ? 'text-gray-800 hover:text-primary' 
                        : 'text-white hover:text-primary/90'
                    } ${
                      isActiveLink(link.path) 
                        ? (scrolled ? 'text-primary' : 'text-white bg-white/10') 
                        : ''
                    }`}
                    aria-current={isActiveLink(link.path) ? 'page' : undefined}
                  >
                    <span className="relative z-10">{link.name}</span>
                    
                    {/* Active link indicator */}
                    {isActiveLink(link.path) && (
                      <motion.span
                        layoutId="activeIndicator"
                        className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-xl -z-10"
                      />
                    )}
                    
                    {/* Hover effect */}
                    <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-white/5 to-transparent" />
                  </Link>

                  {/* Dropdown menu */}
                  {link.submenu && activeDropdown === link.name && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100/50 py-3 animate-fade-in-up">
                      {link.submenu.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.path}
                          className="block px-5 py-3 text-gray-700 hover:text-primary hover:bg-primary/5 transition-all duration-200 group"
                          onClick={() => setActiveDropdown(null)}
                        >
                          <span className="flex items-center gap-3">
                            {subItem.icon && <subItem.icon size={16} />}
                            {subItem.name}
                            <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                              →
                            </span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className={`h-6 w-px ${scrolled ? 'bg-gray-200' : 'bg-white/20'}`} />

            {/* Phone Number */}
            {CONTACT_PHONE && (
              <a
                href={`tel:${CONTACT_PHONE}`}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                  scrolled 
                    ? 'text-gray-700 hover:text-primary bg-gray-50 hover:bg-gray-100' 
                    : 'text-white hover:text-primary bg-white/10 hover:bg-white/20'
                }`}
                aria-label={`Call us at ${CONTACT_PHONE}`}
              >
                <Phone size={18} />
                <span className="text-sm font-medium">{CONTACT_PHONE}</span>
              </a>
            )}

            {/* Book Now Button */}
            <button
              onClick={() => navigate('/booking')}
              className="group relative bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary text-white px-8 py-3 rounded-full text-sm font-bold tracking-wider uppercase transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 active:scale-95"
              aria-label="Book your stay now"
            >
              <span className="flex items-center gap-2">
                <Calendar size={18} className="group-hover:rotate-12 transition-transform" />
                Book Now
              </span>
              <span className="absolute inset-0 rounded-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            </button>
          </div>

          {/* Logo - Right Side */}
          <Link 
            to="/" 
            className="flex items-center group hover:opacity-90 transition-all duration-300 active:scale-95 order-2 ml-auto md:order-2"
            aria-label={`${APP_NAME} - Home`}
            onClick={handleLogoClick}
          >
            <OptimizedImage 
              src="/assets/Logo/New Manyatta Logo.png"
              alt={APP_NAME}
              className={`transition-all duration-300 ${scrolled ? 'h-10' : 'h-14'}`}
              priority
              width={scrolled ? 120 : 160}
              height={scrolled ? 40 : 56}
            />
          </Link>

          {/* Mobile Toggle Button */}
          <button
            className={`lg:hidden p-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 order-3 ${
              scrolled 
                ? 'text-gray-800 hover:bg-gray-100' 
                : 'text-white hover:bg-white/10'
            }`}
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle navigation menu"
          >
            {isOpen ? (
              <X size={28} className="text-primary" />
            ) : (
              <Menu size={28} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        ref={mobileMenuRef}
        id="mobile-menu"
        className={`lg:hidden absolute top-full left-0 w-full bg-gradient-to-b from-white to-gray-50/95 backdrop-blur-xl shadow-2xl transition-all duration-300 ease-out ${
          isOpen 
            ? 'opacity-100 translate-y-0 pointer-events-auto' 
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="container mx-auto px-4 py-6">
          {/* Mobile Navigation Links */}
          <div className="flex flex-col space-y-1 mb-6">
            {NAVIGATION_LINKS.map((link) => (
              <React.Fragment key={link.name}>
                <Link
                  to={link.path}
                  className={`flex items-center justify-between px-5 py-4 rounded-xl text-lg font-medium transition-all duration-200 ${
                    isActiveLink(link.path)
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-800 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsOpen(false)}
                  aria-current={isActiveLink(link.path) ? 'page' : undefined}
                >
                  <span>{link.name}</span>
                  <span className="text-gray-400">→</span>
                </Link>

                {/* Mobile Submenu */}
                {link.submenu && (
                  <div className="ml-5 pl-4 border-l-2 border-gray-200/50 space-y-1">
                    {link.submenu.map((subItem) => (
                      <Link
                        key={subItem.name}
                        to={subItem.path}
                        className="flex items-center gap-3 px-5 py-3 text-gray-600 hover:text-primary rounded-lg transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        {subItem.icon && <subItem.icon size={18} />}
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Mobile Call to Action */}
          <div className="space-y-4 pt-4 border-t border-gray-200/50">
            {/* Phone Number */}
            {CONTACT_PHONE && (
              <a
                href={`tel:${CONTACT_PHONE}`}
                className="flex items-center justify-center gap-3 px-5 py-4 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-800 transition-colors"
                onClick={() => setIsOpen(false)}
                aria-label={`Call us at ${CONTACT_PHONE}`}
              >
                <Phone size={20} />
                <span className="font-medium">{CONTACT_PHONE}</span>
              </a>
            )}

            {/* Book Now Button */}
            <button
              onClick={() => {
                navigate('/booking');
                setIsOpen(false);
              }}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary text-white py-4 rounded-xl text-lg font-bold tracking-wider uppercase transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="Book your stay now"
            >
              <span className="flex items-center justify-center gap-3">
                <Calendar size={20} />
                Book Your Stay
              </span>
            </button>
          </div>

          {/* Social/Contact Info */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Open 24/7 for reservations</p>
            <p className="mt-1">Experience luxury in the wild</p>
          </div>
        </div>
      </div>

      {/* Scroll Progress Indicator */}
      {scrolled && (
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary via-primary/50 to-primary">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{
              width: `${Math.min((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100, 100)}%`
            }}
          />
        </div>
      )}
    </nav>
  );
};

// Import motion from framer-motion if not already
import { motion } from 'framer-motion';

export default Navbar;