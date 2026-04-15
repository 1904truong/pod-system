import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/SettingsView.css";

const SettingsView = () => {
  const [activeTab, setActiveTab] = useState("Personal information");
  const [showNotification, setShowNotification] = useState(false);

  const [profile, setProfile] = useState({
    firstName: "TRUONG",
    lastName: "HOANG",
    email: "truonghoang1904@gmail.com",
    phone: "+84 0353 748 091"
  });

  useEffect(() => {
    const saved = localStorage.getItem("user_profile");
    if (saved) {
      setProfile(JSON.parse(saved));
    }
  }, []);

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveDetails = () => {
    localStorage.setItem("user_profile", JSON.stringify(profile));
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  return (
    <div className="settings-view-container animate-fade-in font-body">
      {/* Breadcrumbs */}
      <nav className="settings-breadcrumb">
        <Link to="#">Dashboard</Link>
        <span className="separator">/</span>
        <Link to="#">Settings</Link>
        <span className="separator">/</span>
        <span>Personal</span>
      </nav>

      {/* Header */}
      <header className="settings-header">
        <h1>Settings</h1>
      </header>

      {/* Tabs */}
      <div className="settings-tabs-wrapper">
        {["Personal information", "Billing information", "Account settings", "Payment methods"].map((tab) => (
          <button
            key={tab}
            className={`settings-tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notifications */}
      {showNotification && (
        <div className="settings-notification">
          <i className="fa-solid fa-circle-check"></i>
          Personal details saved successfully!
        </div>
      )}

      {/* Tab Content (Personal information) */}
      {activeTab === "Personal information" && (
        <div className="settings-tab-content animate-fade-in">
          {/* Email Section */}
          <div className="settings-form-section">
            <h2>Personal email</h2>
            <div className="settings-field-group" style={{ overflow: "hidden" }}>
              <input
                type="text"
                className="settings-input"
                value={profile.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="Enter personal email"
              />
              <button className="settings-btn-primary" onClick={handleSaveDetails}>
                Save personal email
              </button>
            </div>
          </div>

          {/* Details Section */}
          <div className="settings-form-section">
            <h2>Personal details</h2>
            <div className="settings-field-group">
              <label>First name</label>
              <input
                type="text"
                className="settings-input"
                value={profile.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                placeholder="First name"
              />
            </div>
            <div className="settings-field-group">
              <label>Last name</label>
              <input
                type="text"
                className="settings-input"
                value={profile.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                placeholder="Last name"
              />
            </div>
            <div className="settings-field-group" style={{ overflow: "hidden" }}>
              <label>Phone</label>
              <div className="phone-input-wrapper">
                <img 
                  src="https://flagcdn.com/w20/vn.png" 
                  alt="Vietnam Flag" 
                  className="flag-icon"
                />
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="Phone number"
                />
              </div>
              <button className="settings-btn-primary" onClick={handleSaveDetails}>
                Save personal details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Other tabs empty state for now */}
      {activeTab !== "Personal information" && (
        <div className="settings-tab-content py-20 text-center animate-fade-in">
          <i className="fa-solid fa-screwdriver-wrench text-5xl text-slate-100 mb-6 block"></i>
          <p className="text-slate-400 font-medium">This section ({activeTab}) is under development.</p>
        </div>
      )}
    </div>
  );
};

export default SettingsView;
