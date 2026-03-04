import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/DesignerPage.css";

import tshirt from "../assets/mau ao/0.png";
import tshirt1 from "../assets/mau ao/1.png";
import tshirt2 from "../assets/mau ao/2.png";
import tshirt3 from "../assets/mau ao/3.png";
import tshirt4 from "../assets/mau ao/4.png";
import tshirt5 from "../assets/mau ao/5.png";
import tshirt6 from "../assets/mau ao/6.png";
import tshirt7 from "../assets/mau ao/7.png";
import tshirt8 from "../assets/mau ao/8.png";
import tshirt9 from "../assets/mau ao/9.png";
import tshirt10 from "../assets/mau ao/10.png";
import tshirt11 from "../assets/mau ao/11.png";
import tshirt12 from "../assets/mau ao/12.png";
import tshirt13 from "../assets/mau ao/13.png";
import tshirt14 from "../assets/mau ao/14.png";
import tshirt15 from "../assets/mau ao/15.png";
import tshirt16 from "../assets/mau ao/16.png";
import tshirt17 from "../assets/mau ao/17.png";
import tshirt18 from "../assets/mau ao/18.png";
import tshirt19 from "../assets/mau ao/19.png";
import tshirt20 from "../assets/mau ao/20.png";
import tshirt21 from "../assets/mau ao/21.png";
import tshirt22 from "../assets/mau ao/22.png";
import tshirt23 from "../assets/mau ao/23.png";
import tshirt24 from "../assets/mau ao/24.png";
import tshirt25 from "../assets/mau ao/25.png";
import tshirt26 from "../assets/mau ao/26.png";

const DesignerPage = () => {
  const [side, setSide] = useState("Front");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState("upload");
  // edit và preview
  const [mode, setMode] = useState("edit");
  const [selectedMockup, setSelectedMockup] = useState(0);

  // Products list & menu
  // ─── RECEIVE PRODUCTS FROM AddPage ───
  const location = useLocation();
  const passedProducts = location.state?.products;

  const [products, setProducts] = useState(
    passedProducts && passedProducts.length > 0
      ? passedProducts.map((p, i) => ({
          id: p.id || i + 1,
          name: p.name,
          models: p.brand || "",
          img: tshirt,
        }))
      : [
          {
            id: 1,
            name: "Classic Unisex T-shirt",
            models: "Gildan 64000, Gildan 5000",
            img: tshirt,
          },
        ]
  );
  const [selectedProductId, setSelectedProductId] = useState(1);
  const [openMenuId, setOpenMenuId] = useState(null);

  const handleDuplicate = (product) => {
    const newProduct = { ...product, id: Date.now() };
    setProducts((prev) => [...prev, newProduct]);
    setSelectedProductId(newProduct.id);
    setOpenMenuId(null);
  };

  const handleRemove = (id) => {
    if (products.length === 1) return; // không xóa sản phẩm cuối
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setSelectedProductId((prev) => {
      if (prev === id) return products.find((p) => p.id !== id)?.id;
      return prev;
    });
    setOpenMenuId(null);
  };
  const mockupList = [
    { id: 1, name: "Flat-lay Front", img: tshirt },
    { id: 2, name: "Flat-lay Back", img: tshirt1 },
    { id: 3, name: "Mannequin Front", img: tshirt2 },
    { id: 4, name: "Mannequin Back", img: tshirt3 },
    { id: 5, name: "Male model Front", img: tshirt4 },
    { id: 6, name: "Male model Back", img: tshirt5 },
    { id: 7, name: "Female model Front", img: tshirt6 },
    { id: 8, name: "Male Model Front", img: tshirt8 },
    { id: 9, name: "Male model Back", img: tshirt9 },
    { id: 10, name: "Female model Front", img: tshirt10 },
    { id: 11, name: "Female Model Back", img: tshirt11 },
    { id: 12, name: "Male model front", img: tshirt12 },
    { id: 13, name: "Male model back", img: tshirt13 },
    { id: 14, name: "Female model front", img: tshirt14 },
    { id: 15, name: "Female model back", img: tshirt15 },
    { id: 16, name: "Flat-lay Front", img: tshirt16 },
    { id: 17, name: "Male Model Front", img: tshirt1 },
    { id: 18, name: "Male model Back", img: tshirt18 },
    { id: 19, name: "Male model front lifestyle", img: tshirt19 },
    { id: 20, name: "Male model Back", img: tshirt20 },
    { id: 21, name: "Male Model Front", img: tshirt21 },
    { id: 22, name: "Male Model Front", img: tshirt22 },
    { id: 23, name: "Male Model Front", img: tshirt23 },
    { id: 24, name: "Female model Front", img: tshirt24 },
    { id: 25, name: "Female model Front", img: tshirt25 },
    { id: 26, name: "Classic Flat-lay Front", img: tshirt26 },
  ];
  // Logic chuyển view
  const [sidebarView, setSidebarView] = useState("picker");

  // ─── Danh sách layer động ───
  // Mỗi layer: { id, type: 'custom-image'|'text'|'static-text', expanded: bool }
  const [layers, setLayers] = useState([]);
  const [expandedLayerId, setExpandedLayerId] = useState(null);

  // Thêm layer mới khi chọn từ picker
  const addLayer = (type) => {
    const newLayer = { id: Date.now(), type };
    setLayers((prev) => [...prev, newLayer]);
    setExpandedLayerId(newLayer.id);
    // Chuyển sang settings view tương ứng
    if (type === "custom-image") setSidebarView("image-settings");
    if (type === "text") setSidebarView("text-settings");
    if (type === "static-text") setSidebarView("static-text-settings");
  };

  // Xóa layer
  const removeLayer = (id) => {
    setLayers((prev) => {
      const remaining = prev.filter((l) => l.id !== id);
      // Nếu xóa hết → về picker
      if (remaining.length === 0) setSidebarView("picker");
      return remaining;
    });
    if (expandedLayerId === id) setExpandedLayerId(null);
  };

  // Toggle expand/collapse layer
  const toggleExpand = (id) => {
    setExpandedLayerId((prev) => (prev === id ? null : id));
  };

  // Config hiển thị theo type
  const layerConfig = {
    "custom-image": {
      icon: "fa-solid fa-image",
      title: "Custom image layer",
      desc: "Allow customers to add their own image.",
    },
    text: {
      icon: "fa-solid fa-font",
      title: "Your text",
      desc: "Customizable text layer",
    },
    "static-text": {
      icon: "fa-solid fa-font",
      title: "Your text",
      desc: "Text layer",
    },
  };

  const layerTypes = [
    {
      title: "Image layer",
      desc: "Upload a file or choose an asset from your library",
      icon: "fa-regular fa-image",
    },
    {
      title: "Custom image layer",
      desc: "Allow customers to add their own image.",
      icon: "fa-solid fa-wand-magic-sparkles",
    },
    {
      title: "Customizable text layer",
      desc: "Add a customizable text layer",
      icon: "fa-solid fa-t",
    },
    {
      title: "Text layer",
      desc: "Add a static text layer",
      icon: "fa-solid fa-text-height",
    },
  ];

  const renderRightPanelContent = () => {
    if (mode === "preview") {
      return (
        <div className="mockup-grid">
          {mockupList.map((mockup, i) => (
            <div
              key={i}
              className={`mockup-thumb ${selectedMockup === i ? "active" : ""}`}
              onClick={() => setSelectedMockup(i)}
            >
              <img src={mockup.img} alt={mockup.name} />
              <span>{mockup.name}</span>
            </div>
          ))}
        </div>
      );
    }
    return null; // edit mode content stays inline
  };
  // ─── Chọn màu: mỗi view có state màu riêng ───
  // openColorPickerView: null | 'image-settings' | 'text-settings' | 'static-text-settings'
  const [openColorPickerView, setOpenColorPickerView] = useState(null);
  const colorPopoverRef = useRef(null); // dùng để detect click ra ngoài

  // State màu riêng cho từng view
  const [imageColors, setImageColors] = useState(["#ffffff"]);
  const [textColors, setTextColors] = useState(["#ffffff"]);
  const [staticTextColors, setStaticTextColors] = useState(["#ffffff"]);

  // Helper: lấy state + setter theo view hiện tại (hoặc theo view truyền vào)
  const getColorState = (view) => {
    if (view === "image-settings") return [imageColors, setImageColors];
    if (view === "text-settings") return [textColors, setTextColors];
    // static-text-settings hoặc bất kỳ view nào khác
    return [staticTextColors, setStaticTextColors];
  };

  // Đóng popover khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        colorPopoverRef.current &&
        !colorPopoverRef.current.contains(e.target)
      ) {
        setOpenColorPickerView(null);
      }
    };
    if (openColorPickerView) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openColorPickerView]);

  // Danh sách 21 màu chuẩn theo ảnh
  const allColors = [
    "#ffffff",
    "#000000",
    "#c6b59c",
    "#d87093",
    "#ff6347",
    "#d1001c",
    "#8b0000",
    "#778899",
    "#4169e1",
    "#4b0082",
    "#000080",
    "#008000",
    "#556b2f",
    "#d3d3d3",
    "#2f4f4f",
    "#ffd700",
    "#add8e6",
    "#191970",
    "#228b22",
    "#708090",
    "#008b8b",
  ];

  // Toggle một màu cho view đang mở
  const toggleColor = (color) => {
    const [selectedColors, setSelectedColors] =
      getColorState(openColorPickerView);
    if (selectedColors.includes(color)) {
      if (selectedColors.length > 1) {
        setSelectedColors(selectedColors.filter((c) => c !== color));
      }
    } else {
      setSelectedColors([...selectedColors, color]);
    }
  };

  // Chọn / bỏ chọn tất cả cho view đang mở
  const handleSelectAll = (checked) => {
    const [, setSelectedColors] = getColorState(openColorPickerView);
    setSelectedColors(checked ? allColors : ["#ffffff"]);
  };

  // Render phần color section tái sử dụng cho cả 3 view
  const renderColorSection = (view) => {
    const [selectedColors] = getColorState(view);
    const isOpen = openColorPickerView === view;
    return (
      /* ── SECTION MÀU ── dùng chung cho cả 3 view */
      <div className="color-section">
        <p className="sub-label">Colors • {selectedColors.length}</p>
        <div
          className="color-options-row"
          ref={isOpen ? colorPopoverRef : null}
        >
          {/* Hiển thị các màu đã chọn */}
          <div className="selected-colors-list">
            {selectedColors.slice(0, 5).map((color, idx) => (
              <div
                key={idx}
                className="color-circle active"
                style={{ background: color }}
              >
                <i
                  className="fa-solid fa-check"
                  style={{ color: color === "#ffffff" ? "#000" : "#fff" }}
                ></i>
              </div>
            ))}
            {selectedColors.length > 5 && (
              <span className="more-count">+{selectedColors.length - 5}</span>
            )}
          </div>

          {/* Nút mở bảng chọn màu */}
          <div
            className="color-add"
            onClick={() => setOpenColorPickerView(isOpen ? null : view)}
          >
            <i className="fa-solid fa-plus"></i>
          </div>

          {/* POPOVER CHỌN MÀU – đóng khi click ra ngoài */}
          {isOpen && (
            <div className="color-picker-popover" ref={colorPopoverRef}>
              <div className="popover-header">
                {selectedColors.length} out of {allColors.length} colors
              </div>
              <label className="select-all-row">
                <input
                  type="checkbox"
                  checked={selectedColors.length === allColors.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
                <span>Select all</span>
              </label>
              <div className="color-grid-picker">
                {allColors.map((color, idx) => (
                  <div
                    key={idx}
                    className="color-item"
                    style={{ background: color }}
                    onClick={() => toggleColor(color)}
                  >
                    {selectedColors.includes(color) && (
                      <i
                        className="fa-solid fa-check"
                        style={{
                          color: color === "#ffffff" ? "#000" : "#fff",
                        }}
                      ></i>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <span className="available-text">
          Available colors • {allColors.length}
        </span>
      </div>
    );
  };

  return (
    <div className="designer-wrapper">
      <Navbar />

      <header className="designer-header-v2">
        <div className="header-left-part">
          <h2>Classic Unisex T-shirt</h2>
          <span>Gildan 64000, Gildan 5000</span>
        </div>
        <div className="header-center-part">
          {/* Điều khiển chuyển Mode */}
          <button
            className={`btn-mode-tab ${mode === "edit" ? "active" : ""}`}
            onClick={() => setMode("edit")}
          >
            Edit
          </button>
          <button
            className={`btn-mode-tab ${mode === "preview" ? "active" : ""}`}
            onClick={() => setMode("preview")}
          >
            Preview
          </button>
        </div>
        <div className="header-right-part">
          {/* Tiêu đề cột phải thay đổi theo Mode */}
          <h3>{mode === "edit" ? "Product details" : "Product views"}</h3>
        </div>
      </header>

      <div className="designer-layout-v2">
        {/* CỘT 1: LEFT PANEL */}
        <aside className="left-panel-v2" onClick={() => setOpenMenuId(null)}>
          <div className="panel-content-area">
            <div className="panel-header">Product • {products.length}</div>
            {products.map((product) => (
              <div
                key={product.id}
                className={`active-product-card ${
                  selectedProductId === product.id ? "selected" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedProductId(product.id);
                  setOpenMenuId(null);
                }}
              >
                <div className="prod-img">
                  <img src={product.img} alt="thumb" />
                </div>
                <div className="prod-meta">
                  <h4>{product.name}</h4>
                  <span>{product.models}</span>
                </div>
                <div
                  className="more-btn-wrapper"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="more-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(
                        openMenuId === product.id ? null : product.id
                      );
                    }}
                  >
                    <i className="fa-solid fa-ellipsis-vertical"></i>
                  </button>
                  {openMenuId === product.id && (
                    <div className="product-dropdown-menu">
                      <button onClick={() => handleDuplicate(product)}>
                        Duplicate product
                      </button>
                      <button
                        className={products.length === 1 ? "disabled" : ""}
                        onClick={() =>
                          products.length > 1 && handleRemove(product.id)
                        }
                      >
                        Remove product
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="panel-footer-v2">
            <button className="add-prod-footer">
              Add product <span>+</span>
            </button>
          </div>
        </aside>

        {/* CỘT 2: CANVAS */}
        <section className="canvas-section-v2">
          {mode === "edit" ? (
            <div className="panel-content-area">
              <div className="side-switches">
                <button
                  className={side === "Front" ? "active" : ""}
                  onClick={() => setSide("Front")}
                >
                  Front
                </button>
                <button
                  className={side === "Back" ? "active" : ""}
                  onClick={() => setSide("Back")}
                >
                  Back
                </button>
              </div>
              <div className="main-canvas">
                <img
                  src={side === "Front" ? tshirt : tshirt1}
                  alt="Shirt"
                  className="shirt-img"
                />
                <div className="print-safe-area"></div>
              </div>
            </div>
          ) : (
            /* GIAO DIỆN PREVIEW */
            <div className="preview-container">
              <div className="blank-notice">
                <i className="fa-solid fa-circle-info"></i> This product is
                blank. Please add a design.
              </div>
              <div className="main-preview-mockup">
                <img
                  src={mockupList[selectedMockup].img}
                  alt={mockupList[selectedMockup].name}
                />
              </div>
            </div>
          )}
          <div className="panel-footer-v2 canvas-footer-gap"></div>
        </section>

        {/* CỘT 3: RIGHT PANEL (FIXED LOGIC) */}
        <aside className="right-panel-v2">
          <div className="panel-content-area">
            {mode === "edit" ? (
              sidebarView === "picker" ? (
                /* --- VIEW CHỌN LAYER --- */
                <div className="layer-picker">
                  <p className="sub-label">Choose a layer type</p>
                  {layerTypes.map((layer, i) => (
                    <div
                      key={i}
                      className="layer-option-card"
                      onClick={() => {
                        if (i === 0) setIsImageModalOpen(true);
                        if (i === 1) addLayer("custom-image");
                        if (i === 2) addLayer("text");
                        if (i === 3) addLayer("static-text");
                      }}
                    >
                      <div className="icon-box">
                        <i className={layer.icon}></i>
                      </div>
                      <div className="text-box">
                        <h5>{layer.title}</h5>
                        <p>{layer.desc}</p>
                      </div>
                    </div>
                  ))}
                  <div className="file-specs">
                    <p className="sub-label">Print file requirements</p>
                    <ul>
                      <li>
                        <strong>JPG and PNG</strong> file types supported
                      </li>
                      <li>
                        Maximum file size <strong>50 MB</strong>
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                /* ─── SETTINGS VIEW (image-settings / text-settings / static-text-settings) ─── */
                <div className="design-management">
                  {/* ── PHẦN MÀU – dùng hàm tái sử dụng theo sidebarView hiện tại ── */}
                  {renderColorSection(sidebarView)}

                  {/* ── YOUR DESIGN + DANH SÁCH LAYER ── */}
                  <div className="your-design-section">
                    <p className="sub-label">Your design</p>

                    {/* Nút "Add another layer" → quay về picker để chọn thêm */}
                    <div
                      className="add-layer-dotted"
                      onClick={() => setSidebarView("picker")}
                    >
                      <div className="add-icon-box">
                        <i className="fa-solid fa-plus"></i>
                      </div>
                      <div className="add-text-box">
                        <h5>Add another layer</h5>
                        <p>
                          Print area size{" "}
                          <strong>4200 x 4800 px (300 dpi)</strong>
                        </p>
                      </div>
                    </div>

                    {/* ── DANH SÁCH LAYER ĐỘNG ── */}
                    {layers.map((layer) => {
                      const cfg = layerConfig[layer.type];
                      const isOpen = expandedLayerId === layer.id;
                      return (
                        <div
                          key={layer.id}
                          className={`layer-card-v2 ${
                            isOpen ? "expanded" : ""
                          }`}
                        >
                          {/* HEADER: click để expand/collapse */}
                          <div
                            className="layer-card-header"
                            onClick={() => toggleExpand(layer.id)}
                          >
                            <div className="left-info">
                              <i className="fa-solid fa-grip-vertical drag-dots"></i>
                              <i className={`${cfg.icon} layer-icon-main`}></i>
                              <div className="title-stack">
                                <h5>{cfg.title}</h5>
                                <p>
                                  {cfg.desc}{" "}
                                  <i className="fa-solid fa-circle-info"></i>
                                </p>
                              </div>
                            </div>
                            <div
                              className="right-actions"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {/* Icon copy – mở expand (giống click header) */}
                              <i
                                className="fa-regular fa-copy"
                                title="Duplicate layer"
                                style={{ cursor: "pointer" }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const clone = { ...layer, id: Date.now() };
                                  setLayers((prev) => {
                                    const idx = prev.findIndex(
                                      (l) => l.id === layer.id
                                    );
                                    const next = [...prev];
                                    next.splice(idx + 1, 0, clone);
                                    return next;
                                  });
                                  setExpandedLayerId(clone.id);
                                }}
                              ></i>
                              {/* Icon thùng rác – xóa layer */}
                              <i
                                className="fa-regular fa-trash-can"
                                title="Delete layer"
                                style={{ cursor: "pointer", color: "#e53935" }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeLayer(layer.id);
                                }}
                              ></i>
                            </div>
                          </div>

                          {/* BODY: chỉ hiện khi isOpen */}
                          {isOpen && (
                            <div className="layer-card-body">
                              {/* ── Custom image layer body ── */}
                              {layer.type === "custom-image" && (
                                <>
                                  <div className="input-group-v2">
                                    <label>
                                      Create a prompt for your buyers{" "}
                                      <i className="fa-solid fa-circle-info"></i>
                                    </label>
                                    <div className="input-with-toggle">
                                      <input type="text" placeholder="" />
                                      <div className="toggle-switch"></div>
                                    </div>
                                  </div>
                                  <div className="shape-section">
                                    <label>Image area shape</label>
                                    <p>
                                      Choose the shape of your custom image
                                      frame
                                    </p>
                                    <div className="shape-grid">
                                      <button className="active">
                                        <i className="fa-solid fa-square"></i>
                                      </button>
                                      <button>
                                        <i className="fa-solid fa-circle"></i>
                                      </button>
                                      <button>
                                        <i className="fa-solid fa-star"></i>
                                      </button>
                                      <button>
                                        <i className="fa-solid fa-certificate"></i>
                                      </button>
                                      <button>
                                        <i className="fa-solid fa-heart"></i>
                                      </button>
                                    </div>
                                    <span className="blue-link">
                                      Custom shape{" "}
                                      <span className="blue-bold">
                                        Select custom shape
                                      </span>
                                    </span>
                                  </div>
                                  <div className="placeholder-options">
                                    <label>Placeholder image</label>
                                    <p>
                                      Choose how to display the image area to
                                      your customers
                                    </p>
                                    <div className="radio-group">
                                      <label className="radio-item">
                                        <input
                                          type="radio"
                                          name={`place-${layer.id}`}
                                          defaultChecked
                                        />{" "}
                                        <span>Icon</span>
                                      </label>
                                      <label className="radio-item">
                                        <input
                                          type="radio"
                                          name={`place-${layer.id}`}
                                        />{" "}
                                        <span>Text</span>
                                      </label>
                                      <label className="radio-item">
                                        <input
                                          type="radio"
                                          name={`place-${layer.id}`}
                                        />{" "}
                                        <span>Blank</span>
                                      </label>
                                      <label className="radio-item">
                                        <input
                                          type="radio"
                                          name={`place-${layer.id}`}
                                        />{" "}
                                        <span>Custom placeholder image</span>
                                      </label>
                                    </div>
                                  </div>
                                  <div className="size-section">
                                    <label>Size</label>
                                    <div className="size-pos-grid">
                                      <div className="field">
                                        <label className="sub-field-label">
                                          Width
                                        </label>
                                        <div className="unit-input">
                                          <input
                                            type="text"
                                            defaultValue="355.59"
                                          />{" "}
                                          <span>mm</span>
                                        </div>
                                      </div>
                                      <div className="link-icon-box">
                                        <i className="fa-solid fa-link"></i>
                                      </div>
                                      <div className="field">
                                        <label className="sub-field-label">
                                          Height
                                        </label>
                                        <div className="unit-input">
                                          <input
                                            type="text"
                                            defaultValue="406.4"
                                          />{" "}
                                          <span>mm</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="position-section">
                                    <label>Positioning</label>
                                    <div className="size-pos-grid no-link">
                                      <div className="field">
                                        <label className="sub-field-label">
                                          Left
                                        </label>
                                        <div className="unit-input">
                                          <input type="text" defaultValue="0" />{" "}
                                          <span>mm</span>
                                        </div>
                                      </div>
                                      <div className="field">
                                        <label className="sub-field-label">
                                          Top
                                        </label>
                                        <div className="unit-input">
                                          <input type="text" defaultValue="0" />{" "}
                                          <span>mm</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="align-section">
                                    <label>Align</label>
                                    <div className="align-buttons">
                                      <button title="Align Left">
                                        <i className="fa-solid fa-align-left"></i>
                                      </button>
                                      <button title="Align Center">
                                        <i className="fa-solid fa-align-center"></i>
                                      </button>
                                      <button title="Align Right">
                                        <i className="fa-solid fa-align-right"></i>
                                      </button>
                                      <button title="Align Bottom">
                                        <i className="fa-solid fa-arrow-down-long"></i>
                                      </button>
                                      <button title="Align Center Vertical">
                                        <i className="fa-solid fa-arrows-up-down"></i>
                                      </button>
                                      <button title="Align Top">
                                        <i className="fa-solid fa-arrow-up-long"></i>
                                      </button>
                                    </div>
                                  </div>
                                </>
                              )}

                              {/* ── Customizable text layer body ── */}
                              {layer.type === "text" && (
                                <>
                                  <div className="input-group-v2">
                                    <label>Customizable text placeholder</label>
                                    <input
                                      type="text"
                                      defaultValue="Your text"
                                      className="full-input"
                                    />
                                  </div>
                                  <div className="input-group-v2">
                                    <label>
                                      Create a prompt for your buyers{" "}
                                      <i className="fa-solid fa-circle-info"></i>
                                    </label>
                                    <div className="input-with-toggle">
                                      <input type="text" />
                                      <div className="toggle-switch"></div>
                                    </div>
                                  </div>
                                  <div className="font-settings">
                                    <label className="section-label">
                                      Font
                                    </label>
                                    <div className="input-group-v2">
                                      <label className="sub-field-label">
                                        Color
                                      </label>
                                      <div className="color-picker-input">
                                        <div
                                          className="color-preview"
                                          style={{ background: "#000" }}
                                        ></div>
                                        <span>#000000</span>
                                        <i className="fa-solid fa-pencil edit-pencil"></i>
                                      </div>
                                    </div>
                                    <div className="input-group-v2">
                                      <label className="sub-field-label">
                                        Font
                                      </label>
                                      <div className="font-selector">
                                        <select>
                                          <option>Abril Fatface</option>
                                        </select>
                                        <span className="upload-font-link">
                                          Upload font
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-align-section">
                                    <label>Text alignment</label>
                                    <div className="align-buttons">
                                      <button className="active">
                                        <i className="fa-solid fa-align-left"></i>
                                      </button>
                                      <button>
                                        <i className="fa-solid fa-align-center"></i>
                                      </button>
                                      <button>
                                        <i className="fa-solid fa-align-right"></i>
                                      </button>
                                      <button>
                                        <i className="fa-solid fa-grip-lines"></i>
                                      </button>
                                      <button>
                                        <i className="fa-solid fa-grip-lines-vertical"></i>
                                      </button>
                                      <button>
                                        <i className="fa-solid fa-bars"></i>
                                      </button>
                                    </div>
                                  </div>
                                  <div className="size-section">
                                    <label>Size</label>
                                    <div className="input-group-v2">
                                      <label className="sub-field-label">
                                        Font size
                                      </label>
                                      <div className="unit-input">
                                        <input type="text" defaultValue="40" />{" "}
                                        <span>mm</span>
                                      </div>
                                    </div>
                                    <div className="size-pos-grid no-link">
                                      <div className="field">
                                        <label className="sub-field-label">
                                          Width
                                        </label>
                                        <div className="unit-input">
                                          <input
                                            type="text"
                                            defaultValue="250"
                                          />{" "}
                                          <span>mm</span>
                                        </div>
                                      </div>
                                      <div className="field">
                                        <label className="sub-field-label">
                                          Height
                                        </label>
                                        <div className="unit-input">
                                          <input
                                            type="text"
                                            defaultValue="100"
                                          />{" "}
                                          <span>mm</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="position-section">
                                    <label>Positioning</label>
                                    <div className="size-pos-grid no-link">
                                      <div className="field">
                                        <label className="sub-field-label">
                                          Left
                                        </label>
                                        <div className="unit-input">
                                          <input
                                            type="text"
                                            defaultValue="52.8"
                                          />{" "}
                                          <span>mm</span>
                                        </div>
                                      </div>
                                      <div className="field">
                                        <label className="sub-field-label">
                                          Top
                                        </label>
                                        <div className="unit-input">
                                          <input
                                            type="text"
                                            defaultValue="153.2"
                                          />{" "}
                                          <span>mm</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="transform-section">
                                    <label>Transform</label>
                                    <div className="field">
                                      <label className="sub-field-label">
                                        Rotate
                                      </label>
                                      <div className="unit-input">
                                        <input type="text" defaultValue="0" />{" "}
                                        <span>deg</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="align-section">
                                    <label>Align</label>
                                    <div className="align-buttons">
                                      <button>
                                        <i className="fa-solid fa-align-left"></i>
                                      </button>
                                      <button>
                                        <i className="fa-solid fa-align-center"></i>
                                      </button>
                                      <button>
                                        <i className="fa-solid fa-align-right"></i>
                                      </button>
                                      <button>
                                        <i className="fa-solid fa-arrow-down-long"></i>
                                      </button>
                                      <button>
                                        <i className="fa-solid fa-arrows-up-down"></i>
                                      </button>
                                      <button>
                                        <i className="fa-solid fa-arrow-up-long"></i>
                                      </button>
                                    </div>
                                  </div>
                                  <div className="case-section">
                                    <label>Case</label>
                                    <div className="case-buttons">
                                      <button className="active">Tt</button>
                                      <button>TT</button>
                                    </div>
                                  </div>
                                </>
                              )}

                              {/* ── Static text layer body ── */}
                              {layer.type === "static-text" && (
                                <>
                                  <div className="input-group-v2">
                                    <label>Text</label>
                                    <input
                                      type="text"
                                      defaultValue="Your text"
                                      className="full-input"
                                    />
                                  </div>
                                  <div className="font-section">
                                    <label>Font</label>
                                    <div className="field">
                                      <label className="sub-field-label">
                                        Color
                                      </label>
                                      <div className="color-picker-box">
                                        <div
                                          className="color-sample"
                                          style={{ background: "#000" }}
                                        ></div>
                                        <span>#000000</span>
                                        <i className="fa-solid fa-pencil"></i>
                                      </div>
                                    </div>
                                    <div className="field">
                                      <label className="sub-field-label">
                                        Font
                                      </label>
                                      <div className="font-selector-row">
                                        <select className="font-dropdown">
                                          <option>Abril Fatface</option>
                                        </select>
                                        <span className="upload-link">
                                          Upload font
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-align-section">
                                    <label>Text alignment</label>
                                    <div className="align-buttons-grid">
                                      <button>
                                        <i className="fa-solid fa-align-left"></i>
                                      </button>
                                      <button className="active">
                                        <i className="fa-solid fa-align-center"></i>
                                      </button>
                                      <button>
                                        <i className="fa-solid fa-align-right"></i>
                                      </button>
                                      <button>
                                        <i className="fa-solid fa-grip-lines"></i>
                                      </button>
                                      <button>
                                        <i className="fa-solid fa-grip-lines-vertical"></i>
                                      </button>
                                      <button>
                                        <i className="fa-solid fa-bars"></i>
                                      </button>
                                    </div>
                                  </div>
                                  <div className="size-section">
                                    <label>Size</label>
                                    <div className="field">
                                      <label className="sub-field-label">
                                        Font size
                                      </label>
                                      <div className="unit-input">
                                        <input type="text" defaultValue="40" />{" "}
                                        <span>mm</span>
                                      </div>
                                    </div>
                                    <div className="size-pos-grid no-link">
                                      <div className="field">
                                        <label className="sub-field-label">
                                          Width
                                        </label>
                                        <div className="unit-input">
                                          <input
                                            type="text"
                                            defaultValue="250"
                                          />{" "}
                                          <span>mm</span>
                                        </div>
                                      </div>
                                      <div className="field">
                                        <label className="sub-field-label">
                                          Height
                                        </label>
                                        <div className="unit-input">
                                          <input
                                            type="text"
                                            defaultValue="100"
                                          />{" "}
                                          <span>mm</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="position-section">
                                    <label>Positioning</label>
                                    <div className="size-pos-grid no-link">
                                      <div className="field">
                                        <label className="sub-field-label">
                                          Left
                                        </label>
                                        <div className="unit-input">
                                          <input
                                            type="text"
                                            defaultValue="52.79"
                                          />{" "}
                                          <span>mm</span>
                                        </div>
                                      </div>
                                      <div className="field">
                                        <label className="sub-field-label">
                                          Top
                                        </label>
                                        <div className="unit-input">
                                          <input
                                            type="text"
                                            defaultValue="153.2"
                                          />{" "}
                                          <span>mm</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="transform-section">
                                    <label>Transform</label>
                                    <div className="field">
                                      <label className="sub-field-label">
                                        Rotate
                                      </label>
                                      <div className="unit-input">
                                        <input type="text" defaultValue="0" />{" "}
                                        <span>deg</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="align-section">
                                    <label>Align</label>
                                    <div className="align-buttons-grid">
                                      <button>
                                        <i className="fa-solid fa-align-left"></i>
                                      </button>
                                      <button>
                                        <i className="fa-solid fa-align-center"></i>
                                      </button>
                                      <button>
                                        <i className="fa-solid fa-align-right"></i>
                                      </button>
                                      <button>
                                        <i className="fa-solid fa-arrow-down-long"></i>
                                      </button>
                                      <button>
                                        <i className="fa-solid fa-arrows-up-down"></i>
                                      </button>
                                      <button>
                                        <i className="fa-solid fa-arrow-up-long"></i>
                                      </button>
                                    </div>
                                  </div>
                                  <div className="case-section">
                                    <label>Case</label>
                                    <div className="case-buttons">
                                      <button className="active">Tt</button>
                                      <button>TT</button>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            ) : null}

            {/* preview mode - product views grid */}
            {mode === "preview" && (
              <div className="mockup-grid">
                {mockupList.map((mockup, i) => (
                  <div
                    key={i}
                    className={`mockup-thumb ${
                      selectedMockup === i ? "active" : ""
                    }`}
                    onClick={() => setSelectedMockup(i)}
                  >
                    <img src={mockup.img} alt={mockup.name} />
                    <span>{mockup.name}</span>
                  </div>
                ))}
              </div>
            )}

            {/* ngắt 1 */}
          </div>
          <div className="panel-footer-v2">
            <button className="btn-primary-continue">
              Continue to pricing <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </aside>
      </div>

      {/* MODAL IMAGE layer GIỮ NGUYÊN */}
      {isImageModalOpen && (
        <div
          className="image-modal-overlay"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div
            className="image-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Add a new image</h3>
              <button
                className="close-x"
                onClick={() => setIsImageModalOpen(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-tabs">
              <button
                className={activeModalTab === "upload" ? "active" : ""}
                onClick={() => setActiveModalTab("upload")}
              >
                Upload Image
              </button>
              <button
                className={activeModalTab === "library" ? "active" : ""}
                onClick={() => setActiveModalTab("library")}
              >
                My library
              </button>
            </div>
            <div className="modal-body">
              {activeModalTab === "upload" ? (
                <div className="upload-dropzone">
                  <i className="fa-regular fa-image"></i>
                  <p>
                    Drop image here or{" "}
                    <span className="browse-text">browse</span>
                  </p>
                </div>
              ) : (
                <div className="library-placeholder">
                  Your library is empty.
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-save-disabled" disabled>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignerPage;
