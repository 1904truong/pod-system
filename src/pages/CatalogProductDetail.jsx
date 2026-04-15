import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import AddPageHeader from "../components/AddPageHeader";
import "../styles/CatalogProductDetail.css";
import "../styles/AddPage.css";
import { productsData } from "../data/product-man";
import api from "../utils/api";
import { getGalleryImagesForProduct } from "../utils/mockupPack";
import useActiveStoreDiscount from "../hooks/useActiveStoreDiscount";
import { calculateDiscountedPrice, isDiscountApplicable } from "../utils/discountUtils";
import CartModal from "../components/CartModal";

/* ─────────────────────────────────────────
   DỮ LIỆU MẪU (dùng chung cho fallback)
───────────────────────────────────────── */
const DEFAULT_PRODUCT = {
  id: 1,
  name: "Classic Unisex T-shirt",
  brand: "Gildan 64000, Gildan 5000",
  technology: "DTG",
  fulfilledFrom: "Europe, United Kingdom, United States",
  price: 6.98,
  shippingFrom: 5.99,
  image:
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop",
  colors: [
    { name: "White", hex: "#ffffff" },
    { name: "Black", hex: "#1a1a1a" },
    { name: "Sand", hex: "#c6b59c" },
    { name: "Pink", hex: "#d87093" },
    { name: "Red", hex: "#c0392b" },
    { name: "Maroon", hex: "#800000" },
    { name: "Navy", hex: "#001f5b" },
    { name: "Royal Blue", hex: "#2563eb" },
    { name: "Forest Green", hex: "#15803d" },
    { name: "Dark Green", hex: "#166534" },
    { name: "Charcoal", hex: "#374151" },
    { name: "Dark Navy", hex: "#0f172a" },
    { name: "Gold", hex: "#f59e0b" },
    { name: "Sky Blue", hex: "#7dd3fc" },
    { name: "Lilac", hex: "#c4b5fd" },
    { name: "Mint", hex: "#6ee7b7" },
    { name: "Coral", hex: "#f87171" },
    { name: "Grey", hex: "#9ca3af" },
  ],
  sizes: ["S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"],
};

const REGIONAL_PRICING_TEMPLATE = [
  { flag: "🇺🇸", destination: "United States", product: "$6.98", shipping1: "$5.99", shipping2: "$3.00", ratioP: 1.0, ratioS: 1.0, ratioS2: 1.0 },
  { flag: "🇩🇪", destination: "Germany",        product: "$5.83", shipping1: "$5.99", shipping2: "$3.00", ratioP: 5.83/6.98, ratioS: 5.99/5.99, ratioS2: 3.00/3.00 },
  { flag: "🇳🇱", destination: "Netherlands",    product: "$5.83", shipping1: "$5.49", shipping2: "$2.75", ratioP: 5.83/6.98, ratioS: 5.49/5.99, ratioS2: 2.75/3.00 },
  { flag: "🇧🇪", destination: "Belgium",         product: "$5.83", shipping1: "$5.99", shipping2: "$3.00", ratioP: 5.83/6.98, ratioS: 5.99/5.99, ratioS2: 3.00/3.00 },
  { flag: "🇫🇷", destination: "France",          product: "$5.83", shipping1: "$5.99", shipping2: "$3.00", ratioP: 5.83/6.98, ratioS: 5.99/5.99, ratioS2: 3.00/3.00 },
  { flag: "🇬🇧", destination: "United Kingdom",  product: "$6.33", shipping1: "$4.99", shipping2: "$2.50", ratioP: 6.33/6.98, ratioS: 4.99/5.99, ratioS2: 2.50/3.00 },
  { flag: "🇸🇪", destination: "Sweden",          product: "$5.83", shipping1: "$6.49", shipping2: "$3.25", ratioP: 5.83/6.98, ratioS: 6.49/5.99, ratioS2: 3.25/3.00 },
  { flag: "🇪🇸", destination: "Spain",           product: "$5.83", shipping1: "$6.49", shipping2: "$3.25", ratioP: 5.83/6.98, ratioS: 6.49/5.99, ratioS2: 3.25/3.00 },
];

const DESTINATION_CODE_MAP = {
  "United States": "us",
  "Germany": "de",
  "Netherlands": "nl",
  "Belgium": "be",
  "France": "fr",
  "United Kingdom": "gb",
  "Sweden": "se",
  "Spain": "es",
};

const getRegionalDestinations = (product) => {
  const isTemplate = product?.id === "MEN-TSH-001";
  const baseP = product?.price ?? 6.98;

  return REGIONAL_PRICING_TEMPLATE.map((row) => {
    let pPrice = row.product;
    let s1 = row.shipping1;
    let s2 = row.shipping2;

    if (!isTemplate) {
      // Dynamic adjustments based on base price
      const rProduct = baseP * row.ratioP;
      pPrice = `$${rProduct.toFixed(2)}`;

      // User rule: shipping first product = price + $1 (scaled by region conceptually, or just literal baseP + 1 for US)
      // Since regions have different shippings, let's keep the regional scale but base it on (baseP + 1)
      const baseShipping = baseP + 1.0;
      const rShip1 = baseShipping * row.ratioS;
      s1 = `$${rShip1.toFixed(2)}`;

      // And secondary shipping scales similarly
      const baseShip2 = baseShipping * 0.5; // ~$3.00 originally
      const rShip2 = baseShip2 * row.ratioS2;
      s2 = `$${rShip2.toFixed(2)}`;
    }

    return {
      code: DESTINATION_CODE_MAP[row.destination] || "worldwide",
      name: row.destination,
      flag: row.flag,
      pricing: { product: pPrice, shipping1: s1, shipping2: s2 },
    };
  });
};

const SIZE_DATA_METRIC = [
  { size: "S",   a: 71, b: 46 },
  { size: "M",   a: 74, b: 51 },
  { size: "L",   a: 76, b: 56 },
  { size: "XL",  a: 79, b: 61 },
  { size: "2XL", a: 81, b: 66 },
  { size: "3XL", a: 84, b: 71 },
  { size: "4XL", a: 86, b: 76 },
  { size: "5XL", a: 89, b: 81 },
];

const SIZE_DATA_IMPERIAL = [
  { size: "S",   a: 28.0, b: 18.0 },
  { size: "M",   a: 29.0, b: 20.0 },
  { size: "L",   a: 30.0, b: 22.0 },
  { size: "XL",  a: 31.0, b: 24.0 },
  { size: "2XL", a: 32.0, b: 26.0 },
  { size: "3XL", a: 33.0, b: 28.0 },
  { size: "4XL", a: 34.0, b: 30.0 },
  { size: "5XL", a: 35.0, b: 32.0 },
];

const ASSET_MAP = import.meta.glob("../assets/**/*.{png,jpg,jpeg,webp,svg}", {
  eager: true,
  import: "default",
});

const resolveAssetUrl = (value) => {
  if (!value || typeof value !== "string") return null;
  return ASSET_MAP[value] || null;
};

const normalizeColors = (colors) => {
  if (!Array.isArray(colors)) return DEFAULT_PRODUCT.colors;
  return colors.map((color, index) => {
    if (typeof color === "string") {
      const upper = color.toUpperCase();
      const name = upper === "#FFFFFF" ? "White" : `Color ${index + 1}`;
      return { name, hex: upper };
    }
    return color;
  });
};

const normalizeSizes = (sizes) => {
  if (Array.isArray(sizes) && sizes.length) return sizes;
  const range = String(sizes?.range || "").toUpperCase();
  if (range.includes("S-5XL")) return ["S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];
  if (range.includes("XS-4XL")) return ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"];
  if (range.includes("S-4XL")) return ["S", "M", "L", "XL", "2XL", "3XL", "4XL"];
  if (range.includes("S-2XL")) return ["S", "M", "L", "XL", "2XL"];
  return DEFAULT_PRODUCT.sizes;
};

const toDetailProduct = (source) => {
  if (!source) return DEFAULT_PRODUCT;
  return {
    ...DEFAULT_PRODUCT,
    ...source,
    price: Number(source.price ?? DEFAULT_PRODUCT.price),
    shippingFrom: Number(source.shippingFrom ?? DEFAULT_PRODUCT.shippingFrom),
    image: resolveAssetUrl(source.image) || source.image || DEFAULT_PRODUCT.image,
    colors: normalizeColors(source.colors),
    sizes: normalizeSizes(source.sizes),
  };
};

const FlagImg = ({ code, size = 18 }) =>
  code === "worldwide" ? (
    <span style={{ fontSize: size * 0.9 }}>🌐</span>
  ) : (
    <img
      src={`https://flagcdn.com/${code}.svg`}
      alt={code}
      width={size}
      height={size}
      style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
    />
  );

/* ─────────────────────────────────────────
   COMPONENT CHÍNH
───────────────────────────────────────── */
const CatalogProductDetailInner = ({ product, discountInPlay }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);

  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize]   = useState(product.sizes[1] || product.sizes[0] || "M");
  const [currentImg, setCurrentImg]       = useState(0);
  const [pricingTab, setPricingTab]       = useState("mayzing"); // "fulfillment" | "mayzing"
  const [sizeUnit, setSizeUnit]           = useState("metric");  // "metric" | "imperial"
  const [currency, setCurrency]          = useState("USD");
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [country, setCountry]             = useState({ code: "us", name: "United States" });
  const [isCountryOpen, setIsCountryOpen]  = useState(false);
  const [isCartOpen, setIsCartOpen]        = useState(false);
  const regionalDestinationsDynamic = useMemo(() => getRegionalDestinations(product), [product]);

  const [deliverToCode, setDeliverToCode] = useState("us");
  const deliverTo = useMemo(() => {
    return regionalDestinationsDynamic.find((item) => item.code === deliverToCode) || regionalDestinationsDynamic[0];
  }, [regionalDestinationsDynamic, deliverToCode]);
  const [catalogSearch, setCatalogSearch]  = useState("");
  const countrySearch = "";
  const [dashActive, setDashActive]       = useState("Catalog");
  const [isSelected, setIsSelected]       = useState(false);
  const currencyRef = React.useRef(null);
  const countryRef = React.useRef(null);

  const applies = isDiscountApplicable(discountInPlay, product.campaignId || product.id);
  const getDisplayPrice = (original) => {
    if (!applies) return original;
    const num = typeof original === 'string' ? parseFloat(original.replace(/[^0-9.]/g, '')) : original;
    return calculateDiscountedPrice(num, discountInPlay);
  };

  const deliverPricing = useMemo(() => deliverTo?.pricing || null, [deliverTo]);

  const gallery = useMemo(() => {
    const images = getGalleryImagesForProduct(product);
    const combined = [product?.image, ...images].filter(Boolean);
    const unique = Array.from(new Set(combined));
    return unique.length ? unique : [DEFAULT_PRODUCT.image];
  }, [product]);
  const sizeData = sizeUnit === "metric" ? SIZE_DATA_METRIC : SIZE_DATA_IMPERIAL;
  const unitLabel = sizeUnit === "metric" ? "cm" : "in";

  const sidebarStoreItems = [
    { icon: "open_in_new", label: "Go to store" },
    { icon: "campaign", label: "Campaigns" },
    { icon: "explore", label: "Collections" },
    { icon: "sell", label: "Discounts" },
    { icon: "settings", label: "Store settings" },
    { icon: "language", label: "Domain set up" },
    { icon: "track_changes", label: "Data tracking" },
  ];

  const sidebarManageItems = [
    { icon: "shopping_cart", label: "Orders" },
    { icon: "photo_library", label: "Artwork library" },
    { icon: "monetization_on", label: "Payouts" },
    { icon: "build", label: "Settings" },
    { icon: "help_outline", label: "Help center" },
    { icon: "check_circle", label: "Task log" },
  ];

  const onSidebarItemClick = (label) => {
    setDashActive(label);
    if (label === "Catalog") return;
    navigate("/addpage", { state: { dashActive: label } });
  };

  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const setCountryAndMaybeDeliverTo = (nextCountry) => {
    setCountry(nextCountry);
    const matched = regionalDestinationsDynamic.find(
      (item) => item.code === nextCountry?.code || item.name === nextCountry?.name
    );
    if (matched) setDeliverToCode(matched.code);
  };

  const allCurrencies = [
    { code: "USD", label: "US Dollar" },
    { code: "EUR", label: "Euro" },
    { code: "GBP", label: "British Pound" },
  ];

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

  const filteredCountries = allCountries.filter((item) =>
    item.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (currencyRef.current && !currencyRef.current.contains(e.target)) {
        setIsCurrencyOpen(false);
      }
      if (countryRef.current && !countryRef.current.contains(e.target)) {
        setIsCountryOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStartDesigning = () => {
    if (!isSelected) return;
    navigate("/designer", { state: { products: [product] } });
  };

  const handleCartClick = () => {
    navigate("/addpage", { state: { dashActive: "Catalog" } });
  };

  const handleAddToSelection = () => {
    setIsSelected((prev) => !prev);
  };

  useEffect(() => {
    const fetchHeaderData = async () => {
      try {
        const [profileRes, storesRes] = await Promise.all([
          api.get("/user/profile"),
          api.get("/stores"),
        ]);

        setUser(profileRes.data || null);
        const nextStores = Array.isArray(storesRes.data) ? storesRes.data : [];
        setStores(nextStores);
        setSelectedStore(nextStores[0] || null);
      } catch (error) {
        console.error("Error loading header data:", error);
      }
    };

    fetchHeaderData();
  }, []);

  const prevImg = () => setCurrentImg((p) => (p === 0 ? gallery.length - 1 : p - 1));
  const nextImg = () => setCurrentImg((p) => (p === gallery.length - 1 ? 0 : p + 1));

  return (
    <div className="cpd-wrapper">
      <AddPageHeader
        stores={stores}
        selectedStore={selectedStore}
        onSelectStore={(store) => setSelectedStore(store)}
        onCreateStore={() => navigate("/addpage", { state: { dashActive: "Your stores" } })}
        onManageStores={() => navigate("/addpage", { state: { dashActive: "Your stores" } })}
        logoText="Breezy Sunz"
        profileInitials={getInitials(user?.name)}
        profileImageSrc={user?.avatar || user?.profileImage || user?.image || ""}
        profileAlt={user?.name || "Profile"}
      />

      {/* ── LAYOUT ─────────────────────────────────── */}
      <div className="cpd-layout">
        <aside className="dashboard-sidebar cpd-dashboard-sidebar">
          <div className="dash-user">
            <div className="dash-avatar">{getInitials(user?.name)}</div>
            <div className="dash-user-info">
              <strong>{user?.name || "Loading..."}</strong>
              <span>{user?.role || "Personal account"}</span>
            </div>
          </div>

          <nav className="dash-nav">
            {[
              { icon: "menu_book", label: "Catalog" },
              { icon: "storefront", label: "Your stores" },
            ].map((item) => (
              <div
                key={item.label}
                className={`dash-nav-item${dashActive === item.label ? " active" : ""}`}
                onClick={() => onSidebarItemClick(item.label)}
              >
                <span className="material-symbols-outlined dash-icon">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}

            <div className="dash-section-title">Store</div>
            {sidebarStoreItems.map((item) => (
              <div
                key={item.label}
                className={`dash-nav-item${dashActive === item.label ? " active" : ""}`}
                onClick={() => onSidebarItemClick(item.label)}
              >
                <span className="material-symbols-outlined dash-icon">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}

            <div className="dash-section-title">Manage</div>
            {sidebarManageItems.map((item) => (
              <div
                key={item.label}
                className={`dash-nav-item${dashActive === item.label ? " active" : ""}`}
                onClick={() => onSidebarItemClick(item.label)}
              >
                <span className="material-symbols-outlined dash-icon">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="cpd-main">
          {/* ── UTILITY BAR ── */}
          <div className="cpd-util-bar">
            <div className="cpd-search-wrap">
              <svg className="cpd-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search catalog"
                className="cpd-search-input"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
              />
            </div>

            <div className="cpd-util-right">
              <div className="cpd-util-item" ref={currencyRef} style={{ position: "relative" }}>
                Currency
                <button
                  type="button"
                  className="cpd-util-value"
                  onClick={() => setIsCurrencyOpen((value) => !value)}
                >
                  {currency} ▾
                </button>
                {isCurrencyOpen && (
                  <div className="cpd-dropdown">
                    {allCurrencies.map((item) => (
                      <button
                        key={item.code}
                        className="cpd-dropdown-item"
                        onClick={() => {
                          setCurrency(item.code);
                          setIsCurrencyOpen(false);
                        }}
                      >
                        {item.code} - {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="cpd-util-item" ref={countryRef} style={{ position: "relative" }}>
                <FlagImg code={country.code} size={18} />
                <button
                  type="button"
                  className="cpd-util-value"
                  onClick={() => setIsCountryOpen((value) => !value)}
                >
                  {country.name} ▾
                </button>
                {isCountryOpen && (
                  <div className="cpd-dropdown">
                    {filteredCountries.slice(0, 8).map((item) => (
                      <button
                        key={item.code}
                        className="cpd-dropdown-item"
                        onClick={() => {
                          setCountryAndMaybeDeliverTo(item);
                          setIsCountryOpen(false);
                        }}
                      >
                        <FlagImg code={item.code} size={16} /> {item.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                className={`cpd-btn-design ${isSelected ? "selected" : ""}`}
                onClick={handleStartDesigning}
                disabled={!isSelected}
              >
                Start designing +
              </button>
              <button className="cpd-cart-btn" onClick={handleCartClick}>
                <span className="cpd-cart-icon">🛒</span>
                <span className="cpd-cart-badge">{isSelected ? 1 : 0}</span>
              </button>
            </div>
          </div>

          {/* ── BREADCRUMBS ── */}
          <div className="cpd-breadcrumbs">
            <span className="cpd-bc-link" onClick={() => navigate("/addpage")}>My Stores</span>
            <span className="cpd-bc-sep">›</span>
            <span className="cpd-bc-link">Cothlab Hats</span>
            <span className="cpd-bc-sep">›</span>
            <span className="cpd-bc-link" onClick={() => navigate("/addpage")}>Catalog</span>
            <span className="cpd-bc-sep">›</span>
            <span className="cpd-bc-link" onClick={() => navigate("/addpage")}>Products</span>
            <span className="cpd-bc-sep">›</span>
            <span className="cpd-bc-current">{product.name}</span>
          </div>

          {/* ── PRODUCT SECTION ── */}
          <div className="cpd-product-section">
            {/* Gallery */}
            <div className="cpd-gallery">
              <div className="cpd-main-img-wrap">
                <button className="cpd-gallery-arrow left" onClick={prevImg}>‹</button>
                <img
                  src={gallery[currentImg]}
                  alt={product.name}
                  className="cpd-main-img"
                />
                <button className="cpd-gallery-arrow right" onClick={nextImg}>›</button>
              </div>
            </div>

            {/* Info */}
            <div className="cpd-info">
              <h1 className="cpd-product-name">{product.name}</h1>
              <p className="cpd-product-brand">{product.brand}</p>

              {/* Size */}
              <div className="cpd-field">
                <div className="cpd-field-label">
                  Size <span className="cpd-size-selected">{selectedSize}</span>
                </div>
                <div className="cpd-size-grid">
                  {(product.sizes || DEFAULT_PRODUCT.sizes).map((s) => (
                    <button
                      key={s}
                      className={`cpd-size-btn ${selectedSize === s ? "active" : ""}`}
                      onClick={() => setSelectedSize(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div className="cpd-field">
                <div className="cpd-field-label">
                  Color{" "}
                  <span className="cpd-color-name">
                    {selectedColor?.name} &nbsp;
                    <span style={{ color: "#888" }}>{selectedColor?.hex?.toUpperCase()}</span>
                  </span>
                </div>
                <div className="cpd-color-grid">
                  {(product.colors || DEFAULT_PRODUCT.colors).map((c, i) => (
                    <div
                      key={i}
                      className={`cpd-color-dot ${selectedColor?.name === c.name ? "active" : ""}`}
                      style={{ backgroundColor: c.hex,
                        border: c.hex === "#ffffff" ? "1px solid #d1d5db" : "none"
                      }}
                      title={c.name}
                      onClick={() => setSelectedColor(c)}
                    />
                  ))}
                </div>
              </div>

              {/* Deliver to */}
              <div className="cpd-field">
                <div className="cpd-field-label">
                  Deliver to <span className="cpd-size-selected">({regionalDestinationsDynamic.length} countries)</span>
                </div>
                <div className="cpd-deliver-select" style={{ position: "relative" }}>
                  <span>{deliverTo?.flag || "🌐"}</span>
                  <select
                    className="cpd-select-native"
                    value={deliverTo?.name || ""}
                    onChange={(e) => {
                      const next = regionalDestinationsDynamic.find((item) => item.name === e.target.value);
                      if (!next) return;
                      setDeliverToCode(next.code);
                      setCountryAndMaybeDeliverTo({ code: next.code, name: next.name });
                    }}
                  >
                    {regionalDestinationsDynamic.map((item) => (
                      <option key={item.code} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing row */}
              <div className="cpd-price-row">
                <div className="cpd-price-block">
                  <span className="cpd-price-label">Product</span>
                  <span className="cpd-price-val">
                    {(() => {
                      const basePrice = deliverPricing?.product ? parseFloat(deliverPricing.product.replace(/[^0-9.]/g, '')) : (product.price ?? DEFAULT_PRODUCT.price);
                      const finalPrice = getDisplayPrice(basePrice);
                      const hasDiscount = applies && finalPrice < basePrice;
                      
                      return (
                        <div className="flex flex-col">
                          {hasDiscount && (
                            <span className="text-xs text-gray-400 line-through">
                              ${basePrice.toFixed(2)}
                            </span>
                          )}
                          <span className={hasDiscount ? "text-green-600 font-bold" : ""}>
                            ${finalPrice.toFixed(2)}
                          </span>
                        </div>
                      );
                    })()}
                  </span>
                </div>
                <div className="cpd-price-block">
                  <span className="cpd-price-label">Shipping from</span>
                  <span className="cpd-price-val cpd-price-ship">
                    {deliverPricing?.shipping1 || `$${(product.shippingFrom ?? DEFAULT_PRODUCT.shippingFrom).toFixed(2)}`}
                  </span>
                </div>
              </div>

              <p className="cpd-delivery-est">
                🚚 Estimated delivery with standard shipping from 4–7 business days
              </p>

              {/* CTAs */}
              <button className={`cpd-btn-add-selection ${isSelected ? "selected" : ""}`} onClick={handleAddToSelection}>
                {isSelected ? "Remove from selection" : "Add to selection +"}
              </button>
              <button
                className={`cpd-btn-start-design ${isSelected ? "selected" : ""}`}
                onClick={handleStartDesigning}
                disabled={!isSelected}
              >
                <span className="cpd-start-design-icon">🛒</span>
                <span>Start designing</span>
                <span className="cpd-start-design-count">+{isSelected ? 1 : 0}</span>
              </button>
              <button
                className="cpd-btn-buy-now"
                onClick={() => setIsCartOpen(true)}
              >
                Buy now
              </button>
              <button className="cpd-btn-return" onClick={() => navigate("/addpage")}>
                ← Return to the catalog
              </button>
            </div>
          </div>

          {/* ── REGIONAL PRICING ── */}
          <section className="cpd-regional">
            <h2 className="cpd-section-title">Regional pricing</h2>

            <div className="cpd-tab-bar">
              <button
                className={`cpd-tab ${pricingTab === "fulfillment" ? "active" : ""}`}
                onClick={() => setPricingTab("fulfillment")}
              >
                Fulfilment stores
              </button>
              <button
                className={`cpd-tab ${pricingTab === "mayzing" ? "active" : ""}`}
                onClick={() => setPricingTab("mayzing")}
              >
                Mayzing stores
              </button>
            </div>

            <div className="cpd-table-wrap">
              <table className="cpd-table">
                <thead>
                  <tr>
                    <th>Destination</th>
                    <th>Product price from</th>
                    <th>Shipping first product from</th>
                    <th>Shipping second product from</th>
                  </tr>
                </thead>
                <tbody>
                  {regionalDestinationsDynamic.map((rowRef, idx) => {
                    const row = rowRef.pricing;
                    const baseNum = parseFloat(row.product.replace(/[^0-9.]/g, ''));
                    const finalNum = getDisplayPrice(baseNum);
                    const hasDiscount = applies && finalNum < baseNum;
                    
                    return (
                      <tr key={idx}>
                        <td>
                          <div className="flex items-center gap-2">
                            <span>{rowRef.flag}</span>
                            <span>{rowRef.name}</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex flex-col">
                            {hasDiscount && (
                              <span className="text-[10px] text-gray-400 line-through">${baseNum.toFixed(2)}</span>
                            )}
                            <span className={hasDiscount ? "text-green-600 font-medium" : ""}>
                              ${finalNum.toFixed(2)}
                            </span>
                          </div>
                        </td>
                        <td>{row.shipping1}</td>
                        <td>{row.shipping2}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── SIZE GUIDE ── */}
          <section className="cpd-size-guide">
            <div className="cpd-size-guide-header">
              <h2 className="cpd-section-title">Size guide</h2>
              <div className="cpd-unit-toggle">
                <button
                  className={`cpd-unit-btn ${sizeUnit === "metric" ? "active" : ""}`}
                  onClick={() => setSizeUnit("metric")}
                >
                  Metric
                </button>
                <button
                  className={`cpd-unit-btn ${sizeUnit === "imperial" ? "active" : ""}`}
                  onClick={() => setSizeUnit("imperial")}
                >
                  Imperial
                </button>
              </div>
            </div>

            <div className="cpd-size-guide-body">
              {/* Size diagram SVG */}
              <div className="cpd-size-diagram">
                <svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
                  {/* T-shirt silhouette */}
                  <path
                    d="M30 20 L10 45 L25 50 L25 120 L95 120 L95 50 L110 45 L90 20 L75 30 Q60 40 45 30 Z"
                    fill="none"
                    stroke="#9ca3af"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  {/* A - Length line */}
                  <line x1="38" y1="25" x2="38" y2="118" stroke="#2563eb" strokeWidth="1.5" markerEnd="url(#arrow)" />
                  <text x="26" y="70" fill="#2563eb" fontSize="10" fontWeight="bold">A</text>
                  {/* B - Width line */}
                  <line x1="26" y1="95" x2="94" y2="95" stroke="#ef4444" strokeWidth="1.5" />
                  <text x="55" y="90" fill="#ef4444" fontSize="10" fontWeight="bold">B</text>
                  <defs>
                    <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                      <path d="M0,0 L0,6 L6,3 z" fill="#2563eb" />
                    </marker>
                  </defs>
                </svg>
              </div>

              <div className="cpd-table-wrap">
                <table className="cpd-table">
                  <thead>
                    <tr>
                      <th>Size</th>
                      <th>A) Length ({unitLabel})</th>
                      <th>B) Width ({unitLabel})</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sizeData.map((row, i) => (
                      <tr key={i} className={selectedSize === row.size ? "cpd-row-highlight" : ""}>
                        <td>{row.size}</td>
                        <td>{row.a}</td>
                        <td>{row.b}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </main>
      </div>

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        product={product}
      />
    </div>
  );
};

const CatalogProductDetail = () => {
  const location = useLocation();
  const { id: routeId } = useParams();
  const { discountInPlay } = useActiveStoreDiscount();

  const stateProduct = location.state?.product;
  const matched = productsData.find(
    (item) => String(item.id).toLowerCase() === String(routeId || "").toLowerCase()
  );

  const product = stateProduct ? toDetailProduct(stateProduct) : toDetailProduct(matched);
  const productKey = String(stateProduct?.id ?? routeId ?? product?.id ?? "product");

  return <CatalogProductDetailInner key={productKey} product={product} discountInPlay={discountInPlay} />;
};

export default CatalogProductDetail;
