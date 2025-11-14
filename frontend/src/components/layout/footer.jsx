import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-3xl">🌼</span>
              <span className="text-2xl font-bold">Daisy Days</span>
            </div>
            <p className="text-gray-400">
              Bringing Satin flowers to brighten your day, every day.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <a href="#home" className="block text-gray-400 hover:text-white transition">
                Home
              </a>
              <a href="#shop" className="block text-gray-400 hover:text-white transition">
                Shop
              </a>
              <a href="#about" className="block text-gray-400 hover:text-white transition">
                About
              </a>
              <a href="#contact" className="block text-gray-400 hover:text-white transition">
                Contact
              </a>
            </div>
          </div>
          
          {/* Customer Service */}
          <div>
            <h4 className="font-bold mb-4">Customer Service</h4>
            <div className="space-y-2">
              <a href="#" className="block text-gray-400 hover:text-white transition">
                Track Order
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition">
                Shipping Info
              </a>
            </div>
          </div>
          
          {/* Contact Info */}
          <div>
            <h4 className="font-bold mb-4">Contact Us</h4>
            <div className="space-y-2 text-gray-400">
              <p>📞 +63 912 345 6789</p>
              <p>📧 hello@daisydays.ph</p>
              <p>📍 Manila, Philippines</p>
              <div className="flex space-x-4 mt-4">
                <a href="#" className="hover:text-white transition">Facebook</a> 
                <a href="#" className="hover:text-white transition">Instagram</a>
                <a href="#" className="hover:text-white transition">Twitter</a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>© 2025 Daisy Days. All rights reserved. Made with 💖 by Aristhea & Casey</p>
        </div>
      </div>
    </footer>
  );
}