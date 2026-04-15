import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/DataTrackingView.css";

const DataTrackingView = ({ selectedStore }) => {
  const storeName = selectedStore?.name || "Cothlab Hats";
  
  // Meta state
  const [fbDomainVerification, setFbDomainVerification] = useState("");
  const [fbPixel1, setFbPixel1] = useState("");
  const [fbToken1, setFbToken1] = useState("");
  const [fbPixel2, setFbPixel2] = useState("");
  const [fbToken2, setFbToken2] = useState("");
  
  // TikTok state
  const [ttPixel1, setTtPixel1] = useState("");
  const [ttPixel2, setTtPixel2] = useState("");
  
  // Google state
  const [ggMeasurementId, setGgMeasurementId] = useState("");

  return (
    <div className="data-tracking-container animate-fade-in font-body">
      {/* Breadcrumbs */}
      <nav className="tracking-breadcrumb">
        <Link to="#">Dashboard</Link>
        <span className="separator">/</span>
        <Link to="#">My Stores</Link>
        <span className="separator">/</span>
        <Link to="#">{storeName}</Link>
        <span className="separator">/</span>
        <span>Data Tracking</span>
      </nav>

      {/* Header */}
      <header className="tracking-header">
        <h1>Data tracking</h1>
        <p>
          Tracking collects data about customer behavior. It helps you to measure the effectiveness of your advertising, increase conversions, and drive more sales.
        </p>
      </header>

      {/* Meta Section */}
      <section className="tracking-section">
        <div className="section-brand-header meta">
          <i className="fa-brands fa-meta"></i>
          <h2>Meta</h2>
        </div>
        <p className="section-instruction">
          Sign in to your Meta Business Suite and follow the steps to verify your store's domain and activate the Facebook pixel. For more information see <Link to="#">Meta Business Help Center</Link>.
        </p>

        <div className="tracking-input-group">
          <span className="step-title-v2">Step 1. Enter your Facebook domain verification</span>
          <input 
            type="text" 
            className="tracking-input"
            placeholder="Paste your Facebook domain verification here"
            value={fbDomainVerification}
            onChange={(e) => setFbDomainVerification(e.target.value)}
          />
        </div>

        <div className="tracking-input-group">
          <span className="step-title-v2">Step 2. Enter your Facebook pixel IDs</span>
          
          <div className="tracking-sub-group">
            <label>Facebook Pixel 1</label>
            <input 
              type="text" 
              className="tracking-input mb-3"
              placeholder="Add pixel"
              value={fbPixel1}
              onChange={(e) => setFbPixel1(e.target.value)}
            />
            <input 
              type="text" 
              className="tracking-input"
              placeholder="Add an optional access token"
              value={fbToken1}
              onChange={(e) => setFbToken1(e.target.value)}
            />
          </div>

          <div className="tracking-sub-group">
            <label>Facebook Pixel 2</label>
            <input 
              type="text" 
              className="tracking-input mb-3"
              placeholder="Add pixel"
              value={fbPixel2}
              onChange={(e) => setFbPixel2(e.target.value)}
            />
            <input 
              type="text" 
              className="tracking-input"
              placeholder="Add an optional access token"
              value={fbToken2}
              onChange={(e) => setFbToken2(e.target.value)}
            />
          </div>
        </div>
        <div className="save-tracking-indicator">
          <span>Save Facebook tracking</span>
          <i className="fa-solid fa-check"></i>
        </div>
      </section>

      {/* TikTok Section */}
      <section className="tracking-section">
        <div className="section-brand-header tiktok">
          <i className="fa-brands fa-tiktok"></i>
          <h2>TikTok</h2>
        </div>
        <p className="section-instruction">
          Sign in to your <Link to="#">TikTok Ads Manager</Link> and follow the steps to set up and activate the TikTok pixel. For more information see the <Link to="#">TikTok Help Center</Link> or download the <Link to="#">TikTok Pixel Helper</Link> extension on Chrome.
        </p>

        <div className="tracking-input-group">
          <label>TikTok Pixel ID</label>
          <div className="flex items-center gap-4 mb-3">
            <span className="text-slate-400 font-bold">1</span>
            <input 
              type="text" 
              className="tracking-input"
              placeholder="Enter your TikTok Pixel ID"
              value={ttPixel1}
              onChange={(e) => setTtPixel1(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 font-bold">2</span>
            <input 
              type="text" 
              className="tracking-input"
              placeholder="Enter your TikTok Pixel ID"
              value={ttPixel2}
              onChange={(e) => setTtPixel2(e.target.value)}
            />
          </div>
        </div>
        <div className="save-tracking-indicator">
          <span>Save TikTok tracking</span>
          <i className="fa-solid fa-check"></i>
        </div>
      </section>

      {/* Google Section */}
      <section className="tracking-section">
        <div className="section-brand-header google">
          <i className="fa-brands fa-google"></i>
          <h2>Google</h2>
        </div>
        <p className="section-instruction">
          Sign in to your Google Analytics account and follow the steps to connect your store's URL. You can then copy your "G-" ID (located in the "Stream details" panel) and paste it here. For more information see the <Link to="#">Google Analytics Help Center</Link>.
        </p>

        <div className="tracking-input-group">
          <label>Enter your Google Measurement ID</label>
          <input 
            type="text" 
            className="tracking-input"
            placeholder='Paste your "G-" ID here'
            value={ggMeasurementId}
            onChange={(e) => setGgMeasurementId(e.target.value)}
          />
        </div>
        <div className="save-tracking-indicator">
          <span>Save Google tracking</span>
          <i className="fa-solid fa-check"></i>
        </div>
      </section>
    </div>
  );
};

export default DataTrackingView;
