import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/DomainSetupView.css";

const DomainSetupView = ({ selectedStore }) => {
  const storeName = selectedStore?.name || "Cothlab Hats";
  const [domainValue, setDomainValue] = useState("");
  const [showError, setShowError] = useState(false);

  const handleConnect = () => {
    if (!domainValue.trim()) {
      setShowError(true);
    } else {
      setShowError(false);
      // Logic for connecting domain would go here
      console.log("Connecting domain:", domainValue);
    }
  };

  return (
    <div className="domain-setup-container animate-fade-in font-body">
      {/* Breadcrumbs */}
      <nav className="domain-breadcrumb">
        <Link to="#">Dashboard</Link>
        <span className="separator">/</span>
        <Link to="#">My Stores</Link>
        <span className="separator">/</span>
        <Link to="#">{storeName}</Link>
        <span className="separator">/</span>
        <span>Domain</span>
      </nav>

      {/* Header */}
      <header className="domain-header">
        <h1>Domains</h1>
        <p>
          Before you start trading on your store and use all available features you must first configure your domain name. The following steps will allow you to verify that everything has been set up correctly.
        </p>
      </header>

      {/* Step 1 Section */}
      <section className="domain-step-section">
        <span className="step-label">Step 1</span>
        <h2 className="step-title">Connect an existing domain</h2>
        <p className="step-description">
          Please enter the domain name you have purchased from your domain provider.
        </p>

        <div className="form-group-domain">
          <label className="input-label">Custom domain</label>
          <div className="domain-input-group">
            <div className="domain-input-wrapper">
              <input
                type="text"
                className={`domain-input ${showError ? "error" : ""}`}
                placeholder="Type your store domain"
                value={domainValue}
                onChange={(e) => {
                  setDomainValue(e.target.value);
                  if (e.target.value.trim()) setShowError(false);
                }}
              />
              {showError && (
                <p className="error-message">Please enter a domain name</p>
              )}
            </div>
            <button 
              className={`btn-connect-domain ${domainValue.trim() ? "active" : ""}`}
              onClick={handleConnect}
            >
              Connect
              <i className="fa-solid fa-link"></i>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DomainSetupView;
