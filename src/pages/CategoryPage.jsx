import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import "../styles/CategoryPage.css";

const CategoryPage = () => {
  // --- 1. STATE MANAGEMENT ---
  const [openFilters, setOpenFilters] = useState([]); // Mặc định đóng hết khi mới vào
  const [currency, setCurrency] = useState("USD");
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [showAllColors, setShowAllColors] = useState(false);

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

  const allProducts = Array.from({ length: 18 }, (_, i) => i + 1);

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
                        {displayedColors.map((color, idx) => (
                          <div key={idx} className="color-option">
                            <div
                              className="color-circle"
                              style={{
                                backgroundColor: color.hex,
                                border:
                                  color.name === "White"
                                    ? "1px solid #ddd"
                                    : "none",
                              }}
                            ></div>
                            <span className="color-name">{color.name}</span>
                          </div>
                        ))}
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
                          <label>
                            <input type="checkbox" /> {item}
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

              <select className="sort-select">
                <option>Sort By: Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>
          </div>

          <div className="category-grid">
            {allProducts.slice(0, visibleProducts).map((id) => (
              <ProductCard
                key={id}
                product={{
                  id,
                  name: "Premium Unisex T-shirt",
                  price: "$25.00",
                  image: "https://via.placeholder.com/400x500",
                }}
              />
            ))}
          </div>

          {/* NÚT VIEW MORE */}
          {visibleProducts < allProducts.length && (
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
