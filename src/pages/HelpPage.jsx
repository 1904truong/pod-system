import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 py-5">
      <button 
        className="flex w-full justify-between items-center text-left focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-semibold text-slate-800">{question}</span>
        <span className="text-gray-400">
          {isOpen ? <i className="fa-solid fa-minus"></i> : <i className="fa-solid fa-plus"></i>}
        </span>
      </button>
      {isOpen && (
        <div className="mt-4 text-gray-600 leading-relaxed pr-8">
          {answer}
        </div>
      )}
    </div>
  );
};

const HelpPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const faqs = [
    {
      question: "How long does shipping take?",
      answer: "Since all products are printed on demand, it typically takes 2-5 business days to process and print your order. After fulfillment, standard shipping takes 3-7 business days depending on your location."
    },
    {
      question: "What is your return policy?",
      answer: "Because our items are custom printed just for you, we do not accept returns for buyer's remorse or wrong size selections. However, if there is a manufacturing defect or the item arrived damaged, please contact us within 30 days for a free replacement."
    },
    {
      question: "Where are your products printed?",
      answer: "We partner with top-tier fulfillment centers globally. Your order will automatically be routed to the printing facility closest to your destination to ensure the fastest delivery and lowest ecological footprint."
    },
    {
      question: "Can I track my order?",
      answer: "Absolutely! Once your order has been printed and packed, you will receive an email containing the tracking number so you can follow its journey to your doorstep."
    },
    {
      question: "What printing methods do you use?",
      answer: "We primarily utilize Direct-to-Garment (DTG) printing for apparel, which ensures vibrant colors and long-lasting prints. For certain accessories and homeware, we use advanced dye-sublimation techniques."
    }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      
      {/* Help Header */}
      <div className="bg-blue-600 text-white py-20 px-8 mt-[100px]">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">How can we help you?</h1>
          <div className="relative mt-8 max-w-xl mx-auto text-gray-800">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-4 text-gray-400"></i>
            <input 
              type="text" 
              placeholder="Search for answers..." 
              className="w-full py-3 pl-12 pr-4 rounded-full text-lg focus:outline-none focus:ring-4 ring-blue-300"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow max-w-4xl mx-auto w-full px-8 py-16">
        <h2 className="text-3xl font-bold mb-8 text-slate-800">Frequently Asked Questions</h2>
        <div className="bg-white">
          {faqs.map((faq, idx) => (
            <FAQItem key={idx} question={faq.question} answer={faq.answer} />
          ))}
        </div>

        {/* Contact Support */}
        <div className="mt-20 bg-slate-50 p-10 rounded-2xl text-center border border-slate-100">
          <i className="fa-solid fa-headset text-5xl text-blue-500 mb-4"></i>
          <h3 className="text-2xl font-bold text-slate-800 mb-2">Still need help?</h3>
          <p className="text-gray-600 mb-6">Our dedicated support team is available 24/7 to assist you with any inquiries regarding your store or orders.</p>
          <a href="mailto:support@breezysunz.com" className="inline-block bg-slate-900 text-white px-8 py-3 rounded-full font-semibold hover:bg-slate-800 transition-colors">
            Contact Support
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HelpPage;
