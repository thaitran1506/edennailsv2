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
      price: "$25",
      description: "Basic nail care including shaping, cuticle care, and polish application.",
      duration: "30 min"
    },
    {
      title: "Gel Manicure",
      price: "$35",
      description: "Long-lasting gel polish that won't chip for up to 2 weeks.",
      duration: "45 min"
    },
    {
      title: "Classic Pedicure",
      price: "$35",
      description: "Complete foot care including exfoliation, massage, and polish.",
      duration: "45 min"
    },
    {
      title: "Gel Pedicure",
      price: "$45",
      description: "Long-lasting gel polish pedicure with extended wear.",
      duration: "60 min"
    },
    {
      title: "Nail Art Design",
      price: "$15+",
      description: "Custom nail art and designs to express your unique style.",
      duration: "30+ min"
    },
    {
      title: "Nail Extensions",
      price: "$65",
      description: "Professional nail extensions for length and strength.",
      duration: "90 min"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold gradient-text">Eden Nails</h1>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#home" className="text-gray-700 hover:text-pink-500 transition-colors">Home</a>
              <a href="#services" className="text-gray-700 hover:text-pink-500 transition-colors">Services</a>
              <a href="#gallery" className="text-gray-700 hover:text-pink-500 transition-colors">Gallery</a>
              <a href="#about" className="text-gray-700 hover:text-pink-500 transition-colors">About</a>
              <a href="#contact" className="text-gray-700 hover:text-pink-500 transition-colors">Contact</a>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleBookNow}
                className="hidden md:block bg-pink-500 text-white px-6 py-2 rounded-full hover:bg-pink-600 transition-colors"
              >
                Book Now
              </button>
              <MobileNav onBookNow={handleBookNow} />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-16 min-h-screen flex items-center justify-center gradient-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Welcome to <span className="text-yellow-300">Eden Nails</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Experience luxury nail care in a relaxing environment. Professional manicures, pedicures, and stunning nail art.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleBookNow}
              className="bg-white text-pink-500 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Book Appointment
            </button>
            <button 
              onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
              className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-pink-500 transition-colors"
            >
              View Services
            </button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We offer a wide range of professional nail services to keep your hands and feet looking beautiful.
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
                onBookNow={handleBookNow}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Work</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Check out some of our beautiful nail designs and transformations.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="aspect-square bg-gradient-to-br from-pink-200 to-purple-200 rounded-lg flex items-center justify-center hover:scale-105 transition-transform cursor-pointer">
                <div className="text-center">
                  <div className="w-16 h-16 bg-pink-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <span className="text-white text-2xl">💅</span>
                  </div>
                  <p className="text-sm text-gray-600">Nail Design {i + 1}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">About Eden Nails</h2>
              <p className="text-lg text-gray-600 mb-6">
                At Eden Nails, we believe that beautiful nails are an essential part of feeling confident and polished. 
                Our team of skilled nail technicians is dedicated to providing you with the highest quality nail care services.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                We use only premium products and follow strict hygiene protocols to ensure your safety and satisfaction. 
                Whether you&apos;re looking for a simple manicure or an elaborate nail art design, we&apos;re here to make your vision a reality.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-500 mb-2">5+</div>
                  <div className="text-gray-600">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-500 mb-2">1000+</div>
                  <div className="text-gray-600">Happy Clients</div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-pink-200 to-purple-200 rounded-lg p-8">
              <div className="text-center">
                <div className="w-32 h-32 bg-pink-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-white text-6xl">💅</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Choose Us?</h3>
                <ul className="text-left space-y-3">
                  <li className="flex items-center">
                    <span className="text-pink-500 mr-3">✓</span>
                    Professional nail technicians
                  </li>
                  <li className="flex items-center">
                    <span className="text-pink-500 mr-3">✓</span>
                    Premium quality products
                  </li>
                  <li className="flex items-center">
                    <span className="text-pink-500 mr-3">✓</span>
                    Relaxing atmosphere
                  </li>
                  <li className="flex items-center">
                    <span className="text-pink-500 mr-3">✓</span>
                    Competitive pricing
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ready to book your appointment? Get in touch with us today!
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Get In Touch</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white">📍</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Address</h4>
                    <p className="text-gray-600">123 Beauty Street, Downtown<br />City, State 12345</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white">📞</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Phone</h4>
                    <p className="text-gray-600">(555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white">✉️</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Email</h4>
                    <p className="text-gray-600">info@edennails.com</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white">🕒</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Hours</h4>
                    <p className="text-gray-600">Mon-Sat: 9AM-7PM<br />Sunday: 10AM-5PM</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Book Appointment</h3>
              <ContactForm onSubmit={handleFormSubmit} />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-bold gradient-text mb-4">Eden Nails</h3>
              <p className="text-gray-400">
                Experience luxury nail care in a relaxing environment. Professional manicures, pedicures, and stunning nail art.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#home" className="text-gray-400 hover:text-white transition-colors">Home</a></li>
                <li><a href="#services" className="text-gray-400 hover:text-white transition-colors">Services</a></li>
                <li><a href="#gallery" className="text-gray-400 hover:text-white transition-colors">Gallery</a></li>
                <li><a href="#about" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                <li><a href="#contact" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <div className="space-y-2 text-gray-400">
                <p>📍 123 Beauty Street, Downtown</p>
                <p>📞 (555) 123-4567</p>
                <p>✉️ info@edennails.com</p>
                <p>🕒 Mon-Sat: 9AM-7PM</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Eden Nails. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
