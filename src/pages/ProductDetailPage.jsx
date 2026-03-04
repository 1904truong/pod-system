import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/ProductDetail.css";
import tshirt from "../assets/mau/imga1.webp";
import tshirt21 from "../assets/mau/tshirt2.webp";
import tshirt3 from "../assets/mau/tshirt3.webp";
import tshirt4 from "../assets/mau/tshirt4.webp";
import tshirt5 from "../assets/mau/tshirt5.webp";

import tshirt2 from "../assets/mau/image2.webp";
import visa from "../assets/pay/visa.png";
import mc from "../assets/pay/mc.png";
import am from "../assets/pay/am.png";
import paypal from "../assets/pay/paypal.png";
import kla from "../assets/pay/kla.png";

import size from "../assets/size_cm.webp";
const ProductDetailPage = () => {
  // --- 1. QUẢN LÝ TRẠNG THÁI ---
  const [selectedColor, setSelectedColor] = useState({
    name: "White",
    hex: "#ffffff",
  });
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [currency, setCurrency] = useState("USD");
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);

  // State quản lý việc đóng mở Accordion
  const [activeAccordion, setActiveAccordion] = useState(null);

  // --- 2. DỮ LIỆU MẪU ---
  const product = {
    title: "Jag Är Pensionär Min Husbil",
    price: "€21.99",
    type: "Classic Unisex T-shirt",
  };

  const productTypes = [
    "White Mug",
    "Classic Unisex T-shirt",
    "Men's T-shirt",
    "Premium T-Shirt",
    "Unisex V-neck Tee",
    "Unisex Tank Top",
    "Classic Sweatshirt",
  ];

  const images = [tshirt, tshirt21, tshirt3, tshirt4, tshirt5];

  const colors = [
    { name: "White", hex: "#ffffff" },
    { name: "Orange", hex: "#ff5722" },
    { name: "Red", hex: "#d32f2f" },
    { name: "Purple", hex: "#673ab7" },
    { name: "Green", hex: "#2e7d32" },
    { name: "Grey", hex: "#9e9e9e" },
    { name: "Yellow", hex: "#fbc02d" },
    { name: "Dark Green", hex: "#3e4e41" },
    { name: "Navy", hex: "#1a237e" },
  ];

  const sizes = ["S", "M", "L", "XL", "2XL", "3XL", "4XL"];

  // --- 3. XỬ LÝ SỰ KIỆN ---
  const nextImg = () =>
    setCurrentImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  const prevImg = () =>
    setCurrentImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));

  const toggleAccordion = (section) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };

  // size guiden
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [sizeUnit, setSizeUnit] = useState("inch");

  // back to top
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
  const sizeData = {
    cm: [
      { size: "S", a: "71.1", b: "45.7" },
      { size: "M", a: "73.7", b: "50.8" },
      { size: "L", a: "76.2", b: "55.9" },
      { size: "XL", a: "78.7", b: "61.0" },
      { size: "2XL", a: "81.3", b: "66.0" },
      { size: "3XL", a: "83.8", b: "71.0" },
      { size: "4XL", a: "86.3", b: "81" },
      { size: "5XL", a: "89", b: "81.2" },
    ],
    inch: [
      { size: "S", a: "28.0", b: "18.0" },
      { size: "M", a: "29.0", b: "20.0" },
      { size: "L", a: "30.0", b: "22.0" },
      { size: "XL", a: "31.0", b: "24.0" },
      { size: "2XL", a: "32.0", b: "26.0" },
      { size: "3XL", a: "33", b: "28.0" },
      { size: "4XL", a: "34", b: "30" },
      { size: "5XL", a: "35", b: "32" },
    ],
  };
  // show all / show less
  const [showAllRelated, setShowAllRelated] = useState(false);
  const allRelatedProducts = Array.from({ length: 15 }, (_, i) => i + 1);
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Cuộn lên mượt mà chuẩn mẫu thiết kế
    });
  };
  const visibleRelated = showAllRelated
    ? allRelatedProducts
    : allRelatedProducts.slice(0, 3);

  return (
    <div className="product-page-wrapper">
      <Navbar />

      <main className="product-page-main">
        <div className="detail-top-nav">
          <div className="d-breadcrumbs">
            <i className="fa-solid fa-house"></i>{" "}
            <i className="fa-solid fa-chevron-right"></i> Clothing{" "}
            <i className="fa-solid fa-chevron-right"></i> {product.title}
          </div>
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
        </div>

        <section className="product-layout">
          <div className="vertical-thumbs">
            {images.map((img, idx) => (
              <div
                key={idx}
                className={`v-thumb-box ${
                  currentImgIndex === idx ? "active" : ""
                }`}
                onClick={() => setCurrentImgIndex(idx)}
              >
                <img src={img} alt="thumb" />
              </div>
            ))}
          </div>

          <div className="main-image-section">
            <div className="image-card">
              <button className="img-nav prev" onClick={prevImg}>
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <img src={images[currentImgIndex]} alt="main product" />
              <button className="img-nav next" onClick={nextImg}>
                <i className="fa-solid fa-chevron-right"></i>
              </button>
              <span className="badge-side">Front</span>
              <span className="counter-text">
                {currentImgIndex + 1}/{images.length}
              </span>
            </div>
          </div>

          <div className="info-sidebar">
            <div className="title-row">
              <h1 className="product-name">{product.title}</h1>
            </div>
            <div className="product-price">{product.price}</div>

            <div className="form-group">
              <label>Product</label>
              <select className="full-select">
                {productTypes.map((item, index) => (
                  <option key={index} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>
                Color:{" "}
                <strong class="color__title">{selectedColor.name}</strong>
              </label>
              <div className="swatch-grid">
                {colors.map((c, i) => (
                  <div
                    key={i}
                    className={`swatch-item ${
                      selectedColor.name === c.name ? "active" : ""
                    }`}
                    style={{ backgroundColor: c.hex }}
                    onClick={() => setSelectedColor(c)}
                  ></div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <div className="size-header">
                <label>
                  Size: <span class="size__title">Select size</span>
                </label>
                {/* SỰ KIỆN MỞ SIZE GUIDE */}
                <span
                  className="size-guide-btn"
                  onClick={() => setIsSizeGuideOpen(true)}
                >
                  <i className="fa-solid fa-ruler"></i> Size Guide
                </span>
              </div>

              <div className="size-grid">
                {sizes.map((s) => (
                  <button
                    key={s}
                    className={`size-square ${
                      selectedSize === s ? "active" : ""
                    }`}
                    onClick={() => setSelectedSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Quantity</label>
              <select
                className="qty-select"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <button className="btn-buy-now-green">Buy now</button>

            <div className="pay-methods">
              <img src={visa} alt="visa" />
              <img src={mc} alt="mc" />
              <img src={am} alt="amex" />
              <img src={paypal} alt="paypal" />
              <img src={kla} alt="klarna" />
            </div>

            {/* thông tin sản phẩm */}
            <div className="accordion-list">
              <div className="acc-container">
                <div
                  className="acc-item"
                  onClick={() => toggleAccordion("details")}
                >
                  Product Details{" "}
                  <i
                    className={`fa-solid fa-chevron-${
                      activeAccordion === "details" ? "up" : "down"
                    }`}
                  ></i>
                </div>
                {activeAccordion === "details" && (
                  <div className="acc-content">
                    <p>
                      With clean lines and a classic fit, this t-shirt will
                      always keep you looking sharp. Made from midweight cotton
                      with a seam-free body, it's a wardrobe staple.
                    </p>
                    <ul className="details-list">
                      <li>
                        Midweight 100% cotton (Sport Gray is 90% cotton, 10%
                        polyester)
                      </li>
                      <li>Classic fit</li>
                      <li>Tubular body</li>
                      <li>Double-needle sleeve and bottom hems</li>
                      <li>Taped neck and shoulders</li>
                      <li>Ribbed collar</li>
                      <li>Wash cool, hang dry or tumble dry low</li>
                      <li>Cool iron inside-out</li>
                      <li>170-180gm² / 5.0-5.3oz/yd²</li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="acc-container">
                <div
                  className="acc-item"
                  onClick={() => toggleAccordion("delivery")}
                >
                  Delivery{" "}
                  <i
                    className={`fa-solid fa-chevron-${
                      activeAccordion === "delivery" ? "up" : "down"
                    }`}
                  ></i>
                </div>
                {activeAccordion === "delivery" && (
                  <div className="acc-content">
                    <p>
                      Product delivery times will vary depending on your
                      location.
                    </p>
                  </div>
                )}
              </div>

              <div className="acc-container">
                <div
                  className="acc-item"
                  onClick={() => toggleAccordion("about")}
                >
                  About this design{" "}
                  <i
                    className={`fa-solid fa-chevron-${
                      activeAccordion === "about" ? "up" : "down"
                    }`}
                  ></i>
                </div>

                {activeAccordion === "about" && (
                  <div className="acc-content">
                    <p>Begränsad Utgåva. Finns ej i butik.</p>
                    <div className="how-to-buy">
                      <strong>HUR DU KÖPER:</strong>
                      <ol>
                        <li>
                          Välj den typ och färg du vill (T-shirt eller hoodie)
                        </li>
                        <li>Klicka på "Reserve it now"</li>
                        <li>Välj antal och storlek</li>
                        <li>Skriv in adressen och betalningsinformation</li>
                        <li>Klart! Det är så enkelt!</li>
                      </ol>
                    </div>
                    <p className="buy-tip">
                      <strong>TIPS:</strong> DELA till dina vänner, beställ
                      tillsammans och spara på fraktkostnaden.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="social-share">
              <span class="share__title">Share design</span>
              <div className="share-links">
                <i className="fa-brands fa-facebook-f"></i>
                <i className="fa-brands fa-x-twitter"></i>
                <i className="fa-brands fa-pinterest-p"></i>
              </div>
            </div>
          </div>
        </section>

        <section className="other-available">
          <h2 className="sec-title">Other available products</h2>

          <div className="mini-product-grid">
            {visibleRelated.map((i) => (
              <div key={i} className="mini-item">
                <img src={tshirt2} alt="rel" />
                <h4>Jag Är Pensionär Min Husbil</h4>
                <p>€19.99</p>
              </div>
            ))}
          </div>

          {/* Nút bấm thay đổi trạng thái */}
          <span
            className="btn-show-all"
            onClick={() => setShowAllRelated(!showAllRelated)}
          >
            {showAllRelated ? "Show less" : "Show all"}
          </span>
        </section>
      </main>

      {/* phần size guiden */}
      {isSizeGuideOpen && (
        <div
          className="size-modal-overlay"
          onClick={() => setIsSizeGuideOpen(false)}
        >
          <div
            className="size-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="size-modal-header">
              <h3>Men's T-Shirt</h3>
              <button
                className="close-modal"
                onClick={() => setIsSizeGuideOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="size-modal-body">
              {/* Nút chuyển đơn vị */}
              <div className="unit-toggle">
                <button
                  className={sizeUnit === "inch" ? "active" : ""}
                  onClick={() => setSizeUnit("inch")}
                >
                  inch
                </button>
                <button
                  className={sizeUnit === "cm" ? "active" : ""}
                  onClick={() => setSizeUnit("cm")}
                >
                  cm
                </button>
              </div>

              {/* Hình minh họa trục A, B */}
              <div className="size-diagram">
                <img src={size} alt="Size Guide" />
              </div>

              {/* Bảng thông số */}
              <table className="size-table">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>A (Length)</th>
                    <th>B (Width)</th>
                  </tr>
                </thead>
                <tbody>
                  {sizeData[sizeUnit].map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.size}</td>
                      <td>{row.a}</td>
                      <td>{row.b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
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

export default ProductDetailPage;
