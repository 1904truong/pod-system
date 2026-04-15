# POD Product Catalog Interface - React Component System

A modern, fully-featured Print-on-Demand (POD) product catalog interface built with React and Tailwind CSS.

## 📁 Component Structure

```
src/components/PODCatalog/
├── Header.jsx              # Top navigation with store selector & utilities
├── Sidebar.jsx             # Left sidebar with categories and filters
├── ProductCard.jsx         # Individual product card component
├── ProductCatalog.jsx      # Main product grid with search & sort
├── PODCatalogPage.jsx      # Main container component
└── index.js               # Component exports
```

## 🚀 Quick Start

### 1. Import the Main Component

```jsx
import { PODCatalogPage } from '@/components/PODCatalog';

function App() {
  return <PODCatalogPage />;
}
```

### 2. Or Import Individual Components

```jsx
import {
  Header,
  Sidebar,
  ProductCatalog,
  ProductCard
} from '@/components/PODCatalog';

function CustomLayout() {
  const [selectedStore, setSelectedStore] = useState('Cothlab Hats');
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <div className="flex flex-col h-screen">
      <Header
        selectedStore={selectedStore}
        onStoreChange={setSelectedStore}
      />
      <div className="flex flex-1">
        <Sidebar
          onCategorySelect={setSelectedCategory}
          selectedCategory={selectedCategory}
        />
        <ProductCatalog
          selectedCategory={selectedCategory}
          selectedStore={selectedStore}
        />
      </div>
    </div>
  );
}
```

## 📦 Component API Reference

### Header Component

**Props:**
- `selectedStore` (string): Currently selected store name
- `onStoreChange` (function): Callback when store is changed

**Features:**
- Brand logo "BREEZY SUNZ"
- Currency selector (USD, EUR, GBP, AUD)
- Country selector
- Store dropdown
- Notification bell with badge
- Profile avatar
- Start designing button
- Cart icon with badge

```jsx
<Header
  selectedStore="Cothlab Hats"
  onStoreChange={(store) => console.log(store)}
/>
```

---

### Sidebar Component

**Props:**
- `onCategorySelect` (function): Callback when category is selected
- `selectedCategory` (string): Currently selected category name

**Features:**
- Expandable category list
- Subcategory navigation
- Filter section:
  - Brands (Gildan, Bella+Canvas, Port & Company)
  - Technology (DTG, DTF, Sublimation)
  - Fulfillment locations (Europe, UK, US)
- Sticky positioning
- Smooth animations

```jsx
<Sidebar
  onCategorySelect={(category) => handleCategorySelect(category)}
  selectedCategory={selectedCategory}
/>
```

---

### ProductCatalog Component

**Props:**
- `selectedCategory` (string): Currently selected category (optional)
- `selectedStore` (string): Currently selected store name

**Features:**
- Search functionality
- Sort options:
  - Recommended
  - Lowest price
  - Highest price
  - Product name
- Responsive product grid (1-4 columns based on screen size)
- Product count display
- "Start Designing" button with selection count
- Empty state message
- Filter status display

```jsx
<ProductCatalog
  selectedCategory="Men's clothing"
  selectedStore="Cothlab Hats"
/>
```

---

### ProductCard Component

**Props:**
- `product` (object): Product data object
  - `id` (number)
  - `name` (string)
  - `brand` (string)
  - `technology` (string)
  - `sizes` (string or number)
  - `fulfilledFrom` (string)
  - `price` (number)
  - `image` (string): Image URL
  - `colors` (array): Color hex codes
- `onSelect` (function): Callback when checkbox is selected
- `isSelected` (boolean): Whether product is selected

**Features:**
- Product image with hover effects
- Selection checkbox
- Brand information
- Technology details
- Fulfillment locations
- Color swatches
- Price display
- Image placeholder for loading errors
- Responsive design

```jsx
<ProductCard
  product={{
    id: 1,
    name: 'Classic Unisex T-shirt',
    brand: 'Gildan 64000',
    technology: 'DTG',
    sizes: '8',
    fulfilledFrom: 'Europe, United Kingdom, United States',
    price: 6.98,
    image: 'https://example.com/tshirt.jpg',
    colors: ['#ffffff', '#000000', '#c6b59c']
  }}
  onSelect={(id) => handleSelect(id)}
  isSelected={false}
/>
```

---

## 🎨 Design Features

### Typography
- **Headings/Logos:** Poppins font (bold)
- **Body/UI:** Inter font

### Color Palette
- **Primary Background:** White (#ffffff)
- **Secondary Background:** Light Gray (#f9f9f9, #f3f3f3)
- **Borders:** Soft Gray (#e5e5e5, #ececec)
- **Text:** Dark Gray (#333333) / Black (#000000)
- **Accent:** Blue (#0056b3)
- **Hover States:** Light Gray (#f5f5f5)

### Responsive Breakpoints
- **Mobile:** < 640px (1 column)
- **Tablet:** 640px - 1024px (2 columns)
- **Desktop:** 1024px - 1440px (3 columns)
- **Large Desktop:** > 1440px (4 columns)

---

## 📊 Dummy Product Data

The ProductCatalog component includes 8 sample products:

```javascript
{
  id: 1,
  name: 'Classic Unisex T-shirt',
  brand: 'Gildan 64000, Gildan 5000',
  technology: 'DTG',
  sizes: '8',
  fulfilledFrom: 'Europe, United Kingdom, United States',
  price: 6.98,
  image: 'https://images.unsplash.com/...',
  colors: ['#ffffff', '#000000', '#c6b59c', '#d87093']
}
```

To use your own data, modify the `products` array in `ProductCatalog.jsx`.

---

## 🎯 Usage Examples

### Example 1: Basic Implementation

```jsx
import { PODCatalogPage } from '@/components/PODCatalog';

export default function App() {
  return <PODCatalogPage />;
}
```

### Example 2: With Custom Store Handling

```jsx
import { useState } from 'react';
import { Header, Sidebar, ProductCatalog } from '@/components/PODCatalog';

export default function CustomCatalog() {
  const [store, setStore] = useState('Store A');
  const [category, setCategory] = useState(null);

  const handleStoreChange = (newStore) => {
    setStore(newStore);
    console.log(`Switched to store: ${newStore}`);
  };

  const handleCategorySelect = (cat) => {
    setCategory(cat);
    // Fetch products for this category
  };

  return (
    <div className="flex flex-col h-screen">
      <Header
        selectedStore={store}
        onStoreChange={handleStoreChange}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          onCategorySelect={handleCategorySelect}
          selectedCategory={category}
        />
        <ProductCatalog
          selectedCategory={category}
          selectedStore={store}
        />
      </div>
    </div>
  );
}
```

### Example 3: With API Integration

```jsx
import { useEffect, useState } from 'react';
import { ProductCatalog } from '@/components/PODCatalog';

export default function APIIntegratedCatalog() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);

  useEffect(() => {
    // Fetch products from API
    const fetchProducts = async () => {
      const response = await fetch(`/api/products?category=${category}`);
      const data = await response.json();
      setProducts(data);
    };

    if (category) {
      fetchProducts();
    }
  }, [category]);

  return (
    <ProductCatalog
      selectedCategory={category}
      selectedStore="Your Store"
    />
  );
}
```

---

## 🔧 Customization Guide

### Change Color Scheme

Edit the Tailwind classes in components. For example, in `Header.jsx`:

```jsx
// Change button color from gray to blue
className="px-4 py-2 bg-blue-600 text-white rounded-lg"
```

### Add More Categories

In `Sidebar.jsx`, add to the `categories` array:

```jsx
{
  name: "Your Category",
  subcategories: ['Sub1', 'Sub2', 'Sub3']
}
```

### Customize Product Grid

In `ProductCatalog.jsx`, modify the grid columns:

```jsx
{/* Change from 1-4 to custom configuration */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
```

### Update Product Data

In `ProductCatalog.jsx`, replace the `products` array with your own data or API call:

```jsx
const [products, setProducts] = useState([]);

useEffect(() => {
  // Fetch from your API
  fetch('/api/products')
    .then(res => res.json())
    .then(data => setProducts(data));
}, []);
```

---

## 📋 Features Checklist

- ✅ Modern, clean UI with Tailwind CSS
- ✅ Google Fonts integration (Poppins & Inter)
- ✅ Fully responsive design
- ✅ Category filtering with subcategories
- ✅ Search functionality
- ✅ Sort options (price, name, recommended)
- ✅ Product selection with checkboxes
- ✅ Color swatches display
- ✅ Store selector dropdown
- ✅ Currency selector
- ✅ Country selector
- ✅ Notification system
- ✅ Cart counter
- ✅ Multiple filter options
- ✅ Image error handling
- ✅ Smooth animations & transitions
- ✅ Accessible UI components
- ✅ Mobile-first approach

---

## 🛠️ Dependencies

- React 18+
- Tailwind CSS 3+
- Node.js compatible

---

## 📄 License

Feel free to use and modify these components for your projects.

---

## 🚀 Performance Tips

1. **Lazy Load Images:** Use next/image or similar for better performance
2. **Memoize Components:** Use React.memo for ProductCard to prevent unnecessary re-renders
3. **Virtual Scrolling:** For large product lists, consider react-window
4. **Debounce Search:** Add debouncing to search input for better performance

---

## 📞 Support

For issues or questions, review the component code or create custom variations based on your needs.
