import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/AddPage.css";

import tshirtImg from "../assets/mau ao/0.png";

const AddPage = () => {
  // ─── DASHBOARD SIDEBAR ───
  const [dashActive, setDashActive] = useState("Catalog");
  const [dashCollapsed, setDashCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null); // { label, y }

  // ─── NAVIGATION ───
  const navigate = useNavigate();

  // ─── SELECTED PRODUCTS ───
  const [selectedProducts, setSelectedProducts] = useState([]);

  const toggleSelectProduct = (product) => {
    setSelectedProducts((prev) =>
      prev.find((p) => p.id === product.id)
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product]
    );
  };

  const handleStartDesigning = () => {
    if (selectedProducts.length === 0) return;
    navigate("/designer", { state: { products: selectedProducts } });
  };

  // ─── NAVBAR SCROLL SYNC ───
  const [navScrolled, setNavScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ─── CURRENCY ───
  const [currency, setCurrency] = useState("USD");
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [currencySearch, setCurrencySearch] = useState("");
  const currencyRef = useRef(null);

  const allCurrencies = [
    { code: "USD", label: "US Dollar" },
    { code: "EUR", label: "Euro" },
    { code: "GBP", label: "British Pound" },
  ];

  const filteredCurrencies = allCurrencies.filter(
    (c) =>
      c.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
      c.label.toLowerCase().includes(currencySearch.toLowerCase())
  );

  // ─── COUNTRY ───
  const [country, setCountry] = useState({ code: "us", name: "United States" });
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const countryRef = useRef(null);

  const allCountries = [
    { code: "worldwide", name: "Worldwide", flag: "🌐" },
    { code: "au", name: "Australia" },
    { code: "at", name: "Austria" },
    { code: "be", name: "Belgium" },
    { code: "bg", name: "Bulgaria" },
    { code: "ca", name: "Canada" },
    { code: "hr", name: "Croatia" },
    { code: "cz", name: "Czechia" },
    { code: "dk", name: "Denmark" },
    { code: "ee", name: "Estonia" },
    { code: "fi", name: "Finland" },
    { code: "fr", name: "France" },
    { code: "de", name: "Germany" },
    { code: "gr", name: "Greece" },
    { code: "hu", name: "Hungary" },
    { code: "ie", name: "Ireland" },
    { code: "it", name: "Italy" },
    { code: "jp", name: "Japan" },
    { code: "lv", name: "Latvia" },
    { code: "lt", name: "Lithuania" },
    { code: "nl", name: "Netherlands" },
    { code: "nz", name: "New Zealand" },
    { code: "no", name: "Norway" },
    { code: "pl", name: "Poland" },
    { code: "pt", name: "Portugal" },
    { code: "ro", name: "Romania" },
    { code: "sk", name: "Slovakia" },
    { code: "si", name: "Slovenia" },
    { code: "es", name: "Spain" },
    { code: "se", name: "Sweden" },
    { code: "ch", name: "Switzerland" },
    { code: "gb", name: "United Kingdom" },
    { code: "us", name: "United States" },
  ];

  const filteredCountries = allCountries.filter((c) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  // Đóng tất cả dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (currencyRef.current && !currencyRef.current.contains(e.target))
        setIsCurrencyOpen(false);
      if (countryRef.current && !countryRef.current.contains(e.target))
        setIsCountryOpen(false);
      if (sortRef.current && !sortRef.current.contains(e.target))
        setIsSortOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper render cờ quốc gia qua flagcdn
  const FlagImg = ({ code, size = 20 }) =>
    code === "worldwide" ? (
      <span style={{ fontSize: size * 0.85 }}>🌐</span>
    ) : (
      <img
        src={`https://flagcdn.com/${code}.svg`}
        alt={code}
        width={size}
        height={size}
        style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
      />
    );

  // ─── DATA ───
  const categories = [
    {
      name: "Men's clothing",
      items: [
        "All men's clothing",
        "T-shirts",
        "Hoodies",
        "Sweatshirts",
        "Longsleeve shirts",
        "Tank tops",
      ],
    },
    {
      name: "Women's clothing",
      items: [
        "All women's clothing",
        "T-shirts",
        "Hoodies",
        "Sweatshirts",
        "Longsleeve shirts",
        "Tank tops",
      ],
    },
    {
      name: "Unisex clothing",
      items: [
        "All unisex clothing",
        "T-shirts",
        "Hoodies",
        "Sweatshirts",
        "Longsleeve shirts",
        "Tank tops",
      ],
    },
    {
      name: "Youth & Baby",
      items: [
        "All youth & baby",
        "T-shirts",
        "Hoodies",
        "Sweatshirts",
        "Baby Clothing",
      ],
    },
    {
      name: "Drinkware",
      items: ["All drinkware", "Mugs", "Bottles", "Tumblers", "Glasses"],
    },
    {
      name: "Homeware",
      items: [
        "All homeware",
        "Cushions & pillows",
        "Mats",
        "Blankets",
        "Ornaments",
        "Yard Sign",
        "Candles",
      ],
    },
    {
      name: "Wall art",
      items: ["All wall art", "Posters", "Canvases"],
    },
    {
      name: "Hats",
      items: ["All hats", "Caps", "Beanies", "Visors"],
    },
    {
      name: "Accessories",
      items: ["All accessories"],
    },
  ];

  const [openCategories, setOpenCategories] = useState(
    categories.reduce((acc, cat) => ({ ...acc, [cat.name]: false }), {})
  );
  const [activeSubItem, setActiveSubItem] = useState(null);

  const toggleCategory = (name) => {
    setOpenCategories((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  // ─── BRANDS FILTER ───
  const allBrands = [
    "Adams Headwear",
    "Atlantis",
    "AWDis",
    "Babybugz",
    "B&C Collection",
    "Beechfield",
    "Bella+Canvas",
    "Comfort Colors",
    "Earth Positive",
    "Gildan",
    "Independant Trading Company",
    "Larkwood",
    "LAT Apparel",
    "Myrtle Beach",
    "Next Level",
    "Pacific Headwear",
    "Port and Company",
    "Sport Tek",
  ];
  const allTechs = [
    "Direct-to-Garment (DTG)",
    "Direct-to-Film (DTF)",
    "Hybrid (DTG/DTF)",
    "All-Over Print (AOP)",
    "Sublimation",
    "UV Inkjet",
  ];
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedTechs, setSelectedTechs] = useState([]);
  const [brandOpen, setBrandOpen] = useState(true);
  const [techOpen, setTechOpen] = useState(true);
  const [locationOpen, setLocationOpen] = useState(true);

  const toggleBrand = (b) =>
    setSelectedBrands((prev) =>
      prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]
    );
  const toggleTech = (t) =>
    setSelectedTechs((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );

  const productData = [
    {
      id: 1,
      name: "Classic Unisex T-shirt",
      brand: "Gildan 64000, Gildan 5000",
      tech: "DTG",
      locations: "Europe, United Kingdom, United States",
      sizes: "8",
      sizeRange: "S-5XL",
      price: "6.98",
      colors: [
        "#ffffff",
        "#000000",
        "#c6b59c",
        "#d87093",
        "#ff6347",
        "#d1001c",
        "#8b0000",
        "#778899",
      ],
    },
    {
      id: 2,
      name: "Classic Men's T-shirt",
      brand: "Gildan 64000, Gildan 5000",
      tech: "DTG",
      locations: "Europe, United Kingdom, United States",
      sizes: "8",
      sizeRange: "S-5XL",
      price: "7.08",
      colors: [
        "#ffffff",
        "#000000",
        "#c6b59c",
        "#d87093",
        "#ff6347",
        "#191970",
        "#228b22",
        "#708090",
      ],
    },
    {
      id: 3,
      name: "Classic Women's T-shirt",
      brand: "Gildan 64000L, Gildan 5000L",
      tech: "DTG",
      locations: "Europe, United Kingdom, United States",
      sizes: "6",
      sizeRange: "S-3XL",
      price: "7.92",
      colors: [
        "#ffffff",
        "#000000",
        "#d87093",
        "#4169e1",
        "#008000",
        "#ffd700",
        "#add8e6",
      ],
    },
    {
      id: 4,
      name: "Kids' T-shirt",
      brand: "Gildan 64000B, Gildan 5000B",
      tech: "DTG",
      locations: "Europe, United Kingdom, United States",
      sizes: "5",
      sizeRange: "XS-XL",
      price: "8.35",
      colors: [
        "#ffffff",
        "#000000",
        "#ff6347",
        "#000080",
        "#ffd700",
        "#add8e6",
      ],
    },
    {
      id: 5,
      name: "Premium Unisex Hoodie",
      brand: "Bella+Canvas 3719",
      tech: "DTG",
      locations: "Europe, United States",
      sizes: "6",
      sizeRange: "S-3XL",
      price: "19.99",
      colors: [
        "#ffffff",
        "#000000",
        "#808080",
        "#000080",
        "#8b0000",
        "#2f4f4f",
      ],
    },
    {
      id: 6,
      name: "Classic Sweatshirt",
      brand: "Gildan 18000",
      tech: "DTG",
      locations: "Europe, United Kingdom, United States",
      sizes: "7",
      sizeRange: "S-5XL",
      price: "14.50",
      colors: [
        "#ffffff",
        "#000000",
        "#708090",
        "#006400",
        "#4b0082",
        "#8b4513",
      ],
    },
    {
      id: 7,
      name: "Unisex Long Sleeve Shirt",
      brand: "Bella+Canvas 3501",
      tech: "DTG",
      locations: "Europe, United States",
      sizes: "6",
      sizeRange: "S-2XL",
      price: "12.75",
      colors: [
        "#ffffff",
        "#000000",
        "#c0c0c0",
        "#000080",
        "#8b0000",
        "#2e8b57",
      ],
    },
    {
      id: 8,
      name: "Women's Crop Top",
      brand: "Bella+Canvas 6681",
      tech: "DTG",
      locations: "Europe, United States",
      sizes: "5",
      sizeRange: "XS-2XL",
      price: "11.20",
      colors: [
        "#ffffff",
        "#000000",
        "#ffc0cb",
        "#e6e6fa",
        "#ffe4b5",
        "#b0e0e6",
      ],
    },
    {
      id: 9,
      name: "Comfort Colors Tee",
      brand: "Comfort Colors 1717",
      tech: "DTG",
      locations: "United States",
      sizes: "8",
      sizeRange: "S-4XL",
      price: "13.49",
      colors: [
        "#f5f5dc",
        "#fffacd",
        "#e9967a",
        "#87ceeb",
        "#90ee90",
        "#dda0dd",
        "#f08080",
        "#b0c4de",
      ],
    },
    {
      id: 10,
      name: "Next Level Premium Tee",
      brand: "Next Level 3600",
      tech: "DTG",
      locations: "United States, Canada",
      sizes: "7",
      sizeRange: "XS-4XL",
      price: "9.85",
      colors: [
        "#ffffff",
        "#000000",
        "#ff8c00",
        "#00ced1",
        "#9400d3",
        "#dc143c",
        "#32cd32",
      ],
    },
    {
      id: 11,
      name: "Classic Polo Shirt",
      brand: "Port and Company KP155",
      tech: "DTF",
      locations: "Europe, United States",
      sizes: "6",
      sizeRange: "S-3XL",
      price: "15.60",
      colors: [
        "#ffffff",
        "#000000",
        "#000080",
        "#006400",
        "#800000",
        "#808080",
      ],
    },
    {
      id: 12,
      name: "Sport Performance Tee",
      brand: "Sport Tek ST350",
      tech: "Sublimation",
      locations: "United States",
      sizes: "5",
      sizeRange: "XS-3XL",
      price: "10.95",
      colors: [
        "#ffffff",
        "#000000",
        "#ff4500",
        "#1e90ff",
        "#ffd700",
        "#32cd32",
      ],
    },
    {
      id: 13,
      name: "All-Over Print Tee",
      brand: "LAT Apparel 6901",
      tech: "All-Over Print (AOP)",
      locations: "Europe, United States",
      sizes: "6",
      sizeRange: "S-3XL",
      price: "18.30",
      colors: [
        "#ffffff",
        "#000000",
        "#f5deb3",
        "#e0ffff",
        "#ffe4e1",
        "#f0fff0",
      ],
    },
    {
      id: 14,
      name: "Baby Bodysuit",
      brand: "Babybugz BZ10",
      tech: "DTG",
      locations: "Europe, United Kingdom",
      sizes: "5",
      sizeRange: "0-18M",
      price: "9.45",
      colors: [
        "#ffffff",
        "#fffacd",
        "#ffc0cb",
        "#b0e0e6",
        "#98fb98",
        "#e6e6fa",
      ],
    },
    {
      id: 15,
      name: "Earth Positive Organic Tee",
      brand: "Earth Positive EP01",
      tech: "DTG",
      locations: "Europe, United Kingdom",
      sizes: "7",
      sizeRange: "XS-3XL",
      price: "11.80",
      colors: [
        "#f5f5dc",
        "#6b8e23",
        "#8fbc8f",
        "#d2b48c",
        "#deb887",
        "#a0522d",
      ],
    },
    {
      id: 16,
      name: "Women's Hoodie",
      brand: "Bella+Canvas 7519",
      tech: "DTG",
      locations: "Europe, United States",
      sizes: "5",
      sizeRange: "XS-2XL",
      price: "22.50",
      colors: [
        "#ffffff",
        "#000000",
        "#c0c0c0",
        "#ffc0cb",
        "#e6e6fa",
        "#add8e6",
      ],
    },
  ];

  // sort by
  const [sortBy, setSortBy] = useState("Recommended");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef(null);

  // ─── 3. Logic Sắp xếp thực tế ───
  const filteredProducts = productData.filter((p) => {
    const brandMatch =
      selectedBrands.length === 0 ||
      selectedBrands.some((b) => p.brand.includes(b));
    const techMatch =
      selectedTechs.length === 0 ||
      selectedTechs.some((t) => p.tech.includes(t));
    return brandMatch && techMatch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "Lowest price")
      return parseFloat(a.price) - parseFloat(b.price);
    if (sortBy === "Highest price")
      return parseFloat(b.price) - parseFloat(a.price);
    if (sortBy === "Product name") return a.name.localeCompare(b.name);
    return 0; // "Recommended" giữ nguyên thứ tự mặc định
  });
  return (
    <div className="add-page-wrapper">
      <Navbar />
      {/* thanh bar*/}
      <div
        className={`catalog-top-bar${navScrolled ? " navbar-scrolled" : ""}`}
      >
        {/* Tìm kiếm */}
        <div className="search-container">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="Search catalog" />
        </div>

        <div className="top-tools">
          {/* tiền tệ */}
          <div className="tool-dropdown-wrapper" ref={currencyRef}>
            <div
              className={`tool-item tool-select ${
                isCurrencyOpen ? "active" : ""
              }`}
              onClick={() => {
                setIsCurrencyOpen(!isCurrencyOpen);
                setIsCountryOpen(false);
                setCurrencySearch("");
              }}
            >
              {/* Label */}
              <span className="tool-label">Currency</span>
              <strong>{currency}</strong>
              <i
                className={`fa-solid fa-caret-${
                  isCurrencyOpen ? "up" : "down"
                }`}
              ></i>
            </div>

            {isCurrencyOpen && (
              <div className="tool-dropdown-panel">
                {/* Search box */}
                <div className="dropdown-search-box">
                  <i className="fa-solid fa-magnifying-glass"></i>
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search"
                    value={currencySearch}
                    onChange={(e) => setCurrencySearch(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                {/* List */}
                <ul className="dropdown-list">
                  {filteredCurrencies.map((c) => (
                    <li
                      key={c.code}
                      className={currency === c.code ? "selected" : ""}
                      onClick={() => {
                        setCurrency(c.code);
                        setIsCurrencyOpen(false);
                        setCurrencySearch("");
                      }}
                    >
                      <span className="item-code">{c.code}</span>
                      <span className="item-label">{c.label}</span>
                    </li>
                  ))}
                  {filteredCurrencies.length === 0 && (
                    <li className="no-result">No results</li>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* quốc gia */}
          <div className="tool-dropdown-wrapper" ref={countryRef}>
            <div
              className={`tool-item tool-select ${
                isCountryOpen ? "active" : ""
              }`}
              onClick={() => {
                setIsCountryOpen(!isCountryOpen);
                setIsCurrencyOpen(false);
                setCountrySearch("");
              }}
            >
              <FlagImg code={country.code} size={18} />
              <strong>{country.name}</strong>
              <i
                className={`fa-solid fa-caret-${isCountryOpen ? "up" : "down"}`}
              ></i>
            </div>

            {isCountryOpen && (
              <div className="tool-dropdown-panel country-panel">
                {/* Search box */}
                <div className="dropdown-search-box">
                  <i className="fa-solid fa-magnifying-glass"></i>
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search"
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                {/* List quốc gia với cờ */}
                <ul className="dropdown-list">
                  {filteredCountries.map((c) => (
                    <li
                      key={c.code}
                      className={country.code === c.code ? "selected" : ""}
                      onClick={() => {
                        setCountry(c);
                        setIsCountryOpen(false);
                        setCountrySearch("");
                      }}
                    >
                      <FlagImg code={c.code} size={22} />
                      <span className="item-label">{c.name}</span>
                    </li>
                  ))}
                  {filteredCountries.length === 0 && (
                    <li className="no-result">No results</li>
                  )}
                </ul>
              </div>
            )}
          </div>

          <button
            className={`btn-start-designing${
              selectedProducts.length > 0 ? " has-selection" : " disabled"
            }`}
            onClick={handleStartDesigning}
            disabled={selectedProducts.length === 0}
          >
            Start designing{" "}
            {selectedProducts.length > 0 ? `(${selectedProducts.length})` : "+"}
          </button>

          <div className="cart-badge-icon">
            <i className="fa-solid fa-shirt"></i>
            <span className="count">{selectedProducts.length}</span>
          </div>
        </div>
      </div>
      <div className="dashboard-layout">
        {/* ── DASHBOARD SIDEBAR ── */}
        <aside
          className={`dashboard-sidebar${dashCollapsed ? " collapsed" : ""}`}
        >
          {/* ── HEADER: expanded = avatar + info + collapse btn | collapsed = chỉ expand btn ── */}
          {dashCollapsed ? (
            <div className="dash-header-collapsed">
              <button
                className="dash-expand-btn"
                onClick={() => setDashCollapsed(false)}
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          ) : (
            <div className="dash-user">
              <div className="dash-avatar">TH</div>
              <div className="dash-user-info">
                <strong>Truong Hoang</strong>
                <span>Personal account</span>
              </div>
              <button
                className="dash-collapse-btn"
                onClick={() => setDashCollapsed(true)}
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>
            </div>
          )}

          <nav className="dash-nav">
            {[
              { icon: "fa-solid fa-border-all", label: "Catalog" },
              { icon: "fa-solid fa-store", label: "Your stores" },
            ].map((item) => (
              <div
                key={item.label}
                className={`dash-nav-item${
                  dashActive === item.label ? " active" : ""
                }`}
                onClick={() => setDashActive(item.label)}
                onMouseEnter={
                  dashCollapsed
                    ? (e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredItem({
                          label: item.label,
                          y: rect.top + rect.height / 2,
                          x: rect.right + 10,
                        });
                      }
                    : undefined
                }
                onMouseLeave={
                  dashCollapsed ? () => setHoveredItem(null) : undefined
                }
              >
                <i className={item.icon}></i>
                {!dashCollapsed && <span>{item.label}</span>}
              </div>
            ))}

            {!dashCollapsed && <div className="dash-section-title">Store</div>}
            {[
              {
                icon: "fa-solid fa-arrow-up-right-from-square",
                label: "Go to store",
              },
              { icon: "fa-solid fa-bullhorn", label: "Campaigns" },
              { icon: "fa-solid fa-layer-group", label: "Collections" },
              { icon: "fa-solid fa-tag", label: "Discounts" },
              { icon: "fa-solid fa-gear", label: "Store settings" },
              { icon: "fa-solid fa-globe", label: "Domain set up" },
              { icon: "fa-solid fa-chart-line", label: "Data tracking" },
            ].map((item) => (
              <div
                key={item.label}
                className={`dash-nav-item${
                  dashActive === item.label ? " active" : ""
                }`}
                onClick={() => setDashActive(item.label)}
                onMouseEnter={
                  dashCollapsed
                    ? (e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredItem({
                          label: item.label,
                          y: rect.top + rect.height / 2,
                          x: rect.right + 10,
                        });
                      }
                    : undefined
                }
                onMouseLeave={
                  dashCollapsed ? () => setHoveredItem(null) : undefined
                }
              >
                <i className={item.icon}></i>
                {!dashCollapsed && <span>{item.label}</span>}
              </div>
            ))}

            {!dashCollapsed && <div className="dash-section-title">Manage</div>}
            {[
              { icon: "fa-solid fa-box", label: "Orders" },
              { icon: "fa-solid fa-paintbrush", label: "Artwork library" },
              { icon: "fa-solid fa-money-bill-wave", label: "Payouts" },
              { icon: "fa-solid fa-sliders", label: "Settings" },
            ].map((item) => (
              <div
                key={item.label}
                className={`dash-nav-item${
                  dashActive === item.label ? " active" : ""
                }`}
                onClick={() => setDashActive(item.label)}
                onMouseEnter={
                  dashCollapsed
                    ? (e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredItem({
                          label: item.label,
                          y: rect.top + rect.height / 2,
                          x: rect.right + 10,
                        });
                      }
                    : undefined
                }
                onMouseLeave={
                  dashCollapsed ? () => setHoveredItem(null) : undefined
                }
              >
                <i className={item.icon}></i>
                {!dashCollapsed && <span>{item.label}</span>}
              </div>
            ))}
          </nav>
        </aside>
        {/* ── CATALOG AREA ── */}
        <div className="catalog-main-layout">
          {/* ── SIDEBAR ── */}
          <aside className="catalog-sidebar">
            <nav className="category-list">
              {categories.map((cat) => (
                <div key={cat.name} className="cat-group">
                  <div
                    className={`nav-item${
                      openCategories[cat.name] ? " open" : ""
                    }`}
                    onClick={() => toggleCategory(cat.name)}
                  >
                    <span>{cat.name}</span>
                    <i
                      className={`fa-solid fa-chevron-${
                        openCategories[cat.name] ? "up" : "down"
                      }`}
                    ></i>
                  </div>
                  {openCategories[cat.name] && (
                    <ul className="cat-sub-list">
                      {cat.items.map((item) => (
                        <li
                          key={item}
                          className={`cat-sub-item${
                            activeSubItem === item ? " active" : ""
                          }`}
                          onClick={() => setActiveSubItem(item)}
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </nav>

            <div className="sidebar-filters">
              {/* Brands */}
              <div className="filter-group">
                <div
                  className="filter-header"
                  onClick={() => setBrandOpen(!brandOpen)}
                  style={{ cursor: "pointer" }}
                >
                  Brands{" "}
                  <i
                    className={`fa-solid fa-chevron-${
                      brandOpen ? "up" : "down"
                    }`}
                    style={{ fontSize: "1.1rem", color: "#000" }}
                  ></i>
                </div>
                {brandOpen && (
                  <div className="filter-options">
                    {allBrands.map((b) => (
                      <label key={b} className="check-row">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(b)}
                          onChange={() => toggleBrand(b)}
                        />
                        <span>{b}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Production Technology */}
              <div className="filter-group">
                <div
                  className="filter-header"
                  onClick={() => setTechOpen(!techOpen)}
                  style={{ cursor: "pointer" }}
                >
                  Production Technology{" "}
                  <i
                    className={`fa-solid fa-chevron-${
                      techOpen ? "up" : "down"
                    }`}
                    style={{ fontSize: "1.1rem", color: "#000" }}
                  ></i>
                </div>
                {techOpen && (
                  <div className="filter-options">
                    {allTechs.map((t) => (
                      <label key={t} className="check-row">
                        <input
                          type="checkbox"
                          checked={selectedTechs.includes(t)}
                          onChange={() => toggleTech(t)}
                        />
                        <span>{t}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Fulfilment locations */}
              <div className="filter-group">
                <div
                  className="filter-header"
                  onClick={() => setLocationOpen(!locationOpen)}
                  style={{ cursor: "pointer" }}
                >
                  Fulfilment locations{" "}
                  <i
                    style={{ fontSize: "1.1rem", color: "#000" }}
                    className={`fa-solid fa-chevron-${
                      locationOpen ? "up" : "down"
                    }`}
                  ></i>
                </div>
                {locationOpen && (
                  <div className="filter-options">
                    <label className="check-row">
                      <input type="checkbox" /> <span>Europe</span>
                    </label>
                    <label className="check-row">
                      <input type="checkbox" /> <span>United Kingdom</span>
                    </label>
                    <label className="check-row">
                      <input type="checkbox" /> <span>United States</span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* ── PRODUCT GRID ── */}
          <main className="catalog-content">
            <div className="content-header">
              <div className="header-info">
                <h1>All Products</h1>
                <p>
                  Create, customize, and sell globally with our popular range of
                  products.
                </p>
              </div>
              <div className="sort-dropdown-wrapper" ref={sortRef}>
                <div
                  className={`sort-select-trigger ${
                    isSortOpen ? "active" : ""
                  }`}
                  onClick={() => setIsSortOpen(!isSortOpen)}
                >
                  <span>Sort by</span>
                  <strong>{sortBy}</strong>
                  <i
                    className={`fa-solid fa-chevron-${
                      isSortOpen ? "up" : "down"
                    }`}
                  ></i>
                </div>

                {isSortOpen && (
                  <ul className="sort-options-panel">
                    {[
                      "Recommended",
                      "Lowest price",
                      "Highest price",
                      "Product name",
                    ].map((option) => (
                      <li
                        key={option}
                        className={sortBy === option ? "selected" : ""}
                        onClick={() => {
                          setSortBy(option);
                          setIsSortOpen(false);
                        }}
                      >
                        {option}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="product-grid-4-col">
              {sortedProducts.map((p) => (
                <div
                  key={p.id}
                  className={`catalog-product-card${
                    selectedProducts.find((sp) => sp.id === p.id)
                      ? " selected-card"
                      : ""
                  }`}
                >
                  <div className="image-box">
                    <input
                      type="checkbox"
                      className="card-check"
                      checked={!!selectedProducts.find((sp) => sp.id === p.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleSelectProduct(p);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <img src={tshirtImg} alt={p.name} />
                  </div>
                  <div className="product-details">
                    <h3>{p.name}</h3>
                    <p className="brand-text">{p.brand}</p>
                    <div className="meta-line">
                      <strong>Technology</strong> {p.tech}
                    </div>
                    <div className="meta-line">
                      <strong>Fulfilled From</strong> {p.locations}
                    </div>
                    <div className="meta-line">
                      <strong>Sizes</strong> ({p.sizes}) • {p.sizeRange}
                    </div>
                    <div className="color-dots-row">
                      {p.colors.map((color, i) => (
                        <span
                          key={i}
                          className="dot"
                          style={{ backgroundColor: color }}
                        ></span>
                      ))}
                    </div>
                    <div className="price-tag">
                      From <strong>${p.price}</strong> <small>excl. VAT</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>{" "}
      </div>{" "}
      {/* ── TOOLTIP PORTAL (render ngoài sidebar để không bị clip) ── */}
      {dashCollapsed && hoveredItem && (
        <div
          style={{
            position: "fixed",
            top: hoveredItem.y,
            left: hoveredItem.x,
            transform: "translateY(-50%)",
            background: "#1a1a1a",
            color: "#fff",
            padding: "7px 14px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 500,
            whiteSpace: "nowrap",
            zIndex: 99999,
            pointerEvents: "none",
            boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
          }}
        >
          {/* Mũi tên trái */}
          <span
            style={{
              position: "absolute",
              left: "-6px",
              top: "50%",
              transform: "translateY(-50%)",
              width: 0,
              height: 0,
              borderTop: "6px solid transparent",
              borderBottom: "6px solid transparent",
              borderRight: "6px solid #1a1a1a",
            }}
          />
          {hoveredItem.label}
        </div>
      )}
      <div className="floating-chat-btn">
        <i className="fa-solid fa-message"></i>
      </div>
    </div>
  );
};

export default AddPage;
