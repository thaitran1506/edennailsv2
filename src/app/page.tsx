'use client';

// import { useState } from 'react';
import ServiceCard from '../components/ServiceCard';
import ContactForm from '../components/ContactForm';
import MobileNav from '../components/MobileNav';

interface FormData {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
}

export default function Home() {
  const handleBookNow = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFormSubmit = (data: FormData) => {
    // Here you would typically send the data to your backend
    console.log('Booking submitted:', data);
    alert('Thank you for your booking! We will contact you soon to confirm your appointment.');
  };

  const services = [
    {
      title: "Classic Manicure",
      price: "$35",
      description: "Professional nail shaping, cuticle care, and premium polish application for a flawless finish.",
      duration: "45 min",
      icon: "💅"
    },
    {
      title: "Gel Manicure",
      price: "$45",
      description: "Long-lasting gel polish with chip-resistant finish that maintains shine for up to 3 weeks.",
      duration: "60 min",
      icon: "✨"
    },
    {
      title: "Luxury Pedicure",
      price: "$55",
      description: "Complete foot care including exfoliation, massage, and premium polish with extended relaxation.",
      duration: "75 min",
      icon: "🌸"
    },
    {
      title: "Gel Pedicure",
      price: "$65",
      description: "Long-lasting gel pedicure with extended wear and beautiful finish for sandal season.",
      duration: "90 min",
      icon: "🌺"
    },
    {
      title: "Nail Art Design",
      price: "$25+",
      description: "Custom nail art and intricate designs to express your unique style and personality.",
      duration: "30+ min",
      icon: "🎨"
    },
    {
      title: "Nail Extensions",
      price: "$85",
      description: "Professional acrylic or gel extensions for length, strength, and stunning nail transformations.",
      duration: "120 min",
      icon: "💎"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full glass z-50 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gradient-primary">Eden Nails</h1>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#home" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">Home</a>
              <a href="#services" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">Services</a>
              <a href="#gallery" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">Gallery</a>
              <a href="#about" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">About</a>
              <a href="#contact" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">Contact</a>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleBookNow}
                className="hidden md:block btn-primary"
              >
                Book Now
              </button>
              <MobileNav onBookNow={handleBookNow} />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-20 min-h-screen flex items-center justify-center gradient-bg-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white z-10">
          <div className="mb-8">
            <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
              ✨ Luxury Nail Care Experience
            </span>
          </div>
          <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
            Welcome to <span className="text-yellow-300">Eden Nails</span>
          </h1>
          <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed opacity-90">
            Experience the pinnacle of luxury nail care in our serene, professional environment. 
            Where artistry meets excellence, and every detail matters.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button 
              onClick={handleBookNow}
              className="btn-primary text-lg px-10 py-4"
            >
              Book Your Appointment
            </button>
            <button 
              onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-outline text-lg px-10 py-4"
            >
              Explore Services
            </button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 section-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="text-purple-600 font-semibold text-sm uppercase tracking-wider mb-4 block">
              Our Services
            </span>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Premium Nail Care</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover our comprehensive range of professional nail services, designed to enhance your natural beauty 
              and provide the ultimate pampering experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <ServiceCard
                key={index}
                title={service.title}
                price={service.price}
                description={service.description}
                duration={service.duration}
                icon={service.icon}
                onBookNow={handleBookNow}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="text-purple-600 font-semibold text-sm uppercase tracking-wider mb-4 block">
              Our Portfolio
            </span>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Artistic Excellence</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Explore our gallery of stunning nail designs and transformations that showcase our artistic expertise 
              and attention to detail.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center hover:scale-105 transition-transform cursor-pointer group">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-3xl">💅</span>
                  </div>
                  <p className="text-sm font-medium text-gray-700">Design {i + 1}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 section-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-purple-600 font-semibold text-sm uppercase tracking-wider mb-4 block">
                About Us
              </span>
              <h2 className="text-5xl font-bold text-gray-900 mb-8">Crafting Beauty, One Nail at a Time</h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                At Eden Nails, we believe that beautiful nails are an essential part of feeling confident and polished. 
                Our team of skilled nail technicians is dedicated to providing you with the highest quality nail care services 
                in a luxurious, relaxing environment.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                We use only premium products and follow strict hygiene protocols to ensure your safety and satisfaction. 
                Whether you&apos;re looking for a simple manicure or an elaborate nail art design, we&apos;re here to make your vision a reality.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gradient-primary mb-2">8+</div>
                  <div className="text-gray-600 font-medium">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-gradient-primary mb-2">2000+</div>
                  <div className="text-gray-600 font-medium">Happy Clients</div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-10">
              <div className="text-center">
                <div className="w-40 h-40 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl mx-auto mb-8 flex items-center justify-center">
                  <span className="text-8xl">💅</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Why Choose Eden Nails?</h3>
                <ul className="text-left space-y-4">
                  <li className="flex items-center">
                    <span className="text-purple-500 mr-4 text-xl">✓</span>
                    <span className="font-medium">Certified nail technicians</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-purple-500 mr-4 text-xl">✓</span>
                    <span className="font-medium">Premium quality products</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-purple-500 mr-4 text-xl">✓</span>
                    <span className="font-medium">Luxurious atmosphere</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-purple-500 mr-4 text-xl">✓</span>
                    <span className="font-medium">Competitive pricing</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="text-purple-600 font-semibold text-sm uppercase tracking-wider mb-4 block">
              Get In Touch
            </span>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Book Your Appointment</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Ready to experience luxury nail care? Contact us today to schedule your appointment 
              and begin your journey to beautiful, healthy nails.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-8">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mr-6">
                    <span className="text-white text-xl">📍</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Visit Us</h4>
                    <p className="text-gray-600">123 Luxury Avenue, Downtown<br />City, State 12345</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mr-6">
                    <span className="text-white text-xl">📞</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Call Us</h4>
                    <p className="text-gray-600">(555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mr-6">
                    <span className="text-white text-xl">✉️</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Email Us</h4>
                    <p className="text-gray-600">info@edennails.com</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mr-6">
                    <span className="text-white text-xl">🕒</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Business Hours</h4>
                    <p className="text-gray-600">Monday - Saturday: 9AM - 8PM<br />Sunday: 10AM - 6PM</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-10 shadow-soft">
              <h3 className="text-3xl font-bold text-gray-900 mb-8">Book Your Appointment</h3>
              <ContactForm onSubmit={handleFormSubmit} />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="section-dark py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-3xl font-bold text-gradient-primary mb-6">Eden Nails</h3>
              <p className="text-gray-300 leading-relaxed">
                Experience luxury nail care in a relaxing environment. Professional manicures, pedicures, and stunning nail art 
                crafted with precision and care.
              </p>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-6 text-white">Quick Links</h4>
              <ul className="space-y-3">
                <li><a href="#home" className="text-gray-300 hover:text-white transition-colors">Home</a></li>
                <li><a href="#services" className="text-gray-300 hover:text-white transition-colors">Services</a></li>
                <li><a href="#gallery" className="text-gray-300 hover:text-white transition-colors">Gallery</a></li>
                <li><a href="#about" className="text-gray-300 hover:text-white transition-colors">About</a></li>
                <li><a href="#contact" className="text-gray-300 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-6 text-white">Contact Info</h4>
              <div className="space-y-3 text-gray-300">
                <p>📍 123 Luxury Avenue, Downtown</p>
                <p>📞 (555) 123-4567</p>
                <p>✉️ info@edennails.com</p>
                <p>🕒 Mon-Sat: 9AM-8PM</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Eden Nails. All rights reserved. | Luxury Nail Care</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
