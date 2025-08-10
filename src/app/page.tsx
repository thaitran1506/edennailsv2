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
  specialRequest: string;
}

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

  const handleAppointmentSubmit = async (data: AppointmentData) => {
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to book appointment');
      }

      const result = await response.json();
      console.log('Appointment booked successfully:', result);
    } catch (error) {
      console.error('Error booking appointment:', error);
      throw error;
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
      
      <div id="services">
        <ServicesSection onBookNow={handleBookNow} />
      </div>
      
      <section id="about" className="py-8 bg-white">
        <div className="px-40 flex flex-1 justify-center">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-center gap-3 p-4">
              <p className="text-[#181113] tracking-light text-[32px] font-bold leading-tight min-w-72 text-center">About Us</p>
            </div>
            <p className="text-[#181113] text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">
              Welcome to Eden Nails, where luxury meets artistry in the heart of Portland. Founded in 2020 by Sarah Chen, a passionate nail artist with over 15 years of experience, Eden Nails was born from a simple yet powerful vision: to create a sanctuary where every client feels pampered, beautiful, and confident.
            </p>
            <p className="text-[#181113] text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">
              Our journey began in a small studio with just two chairs and a dream. Today, we&apos;ve grown into one of Portland&apos;s most beloved nail salons, serving thousands of satisfied clients who trust us with their nail care needs. What sets us apart is our unwavering commitment to quality, hygiene, and personalized service.
            </p>
            <p className="text-[#181113] text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">
              At Eden Nails, we believe that beautiful nails are more than just a fashion statement—they&apos;re a form of self-expression and self-care. That&apos;s why we use only the highest quality products and stay up-to-date with the latest trends and techniques in nail art and care.
            </p>
            <p className="text-[#181113] text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">
              Our team of skilled technicians is not just trained in the technical aspects of nail care, but also in the art of creating a relaxing, welcoming atmosphere. We understand that your time with us is precious, and we strive to make every visit a memorable experience.
            </p>
            <p className="text-[#181113] text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">
              Whether you&apos;re looking for a classic manicure, a bold nail art design, or a relaxing pedicure, we&apos;re here to bring your vision to life. Join our growing family of clients who have made Eden Nails their go-to destination for all things nail care.
            </p>
          </div>
        </div>
      </section>
      
      <section id="booking" className="py-5 bg-white">
        <div className="flex justify-center items-center w-full">
          <div className="max-w-[512px] w-full px-4">
            <BookingForm onSubmit={handleAppointmentSubmit} />
          </div>
        </div>
      </section>
      
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
