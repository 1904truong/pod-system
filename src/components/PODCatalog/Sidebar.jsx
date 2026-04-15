import React, { useState } from 'react';

const Sidebar = ({ onCategorySelect, selectedCategory }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);

  const categories = [
    {
      name: "Men's clothing",
      subcategories: ['All', 'T-shirts', 'Hoodies', 'Sweatshirts', 'Tank tops']
    },
    {
      name: "Women's clothing",
      subcategories: ['All', 'T-shirts', 'Hoodies', 'Crop tops', 'Tank tops']
    },
    {
      name: 'Unisex clothing',
      subcategories: ['All', 'T-shirts', 'Hoodies', 'Sweatshirts']
    },
    {
      name: 'Youth & Baby',
      subcategories: ['All', 'T-shirts', 'Hoodies', 'Baby wear']
    },
    {
      name: 'Drinkware',
      subcategories: ['All', 'Mugs', 'Bottles', 'Tumblers']
    },
    {
      name: 'Hats',
      subcategories: ['All', 'Caps', 'Beanies', 'Visors']
    },
    {
      name: 'Accessories',
      subcategories: ['All', 'Bags', 'Scarves', 'Belts']
    }
  ];

  const handleCategoryClick = (category) => {
    setExpandedCategory(expandedCategory === category ? null : category);
    onCategorySelect(category);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-6 sticky top-0 h-screen overflow-y-auto">
      <h2 className="text-lg font-semibold text-black mb-6" style={{ fontFamily: 'Poppins' }}>
        Categories
      </h2>

      <div className="space-y-2">
        {categories.map((category) => (
          <div key={category.name}>
            <button
              onClick={() => handleCategoryClick(category.name)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition ${
                selectedCategory === category.name
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-sm">{category.name}</span>
              <svg
                className={`w-4 h-4 transition-transform ${
                  expandedCategory === category.name ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>

            {/* Subcategories */}
            {expandedCategory === category.name && (
              <div className="ml-4 space-y-1 mt-1 pb-3 border-b border-gray-200">
                {category.subcategories.map((sub) => (
                  <button
                    key={sub}
                    className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 rounded-lg transition"
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Filters Section */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-black mb-4">Filters</h3>

        {/* Brand Filter */}
        <div className="mb-6">
          <button className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-2 hover:text-black transition">
            <span>Brands</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
          <div className="space-y-2">
            {['Gildan', 'Bella+Canvas', 'Port & Company'].map((brand) => (
              <label key={brand} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-black transition">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600" />
                {brand}
              </label>
            ))}
          </div>
        </div>

        {/* Technology Filter */}
        <div className="mb-6">
          <button className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-2 hover:text-black transition">
            <span>Technology</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
          <div className="space-y-2">
            {['DTG', 'DTF', 'Sublimation'].map((tech) => (
              <label key={tech} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-black transition">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600" />
                {tech}
              </label>
            ))}
          </div>
        </div>

        {/* Fulfillment Location Filter */}
        <div>
          <button className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-2 hover:text-black transition">
            <span>Fulfillment</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
          <div className="space-y-2">
            {['Europe', 'United Kingdom', 'United States'].map((location) => (
              <label key={location} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-black transition">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600" />
                {location}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
