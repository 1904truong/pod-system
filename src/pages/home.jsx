import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
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

import "../styles/Home.css";

const Home = () => {
  // --- 1. STATE MANAGEMENT ---
  const [region, setRegion] = useState("denmark");
  const [activeLabel, setActiveLabel] = useState("");
  const [designIdeas, setDesignIdeas] = useState([]);
  const [visibleIdeas, setVisibleIdeas] = useState(4); // phần design
  const [visibleProducts, setVisibleProducts] = useState(6); // phần country

  const navigate = useNavigate();

  // --- 2. REFS FOR SCROLLING ---
  const newArrivalsRef = useRef(null); // Ref cho cuộn ngang New Arrivals
  const countryRef = useRef(null); // Ref cho cuộn đến phần Quốc gia
  const designIdeasRef = useRef(null); // Ref cho cuộn về đầu phần Ý tưởng

  // --- 3. DATA FETCHING ---
  useEffect(() => {
    // Dữ liệu giả lập (Sau này thay bằng fetch API từ PHP)
    const mockData = [
      {
        id: 1,
        title: "Idea 1",
        description: "Vintage Fishing style",
        image_path: "https://picsum.photos/400/300?random=1",
      },
      {
        id: 2,
        title: "Idea 2",
        description: "Moto Custom design",
        image_path: "https://picsum.photos/400/300?random=2",
      },
      {
        id: 3,
        title: "Idea 3",
        description: "Beer & Grill vibes",
        image_path: "https://picsum.photos/400/300?random=3",
      },
      {
        id: 4,
        title: "Idea 4",
        description: "Nordic Minimalist",
        image_path: "https://picsum.photos/400/300?random=4",
      },
      {
        id: 5,
        title: "Idea 5",
        description: "New Era Sport",
        image_path: "https://picsum.photos/400/300?random=5",
      },
    ];
    setDesignIdeas(mockData);
  }, []);
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
    {
      id: 1,
      name: "T-Shirt",
      image: tshirtIcon,
    },
    { id: 2, name: "Drinkware", image: drinkIcon },
    { id: 3, name: "Homeware", image: homeIcon },
    { id: 4, name: "Wall art", image: wallIcon },
    { id: 5, name: "Hats", image: hatsIcon },
    { id: 6, name: "Accesories", image: accIcon },
  ];
  return (
    <div className="home-container">
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
          {[1, 2, 3, 4, 5, 6].map((id) => (
            <ProductCard
              key={id}
              product={{
                id,
                name: "Nike Air Jordan 4 Retro",
                label: "Original",
                price: "6,299,000đ",
                image:
                  "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/070f368f-a90f-48e0-a4ef-a270f277150a/NIKE+AIR+JORDAN+4+RETRO+RM.png",
              }}
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

      {/* Design Inspiration Section (Grid with View More) */}
      <section className="design-inspiration" ref={designIdeasRef}>
        <div className="inspiration-header">
          <div className="header-text">
            <h2 className="section-label">DESIGN IDEAS</h2>
            <p className="quote-text">
              "Every great design begins with an even better story. Let's tell
              yours."
            </p>
          </div>
        </div>

        <div className="idea-grid">
          {designIdeas.slice(0, visibleIdeas).map((idea) => (
            <div key={idea.id} className="idea-card">
              <div className="idea-image">
                <img src={idea.image_path} alt={idea.title} />
                <span className="badge">Idea</span>
              </div>
              <div className="idea-info">
                <h3>{idea.title}</h3>
                <p>{idea.description}</p>
                <button className="btn-apply">Pick this style</button>
              </div>
            </div>
          ))}
        </div>

        <div className="view-more-container">
          {visibleIdeas < designIdeas.length ? (
            <button
              className="btn-view-more"
              onClick={() => setVisibleIdeas((prev) => prev + 4)}
            >
              View more products
            </button>
          ) : (
            <button className="btn-back-section" onClick={scrollToDesignTop}>
              Back to Design Top{" "}
              <i className="fa-solid fa-arrow-up-to-line"></i>
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
