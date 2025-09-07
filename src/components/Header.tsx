'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { RippleButton } from './MicroInteractions';

export default function Header() {
  const [activeSection, setActiveSection] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'services', 'gallery', 'promotions', 'about', 'booking', 'contact'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;

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
      setIsMobileMenuOpen(false);
    }
  };

  const handleBookNow = () => {
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
      setActiveSection('booking');
      setIsMobileMenuOpen(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap px-4 md:px-10 py-3">
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
              onClick={() => handleNavClick('promotions')}
              className={`text-sm font-medium leading-normal transition-all duration-200 hover:text-[#eb477e] hover:scale-105 ${
                activeSection === 'promotions' ? 'text-[#eb477e] font-semibold' : 'text-[#181113]'
              }`}
            >
              Promotions
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
          <RippleButton
            onClick={handleBookNow}
            variant="primary"
            size="sm"
            className="min-w-[84px] max-w-[480px] h-10 text-sm font-bold leading-normal tracking-[0.015em] shadow-md hover:shadow-lg btn-enhanced"
          >
            <span className="truncate">Book</span>
          </RippleButton>
        </div>

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

      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300">
          <div className="mobile-menu fixed top-0 right-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
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
                  onClick={() => handleNavClick('promotions')}
                  className={`w-full text-left py-3 px-4 rounded-lg transition-all duration-200 ${
                    activeSection === 'promotions'
                      ? 'bg-[#eb477e] text-white font-semibold'
                      : 'text-[#181113] hover:bg-gray-100'
                  }`}
                >
                  Promotions
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

              <div className="p-6 border-t border-gray-200">
                <RippleButton
                  onClick={handleBookNow}
                  variant="primary"
                  size="md"
                  className="w-full py-3 px-6 font-semibold shadow-md btn-enhanced"
                >
                  Book Appointment
                </RippleButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}