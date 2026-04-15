import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AboutPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-slate-900 text-white py-24 px-8 mt-[100px]">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-black mb-6 tracking-tight uppercase">About Breezy Sunz</h1>
          <p className="text-xl text-gray-300 leading-relaxed font-light">
            We are a premium Print-On-Demand (POD) platform dedicated to turning your creative ideas into high-quality physical products. From statement apparel to elegant homeware, we print it for you.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-8 py-20 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-slate-800">Our Mission</h2>
            <p className="text-gray-600 leading-loose mb-4">
              At Breezy Sunz, we believe that everyone has a unique story to tell. Our mission is to provide creators, entrepreneurs, and dreamers with the tools they need to bring their visions to life without the hassle of inventory or fulfillment.
            </p>
            <p className="text-gray-600 leading-loose">
              By utilizing sustainable printing technologies and a global fulfillment network, we ensure that every order is crafted with care and delivered swiftly across the globe.
            </p>
          </div>
          <div className="bg-blue-100 rounded-2xl h-80 flex items-center justify-center p-8">
            <i className="fa-solid fa-palette text-8xl text-blue-500 opacity-50"></i>
          </div>
        </div>

        {/* How It Works */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-12 text-slate-800">How Print-On-Demand Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="p-8 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-blue-500 text-4xl mb-4"><i className="fa-solid fa-upload"></i></div>
              <h3 className="text-xl font-bold mb-3">1. You Upload</h3>
              <p className="text-gray-600">Submit your custom artwork, select your preferred blank products, and set your own profit margins.</p>
            </div>
            <div className="p-8 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-blue-500 text-4xl mb-4"><i className="fa-solid fa-shirt"></i></div>
              <h3 className="text-xl font-bold mb-3">2. We Print</h3>
              <p className="text-gray-600">When a customer places an order, our cutting-edge facilities print the design exactly as you imagined it.</p>
            </div>
            <div className="p-8 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-blue-500 text-4xl mb-4"><i className="fa-solid fa-truck-fast"></i></div>
              <h3 className="text-xl font-bold mb-3">3. We Ship</h3>
              <p className="text-gray-600">We carefully package and ship the final product directly to your customer under your brand name.</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AboutPage;
