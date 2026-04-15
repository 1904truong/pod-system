import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AddPageHeader from "../components/AddPageHeader";
import MyStoresView from "../components/MyStoresView";
import CampaignsView from "../components/CampaignsView";
import CollectionsView from "../components/CollectionsView";
import DiscountsView from "../components/DiscountsView";
import StoreSettingsView from "../components/StoreSettingsView";
import DomainSetupView from "../components/DomainSetupView";
import DataTrackingView from "../components/DataTrackingView";
import OrdersView from "../components/OrdersView";
import ArtworkLibraryView from "../components/ArtworkLibraryView";
import PayoutsView from "../components/PayoutsView";
import SettingsView from "../components/SettingsView";
import TaskLogView from "../components/TaskLogView";
import api from "../utils/api";
import "../styles/AddPage.css";
import { productsData } from "../data/product-man";
import { productsWon } from "../data/product-won";
import { productsUnisex } from "../data/product-unisex";
import { productsYB } from "../data/product-youth-baby";
import { productsDrink } from "../data/procduct-drink";
import { productsHomeware } from "../data/product-homeware";
import { productsWallart } from "../data/product-wallart";
import { productsHat } from "../data/product-hat";
import { productsAccessories } from "../data/product-accessories";
import { productsFlat } from "../data/product-flat";
import tshirtImg from "../assets/mau ao/0.png";
import { setActiveStoreUrl } from "../hooks/useActiveStoreDiscount";

const ASSET_MAP = import.meta.glob("../assets/**/*.{png,jpg,jpeg,webp,svg}", {
  eager: true,
  import: "default",
});

const resolveAssetUrl = (value) => {
  if (!value || typeof value !== "string") return null;
  return ASSET_MAP[value] || null;
};

const AddPage = () => {
  const location = useLocation();
  // ─── USER DATA ───
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/user/profile");
        setUser(res.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, []);

  const getInitials = (name) => {
    if (!name) return "??";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  // ─── DASHBOARD SIDEBAR ───
  const [dashActive, setDashActive] = useState("Catalog");
  const [dashCollapsed, setDashCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null); // { label, y }
  const [selectedStore, setSelectedStore] = useState(null);
  const [stores, setStores] = useState([]);
  const [storesLoading, setStoresLoading] = useState(true);
  const [createStoreRequested, setCreateStoreRequested] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleManageStore = (store) => {
    setSelectedStore(store);
    setDashActive("Campaigns");
  };

  useEffect(() => {
    const url = typeof selectedStore?.url === "string" ? selectedStore.url.trim() : "";
    if (url) {
      setActiveStoreUrl(url);
      return;
    }
    const id = selectedStore?.id ? String(selectedStore.id) : "";
    if (id) setActiveStoreUrl(id);
  }, [selectedStore?.url, selectedStore?.id]);

  const refreshStores = async () => {
    setStoresLoading(true);
    try {
      const res = await api.get('/stores');
      const nextStores = Array.isArray(res.data) ? res.data : [];
      setStores(nextStores);

      if (nextStores.length === 0) {
        const storeViews = new Set([
          'Go to store',
          'Campaigns',
          'Collections',
          'Discounts',
          'Store settings',
          'Domain set up',
        ]);
        if (storeViews.has(dashActive)) {
          setDashActive('Your stores');
        }
      }

      setSelectedStore((prevSelected) => {
        if (!nextStores.length) return null;
        if (prevSelected && nextStores.some((s) => s.id === prevSelected.id)) return prevSelected;
        return nextStores[0];
      });
    } catch (err) {
      console.error('Error fetching stores:', err);
      setStores([]);
      setSelectedStore(null);
    } finally {
      setStoresLoading(false);
    }
  };

  useEffect(() => {
    refreshStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── NAVIGATION ───
  const navigate = useNavigate();

  // Allow deep-linking to a specific dashboard view.
  useEffect(() => {
    const desired = location.state?.dashActive;
    if (typeof desired === "string" && desired.trim()) {
      setDashActive(desired);
    }

    const campaignEditId = location.state?.campaignEditId;
    if (campaignEditId) {
      setDashActive("Campaigns");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── SELECTED PRODUCTS ───
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isBannerVisible, setIsBannerVisible] = useState(
    localStorage.getItem("hide_add_page_banner") !== "true"
  );

  const toggleSelectProduct = (product) => {
    setSelectedProducts((prev) =>
      prev.find((p) => p.id === product.id)
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product]
    );
  };

  const [pendingCampaign, setPendingCampaign] = useState(null);

  const handleStartCampaignProductSelection = (name, slug, id = null) => {
    setPendingCampaign({ title: name, slug, id });
    setSelectedProducts([]);
    setDashActive("Catalog");
  };

  const handleStartDesigning = () => {
    if (selectedProducts.length === 0) return;
    navigate("/designer", { 
      state: { 
        products: selectedProducts,
        pendingCampaign 
      } 
    });
  };

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
    {
      name: "Flat rate shipping",
      items: ["All flat rate shipping"],
    },
  ];

  const [openCategories, setOpenCategories] = useState(
    categories.reduce((acc, cat) => ({ ...acc, [cat.name]: false }), {})
  );
  const [activeSubItem, setActiveSubItem] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);

  // Map subItem label → subCategory key trong productsData
  const subItemToSubCat = {
    "T-shirts": "t-shirts",
    Hoodies: "hoodies",
    Sweatshirts: "sweatshirts",
    "Longsleeve shirts": "longsleeve-shirts",
    "Tank tops": "tank-tops",
    "Baby Clothing": "babycothing",
    Mugs: "mugs",
    Bottles: "bottle",
    Tumblers: "tumblers",
    Glasses: "glass",
    "Cushions & pillows": "cushion",
    Mats: "mats",
    Blankets: "blankets",
    Ornaments: "ornament",
    "Yard Sign": "yardsign",
    Candles: "candle",
    Posters: "poster",
    Canvases: "canvas",
    Caps: "cap",
    Beanies: "beanie",
    Visors: "visor",
  };

  // Map category label → data source
  const catToKey = {
    "Men's clothing": { key: "men", data: productsData },
    "Women's clothing": { key: "won", data: productsWon },
    "Unisex clothing": { key: "uni", data: productsUnisex },
    "Youth & Baby": { key: "yb", data: productsYB },
    Drinkware: { key: "drink", data: productsDrink },
    Homeware: { key: "homeware", data: productsHomeware },
    "Wall art": { key: "wallart", data: productsWallart },
    Hats: { key: "hat", data: productsHat },
    Accessories: { key: "accessories", data: productsAccessories },
    "Flat rate shipping": { key: "flat", data: productsFlat },
    Flat: { key: "flat", data: productsFlat },
  };

  // Tính title hiển thị
  const pageTitle = activeSubItem
    ? activeSubItem
    : activeCategory
      ? `All ${activeCategory.toLowerCase()}`
      : "All Products";

  // Lọc products từ data đúng theo category + subCategory
  const getCatalogProducts = () => {
    const catInfo = catToKey[activeCategory];
    if (!catInfo) return null;

    const catProds = catInfo.data.filter((p) => p.category === catInfo.key);
    if (!activeSubItem || activeSubItem.startsWith("All ")) return catProds;

    const subKey = subItemToSubCat[activeSubItem];
    return subKey ? catProds.filter((p) => p.subCategory === subKey) : catProds;
  };

  const catalogProducts = getCatalogProducts();

  const toggleCategory = (name) => {
    setOpenCategories((prev) => ({ ...prev, [name]: !prev[name] }));
    setActiveCategory(name);
    setActiveSubItem(null);
    setActiveBrand(null);
    // Close mobile sidebar after category selection
    if (window.innerWidth <= 639) {
      setIsMobileSidebarOpen(false);
    }
  };

  // ─── BRANDS FILTER ───
  const parseBrand = (str) => {
    if (!str) return null;
    const first = str.split(",")[0].trim();
    // Bỏ model number cuối: số, chữ hoa + số, ngoặc, "Co."
    const name = first
      .replace(/\s+[A-Z]{0,3}[0-9][A-Z0-9/()-]*$/i, "") // "Gildan 64000" → "Gildan"
      .replace(/\s+\([^)]*\)$/, "") // "Next Level 6210 (CVC)" → "Next Level 6210" → rồi bước trên
      .trim();
    const map = {
      "Port & Company": "Port and Company",
      "Sport-Tek": "Sport Tek",
      "Independent Trading Co.": "Independent Trading Co.",
      "Independant Trading Company": "Independent Trading Co.",
    };
    return map[name] || name || first;
  };
  const allTechs = [
    "Direct-to-Garment (DTG)",
    "Direct-to-Film (DTF)",
    "Hybrid (DTG/DTF)",
    "All-Over Print (AOP)",
    "Sublimation",
    "UV Inkjet",
  ];
  const [activeBrand, setActiveBrand] = useState(null);
  const [selectedTechs, setSelectedTechs] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [brandOpen, setBrandOpen] = useState(true);
  const [techOpen, setTechOpen] = useState(true);
  const [locationOpen, setLocationOpen] = useState(true);

  const fulfillmentLocations = ["Europe", "United Kingdom", "United States"];

  const toggleTech = (t) =>
    setSelectedTechs((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );

  const toggleLocation = (location) =>
    setSelectedLocations((prev) =>
      prev.includes(location)
        ? prev.filter((x) => x !== location)
        : [...prev, location]
    );

  const _productData = [
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
  // ─── THAY THẾ TOÀN BỘ ĐOẠN allRealProducts BẰNG ĐOẠN NÀY ───
  const allRealProducts = (() => {
    const seen = new Set();
    return [
      ...productsData,
      ...productsWon,
      ...productsUnisex,
      ...productsYB,
      ...productsDrink,
      ...productsHomeware,
      ...productsWallart,
      ...productsHat,
      ...productsAccessories,
      ...productsFlat,
    ].filter((p) => {
      // Chuẩn hóa dữ liệu
      const namePart = p.name ? p.name.trim().toLowerCase() : "";
      const brandPart = p.brand ? p.brand.trim().toLowerCase() : "";

      const fulfilledPart = Array.isArray(p.fulfilledFrom)
        ? p.fulfilledFrom.slice().sort().join(",").toLowerCase()
        : (p.locations || "").toLowerCase();

      // Thêm p.image vào chìa khóa để phân biệt các sản phẩm giống hệt nhau nhưng khác ảnh mẫu
      const imgPart = p.image ? p.image.trim() : "";

      const key = `${namePart} | ${brandPart} | ${fulfilledPart} | ${p.colors?.length} | ${imgPart}`;

      if (!p.id || seen.has(key)) return false;

      seen.add(key);
      return true;
    });
  })();

  const sourceProducts =
    catalogProducts !== null ? catalogProducts : allRealProducts;

  // Brands có trong data hiện tại
  const allBrands = [
    ...new Set(sourceProducts.map((p) => parseBrand(p.brand)).filter(Boolean)),
  ].sort();

  // ─── THAY THẾ TOÀN BỘ ĐOẠN filteredProducts BẰNG ĐOẠN NÀY ───
  const filteredProducts = sourceProducts.filter((p) => {
    const techVal = p.technology || p.tech || "";

    // Tách chuỗi brand bằng dấu phẩy và parse từng brand một
    const productBrands = p.brand
      ? p.brand.split(",").map((b) => parseBrand(b))
      : [];

    // Kiểm tra xem activeBrand có nằm trong danh sách productBrands không
    const brandMatch = !activeBrand || productBrands.includes(activeBrand);

    const techMatch =
      selectedTechs.length === 0 ||
      selectedTechs.some((t) =>
        techVal.toLowerCase().includes(t.toLowerCase())
      );

    // Kiểm tra fulfillment locations
    const locationMatch =
      selectedLocations.length === 0 ||
      selectedLocations.some((loc) => {
        const productLocations = p.locations || p.fulfilledFrom || "";
        const locStr =
          typeof productLocations === "string"
            ? productLocations
            : Array.isArray(productLocations)
              ? productLocations.join(", ")
              : "";
        return locStr.toLowerCase().includes(loc.toLowerCase());
      });

    return brandMatch && techMatch && locationMatch;
  });

  const getNumericPrice = (product) => {
    const raw = product?.price ?? product?.basePrice ?? product?.minPrice;
    if (typeof raw === "number") return raw;
    if (typeof raw === "string") {
      // Handle values like "$11.80", "€ 11,80", "From 11.80", etc.
      const cleaned = raw
        .replaceAll(",", ".")
        .replace(/[^0-9.]+/g, "")
        .trim();
      const parsed = Number.parseFloat(cleaned);
      return Number.isFinite(parsed) ? parsed : NaN;
    }
    return NaN;
  };

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aName = String(a?.name || "");
    const bName = String(b?.name || "");

    const aPriceRaw = getNumericPrice(a);
    const bPriceRaw = getNumericPrice(b);
    const aPriceAsc = Number.isFinite(aPriceRaw) ? aPriceRaw : Number.POSITIVE_INFINITY;
    const bPriceAsc = Number.isFinite(bPriceRaw) ? bPriceRaw : Number.POSITIVE_INFINITY;
    const aPriceDesc = Number.isFinite(aPriceRaw) ? aPriceRaw : Number.NEGATIVE_INFINITY;
    const bPriceDesc = Number.isFinite(bPriceRaw) ? bPriceRaw : Number.NEGATIVE_INFINITY;

    if (sortBy === "Lowest price") {
      return aPriceAsc - bPriceAsc || aName.localeCompare(bName);
    }
    if (sortBy === "Highest price") {
      return bPriceDesc - aPriceDesc || aName.localeCompare(bName);
    }
    if (sortBy === "Product name") return aName.localeCompare(bName);
    return 0;
  });
  return (
    <div className="add-page-wrapper">
      <AddPageHeader
        stores={stores}
        selectedStore={selectedStore}
        onSelectStore={(store) => {
          setSelectedStore(store);
        }}
        onCreateStore={() => {
          setDashActive('Your stores');
          setCreateStoreRequested(true);
        }}
        onManageStores={() => {
          setDashActive('Your stores');
        }}
      />
      {/* Top Bar removed from here and moved into catalog-content */}
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
                <span className="material-symbols-outlined dash-icon">chevron_right</span>
              </button>
            </div>
          ) : (
            <div className="dash-user">
              <div className="dash-avatar">{user ? getInitials(user.name) : "..."}</div>
              <div className="dash-user-info">
                <strong>{user ? user.name : "Loading..."}</strong>
                <span>{user ? user.role : "Account"}</span>
              </div>
              <button
                className="dash-collapse-btn"
                onClick={() => setDashCollapsed(true)}
              >
                <span className="material-symbols-outlined dash-icon">chevron_left</span>
              </button>
            </div>
          )}

          <nav className="dash-nav">
            {(() => {
              const hasStores = !storesLoading && stores.length > 0;
              const defaultStoreUrl =
                selectedStore?.url ||
                stores[0]?.url ||
                (stores[0]?.id ? String(stores[0].id) : "");

              return (
                <>
            {[
              { icon: "menu_book", label: "Catalog" },
              { icon: "storefront", label: "Your stores" },
            ].map((item) => (
              <div
                key={item.label}
                className={`dash-nav-item${dashActive === item.label ? " active" : ""
                  }`}
                onClick={() => {
                  if (item.label === "Go to store") {
                    setActiveStoreUrl(defaultStoreUrl);
                    window.open(`/store/${defaultStoreUrl}`, "_blank", "noopener,noreferrer");
                  } else {
                    setDashActive(item.label);
                  }
                }}
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
                <span className="material-symbols-outlined dash-icon">{item.icon}</span>
                {!dashCollapsed && <span>{item.label}</span>}
              </div>
            ))}

            {hasStores && (
              <>
                {!dashCollapsed && <div className="dash-section-title">Store</div>}
                {[
                  {
                    icon: "open_in_new",
                    label: "Go to store",
                  },
                  { icon: "campaign", label: "Campaigns" },
                  { icon: "explore", label: "Collections" },
                  { icon: "sell", label: "Discounts" },
                  { icon: "settings", label: "Store settings" },
                  { icon: "language", label: "Domain set up" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`dash-nav-item${dashActive === item.label ? " active" : ""
                      }`}
                    onClick={() => {
                      if (item.label === "Go to store") {
                        setActiveStoreUrl(defaultStoreUrl);
                        window.open(`/store/${defaultStoreUrl}`, "_blank", "noopener,noreferrer");
                      } else {
                        setDashActive(item.label);
                      }
                    }}
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
                    <span className="material-symbols-outlined dash-icon">{item.icon}</span>
                    {!dashCollapsed && <span>{item.label}</span>}
                  </div>
                ))}
              </>
            )}

            {!dashCollapsed && <div className="dash-section-title">Manage</div>}
            {[
              { icon: "shopping_cart", label: "Orders" },
              { icon: "photo_library", label: "Artwork library" },
              { icon: "monetization_on", label: "Payouts" },
              { icon: "build", label: "Settings" },
              { icon: "check_circle", label: "Task log" },
            ].map((item) => (
              <div
                key={item.label}
                className={`dash-nav-item${dashActive === item.label ? " active" : ""
                  }`}
                onClick={() => {
                  if (item.label === "Go to store") {
                    const url =
                      selectedStore?.url ||
                      (selectedStore?.id ? String(selectedStore.id) : "");
                    setActiveStoreUrl(url);
                    window.open(`/store/${url}`, "_blank", "noopener,noreferrer");
                  } else {
                    setDashActive(item.label);
                  }
                }}
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
                <span className="material-symbols-outlined dash-icon">{item.icon}</span>
                {!dashCollapsed && <span>{item.label}</span>}
              </div>
            ))}
                </>
              );
            })()}
          </nav>
        </aside>
        {/* ── CATALOG AREA ── */}
        <div className="catalog-main-layout">
          {dashActive === "Catalog" ? (
            <>
              {/* ── MOBILE MENU TOGGLE ── */}
              <div style={{ display: 'none' }}>
                {/* Hidden by default, shown on mobile via CSS */}
              </div>

              {/* ── SIDEBAR ── */}
              <aside className={`catalog-sidebar${isMobileSidebarOpen ? ' mobile-open' : ''}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 600 }}>Filters</h3>
                  <button
                    onClick={() => setIsMobileSidebarOpen(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '1.6rem',
                      cursor: 'pointer',
                      color: '#666',
                      display: 'none',
                      '@media (max-width: 639px)': { display: 'block' }
                    }}
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
                <nav className="category-list">
                  {categories.map((cat) => (
                    <div key={cat.name} className="cat-group">
                      <div
                        className={`nav-item${openCategories[cat.name] ? " open" : ""
                          }`}
                        onClick={() => toggleCategory(cat.name)}
                      >
                        <span>{cat.name}</span>
                        <i
                          className={`fa-solid fa-chevron-${openCategories[cat.name] ? "up" : "down"
                            }`}
                        ></i>
                      </div>
                      {openCategories[cat.name] && (
                        <ul className="cat-sub-list">
                          {cat.items.map((item) => (
                            <li
                              key={item}
                              className={`cat-sub-item${activeSubItem === item ? " active" : ""
                                }`}
                              onClick={() => {
                                setActiveSubItem(item);
                                setActiveCategory(cat.name);
                              }}
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
                    >
                      Brands{" "}
                      <i
                        className={`fa-solid fa-chevron-${brandOpen ? "up" : "down"
                          }`}
                      ></i>
                    </div>
                    {brandOpen && (
                      <div className="filter-options">
                        {allBrands.map((b) => (
                          <div
                            key={b}
                            className={`brand-item${activeBrand === b ? " active" : ""
                              }`}
                            onClick={() =>
                              setActiveBrand(activeBrand === b ? null : b)
                            }
                          >
                            <span>{b}</span>
                            {activeBrand === b && (
                              <i
                                className="fa-solid fa-xmark"
                                style={{ fontSize: "1.1rem", color: "#999" }}
                              ></i>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Production Technology */}
                  <div className="filter-group">
                    <div
                      className="filter-header"
                      onClick={() => setTechOpen(!techOpen)}
                    >
                      Production Technology{" "}
                      <i
                        className={`fa-solid fa-chevron-${techOpen ? "up" : "down"
                          }`}
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
                    >
                      Fulfilment locations{" "}
                      <i
                        className={`fa-solid fa-chevron-${locationOpen ? "up" : "down"
                          }`}
                      ></i>
                    </div>
                    {locationOpen && (
                      <div className="filter-options">
                        {fulfillmentLocations.map((location) => (
                          <label key={location} className="check-row">
                            <input
                              type="checkbox"
                              checked={selectedLocations.includes(location)}
                              onChange={() => toggleLocation(location)}
                            />
                            <span>{location}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </aside>

              {/* ── PRODUCT GRID ── */}
              <main className="catalog-content">
                {/* 1. Purple Notification Banner */}
                {isBannerVisible && (
                  <div className="content-banner-v2">
                    <i className="fa-solid fa-circle-info"></i>
                    <div className="banner-text">
                      Your store has been disconnected for some time and is now
                      scheduled for permanent removal on 21/04/2026.
                    </div>
                    <div className="banner-actions">
                      <button className="banner-btn">Request more time</button>
                      <button
                        className="banner-close-btn"
                        onClick={() => {
                          setIsBannerVisible(false);
                          localStorage.setItem("hide_add_page_banner", "true");
                        }}
                      >
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. Inline Tools Group */}
                <div className="content-tools-v2">
                  <div className="top-tools">
                    {/* tiền tệ */}
                    <div className="tool-dropdown-wrapper" ref={currencyRef}>
                      <div
                        className={`tool-item tool-select ${isCurrencyOpen ? "active" : ""
                          }`}
                        onClick={() => {
                          setIsCurrencyOpen(!isCurrencyOpen);
                          setIsCountryOpen(false);
                          setCurrencySearch("");
                        }}
                      >
                        <span className="tool-label">Currency</span>
                        <strong>{currency}</strong>
                        <i className={`fa-solid fa-caret-${isCurrencyOpen ? "up" : "down"}`}></i>
                      </div>
                      {isCurrencyOpen && (
                        <div className="tool-dropdown-panel">
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
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* quốc gia */}
                    <div className="tool-dropdown-wrapper" ref={countryRef}>
                      <div
                        className={`tool-item tool-select ${isCountryOpen ? "active" : ""
                          }`}
                        onClick={() => {
                          setIsCountryOpen(!isCountryOpen);
                          setIsCurrencyOpen(false);
                          setCountrySearch("");
                        }}
                      >
                        <FlagImg code={country.code} size={18} />
                        <strong>{country.name}</strong>
                        <i className={`fa-solid fa-caret-${isCountryOpen ? "up" : "down"}`}></i>
                      </div>
                      {isCountryOpen && (
                        <div className="tool-dropdown-panel country-panel">
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
                          </ul>
                        </div>
                      )}
                    </div>

                    <button
                      className={`btn-start-designing${selectedProducts.length > 0 ? " has-selection" : " disabled"
                        }`}
                      onClick={handleStartDesigning}
                      disabled={selectedProducts.length === 0}
                    >
                      Start designing {selectedProducts.length > 0 ? `(${selectedProducts.length})` : "+"}
                    </button>

                    <div className="cart-badge-icon">
                      <i className="fa-solid fa-shirt"></i>
                      <span className="count">{selectedProducts.length}</span>
                    </div>
                  </div>
                </div>

                {/* 3. Search Bar Container */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div className="search-container-v2">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input type="text" placeholder="Search catalog" />
                  </div>
                  {/* Mobile Filter Button */}
                  <button
                    onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                    style={{
                      display: 'none',
                      background: '#f5f5f5',
                      border: '1px solid #e0e0e0',
                      padding: '0.8rem 1.2rem',
                      borderRadius: '0.6rem',
                      cursor: 'pointer',
                      fontSize: '1.4rem',
                      color: '#333',
                      whiteSpace: 'nowrap',
                      '@media (max-width: 768px)': { display: 'flex', alignItems: 'center', gap: '0.5rem' }
                    }}
                    className="mobile-filter-btn"
                  >
                    <i className="fa-solid fa-sliders"></i>
                    <span>Filters</span>
                  </button>
                </div>

                {/* 4. Page Header Area */}
                <div className="content-header">
                  <div className="header-info">
                    <h1>{pageTitle}</h1>
                    <p>
                      Create, customize, and sell globally with our popular range of products.
                    </p>
                  </div>
                  <div className="sort-dropdown-wrapper" ref={sortRef}>
                    <div
                      className={`sort-select-trigger ${isSortOpen ? "active" : ""
                        }`}
                      onClick={() => setIsSortOpen(!isSortOpen)}
                    >
                      <span>Sort by</span>
                      <strong>{sortBy}</strong>
                      <i
                        className={`fa-solid fa-chevron-${isSortOpen ? "up" : "down"
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
                  {sortedProducts.map((p) => {
                    // Tương thích cả 2 data format
                    const tech = p.technology || p.tech || "-";
                    const fulfilled = Array.isArray(p.fulfilledFrom)
                      ? p.fulfilledFrom.join(", ")
                      : p.locations || "-";
                    const sizesTotal = p.sizes?.total ?? p.sizes ?? "-";
                    const sizesRange = p.sizes?.range ?? p.sizeRange ?? "-";
                    const imgSrc = resolveAssetUrl(p.image) || p.image || tshirtImg;
                    const rawColors = Array.isArray(p.colors) ? p.colors : [];

                    return (
                      <div
                        key={p.id}
                        className={`catalog-product-card${selectedProducts.find((sp) => sp.id === p.id)
                            ? " selected-card"
                            : ""
                          }`}
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate('/catalog-product/' + p.id, { state: { product: p } })}
                      >
                        <div className="image-box">
                          <input
                            type="checkbox"
                            className="card-check"
                            checked={
                              !!selectedProducts.find((sp) => sp.id === p.id)
                            }
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleSelectProduct(p);
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <img
                            src={imgSrc}
                            alt={p.name}
                            onError={(e) => {
                              e.target.src = tshirtImg;
                            }}
                          />
                        </div>
                        <div className="product-details">
                          <h3>{p.name}</h3>
                          <p className="brand-text">{p.brand}</p>
                          <div className="meta-line">
                            <strong>Technology</strong> {tech}
                          </div>
                          <div className="meta-line">
                            <strong>Fulfilled From</strong> {fulfilled}
                          </div>
                          <div className="meta-line">
                            <strong>Sizes</strong> ({sizesTotal}) • {sizesRange}
                          </div>
                          <div className="color-dots-row">
                            {rawColors.map((color, i) => (
                              <span
                                key={i}
                                className="dot"
                                style={{ backgroundColor: typeof color === "string" ? color : color?.hex }}
                              ></span>
                            ))}
                          </div>
                          <div className="price-tag">
                            From <strong>${p.price}</strong>{" "}
                            <small>excl. VAT</small>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </main>
            </>
          ) : dashActive === "Your stores" ? (
            <main className="catalog-content">
              <MyStoresView
                onManageStore={handleManageStore}
                openCreateStore={createStoreRequested}
                onCreateStoreOpened={() => setCreateStoreRequested(false)}
                onStoreCreated={(createdStore) => {
                  if (!createdStore) return;
                  setSelectedStore(createdStore);
                }}
                onStoresChanged={(nextStores) => {
                  const safeStores = Array.isArray(nextStores) ? nextStores : [];
                  setStores(safeStores);
                  setStoresLoading(false);

                  if (safeStores.length === 0) {
                    const storeViews = new Set([
                      'Go to store',
                      'Campaigns',
                      'Collections',
                      'Discounts',
                      'Store settings',
                      'Domain set up',
                      'Data tracking',
                    ]);
                    if (storeViews.has(dashActive)) {
                      setDashActive('Your stores');
                    }
                  }

                  setSelectedStore((prevSelected) => {
                    if (!safeStores.length) return null;
                    if (prevSelected && safeStores.some((s) => s.id === prevSelected.id)) return prevSelected;
                    return safeStores[0];
                  });
                }}
              />
            </main>
          ) : dashActive === "Collections" ? (
            <main className="catalog-content">
              <CollectionsView selectedStore={selectedStore} />
            </main>
          ) : dashActive === "Discounts" ? (
            <main className="catalog-content">
              <DiscountsView selectedStore={selectedStore} />
            </main>
          ) : dashActive === "Store settings" ? (
            <main className="catalog-content">
              <StoreSettingsView selectedStore={selectedStore} />
            </main>
          ) : dashActive === "Domain set up" ? (
            <main className="catalog-content">
              <DomainSetupView selectedStore={selectedStore} />
            </main>
          ) : dashActive === "Orders" ? (
            <main className="catalog-content">
              <OrdersView />
            </main>
          ) : dashActive === "Artwork library" ? (
            <main className="catalog-content">
              <ArtworkLibraryView />
            </main>
          ) : dashActive === "Payouts" ? (
            <main className="catalog-content">
              <PayoutsView />
            </main>
          ) : dashActive === "Settings" ? (
            <main className="catalog-content">
              <SettingsView />
            </main>
          ) : dashActive === "Task log" ? (
            <main className="catalog-content">
              <TaskLogView />
            </main>
          ) : (
            <main className="catalog-content">
              <CampaignsView 
                selectedStore={selectedStore} 
                openCampaignId={location.state?.campaignEditId || null} 
                onStartProductSelection={handleStartCampaignProductSelection}
              />
            </main>
          )}
        </div>{" "}
      </div>{" "}
      {/* ── TOOLTIP PORTAL (render ngoài sidebar để không bị clip) ── */}
      {dashCollapsed && hoveredItem && (
        <div
          className="dash-tooltip-portal"
          style={{ top: hoveredItem.y, left: hoveredItem.x }}
        >
          <span className="dash-tooltip-arrow" />
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
