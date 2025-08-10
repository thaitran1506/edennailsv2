'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Header() {
  const [activeSection, setActiveSection] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'gallery', 'services', 'about', 'contact', 'booking'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element as HTMLElement;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.mobile-menu') && !target.closest('.hamburger-button')) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleNavClick = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
      setIsMobileMenuOpen(false); // Close mobile menu after navigation
    }
  };

  const handleBookNow = () => {
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
      setActiveSection('booking');
      setIsMobileMenuOpen(false); // Close mobile menu after navigation
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f4f0f2] px-4 md:px-10 py-3 shadow-sm bg-white">
        {/* Logo Section */}
        <div className="flex items-center gap-2 md:gap-4 text-[#181113]">
          <div className="size-12 md:size-16 relative">
            <Image
              src="/EdenFavicon.png"
              alt="Eden Nails Logo"
              width={64}
              height={64}
              className="object-contain"
              priority
            />
          </div>
          <h2 className="text-[#181113] text-xl md:text-2xl font-bold leading-tight tracking-[-0.02em] font-elegant bg-gradient-to-r from-[#eb477e] to-[#d63d6e] bg-clip-text text-transparent drop-shadow-sm">Eden Nails</h2>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex flex-1 justify-end gap-8">
          <div className="flex items-center gap-9">
            <button 
              onClick={() => handleNavClick('home')} 
              className={`text-sm font-medium leading-normal transition-all duration-200 hover:text-[#eb477e] hover:scale-105 ${
                activeSection === 'home' ? 'text-[#eb477e] font-semibold' : 'text-[#181113]'
              }`}
            >
              Home
            </button>
            <button 
              onClick={() => handleNavClick('gallery')} 
              className={`text-sm font-medium leading-normal transition-all duration-200 hover:text-[#eb477e] hover:scale-105 ${
                activeSection === 'gallery' ? 'text-[#eb477e] font-semibold' : 'text-[#181113]'
              }`}
            >
              Gallery
            </button>
            <button 
              onClick={() => handleNavClick('services')} 
              className={`text-sm font-medium leading-normal transition-all duration-200 hover:text-[#eb477e] hover:scale-105 ${
                activeSection === 'services' ? 'text-[#eb477e] font-semibold' : 'text-[#181113]'
              }`}
            >
              Services
            </button>
            <button 
              onClick={() => handleNavClick('about')} 
              className={`text-sm font-medium leading-normal transition-all duration-200 hover:text-[#eb477e] hover:scale-105 ${
                activeSection === 'about' ? 'text-[#eb477e] font-semibold' : 'text-[#181113]'
              }`}
            >
              About
            </button>
            <button 
              onClick={() => handleNavClick('contact')} 
              className={`text-sm font-medium leading-normal transition-all duration-200 hover:text-[#eb477e] hover:scale-105 ${
                activeSection === 'contact' ? 'text-[#eb477e] font-semibold' : 'text-[#181113]'
              }`}
            >
              Contact
            </button>
          </div>
          <button
            onClick={handleBookNow}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#eb477e] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#d63d6e] transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <span className="truncate">Book</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={toggleMobileMenu}
          className="lg:hidden hamburger-button flex flex-col justify-center items-center w-8 h-8 space-y-1.5 p-1"
          aria-label="Toggle mobile menu"
        >
          <span className={`block w-6 h-0.5 bg-[#181113] transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-[#181113] transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-[#181113] transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300">
          <div className="mobile-menu fixed top-0 right-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-[#181113]">Menu</h3>
                <button
                  onClick={toggleMobileMenu}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  aria-label="Close mobile menu"
                >
                  <svg className="w-6 h-6 text-[#181113]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Mobile Navigation Links */}
              <nav className="flex-1 px-6 py-4 space-y-2">
                <button 
                  onClick={() => handleNavClick('home')} 
                  className={`w-full text-left py-3 px-4 rounded-lg transition-all duration-200 ${
                    activeSection === 'home' 
                      ? 'bg-[#eb477e] text-white font-semibold' 
                      : 'text-[#181113] hover:bg-gray-100'
                  }`}
                >
                  Home
                </button>
                <button 
                  onClick={() => handleNavClick('gallery')} 
                  className={`w-full text-left py-3 px-4 rounded-lg transition-all duration-200 ${
                    activeSection === 'gallery' 
                      ? 'bg-[#eb477e] text-white font-semibold' 
                      : 'text-[#181113] hover:bg-gray-100'
                  }`}
                >
                  Gallery
                </button>
                <button 
                  onClick={() => handleNavClick('services')} 
                  className={`w-full text-left py-3 px-4 rounded-lg transition-all duration-200 ${
                    activeSection === 'services' 
                      ? 'bg-[#eb477e] text-white font-semibold' 
                      : 'text-[#181113] hover:bg-gray-100'
                  }`}
                >
                  Services
                </button>
                <button 
                  onClick={() => handleNavClick('about')} 
                  className={`w-full text-left py-3 px-4 rounded-lg transition-all duration-200 ${
                    activeSection === 'about' 
                      ? 'bg-[#eb477e] text-white font-semibold' 
                      : 'text-[#181113] hover:bg-gray-100'
                  }`}
                >
                  About
                </button>
                <button 
                  onClick={() => handleNavClick('contact')} 
                  className={`w-full text-left py-3 px-4 rounded-lg transition-all duration-200 ${
                    activeSection === 'contact' 
                      ? 'bg-[#eb477e] text-white font-semibold' 
                      : 'text-[#181113] hover:bg-gray-100'
                  }`}
                >
                  Contact
                </button>
              </nav>

              {/* Mobile Book Button */}
              <div className="p-6 border-t border-gray-200">
                <button
                  onClick={handleBookNow}
                  className="w-full bg-[#eb477e] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#d63d6e] transition-colors duration-200 shadow-md"
                >
                  Book Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}