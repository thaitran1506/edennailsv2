'use client';

import { useState, useEffect } from 'react';
import BookingForm from '../components/BookingForm';
import HeroSection from '../components/HeroSection';
import ServicesSection from '../components/ServicesSection';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';

interface AppointmentData {
  name: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  time: string;
}

export default function Home() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBookNow = () => {
    const bookingSection = document.getElementById('booking');
    if (bookingSection) bookingSection.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAppointmentSubmit = async (data: AppointmentData) => {
    const response = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to book appointment');
    await response.json();
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div id="home">
        <HeroSection onBookNow={handleBookNow} />
      </div>

      {/* Services Section */}
      <div id="services">
        <ServicesSection onBookNow={handleBookNow} />
      </div>

      {/* About Section */}
      <section id="about" className="py-5 bg-white">
        <div className="px-40 flex flex-1 justify-center">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="@container">
              <div className="@[480px]:px-4 @[480px]:py-3">
                <div
                  className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden bg-white @[480px]:rounded-lg min-h-[218px]"
                  style={{
                    backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDnNlm890YPZmPFgyKQoUtDAJXQ0qsB5G6lWs0R3HYdjcOFrw82-Zmy5iUkKnmdUeiq7aVhzEr79O06Fw5WWsV6yZOliUiFfMpPZmLPGzdjMSiI5hKAEpYqN83l-sjdBJbB7p6NwoM8-iukEh7Wfeqa9gaNGv3nyqohma16zspWgS37dtysoc2Wh5gMvK5rPO3krhfxsYirRzIP82sr1vpB3yM1kFeDrBtMZALqOfpgYwrmHw6wgQJG0G_YUihcue-VK-DWWwi00gPo")'
                  }}
                />
              </div>
            </div>
            <h2 className="text-[#181113] tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">Our Story</h2>
            <p className="text-[#181113] text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">
              Eden Nails was founded in 2018 by two Vietnamese immigrants who came to Portland with little more than determination, grit, and a dream: to build a better life for their two sons—and to share their passion for beauty with the community that welcomed them.
            </p>
            <p className="text-[#181113] text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">
              Like many immigrant families, they faced challenges: long hours, language barriers, and the pressure of starting over. But with relentless hard work and deep-rooted family values, they turned those challenges into purpose. Eden Nails is the heart of that journey—a family-owned salon built on love, resilience, and the belief that every person deserves to feel seen, cared for, and confident in their own skin.
            </p>
            <p className="text-[#181113] text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">
              Located in the vibrant city of Portland, Eden Nails is more than a place for great nail care. It's a space where neighbors become friends, where diversity is celebrated, and where kindness is always in style. Every service—whether a simple manicure or a detailed nail design—is done with skill, pride, and the kind of attention that only comes from people who truly care.
            </p>
            <p className="text-[#181113] text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">
              At Eden Nails, we believe in the power of small businesses, the strength of immigrant families, and the beauty of building something together—from the ground up, one polished nail at a time.
            </p>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section id="booking" className="py-5 bg-white">
        <div className="flex justify-center items-center w-full">
          <div className="max-w-[512px] w-full px-4">
            <BookingForm onSubmit={handleAppointmentSubmit} />
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <div id="contact">
        <ContactSection />
      </div>

      {/* Footer */}
      <Footer />

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 bg-[#eb477e] text-white p-3 rounded-full shadow-lg hover:bg-[#d63d6e] transform hover:scale-110 transition-all duration-200"
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
