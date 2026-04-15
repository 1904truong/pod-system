/**
 * POD Catalog - Sample Data & Constants
 * This file contains example data structures and constants used in the POD Catalog
 */

// ============================================================
// PRODUCT DATA STRUCTURE
// ============================================================

export const sampleProducts = [
  {
    id: 1,
    name: 'Classic Unisex T-shirt',
    brand: 'Gildan 64000, Gildan 5000',
    technology: 'DTG',
    sizes: '8',
    fulfilledFrom: 'Europe, United Kingdom, United States',
    price: 6.98,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    colors: ['#ffffff', '#000000', '#c6b59c', '#d87093', '#ff6347', '#d1001c']
  },
  {
    id: 2,
    name: 'Premium Men\'s Hoodie',
    brand: 'Bella+Canvas 3719',
    technology: 'DTG',
    sizes: '6',
    fulfilledFrom: 'Europe, United States',
    price: 19.99,
    image: 'https://images.unsplash.com/photo-1556821552-5b0d4c2b9d4a?w=400&h=400&fit=crop',
    colors: ['#ffffff', '#000000', '#808080', '#000080', '#8b0000']
  },
  {
    id: 3,
    name: 'Classic Sweatshirt',
    brand: 'Gildan 18000',
    technology: 'DTG',
    sizes: '7',
    fulfilledFrom: 'Europe, United Kingdom, United States',
    price: 14.50,
    image: 'https://images.unsplash.com/photo-1556821552-5b0d4c2b9d4a?w=400&h=400&fit=crop',
    colors: ['#ffffff', '#000000', '#708090', '#006400', '#4b0082']
  },
  {
    id: 4,
    name: 'Women\'s Crop Top',
    brand: 'Bella+Canvas 6681',
    technology: 'DTG',
    sizes: '5',
    fulfilledFrom: 'Europe, United States',
    price: 11.20,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    colors: ['#ffffff', '#000000', '#ffc0cb', '#e6e6fa', '#ffe4b5']
  },
  {
    id: 5,
    name: 'Comfort Colors Tee',
    brand: 'Comfort Colors 1717',
    technology: 'DTG',
    sizes: '8',
    fulfilledFrom: 'United States',
    price: 13.49,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    colors: ['#f5f5dc', '#fffacd', '#e9967a', '#87ceeb', '#90ee90']
  },
  {
    id: 6,
    name: 'Classic Polo Shirt',
    brand: 'Port and Company KP155',
    technology: 'DTF',
    sizes: '6',
    fulfilledFrom: 'Europe, United States',
    price: 15.60,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    colors: ['#ffffff', '#000000', '#000080', '#006400', '#800000']
  },
  {
    id: 7,
    name: 'All-Over Print Tee',
    brand: 'LAT Apparel 6901',
    technology: 'AOP',
    sizes: '6',
    fulfilledFrom: 'Europe, United States',
    price: 18.30,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    colors: ['#ffffff', '#000000', '#f5deb3', '#e0ffff', '#ffe4e1']
  },
  {
    id: 8,
    name: 'Premium Hoodie',
    brand: 'Bella+Canvas 3719',
    technology: 'Sublimation',
    sizes: '6',
    fulfilledFrom: 'Europe, United States',
    price: 22.50,
    image: 'https://images.unsplash.com/photo-1556821552-5b0d4c2b9d4a?w=400&h=400&fit=crop',
    colors: ['#ffffff', '#000000', '#c0c0c0', '#ffc0cb', '#e6e6fa']
  }
];

// ============================================================
// CATEGORY DATA
// ============================================================

export const categories = [
  {
    name: "Men's clothing",
    subcategories: ['All', 'T-shirts', 'Hoodies', 'Sweatshirts', 'Tank tops', 'Polo shirts']
  },
  {
    name: "Women's clothing",
    subcategories: ['All', 'T-shirts', 'Hoodies', 'Crop tops', 'Tank tops', 'Yoga wear']
  },
  {
    name: 'Unisex clothing',
    subcategories: ['All', 'T-shirts', 'Hoodies', 'Sweatshirts', 'Crewneck', 'V-neck']
  },
  {
    name: 'Youth & Baby',
    subcategories: ['All', 'T-shirts', 'Hoodies', 'Baby wear', 'Kids hoodies']
  },
  {
    name: 'Drinkware',
    subcategories: ['All', 'Mugs', 'Bottles', 'Tumblers', 'Shot glasses']
  },
  {
    name: 'Hats',
    subcategories: ['All', 'Caps', 'Beanies', 'Visors', 'Bucket hats']
  },
  {
    name: 'Accessories',
    subcategories: ['All', 'Bags', 'Scarves', 'Belts', 'Socks']
  }
];

// ============================================================
// FILTER OPTIONS
// ============================================================

export const filterOptions = {
  brands: [
    'Gildan',
    'Bella+Canvas',
    'Port & Company',
    'Comfort Colors',
    'LAT Apparel',
    'Independent Trading Co.'
  ],
  technologies: [
    'DTG (Direct-to-Garment)',
    'DTF (Direct-to-Film)',
    'AOP (All-Over Print)',
    'Sublimation',
    'Screen Print'
  ],
  fulfillmentLocations: [
    'Europe',
    'United Kingdom',
    'United States',
    'Canada',
    'Australia'
  ]
};

// ============================================================
// SORTING OPTIONS
// ============================================================

export const sortOptions = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price-asc', label: 'Lowest price' },
  { value: 'price-desc', label: 'Highest price' },
  { value: 'name', label: 'Product name' },
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most popular' }
];

// ============================================================
// CURRENCY OPTIONS
// ============================================================

export const currencies = [
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar' }
];

// ============================================================
// COUNTRY OPTIONS
// ============================================================

export const countries = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' }
];

// ============================================================
// STORE DATA
// ============================================================

export const stores = [
  { id: 1, name: 'Cothlab Hats', url: 'cothlab-hats' },
  { id: 2, name: 'Fashion Store', url: 'fashion-store' },
  { id: 3, name: 'Breezy Shop', url: 'breezy-shop' },
  { id: 4, name: 'Sunz Collection', url: 'sunz-collection' }
];

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Filter products by search query
 */
export const filterBySearch = (products, query) => {
  const q = query.toLowerCase();
  return products.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.brand.toLowerCase().includes(q)
  );
};

/**
 * Sort products by option
 */
export const sortProducts = (products, sortBy) => {
  const sorted = [...products];

  switch (sortBy) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'newest':
      return sorted.reverse();
    case 'popular':
      return sorted;
    case 'recommended':
    default:
      return sorted;
  }
};

/**
 * Filter products by category
 */
export const filterByCategory = (products, category) => {
  if (!category) return products;
  // Implement your category filtering logic here
  return products; // Placeholder
};

/**
 * Filter products by technology
 */
export const filterByTechnology = (products, technologies) => {
  if (!technologies || technologies.length === 0) return products;
  return products.filter(p =>
    technologies.some(t => p.technology.includes(t))
  );
};

/**
 * Filter products by location
 */
export const filterByLocation = (products, locations) => {
  if (!locations || locations.length === 0) return products;
  return products.filter(p =>
    locations.some(loc => p.fulfilledFrom.includes(loc))
  );
};

/**
 * Get price range from products
 */
export const getPriceRange = (products) => {
  const prices = products.map(p => p.price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices)
  };
};

/**
 * Format price with currency
 */
export const formatPrice = (price, currency = 'USD') => {
  const symbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    AUD: 'A$'
  };
  return `${symbols[currency] || '$'}${price.toFixed(2)}`;
};

// ============================================================
// COLOR PALETTE FOR CONSISTENCY
// ============================================================

export const colorPalette = {
  primary: {
    50: '#f0f7ff',
    100: '#e0effe',
    200: '#bae6fd',
    500: '#0056b3',
    600: '#0056b3',
    700: '#003d82'
  },
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    900: '#111827'
  },
  semantic: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#0056b3'
  }
};

// ============================================================
// TABLE CELL SIZES FOR RESPONSIVE DESIGN
// ============================================================

export const breakpoints = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  largeDesktop: 1440
};

// ============================================================
// EXPORT DEFAULTS
// ============================================================

export default {
  sampleProducts,
  categories,
  filterOptions,
  sortOptions,
  currencies,
  countries,
  stores,
  colorPalette,
  breakpoints
};
