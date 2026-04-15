# POD Catalog - Setup & Integration Guide

## 🎯 Prerequisites

Ensure your React project has:
- React 18 or higher
- Tailwind CSS 3 or higher
- Node.js 14 or higher

---

## 📝 Step 1: Set Up Google Fonts

### Option A: Using Google Fonts CDN (Quick Setup)

Add to your `index.html` file in the `<head>` section:

```html
<head>
  <!-- Google Fonts: Poppins and Inter -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
```

### Option B: Using @import in CSS (Recommended)

Add to your main CSS file (e.g., `index.css` or `styles.css`):

```css
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 🎨 Step 2: Configure Tailwind CSS

### Update `tailwind.config.js`

```javascript
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        'pod-dark': '#111111',
        'pod-light': '#f9f9f9',
        'pod-border': '#e5e5e5',
      },
    },
  },
  plugins: [],
};
```

---

## 📦 Step 3: Copy Components to Your Project

1. Create the directory structure:
```bash
src/components/PODCatalog/
```

2. Copy these files:
- `Header.jsx`
- `Sidebar.jsx`
- `ProductCard.jsx`
- `ProductCatalog.jsx`
- `PODCatalogPage.jsx`
- `index.js`

---

## 🚀 Step 4: Import and Use

### Option A: Full Page Implementation

In your router/main layout file:

```jsx
import { PODCatalogPage } from '@/components/PODCatalog';

export default function DashboardLayout() {
  return <PODCatalogPage />;
}
```

### Option B: Component Integration

In your existing layout:

```jsx
import { Header, Sidebar, ProductCatalog } from '@/components/PODCatalog';
import { useState } from 'react';

export default function YourPage() {
  const [store, setStore] = useState('Default Store');
  const [category, setCategory] = useState(null);

  return (
    <div className="flex flex-col h-screen">
      <Header selectedStore={store} onStoreChange={setStore} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onCategorySelect={setCategory} selectedCategory={category} />
        <ProductCatalog selectedCategory={category} selectedStore={store} />
      </div>
    </div>
  );
}
```

---

## ✅ Step 5: Verify Setup

1. Start your development server:
```bash
npm run dev
```

2. Check that:
- Poppins font is used for headings (BREEZY SUNZ logo)
- Inter font is used for body text and buttons
- Tailwind styles are applied correctly
- Colors match the design palette
- Responsive layout works on mobile/tablet/desktop

---

## 🔌 Step 6: Connect to Your Data

### Replace Dummy Data with API Calls

In `ProductCatalog.jsx`:

```jsx
import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';

const ProductCatalog = ({ selectedCategory, selectedStore }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/products', {
          params: {
            category: selectedCategory,
            store: selectedStore,
          }
        });
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, selectedStore]);

  // Rest of component...
};
```

---

## 🎓 Component Props Reference

### Header

```typescript
interface HeaderProps {
  selectedStore: string;
  onStoreChange: (store: string) => void;
}
```

### Sidebar

```typescript
interface SidebarProps {
  onCategorySelect: (category: string) => void;
  selectedCategory: string | null;
}
```

### ProductCatalog

```typescript
interface ProductCatalogProps {
  selectedCategory: string | null;
  selectedStore: string;
}
```

### ProductCard

```typescript
interface ProductCardProps {
  product: {
    id: number;
    name: string;
    brand: string;
    technology: string;
    sizes: string | number;
    fulfilledFrom: string;
    price: number;
    image: string;
    colors: string[];
  };
  onSelect: (productId: number) => void;
  isSelected: boolean;
}
```

---

## 🛠️ Troubleshooting

### Fonts Not Loading

**Problem:** Google Fonts not displaying

**Solution:**
1. Verify internet connection
2. Check Tailwind config includes font families
3. Clear browser cache (Ctrl+Shift+Delete)
4. Ensure CSS import is at the top of your stylesheet

### Tailwind Styles Not Applied

**Problem:** Classes not styling elements

**Solution:**
1. Verify Tailwind content paths in `tailwind.config.js`
2. Rebuild Tailwind: `npm run build` or restart dev server
3. Ensure `@tailwind` directives are in CSS file
4. Check for typos in class names

### Responsive Breakpoints Not Working

**Problem:** Layout not responsive

**Solution:**
1. Verify Tailwind breakpoint prefixes: `sm:`, `md:`, `lg:`, `xl:`
2. Check device width in browser dev tools
3. Test in Firefox DevTools Responsive Design Mode
4. Ensure no fixed widths are overriding responsive classes

---

## 📚 Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Google Fonts](https://fonts.google.com)
- [React Documentation](https://react.dev)
- [Tailwind UI Components](https://tailwindui.com)

---

## 🚀 Next Steps

1. Test all component interactions
2. Connect to your backend API
3. Add authentication if needed
4. Customize colors and styling
5. Add additional features (favorites, comparing products, etc.)
6. Implement analytics tracking
7. Deploy to production

---

## 📞 Support

For issues encountered during setup, check:
1. Browser console for errors
2. Network tab for API failures
3. Component console logs
4. Tailwind CSS debugging

---

## ✨ That's it!

Your POD Catalog interface is ready to use. Customize as needed for your specific requirements.
