import React, { useState, useEffect } from "react"; // Thêm useEffect
import "../styles/Navbar.css";
import { menuData } from "../data/menuData";
import logoWhale from "../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import useActiveStoreDiscount from "../hooks/useActiveStoreDiscount";

const Navbar = () => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false); // Track if we've scrolled past top-bar
  const [searchTerm, setSearchTerm] = useState("");
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const userProfileRaw = localStorage.getItem('user_profile');
  let userProfile = null;
  try {
    if (userProfileRaw) userProfile = JSON.parse(userProfileRaw);
  } catch (e) {}

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_profile');
    navigate('/login');
  };

  const { discountInPlay } = useActiveStoreDiscount();

  // banner logic moved to DiscountBanner.jsx
  const hasBanner = !!discountInPlay;


  // Lắng nghe sự kiện scroll (cả scroll toàn trang và scroll nội bộ Designer)
  useEffect(() => {
    const handleScroll = (e) => {
      const currentScrollY = e.detail?.scrollTop ?? window.scrollY;

      // Ẩn/Hiện Top-Bar (isScrolled)
      setIsScrolled(currentScrollY > 40);
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("nav-scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("nav-scroll", handleScroll);
    };
  }, []);

  return (
    // Thêm class "scrolled" cho top-bar
    <nav
      className={`navbar-container ${isScrolled ? "scrolled" : ""} ${hasBanner ? "has-banner" : ""}`}
      onMouseLeave={() => setActiveMenu(null)}
    >
      <div className="top-bar">
        <div className="top-bar-left">
          <Link to="/" aria-label="Go to home" className="top-logo-link">
            <img src={logoWhale} alt="Logo" className="top-logo-img" />
          </Link>
        </div>
        <div className="sales">
          {/* Sales banner handled by DiscountBanner component */}
        </div>
        <ul className="top-bar-links">
          <li>
            <Link to="/about">About</Link>
          </li>
          <li className="separator">|</li>
          <li>
            <Link to="/help">Help</Link>
          </li>
          {token ? (
            <>
              <li className="separator">|</li>
              <li style={{ position: "relative" }} onMouseLeave={() => setIsUserMenuOpen(false)}>
                <span 
                  className="user-menu-trigger"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  onMouseEnter={() => setIsUserMenuOpen(true)}
                >
                  <i className="fa-regular fa-user"></i>
                  {userProfile?.firstName || 'User'}
                </span>

                {isUserMenuOpen && (
                  <div className="user-dropdown-panel">
                    <div className="dropdown-header">
                      <p className="user-name">
                        {userProfile?.firstName} {userProfile?.lastName}
                      </p>
                      <p className="user-email">
                        {userProfile?.email}
                      </p>
                    </div>
                    {userProfile?.role === 'admin' && (
                      <button 
                        className="dropdown-btn"
                        onClick={() => { setIsUserMenuOpen(false); navigate("/addpage"); }} 
                      >
                        <i className="fa-solid fa-chart-line"></i> Dashboard
                      </button>
                    )}
                    <button 
                      className="dropdown-btn"
                      onClick={() => setIsUserMenuOpen(false)} 
                    >
                      <i className="fa-solid fa-box-open"></i> My Orders
                    </button>
                    <button 
                      className="dropdown-btn logout"
                      onClick={handleLogout} 
                    >
                      <i className="fa-solid fa-arrow-right-from-bracket"></i> Logout
                    </button>
                  </div>
                )}
              </li>
            </>
          ) : (
            <>
              <li className="separator">|</li>
              <li>
                <Link to="/signup">Join Us</Link>
              </li>
              <li className="separator">|</li>
              <li>
                <Link to="/login">Sign In</Link>
              </li>
            </>
          )}
        </ul>
      </div>
      <div className="main-nav">
        <Link to="/" aria-label="Go to home" className="nav-logo-link">
          <div className="nav-logo">Breezy Sunz</div>
        </Link>

        <ul className="nav-menu">
          {Object.keys(menuData).map((tab) => (
            <li
              key={tab}
              className="menu-item"
              onMouseEnter={() => setActiveMenu(tab)}
            >
              <span
                className={`menu-title ${activeMenu === tab ? "active" : ""}`}
              >
                {tab}
              </span>
            </li>
          ))}
        </ul>

        <div className="nav-actions">
          <div className="search-wrapper">
            <i 
              className="fa-solid fa-magnifying-glass" 
              onClick={() => {
                if (searchTerm.trim()) {
                  navigate("/product/1");
                }
              }}
              style={{ cursor: "pointer" }}
            ></i>
            <input 
              type="text" 
              placeholder="Search" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchTerm.trim()) {
                  navigate("/product/1");
                }
              }}
            />
          </div>
          <div className="action-icons" style={{ position: "relative" }}>
            <i 
              className="fa-regular fa-heart"
              style={{ cursor: "pointer" }}
              title="Wishlist"
              onClick={() => setIsWishlistOpen(!isWishlistOpen)}
            ></i>
            
            {/* Wishlist Dropdown */}
            {isWishlistOpen && (
              <div className="wishlist-dropdown" style={{
                position: "absolute",
                top: "100%",
                right: "-20px",
                marginTop: "15px",
                width: "260px",
                backgroundColor: "#fff",
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                borderRadius: "12px",
                padding: "16px",
                zIndex: 1000,
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                color: "#333",
                textAlign: "left"
              }}>
                <h4 style={{ margin: "0", fontSize: "16px", borderBottom: "1px solid #f0f0f0", paddingBottom: "10px", fontWeight: "600" }}>My Wishlist (2)</h4>
                
                {/* Mockup Item 1 */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }} onClick={() => navigate("/product/1")}>
                  <div style={{ width: "50px", height: "50px", backgroundColor: "#f5f5f5", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <i className="fa-solid fa-shirt" style={{ color: "#aaa" }}></i>
                  </div>
                  <div style={{ flex: 1, fontSize: "14px", lineHeight: "1.4" }}>
                    <div style={{ fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Classic Unisex T-shirt</div>
                    <div style={{ color: "#666", fontSize: "13px" }}>$21.99</div>
                  </div>
                </div>

                {/* Mockup Item 2 */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }} onClick={() => navigate("/product/2")}>
                  <div style={{ width: "50px", height: "50px", backgroundColor: "#f5f5f5", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <i className="fa-solid fa-shirt" style={{ color: "#aaa" }}></i>
                  </div>
                  <div style={{ flex: 1, fontSize: "14px", lineHeight: "1.4" }}>
                    <div style={{ fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Premium Hoodie v2</div>
                    <div style={{ color: "#666", fontSize: "13px" }}>$45.00</div>
                  </div>
                </div>

                <button 
                  style={{
                    marginTop: "8px", 
                    padding: "10px", 
                    backgroundColor: "#000", 
                    color: "#fff", 
                    border: "none", 
                    borderRadius: "20px", 
                    cursor: "pointer", 
                    fontWeight: "600",
                    transition: "background-color 0.2s"
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "#333"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "#000"}
                  onClick={() => setIsWishlistOpen(false)}
                >
                  View All Products
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className={`mega-menu-panel ${activeMenu ? "show" : ""}`}>
        <div className="mega-menu-content">
          {activeMenu &&
            menuData[activeMenu].map((column, idx) => (
              <div key={idx} className="mega-column">
                <h4>{column.title}</h4>
                <ul>
                  {column.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      </div>
      {/* SỬA TẠI ĐÂY: Thêm onMouseEnter để khi chạm vào nền mờ là đóng menu ngay */}
      <div
        className={`nav-overlay ${activeMenu ? "visible" : ""}`}
        onMouseEnter={() => setActiveMenu(null)}
      ></div>
    </nav>
  );
};

export default Navbar;
