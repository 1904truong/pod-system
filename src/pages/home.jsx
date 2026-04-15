import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import DiscountBanner from "../components/DiscountBanner";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import { regionData } from "../data/country";

// icon
import tshirtIcon from "../assets/t-shirt.png";
import drinkIcon from "../assets/drink.png";
import homeIcon from "../assets/homeware.png";
import wallIcon from "../assets/wallart.png";
import hatsIcon from "../assets/hats.png";
import accIcon from "../assets/acces.png";
import na1 from "../assets/newarrive/1.webp";
import na2 from "../assets/newarrive/2.webp";
import na3 from "../assets/newarrive/3.webp";
import na4 from "../assets/newarrive/4.webp";
import na5 from "../assets/newarrive/5.webp";
import na6 from "../assets/newarrive/6.webp";

import "../styles/Home.css";

import idea1 from "../assets/design/idea_1.png";
import idea2 from "../assets/design/idea_2.png";
import idea3 from "../assets/design/idea_3.png";
import idea4 from "../assets/design/idea_4.png";
import idea5 from "../assets/design/idea_5.png";

const MOCK_DESIGN_IDEAS = [
  {
    id: "idea-1",
    title: "Western Truck",
    description: "Vintage LLWestern pig dog & big hogs theme.",
    image_path: idea1,
  },
  {
    id: "idea-2",
    title: "Outdoor Adventure",
    description: "Classic LLWestern retro truck design.",
    image_path: idea2,
  },
  {
    id: "idea-3",
    title: "Camp Vibes Only",
    description: "Relaxed outdoor spirit and nature vibes.",
    image_path: idea3,
  },
  {
    id: "idea-4",
    title: "Tennis Club",
    description: "City people city life urban sport style.",
    image_path: idea4,
  },
  {
    id: "idea-5",
    title: "Cowboy Wood Hero",
    description: "Classic Howdy Woody Austin TX 2024 design.",
    image_path: idea5,
  },
];

export const NEW_ARRIVALS = [
  {
    id: 101,
    name: "Just a Simple Grandpa Who Loves Cycling",
    label: "Classic Unisex T-shirt",
    price: "€21.99",
    image: na1,
    colors: [
      { hex: "#ffffff" }, { hex: "#ff5722" }, { hex: "#d32f2f" }, { hex: "#28a745" }, { hex: "#888888" }, { hex: "#ffeb3b" }, { hex: "#425c48" }
    ]
  },
  {
    id: 102,
    name: "Just a Simple Grandpa Who Loves Fishing",
    label: "Classic Unisex T-shirt",
    price: "€22.50",
    image: na2,
    colors: [
      { hex: "#ffffff" }, { hex: "#ff5722" }, { hex: "#d32f2f" }, { hex: "#28a745" }, { hex: "#888888" }
    ]
  },
  {
    id: 103,
    name: "Best Grandpa & Cycling Enthusiast",
    label: "Classic Unisex T-shirt",
    price: "€19.99",
    image: na3,
    colors: [
      { hex: "#ffffff" }, { hex: "#ff5722" }, { hex: "#d32f2f" }, { hex: "#28a745" }, { hex: "#888888" }, { hex: "#ffeb3b" }, { hex: "#425c48" }, { hex: "#000000" }
    ]
  },
  {
    id: 104,
    name: "Just a Simple Grandpa Who Loves Motorcycles",
    label: "Classic Unisex T-shirt",
    price: "€23.99",
    image: na4,
    colors: [
      { hex: "#ffffff" }, { hex: "#000000" }, { hex: "#888888" }, { hex: "#d32f2f" }
    ]
  },
  {
    id: 105,
    name: "Don't Disturb Me: F1 in Progress",
    label: "Classic Unisex T-shirt",
    price: "€20.95",
    image: na5,
    colors: [
      { hex: "#ffffff" }, { hex: "#ff5722" }, { hex: "#d32f2f" }, { hex: "#28a745" }, { hex: "#888888" }, { hex: "#ffeb3b" }
    ]
  },
  {
    id: 106,
    name: "Don't Disturb Me: Watching MotoGP",
    label: "Classic Unisex T-shirt",
    price: "€21.50",
    image: na6,
    colors: [
      { hex: "#ffffff" }, { hex: "#ff5722" }, { hex: "#d32f2f" }, { hex: "#28a745" }, { hex: "#888888" }, { hex: "#ffeb3b" }, { hex: "#425c48" }, { hex: "#000000" }, { hex: "#ba7f8c" }
    ]
  }
];

const Home = () => {
  // --- 1. STATE MANAGEMENT ---
  const [region, setRegion] = useState("denmark");
  const [activeLabel, setActiveLabel] = useState("");
  const [designIdeas] = useState(MOCK_DESIGN_IDEAS);
  const [visibleIdeas, setVisibleIdeas] = useState(4); // phần design
  const [visibleProducts, setVisibleProducts] = useState(6); // phần country

  const navigate = useNavigate();

  // --- 2. REFS FOR SCROLLING ---
  const newArrivalsRef = useRef(null); // Ref cho cuộn ngang New Arrivals
  const countryRef = useRef(null); // Ref cho cuộn đến phần Quốc gia
  const designIdeasRef = useRef(null); // Ref cho cuộn về đầu phần Ý tưởng

  // --- 3. DATA FETCHING ---
  // // Lấy dữ liệu từ API
  // useEffect(() => {
  //   fetch("http://localhost/api/get_design_ideas.php")
  //     .then((res) => res.json())
  //     .then((data) => setDesignIdeas(data))
  //     .catch((err) => console.log("Chưa kết nối được Database:", err));
  // }, []);
  // --- 4. HELPER FUNCTIONS (Handlers) ---

  // Cuộn ngang New Arrivals
  const scrollNewArrivals = (direction) => {
    if (newArrivalsRef.current) {
      const scrollAmount = 400;
      newArrivalsRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Đổi quốc gia & cuộn xuống
  const handleRegionChange = (newRegion) => {
    setRegion(newRegion);
    setActiveLabel("");
    setTimeout(() => {
      countryRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };
  const scrollToCountryTop = () => {
    if (countryRef.current) {
      const yOffset = -120;
      const y =
        countryRef.current.getBoundingClientRect().top +
        window.pageYOffset +
        yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };
  // Cuộn về đầu mục Design Ideas
  const scrollToDesignTop = () => {
    if (designIdeasRef.current) {
      const yOffset = -120;
      const y =
        designIdeasRef.current.getBoundingClientRect().top +
        window.pageYOffset +
        yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // Quay lại đầu trang
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- 5. DERIVED DATA (Logic lọc) ---
  const filteredProducts =
    activeLabel === ""
      ? regionData[region]?.products
      : regionData[region]?.products.filter(
          (item) => item.label === activeLabel
        );
  // phần icon sản phẩm
  const spotlightData = [
    { id: 1, name: "T-Shirt", image: tshirtIcon },
    { id: 2, name: "Drinkware", image: drinkIcon },
    { id: 3, name: "Homeware", image: homeIcon },
    { id: 4, name: "Wall art", image: wallIcon },
    { id: 5, name: "Hats", image: hatsIcon },
    { id: 6, name: "Accessories", image: accIcon },
  ];


  return (
    <div className="home-container">
      <DiscountBanner />
      <Navbar />

      {/* Hero Section */}
      <header className="hero-banner">
        <div className="hero-content">
          <h1>CUSTOM YOUR STYLE</h1>
          <p className="hero_des">
            Your creativity, our craft. Perfectly matched
          </p>
          <button className="btn-shop">Shop Now</button>
        </div>
      </header>

      {/* Featured Grid Section */}
      <section className="featured-grid">
        <div className="grid-item fashion">
          <span>FASHION</span>
        </div>
        <div className="grid-item accessories">
          <span>ACCESSORIES</span>
        </div>
        <div className="grid-item more">
          <span>MORE</span>
        </div>
        <div className="grid-item best-seller">
          <span>BEST SELLER</span>
        </div>
      </section>

      {/* New Arrivals Section (Horizontal Scroll) */}
      <section className="product-section">
        <div className="section-header">
          <h2 className="card-title">New Arrivals</h2>
          <div className="header-controls">
            <div className="view-all">See More</div>
            <div className="scroll-buttons">
              <button
                className="nav-btn"
                onClick={() => scrollNewArrivals("left")}
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <button
                className="nav-btn"
                onClick={() => scrollNewArrivals("right")}
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
        <div className="product-scroll" ref={newArrivalsRef}>
          {NEW_ARRIVALS.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      </section>

      {/* Phần Country  */}
      <section className="country" ref={countryRef}>
        <div className="region-intro">
          <h2 className="region-title">
            {region.charAt(0).toUpperCase() + region.slice(1)} Collection
          </h2>
          <p className="region-subtitle">
            Select your country to discover exclusive designs just for you.
          </p>
        </div>

        <ul className="region-tabs">
          {Object.keys(regionData).map((c) => (
            <li
              key={c}
              className={region === c ? "active" : ""}
              onClick={() => handleRegionChange(c)}
            >
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </li>
          ))}
        </ul>

        <div className="filter-tags">
          <button
            className={`tag ${activeLabel === "" ? "active" : ""}`}
            onClick={() => {
              setActiveLabel("");
              setVisibleProducts(6);
            }}
          >
            All
          </button>
          {regionData[region]?.labels.map((label) => (
            <button
              key={label}
              className={`tag ${activeLabel === label ? "active" : ""}`}
              onClick={() => {
                setActiveLabel(label);
                setVisibleProducts(6);
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="product-grid">
          {filteredProducts?.length > 0 ? (
            // Chỉ lấy số lượng theo visibleProducts
            filteredProducts
              .slice(0, visibleProducts)
              .map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
          ) : (
            <p className="no-products">No products found in this category.</p>
          )}
        </div>

        {/* Nút View more cho phần Country */}
        <div className="view-more-container">
          {visibleProducts < filteredProducts?.length ? (
            <button
              className="btn-view-more"
              onClick={() => setVisibleProducts((prev) => prev + 3)}
            >
              View more products
            </button>
          ) : (
            filteredProducts?.length > 6 && (
              <button className="btn-back-section" onClick={scrollToCountryTop}>
                Back to Country Top{" "}
                <i className="fa-solid fa-arrow-up-to-line"></i>
              </button>
            )
          )}
        </div>
      </section>

      {/* Design Inspiration Section (Curator Editorial Layout) */}
      <section className="px-8 md:px-12 py-24 max-w-[1920px] mx-auto bg-white" ref={designIdeasRef}>
        <div className="max-w-4xl mb-16">
          <h1 className="font-headline font-black text-4xl md:text-5xl tracking-tighter mb-6 text-primary uppercase">
            DESIGN IDEAS
          </h1>
          <p className="font-body italic text-xl md:text-2xl text-secondary max-w-2xl leading-relaxed">
            Every great design begins with an even better story. Let's tell yours.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-20">
          {designIdeas.slice(0, visibleIdeas).map((idea, index) => {
            // Refined asymmetrical offset classes for 4-column layout
            let offsetClass = "";
            if (index === 1 || index === 3) offsetClass = "md:mt-12";
            if (index === 2) offsetClass = "lg:-mt-12";

            return (
              <div key={idea.id} className={`flex flex-col group ${offsetClass}`}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-surface-container mb-6">
                  <img
                    alt={idea.title}
                    className="w-full h-full object-cover transition-all duration-700 ease-in-out scale-105 group-hover:scale-100"
                    src={idea.image_path}
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-primary text-on-primary px-2.5 py-1 rounded-full text-[9px] font-headline font-black tracking-widest uppercase">
                      IDEA
                    </span>
                  </div>
                </div>
                <div className="flex flex-col space-y-3">
                  <div>
                    <h3 className="font-headline font-bold text-xl tracking-tight text-primary">
                      {idea.title}
                    </h3>
                    <p className="font-body italic text-secondary text-lg">
                      {idea.description}
                    </p>
                  </div>
                  <button className="w-fit bg-primary text-on-primary px-6 py-3 rounded-full font-headline font-bold text-[10px] tracking-widest uppercase hover:opacity-80 active:scale-95 transition-all">
                    Pick this style
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="view-more-container mt-24">
          {visibleIdeas < designIdeas.length ? (
            <button
              className="bg-primary text-on-primary px-10 py-4 rounded-full font-headline font-black text-xs tracking-widest uppercase hover:opacity-90 active:scale-95 transition-all"
              onClick={() => setVisibleIdeas(designIdeas.length)}
            >
              View more products
            </button>
          ) : (
            <button
              className="border border-primary text-primary px-8 py-4 rounded-full font-headline font-bold text-sm tracking-widest uppercase hover:bg-surface-container active:scale-95 transition-all flex items-center gap-4"
              onClick={scrollToDesignTop}
            >
              Back to Design Top <i className="fa-solid fa-arrow-up-to-line"></i>
            </button>
          )}
        </div>
      </section>

      {/* Customer CTA Section */}
      <section className="customer-upload-section">
        <div className="custom-upload-box">
          <div className="upload-inner">
            <i className="fa-solid fa-wand-magic-sparkles"></i>
            <h3>Got a unique idea?</h3>
            <p>Upload your own sketch and we’ll turn it into a masterpiece.</p>
            <button
              className="btn-upload"
              onClick={() => navigate("/designer")}
            >
              Upload My Concept
            </button>
          </div>
        </div>
      </section>

      {/*icon sản phẩm */}
      <section className="spotlight-section">
        <div className="spotlight-header">
          <h2>SPOTLIGHT</h2>
          <p>
            Where art meets everyday life. Unique expressions crafted to turn
            your personal story into premium lifestyle essentials.
          </p>
        </div>

        <div className="spotlight-grid">
          {spotlightData.map((item) => (
            <div key={item.id} className="spotlight-item">
              <div className="spotlight-img-wrapper">
                <img src={item.image} alt={item.name} />
              </div>
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/*Back to Top */}
      <div className="back-to-top-container">
        <button className="btn-back-to-top" onClick={scrollToTop}>
          Back to top <i className="fa-solid fa-chevron-up"></i>
        </button>
      </div>

      <Footer />
    </div>
  );
};

export default Home;
