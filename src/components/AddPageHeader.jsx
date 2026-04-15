import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AddPageHeader.css";

const AddPageHeader = ({
  stores = [],
  selectedStore = null,
  onSelectStore,
  onCreateStore,
  onManageStores,
  logoText = "Breezy Sunz",
  profileInitials = "TH",
  profileImageSrc = "",
  profileAlt = "Profile",
}) => {
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const workspaceRef = useRef(null);
  const notificationsRef = useRef(null);
  
  const navigate = useNavigate();

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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (workspaceRef.current && !workspaceRef.current.contains(e.target)) {
        setIsWorkspaceOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setIsNotificationsOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="add-page-header">
      {/* Logo */}
      <div className="header-logo">
        <span className="breezy-logo-text">{logoText}</span>
      </div>

      {/* Center Icons */}
      <div className="header-center">
        <button className="header-icon-btn" title="Checkmark">
          <i className="fa-solid fa-check"></i>
        </button>
        <div className="notifications-wrapper" ref={notificationsRef}>
          <button 
            className={`header-icon-btn ${isNotificationsOpen ? 'active' : ''}`} 
            title="Notifications"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          >
            <i className="fa-regular fa-bell"></i>
          </button>
          
          {isNotificationsOpen && (
            <div className="notifications-dropdown animate-fade-in">
              <div className="notifications-header">
                <h3>Latest changes</h3>
              </div>
              <div className="notifications-list">
                <div className="notification-item">
                  <span className="notification-badge">New</span>
                  <div className="notification-content">
                    <strong>New: Cookie Management & Legal Pages.</strong> You can now enable: • Cookie management • Legal company page in your Store Settings. 💡 Cookie man...
                  </div>
                </div>
                <div className="notification-item">
                  <span className="notification-badge">New</span>
                  <div className="notification-content">
                    <strong>Keychains now live in the catalogue.</strong> We've just added keychains to the Mayzing platform: ✅ Produced locally in Europe 🇪🇺 and USA 🇺🇸 ✅ ...
                  </div>
                </div>
                <div className="notification-item">
                  <span className="notification-badge">New</span>
                  <div className="notification-content">
                    <strong>Upsell discounts improvements.</strong> Until recently, discounts for upsell promotions in the cart only applied to a single product. Th...
                  </div>
                </div>
                <div className="notification-item">
                  <span className="notification-badge">New</span>
                  <div className="notification-content">
                    <strong>🚀 9 New Cap Styles – USA Fulfilled.</strong> We've launched 9 new caps, printed in the USA using high-quality Hybrid DTF x DTG technology for ...
                  </div>
                </div>
                <div className="notification-item">
                  <span className="notification-badge">New</span>
                  <div className="notification-content">
                    <strong>Mayzing store customization</strong> You can now customize your Mayzing store landing page: For desktop: Do you want larger, more...
                  </div>
                </div>
              </div>
              <div className="notifications-footer">
                <a href="#">Mayzing updates</a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Section - Workspace & Profile */}
      <div className="header-right">
        {/* Workspace Selector */}
        <div className="workspace-selector" ref={workspaceRef}>
          <button
            className="workspace-btn"
            onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
          >
            <i className="fa-solid fa-store"></i>
            <span>{selectedStore?.name || "Select store"}</span>
            <i className={`fa-solid fa-chevron-down ${isWorkspaceOpen ? "active" : ""}`}></i>
          </button>

          {isWorkspaceOpen && (
            <div className="workspace-menu">
              {stores.length === 0 ? (
                <div className="workspace-item workspace-item--muted">
                  No stores yet
                </div>
              ) : (
                stores.map((store) => (
                  <div
                    key={store.id}
                    className="workspace-item"
                    onClick={() => {
                      onSelectStore && onSelectStore(store);
                      setIsWorkspaceOpen(false);
                    }}
                    style={
                      selectedStore?.id === store.id
                        ? { fontWeight: 700, background: '#f5f5f5' }
                        : undefined
                    }
                  >
                    {store.name}
                  </div>
                ))
              )}

              <div className="workspace-divider" />

              <button
                type="button"
                className="workspace-action"
                onClick={() => {
                  setIsWorkspaceOpen(false);
                  onCreateStore && onCreateStore();
                }}
              >
                <span className="material-symbols-outlined workspace-action-icon">add_circle</span>
                <span>Create new store</span>
              </button>

              <button
                type="button"
                className="workspace-action"
                onClick={() => {
                  setIsWorkspaceOpen(false);
                  onManageStores && onManageStores();
                }}
              >
                <span className="material-symbols-outlined workspace-action-icon">settings</span>
                <span>Manage my stores</span>
              </button>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div style={{ position: "relative" }} onMouseLeave={() => setIsProfileOpen(false)}>
          <button 
            className="profile-btn" 
            title="Profile"
            onMouseEnter={() => setIsProfileOpen(true)}
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            style={{ cursor: "pointer" }}
          >
            {profileImageSrc ? (
              <img src={profileImageSrc} alt={profileAlt} className="profile-pic" />
            ) : (
              <i className="fa-regular fa-user" style={{ fontSize: "1.5rem", color: "#333", marginTop: "2px" }}></i>
            )}
          </button>

          {isProfileOpen && (
            <div className="dashboard-user-dropdown">
              <div className="dash-dropdown-header">
                <p className="dash-user-name">
                  {userProfile?.firstName} {userProfile?.lastName}
                </p>
                <p className="dash-user-email">
                  {userProfile?.email}
                </p>
              </div>
              
              <button 
                className="dash-dropdown-btn"
                onClick={() => { setIsProfileOpen(false); navigate("/"); }} 
              >
                <i className="fa-solid fa-store"></i> Storefront
              </button>
              
              <button 
                className="dash-dropdown-btn logout"
                onClick={handleLogout} 
              >
                <i className="fa-solid fa-arrow-right-from-bracket"></i> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AddPageHeader;
