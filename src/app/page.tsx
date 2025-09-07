'use client';

import { useState, useEffect } from 'react';
import BookingForm from '../components/BookingForm';
import HeroSection from '../components/HeroSection';
import GallerySection from '../components/GallerySection';
import ServicesSection from '../components/ServicesSection';
import PromotionSection from '../components/PromotionSection';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';

export default function Home() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBookNow = () => {
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      <div id="home">
        <HeroSection onBookNow={handleBookNow} />
      </div>
      
      {/* Break line */}
      <hr className="border-gray-200" />
      
      <div id="gallery" className="py-8 bg-white">
        <div className="px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#181113] mb-4 font-elegant">
              Featured Nail Designs
            </h2>
            <p className="text-lg text-[#88636f] max-w-md mx-auto">
              Discover our latest nail art creations and get inspired for your next appointment.
            </p>
          </div>
          <GallerySection />
        </div>
      </div>
      
      {/* Break line */}
      <hr className="border-gray-200" />
      
      <div id="services">
        <ServicesSection onBookNow={handleBookNow} />
      </div>
      
      {/* Break line */}
      <hr className="border-gray-200" />
      
      <div id="promotions">
        <PromotionSection />
      </div>
      
      {/* Break line */}
      <hr className="border-gray-200" />
      
      <section id="about" className="py-8 bg-white">
        <div className="px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 flex flex-1 justify-center">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-center gap-3 p-4">
              <p className="text-[#181113] tracking-light text-[32px] font-bold leading-tight min-w-72 text-center">About Us</p>
            </div>
            <p className="text-[#181113] text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">
              Eden Nails was founded in 2018 by two Vietnamese immigrants who came to Portland with little more than determination, grit, and a dream: to build a better life for their two sons—and to share their passion for beauty with the community that welcomed them.
            </p>
            <p className="text-[#181113] text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">
              Like many immigrant families, they faced challenges: long hours, language barriers, and the pressure of starting over. But with relentless hard work and deep-rooted family values, they turned those challenges into purpose. Eden Nails is the heart of that journey—a family-owned salon built on love, resilience, and the belief that every person deserves to feel seen, cared for, and confident in their own skin.
            </p>
            <p className="text-[#181113] text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">
              Located in the vibrant city of Portland, Eden Nails is more than a place for great nail care. It&apos;s a space where neighbors become friends, where diversity is celebrated, and where kindness is always in style. Every service—whether a simple manicure or a detailed nail design—is done with skill, pride, and the kind of attention that only comes from people who truly care.
            </p>
            <p className="text-[#181113] text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">
              At Eden Nails, we believe in the power of small businesses, the strength of immigrant families, and the beauty of building something together—from the ground up, one polished nail at a time.
            </p>
          </div>
        </div>
      </section>
      
      {/* Break line */}
      <hr className="border-gray-200" />
      
      <section id="booking" className="py-6 bg-white">
        <div className="flex justify-center items-center w-full">
          <div className="w-full px-4">
            <BookingForm />
          </div>
        </div>
      </section>
      
      {/* Break line */}
      <hr className="border-gray-200" />
      
      <div id="contact">
        <ContactSection />
      </div>
      
      <Footer />
      
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 bg-[#eb477e] text-white p-3 rounded-full shadow-lg hover:bg-[#d63d6e] transition-all duration-200 transform hover:scale-110"
          aria-label="Scroll to top"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </div>
  );
}
