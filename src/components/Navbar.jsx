import React, { useState, useEffect } from "react"; // Thêm useEffect
import "../styles/Navbar.css";
import { menuData } from "../data/menuData";
import logoWhale from "../assets/logo.png";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false); // State để theo dõi việc cuộn chuột

  // Lắng nghe sự kiện scroll
  useEffect(() => {
    const handleScroll = () => {
      // Nếu cuộn xuống quá 40px (chiều cao xấp xỉ của top-bar) thì ẩn đi
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    // Thêm class "scrolled" nếu isScrolled là true
    <nav
      className={`navbar-container ${isScrolled ? "scrolled" : ""}`}
      onMouseLeave={() => setActiveMenu(null)}
    >
      <div className="top-bar">
        <div className="top-bar-left">
          <img src={logoWhale} alt="Logo" className="top-logo-img" />
        </div>
        <div className="sales">
          <a href="/" className="sales__links">
            <p className="sales__titles">
              10% off all orders applied in cart when you spend €51.00
            </p>
          </a>
        </div>
        <ul className="top-bar-links">
          <li>
            <Link to="/stores">About</Link>
          </li>
          <li className="separator">|</li>
          <li>
            <Link to="/help">Help</Link>
          </li>
          <li className="separator">|</li>
          <li>
            <Link to="/signup">Join Us</Link>
          </li>
          <li className="separator">|</li>
          <li>
            <Link to="/login">Sign In</Link>
          </li>
        </ul>
      </div>
      <div className="main-nav">
        <div className="nav-logo">Breezy Sunz</div>

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
            <i className="fa-solid fa-magnifying-glass"></i>
            <input type="text" placeholder="Search" />
          </div>
          <div className="action-icons">
            <i className="fa-regular fa-heart"></i>
            <i className="fa-solid fa-bag-shopping"></i>
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
