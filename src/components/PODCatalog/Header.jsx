import React, { useState } from 'react';

const Header = ({ selectedStore, onStoreChange }) => {
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [storeOpen, setStoreOpen] = useState(false);

  const currencies = ['USD', 'EUR', 'GBP', 'AUD'];
  const countries = ['United States', 'United Kingdom', 'Canada', 'Australia'];
  const stores = ['Cothlab Hats', 'Fashion Store', 'Breezy Shop', 'Sunz Collection'];

  const [currency, setCurrency] = useState('USD');
  const [country, setCountry] = useState('United States');

  return (
    <div className="w-full bg-white border-b border-gray-200">
      {/* Main Header */}
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex-shrink-0">
          <h1 className="text-2xl font-bold text-black" style={{ fontFamily: 'Poppins' }}>
            BREEZY SUNZ
          </h1>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-6">
          {/* Check icon */}
          <button className="text-gray-600 hover:text-black transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>

          {/* Bell icon */}
          <button className="text-gray-600 hover:text-black transition relative">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
              3
            </span>
          </button>

          {/* Store Dropdown */}
          <div className="relative">
            <button
              onClick={() => setStoreOpen(!storeOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition text-sm font-medium"
            >
              {selectedStore || stores[0]}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
            {storeOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                {stores.map((store) => (
                  <button
                    key={store}
                    onClick={() => {
                      onStoreChange(store);
                      setStoreOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                  >
                    {store}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Profile Avatar */}
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold cursor-pointer">
            TH
          </div>
        </div>
      </div>

      {/* Utility Bar */}
      <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Currency Dropdown */}
          <div className="relative">
            <button
              onClick={() => setCurrencyOpen(!currencyOpen)}
              className="flex items-center gap-2 text-sm text-gray-700 hover:text-black transition"
            >
              Currency: <span className="font-semibold">{currency}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
            {currencyOpen && (
              <div className="absolute top-full left-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                {currencies.map((cur) => (
                  <button
                    key={cur}
                    onClick={() => {
                      setCurrency(cur);
                      setCurrencyOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                  >
                    {cur}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Country Dropdown */}
          <div className="relative">
            <button
              onClick={() => setCountryOpen(!countryOpen)}
              className="flex items-center gap-2 text-sm text-gray-700 hover:text-black transition"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
              {country}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
            {countryOpen && (
              <div className="absolute top-full left-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                {countries.map((ctry) => (
                  <button
                    key={ctry}
                    onClick={() => {
                      setCountry(ctry);
                      setCountryOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                  >
                    {ctry}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Start Designing Button */}
          <button className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg text-sm font-medium cursor-not-allowed opacity-50">
            Start designing +
          </button>

          {/* Cart Icon */}
          <button className="relative p-2 text-gray-600 hover:text-black transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
              0
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
