import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import { NEW_ARRIVALS } from "./Home";
import { regionData } from "../data/country";
import "../styles/CategoryPage.css";

const CategoryPage = () => {
  // --- 1. STATE MANAGEMENT ---
  const [openFilters, setOpenFilters] = useState([]); // Mặc định đóng hết khi mới vào
  const [currency, setCurrency] = useState("USD");
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [showAllColors, setShowAllColors] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  
  const [selectedFilters, setSelectedFilters] = useState({
    Category: [],
    Gender: [],
    Price: [],
    Colour: [],
    Size: [],
    Technology: []
  });

  // --- 2. DATA ---
  const fullColorList = [
    { name: "Pink", hex: "#ffc0cb" },
    { name: "Maroon", hex: "#800000" },
    { name: "Coral", hex: "#ff7f50" },
    { name: "Orange", hex: "#ff8c00" },
    { name: "Sand", hex: "#e4d5b7" },
    { name: "Sage", hex: "#9dc183" },
    { name: "Sky", hex: "#87ceeb" },
    { name: "Deep Red", hex: "#b22222" },
    { name: "Cream", hex: "#fffdd0" },
    { name: "Dusty Rose", hex: "#ba7f8c" },
    { name: "Slate", hex: "#708090" },
    { name: "Royal", hex: "#4169e1" },
    { name: "Charcoal", hex: "#36454f" },
    { name: "Navy", hex: "#000080" },
    { name: "Forest", hex: "#228b22" },
    { name: "White", hex: "#ffffff" },
    { name: "Black", hex: "#000000" },
    { name: "Grey", hex: "#808080" },
    { name: "Brown", hex: "#795548" },
    { name: "Purple", hex: "#9b4caf" },
  ];

  const filters = [
    {
      title: "Category",
      items: ["All men's clothing", "T-shirts", "Hoodies", "Drinkware", "Bags"],
    },
    { title: "Gender", items: ["Men", "Women", "Kids", "Unisex"] },
    { title: "Price", items: ["Under 20$", "20$ - 25$", "Over 25$"] },
    { title: "Colour", isColorGrid: true },
    { title: "Size", items: ["S", "M", "L", "XL", "2XL"] },
    {
      title: "Technology",
      items: [
        "Direct-to-Garment (DTG)",
        "Direct-to-Film (DTF)",
        "Hybrid (DTG/DTF)",
        "All-Over Print (AOP)",
        "Sublimation",
        "UV Inkjet",
      ],
    },
  ];

  const displayedColors = showAllColors
    ? fullColorList
    : fullColorList.slice(0, 9);

  // --- 3. HANDLERS ---
  const toggleFilterGroup = (title) => {
    setOpenFilters((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const toggleFilterOption = (group, value) => {
    setSelectedFilters((prev) => {
      const currentGroup = prev[group];
      if (currentGroup.includes(value)) {
        return { ...prev, [group]: currentGroup.filter((v) => v !== value) };
      } else {
        return { ...prev, [group]: [...currentGroup, value] };
      }
    });
    setVisibleProducts(9); // Reset pagination on filter change
  };
  // view more và back to top
  const [visibleProducts, setVisibleProducts] = useState(9); // Hiển thị 9 cái đầu tiên
  const [showBackToTop, setShowBackToTop] = useState(false); // Trạng thái nút Back to Top

  // Logic theo dõi cuộn chuột để hiện nút Back to Top
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleViewMore = () => {
    setVisibleProducts((prev) => prev + 6); // Mỗi lần bấm hiện thêm 6 cái
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" }); // Cuộn lên mượt mà
  };

  // Combine all products from the homepage (New Arrivals + regional collections)
  const allProductsList = [
    ...NEW_ARRIVALS,
    ...regionData.denmark.products,
    ...regionData.sweden.products
  ];

  const parsePrice = (priceStr) => {
    let p = String(priceStr).replace(/[^0-9.]/g, "");
    return parseFloat(p) || 0;
  };

  const formatPrice = (price, curr) => {
    const rawNum = parsePrice(price);
    if (curr === "EUR") return `€${(rawNum * 0.92).toFixed(2)}`;
    if (curr === "GBP") return `£${(rawNum * 0.79).toFixed(2)}`;
    return `$${rawNum.toFixed(2)}`; // USD
  };

  const filteredAndSortedProductsList = [...allProductsList]
    .filter((product) => {
      // 1. Price Filter
      if (selectedFilters.Price.length > 0) {
        const p = parsePrice(product.price);
        const matchesPrice = selectedFilters.Price.some((bracket) => {
          if (bracket === "Under 20$") return p < 20;
          if (bracket === "20$ - 25$") return p >= 20 && p <= 25;
          if (bracket === "Over 25$") return p > 25;
          return false;
        });
        if (!matchesPrice) return false;
      }

      // 2. Category Filter (basic substring match for demo)
      if (selectedFilters.Category.length > 0) {
        const txt = (product.name + " " + (product.label || "")).toLowerCase();
        const matchesCat = selectedFilters.Category.some((cat) => {
          if (cat === "All men's clothing") return true;
          // Extract root word (e.g., "T-shirts" -> "t-shirt")
          const keyword = cat.toLowerCase().replace(/s$/, ""); 
          return txt.includes(keyword);
        });
        if (!matchesCat) return false;
      }

      // 3. Colour Filter
      if (selectedFilters.Colour.length > 0) {
        if (!product.colors) return false;
        const matchesColour = selectedFilters.Colour.some((hex) =>
          product.colors.some((pc) => pc.hex.toLowerCase() === hex.toLowerCase())
        );
        if (!matchesColour) return false;
      }

      // Size, Gender, Technology defaults to match all mockup products
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "low_to_high") {
        return parsePrice(a.price) - parsePrice(b.price);
      } else if (sortBy === "high_to_low") {
        return parsePrice(b.price) - parsePrice(a.price);
      }
      return 0; // featured
    });

  return (
    <div className="category-container">
      <Navbar />

      <main className="category-main">
        {/* SIDEBAR LỌC */}
        <aside className="sidebar">
          {filters.map((filter, index) => {
            const isOpen = openFilters.includes(filter.title);
            return (
              <div key={index} className="filter-group">
                <h3
                  className="filter-title"
                  onClick={() => toggleFilterGroup(filter.title)}
                >
                  {filter.title}
                  <i
                    className={`fa-solid fa-chevron-down chevron-icon ${
                      isOpen ? "rotate" : ""
                    }`}
                  ></i>
                </h3>

                <div className={`filter-content ${isOpen ? "show" : "hide"}`}>
                  {filter.isColorGrid ? (
                    <div className="color-section-wrapper">
                      <div className="color-filter-grid">
                        {displayedColors.map((color, idx) => {
                          const isSelected = selectedFilters["Colour"].includes(color.hex);
                          return (
                          <div 
                            key={idx} 
                            className="color-option"
                            style={{ cursor: "pointer", opacity: isSelected ? 1 : 0.8 }}
                            onClick={() => toggleFilterOption("Colour", color.hex)}
                          >
                            <div
                              className="color-circle"
                              style={{
                                backgroundColor: color.hex,
                                border:
                                  color.name === "White"
                                    ? "1px solid #ddd"
                                    : "none",
                                outline: isSelected ? "2px solid #000" : "none",
                                outlineOffset: "2px"
                              }}
                            ></div>
                            <span className="color-name" style={{ fontWeight: isSelected ? "600" : "normal" }}>{color.name}</span>
                          </div>
                        )})}
                      </div>
                      {fullColorList.length > 9 && (
                        <button
                          className="btn-toggle-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowAllColors(!showAllColors);
                          }}
                        >
                          {showAllColors
                            ? "- Show less"
                            : `+ View ${fullColorList.length - 9} more`}
                        </button>
                      )}
                    </div>
                  ) : (
                    <ul className="filter-list">
                      {filter.items.map((item, idx) => (
                        <li key={idx} className="filter-item">
                          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                            <input 
                              type="checkbox" 
                              checked={selectedFilters[filter.title].includes(item)}
                              onChange={() => toggleFilterOption(filter.title, item)}
                            /> {item}
                          </label>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </aside>

        {/* NỘI DUNG CHÍNH */}
        <section className="product-content">
          <div className="content-header">
            {/* Breadcrumbs kiểu Catalog xanh */}
            <div className="breadcrumbs">
              <span className="breadcrumb-link">Catalog</span> / Clothing /
              T-shirts
            </div>

            <div className="sort-bar">
              {/* CUSTOM CURRENCY DROPDOWN */}
              <div className="currency-selector-wrapper">
                <span className="currency-label">Currency</span>
                <div
                  className={`currency-select-box ${
                    isCurrencyOpen ? "active" : ""
                  }`}
                  onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                >
                  {currency}{" "}
                  <i
                    className={`fa-solid fa-caret-${
                      isCurrencyOpen ? "up" : "down"
                    }`}
                  ></i>
                  {isCurrencyOpen && (
                    <ul className="currency-dropdown-list">
                      <li
                        onClick={() => {
                          setCurrency("EUR");
                          setIsCurrencyOpen(false);
                        }}
                      >
                        EUR
                      </li>
                      <li
                        onClick={() => {
                          setCurrency("USD");
                          setIsCurrencyOpen(false);
                        }}
                        className={currency === "USD" ? "selected" : ""}
                      >
                        USD
                      </li>
                      <li
                        onClick={() => {
                          setCurrency("GBP");
                          setIsCurrencyOpen(false);
                        }}
                      >
                        GBP
                      </li>
                    </ul>
                  )}
                </div>
              </div>

              <select 
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="featured">Sort By: Featured</option>
                <option value="low_to_high">Price: Low to High</option>
                <option value="high_to_low">Price: High to Low</option>
              </select>
            </div>
          </div>

          <div className="category-grid">
            {filteredAndSortedProductsList.slice(0, visibleProducts).map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  name: product.name,
                  price: formatPrice(product.price, currency),
                  image: product.image,
                }}
              />
            ))}
            {filteredAndSortedProductsList.length === 0 && (
               <div style={{ padding: "40px 0", width: "100%", gridColumn: "1 / -1", textAlign: "center", color: "#666" }}>
                  <i className="fa-solid fa-box-open" style={{ fontSize: "40px", marginBottom: "15px", color: "#ddd" }}></i>
                  <h3>No products found!</h3>
                  <p>Try adjusting your filters to see more results.</p>
               </div>
            )}
          </div>

          {/* NÚT VIEW MORE */}
          {visibleProducts < filteredAndSortedProductsList.length && (
            <div className="view-more-container">
              <button className="btn-view-more" onClick={handleViewMore}>
                View More
              </button>
            </div>
          )}
        </section>
      </main>

      {/* nút back -to-top */}
      <div
        className={`back-to-top-bar ${showBackToTop ? "visible" : ""}`}
        onClick={scrollToTop}
      >
        <span>Back to top</span>
        <i className="fa-solid fa-caret-up"></i>
      </div>
      <Footer />
    </div>
  );
};

export default CategoryPage;
