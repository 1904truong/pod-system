import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import ProductCatalog from './ProductCatalog';

const PODCatalogPage = () => {
  const [selectedStore, setSelectedStore] = useState('Cothlab Hats');
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <Header
        selectedStore={selectedStore}
        onStoreChange={setSelectedStore}
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          onCategorySelect={setSelectedCategory}
          selectedCategory={selectedCategory}
        />

        {/* Product Catalog */}
        <ProductCatalog
          selectedCategory={selectedCategory}
          selectedStore={selectedStore}
        />
      </div>
    </div>
  );
};

export default PODCatalogPage;
