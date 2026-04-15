import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import "../styles/StoreSettingsView.css";

const API_ORIGIN = "http://localhost:5000";

const resolveUploadUrl = (value) => {
  if (!value || typeof value !== "string") return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `${API_ORIGIN}${value}`;
};

const StoreSettingsView = ({ selectedStore }) => {
  const storeNameInitial = selectedStore?.name || "Your store";

  const [activeTab, setActiveTab] = useState("General");
  const [storeName, setStoreName] = useState(storeNameInitial);
  const [timezone, setTimezone] = useState("(GMT+07:00) ICT / Bangkok");
  const [payoutCurrency, setPayoutCurrency] = useState("USD");

  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const [aboutText, setAboutText] = useState("");
  const [desktopLayout, setDesktopLayout] = useState(3);
  const [mobileLayout, setMobileLayout] = useState(2);
  const [storeFilters, setStoreFilters] = useState(true);
  const [storeSearch, setStoreSearch] = useState(true);
  const [campaignsPerPage, setCampaignsPerPage] = useState(12);

  const [cookieBanner, setCookieBanner] = useState(false);
  const [companyInfoPage, setCompanyInfoPage] = useState(false);

  const [uploadingAsset, setUploadingAsset] = useState("");
  const [settings, setSettings] = useState(null);

  const logoInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const faviconInputRef = useRef(null);

  const tabs = [
    { id: "General", label: "General" },
    { id: "Branding", label: "Branding" },
    { id: "Layout", label: "Layout and features" },
    { id: "Compliance", label: "Compliance" },
  ];

  const applySettings = (data) => {
    setSettings(data);
    setAboutText(data?.aboutText || "");
    setTimezone(data?.storeTimezone || "(GMT+00:00) UTC");
    setPayoutCurrency(data?.payoutCurrency || "USD");
    setDesktopLayout(data?.desktopColumns ?? 3);
    setMobileLayout(data?.mobileColumns ?? 2);
    setStoreFilters(Boolean(data?.filtersEnabled ?? true));
    setStoreSearch(Boolean(data?.searchEnabled ?? true));
    setCampaignsPerPage(data?.initialProductCount ?? 12);
    setCookieBanner(Boolean(data?.cookieBannerEnabled ?? false));
    setCompanyInfoPage(Boolean(data?.companyInfoEnabled ?? false));
  };

  const payoutCurrencyDirty = payoutCurrency !== (settings?.payoutCurrency || "USD");

  const storeId = selectedStore?.id;

  useEffect(() => {
    setStoreName(storeNameInitial);
  }, [storeNameInitial]);

  useEffect(() => {
    const loadSettings = async () => {
      if (!storeId) {
        setSettings(null);
        return;
      }
      setSettingsLoading(true);
      setSettingsError("");
      try {
        const res = await api.get(`/stores/${storeId}/settings`);
        applySettings(res.data);
      } catch (err) {
        setSettingsError("Unable to load store settings.");
        console.error("Store settings load error:", err);
      } finally {
        setSettingsLoading(false);
      }
    };

    loadSettings();
  }, [storeId]);

  const handleSaveDescription = async () => {
    if (!storeId) return;
    setStatusMessage("Saving description...");
    try {
      const res = await api.put(`/stores/${storeId}/settings`, { aboutText });
      applySettings(res.data);
      setStatusMessage("Description saved.");
    } catch (err) {
      console.error("Description save error:", err);
      setStatusMessage("Failed to save description.");
    }
  };

  const handleSaveStoreName = async () => {
    if (!storeId) return;
    setStatusMessage("Saving store name...");
    try {
      await api.put(`/stores/${storeId}`, { name: storeName });
      setStatusMessage("Store name saved.");
    } catch (err) {
      console.error("Store name save error:", err);
      setStatusMessage("Failed to save store name.");
    }
  };

  const handleSaveTimezone = async () => {
    if (!storeId) return;
    setStatusMessage("Saving store timezone...");
    try {
      const res = await api.put(`/stores/${storeId}/settings`, { storeTimezone: timezone });
      applySettings(res.data);
      setStatusMessage("Store timezone saved.");
    } catch (err) {
      console.error("Store timezone save error:", err);
      setStatusMessage("Failed to save store timezone.");
    }
  };

  const handleSavePayoutCurrency = async () => {
    if (!storeId) return;
    setStatusMessage("Saving payout currency...");
    try {
      const res = await api.put(`/stores/${storeId}/settings`, { payoutCurrency });
      applySettings(res.data);
      setStatusMessage("Payout currency saved.");
    } catch (err) {
      console.error("Payout currency save error:", err);
      setStatusMessage("Failed to save payout currency.");
    }
  };

  const handleSaveCompliance = async () => {
    if (!storeId) return;
    setStatusMessage("Saving compliance settings...");
    try {
      const res = await api.put(`/stores/${storeId}/settings`, {
        cookieBannerEnabled: cookieBanner,
        companyInfoEnabled: companyInfoPage,
      });
      applySettings(res.data);
      setStatusMessage("Compliance settings saved.");
    } catch (err) {
      console.error("Compliance save error:", err);
      setStatusMessage("Failed to save compliance settings.");
    }
  };

  const handleSaveLayout = async () => {
    if (!storeId) return;
    setStatusMessage("Saving layout settings...");
    try {
      const res = await api.put(`/stores/${storeId}/settings`, {
        desktopColumns: desktopLayout,
        mobileColumns: mobileLayout,
        filtersEnabled: storeFilters,
        searchEnabled: storeSearch,
        initialProductCount: campaignsPerPage,
      });
      applySettings(res.data);
      setStatusMessage("Layout settings saved.");
    } catch (err) {
      console.error("Layout save error:", err);
      setStatusMessage("Failed to save layout settings.");
    }
  };

  const handleResetLayout = () => {
    setDesktopLayout(3);
    setMobileLayout(2);
    setStoreFilters(true);
    setStoreSearch(true);
    setCampaignsPerPage(12);
    setStatusMessage("Defaults restored. Save settings to apply.");
  };

  const handleUpload = async (asset, file) => {
    if (!storeId || !file) return;
    setUploadingAsset(asset);
    setStatusMessage(`Uploading ${asset}...`);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post(`/stores/${storeId}/branding/${asset}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      applySettings(res.data);
      setStatusMessage(`${asset} uploaded.`);
    } catch (err) {
      console.error("Branding upload error:", err);
      setStatusMessage(`Failed to upload ${asset}.`);
    } finally {
      setUploadingAsset("");
    }
  };

  const handleRemoveAsset = async (asset) => {
    if (!storeId) return;
    setUploadingAsset(asset);
    setStatusMessage(`Removing ${asset}...`);
    try {
      const res = await api.delete(`/stores/${storeId}/branding/${asset}`);
      applySettings(res.data);
      setStatusMessage(`${asset} removed.`);
    } catch (err) {
      console.error("Branding remove error:", err);
      setStatusMessage(`Failed to remove ${asset}.`);
    } finally {
      setUploadingAsset("");
    }
  };

  const handleDrop = (event, asset) => {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) handleUpload(asset, file);
  };

  const descriptionCount = useMemo(() => `${aboutText.length}/1000`, [aboutText.length]);

  if (!selectedStore) {
    return (
      <div className="store-settings-container">
        <h1 className="store-settings-title">Store settings</h1>
        <p className="form-helper-text">Select a store to edit its settings.</p>
      </div>
    );
  }

  return (
    <div className="store-settings-container animate-fade-in font-body">
      <div className="header-actions-area">
        <button className="publish-changes-btn">
          Publish changes
          <i className="fa-solid fa-arrows-rotate"></i>
        </button>
      </div>

      <nav className="breadcrumb-nav">
        <Link to="#" className="hover:underline">Dashboard</Link>
        <span className="separator">/</span>
        <Link to="#" className="hover:underline">My Stores</Link>
        <span className="separator">/</span>
        <Link to="#" className="hover:underline">{storeNameInitial}</Link>
        <span className="separator">/</span>
        <span>Preferences</span>
      </nav>

      <h1 className="store-settings-title">Store settings</h1>

      <nav className="settings-tabs-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`settings-tab-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {settingsLoading && <p className="form-helper-text">Loading settings...</p>}
      {settingsError && <p className="form-helper-text text-error">{settingsError}</p>}
      {statusMessage && <div className="status-banner">{statusMessage}</div>}

      {activeTab === "General" ? (
        <div className="settings-form-section animate-fade-in">
          <div className="form-group">
            <label className="form-label">Store name</label>
            <input
              type="text"
              className="settings-input"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
            />
            <div className="general-actions">
              <button className="btn-save-layout" onClick={handleSaveStoreName}>
                Save store name
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Store timezone</label>
            <p className="form-helper-text">
              Set the time zone that corresponds to your store's primary operations.
            </p>
            <div className="relative">
              <select
                className="settings-select"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              >
                <option>(GMT+07:00) ICT / Bangkok</option>
                <option>(GMT+00:00) UTC</option>
                <option>(GMT-05:00) EST</option>
              </select>
            </div>
            <div className="general-actions">
              <button className="btn-save-layout" onClick={handleSaveTimezone}>
                Save store timezone
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Store currency</label>
            <input type="text" className="settings-input" value="USD / $" readOnly />
            <p className="form-helper-text mt-2">
              Store currency is set when the store is created and cannot be changed.
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Payout currency</label>
            <p className="form-helper-text">
              The currency in which your profit will be paid out.
            </p>
            <div className="radio-options-list">
              {[
                "EUR / €",
                "GBP / £",
                "USD / $",
              ].map((curr) => {
                const code = curr.split(" ")[0];
                return (
                  <label key={code} className="radio-item">
                    <input
                      type="radio"
                      name="payoutCurrency"
                      checked={payoutCurrency === code}
                      onChange={() => setPayoutCurrency(code)}
                    />
                    <span>{curr}</span>
                  </label>
                );
              })}
            </div>
            <button
              className="btn-set-payout"
              type="button"
              onClick={handleSavePayoutCurrency}
              disabled={!storeId || settingsLoading || !payoutCurrencyDirty}
            >
              Set payout currency
            </button>
          </div>

          <div className="delete-store-section">
            <h3>Delete store</h3>
            <p className="form-helper-text mb-4">
              This significant action will permanently remove your store.
            </p>
            <button className="btn-delete-store">Delete store</button>
          </div>
        </div>
      ) : activeTab === "Branding" ? (
        <div className="settings-form-section animate-fade-in">
          <div className="branding-section-header">
            <h3>Logo</h3>
            <p className="form-helper-text">
              Add a logo to be displayed in the top-left corner of your store. Use a JPEG or PNG file with at least 800 x 500 px dimensions.
            </p>
          </div>
          <div
            className={`upload-drop-zone ${settings?.logo ? "has-preview" : ""}`}
            onClick={() => logoInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, "logo")}
          >
            {settings?.logo ? (
              <img
                src={resolveUploadUrl(settings.logo)}
                alt="Store logo"
                className="branding-preview branding-preview--logo"
              />
            ) : (
              <>
                <i className="fa-regular fa-image"></i>
                <span className="upload-text">
                  Drop logo here or <span className="browse-link">browse</span>
                </span>
              </>
            )}
          </div>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden-file-input"
            onChange={(e) => handleUpload("logo", e.target.files?.[0])}
          />
          <div className="remove-link-row">
            {settings?.logo && (
              <button
                className="remove-link"
                onClick={() => handleRemoveAsset("logo")}
                disabled={uploadingAsset === "logo"}
              >
                Remove logo
              </button>
            )}
          </div>

          <div className="branding-section-header">
            <h3>Banner</h3>
            <p className="form-helper-text">
              Add a banner image to be displayed at the top of your store. Use a JPEG or PNG file with at least 1100 x 300 px dimensions.
            </p>
          </div>
          <div
            className={`upload-drop-zone ${settings?.banner ? "has-preview" : ""}`}
            onClick={() => bannerInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, "banner")}
          >
            {settings?.banner ? (
              <img
                src={resolveUploadUrl(settings.banner)}
                alt="Store banner"
                className="branding-preview branding-preview--banner"
              />
            ) : (
              <>
                <i className="fa-regular fa-image"></i>
                <span className="upload-text">
                  Drop banner here or <span className="browse-link">browse</span>
                </span>
              </>
            )}
          </div>
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden-file-input"
            onChange={(e) => handleUpload("banner", e.target.files?.[0])}
          />
          <div className="remove-link-row">
            {settings?.banner && (
              <button
                className="remove-link"
                onClick={() => handleRemoveAsset("banner")}
                disabled={uploadingAsset === "banner"}
              >
                Remove banner
              </button>
            )}
          </div>

          <div className="branding-section-header">
            <h3>Favicon</h3>
            <p className="form-helper-text">
              Upload a 32 x 32 pixel ICO, PNG, GIF, or JPG to display in browser tabs.
            </p>
          </div>
          <div
            className={`upload-drop-zone ${settings?.favicon ? "has-preview" : ""}`}
            onClick={() => faviconInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, "favicon")}
          >
            {settings?.favicon ? (
              <img
                src={resolveUploadUrl(settings.favicon)}
                alt="Store favicon"
                className="branding-preview branding-preview--favicon"
              />
            ) : (
              <>
                <i className="fa-regular fa-image"></i>
                <span className="upload-text">
                  Drop favicon here or <span className="browse-link">browse</span>
                </span>
              </>
            )}
          </div>
          <input
            ref={faviconInputRef}
            type="file"
            accept="image/png,image/jpeg,image/gif,image/x-icon"
            className="hidden-file-input"
            onChange={(e) => handleUpload("favicon", e.target.files?.[0])}
          />
          <div className="remove-link-row">
            {settings?.favicon && (
              <button
                className="remove-link"
                onClick={() => handleRemoveAsset("favicon")}
                disabled={uploadingAsset === "favicon"}
              >
                Remove favicon
              </button>
            )}
          </div>

          <div className="branding-section-header">
            <h3>Description</h3>
            <p className="form-helper-text">
              Your About us page is a great way to tell customers a little more about your business, share your story, and build trust.
            </p>
          </div>
          <div className="description-editor-container">
            <textarea
              className="branding-textarea"
              placeholder="Tell your story..."
              maxLength={1000}
              value={aboutText}
              onChange={(e) => setAboutText(e.target.value)}
            ></textarea>
            <div className="description-footer">
              <span className="char-count">{descriptionCount}</span>
              <button className="btn-save-description" onClick={handleSaveDescription}>
                Save description
              </button>
            </div>
          </div>
        </div>
      ) : activeTab === "Layout" ? (
        <div className="settings-form-section animate-fade-in">
          <div className="branding-section-header">
            <h3>Desktop layout</h3>
            <p className="form-helper-text">
              Select a layout for how your store homepage will appear on large screens.
            </p>
          </div>
          <div className="layout-options-grid">
            <div
              className={`layout-option-card ${desktopLayout === 3 ? "selected" : ""}`}
              onClick={() => setDesktopLayout(3)}
            >
              <div className="layout-preview-box">
                <div className="preview-grid cols-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="grid-item-placeholder"></div>
                  ))}
                </div>
              </div>
              <div className="layout-card-footer">
                <div className="layout-radio-circle">
                  <div className="layout-radio-inner"></div>
                </div>
                <span>3 columns</span>
              </div>
            </div>
            <div
              className={`layout-option-card ${desktopLayout === 4 ? "selected" : ""}`}
              onClick={() => setDesktopLayout(4)}
            >
              <div className="layout-preview-box">
                <div className="preview-grid cols-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="grid-item-placeholder"></div>
                  ))}
                </div>
              </div>
              <div className="layout-card-footer">
                <div className="layout-radio-circle">
                  <div className="layout-radio-inner"></div>
                </div>
                <span>4 columns</span>
              </div>
            </div>
          </div>

          <div className="branding-section-header mt-12">
            <h3>Mobile layout</h3>
            <p className="form-helper-text">
              Select a layout for how your store homepage will appear on small devices like phones.
            </p>
          </div>
          <div className="layout-options-grid">
            <div
              className={`layout-option-card ${mobileLayout === 1 ? "selected" : ""}`}
              onClick={() => setMobileLayout(1)}
            >
              <div className="layout-preview-box flex items-center justify-center">
                <div className="mobile-preview-container">
                  <div className="mobile-preview-header"></div>
                  <div className="preview-grid cols-1">
                    {[1, 2].map((i) => (
                      <div key={i} className="grid-item-placeholder h-16"></div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="layout-card-footer">
                <div className="layout-radio-circle">
                  <div className="layout-radio-inner"></div>
                </div>
                <span>1 column</span>
              </div>
            </div>
            <div
              className={`layout-option-card ${mobileLayout === 2 ? "selected" : ""}`}
              onClick={() => setMobileLayout(2)}
            >
              <div className="layout-preview-box flex items-center justify-center">
                <div className="mobile-preview-container">
                  <div className="mobile-preview-header"></div>
                  <div className="preview-grid cols-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="grid-item-placeholder"></div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="layout-card-footer">
                <div className="layout-radio-circle">
                  <div className="layout-radio-inner"></div>
                </div>
                <span>2 columns</span>
              </div>
            </div>
          </div>

          <div className="branding-section-header mt-12">
            <h3>Store filters</h3>
          </div>
          <div className="toggle-row">
            <label className="switch">
              <input
                type="checkbox"
                checked={storeFilters}
                onChange={() => setStoreFilters(!storeFilters)}
              />
              <span className="slider"></span>
            </label>
            <span className="form-helper-text mb-0">Show filters in your store.</span>
          </div>

          <div className="branding-section-header mt-12">
            <h3>Store search</h3>
          </div>
          <div className="toggle-row">
            <label className="switch">
              <input
                type="checkbox"
                checked={storeSearch}
                onChange={() => setStoreSearch(!storeSearch)}
              />
              <span className="slider"></span>
            </label>
            <span className="form-helper-text mb-0">
              Let shoppers search your products.
            </span>
          </div>

          <div className="branding-section-header mt-12">
            <h3>Number of products to display</h3>
            <p className="form-helper-text">
              Loading is faster with fewer items. This setting applies on larger screens.
            </p>
          </div>
          <div className="radio-options-list">
            {[12, 24].map((count) => (
              <label key={count} className="radio-item">
                <input
                  type="radio"
                  name="campaignsPerPage"
                  checked={campaignsPerPage === count}
                  onChange={() => setCampaignsPerPage(count)}
                />
                <span>{count} Products</span>
              </label>
            ))}
          </div>

          <div className="layout-actions">
            <button className="btn-save-layout" onClick={handleSaveLayout}>
              Save settings
            </button>
            <button className="btn-reset-layout" onClick={handleResetLayout}>
              Reset to defaults
            </button>
          </div>
        </div>
      ) : activeTab === "Compliance" ? (
        <div className="settings-form-section animate-fade-in">
          <div className="branding-section-header">
            <h3 className="flex items-center gap-2">
              Store cookie banner
              <i className="fa-solid fa-circle-info text-slate-400 text-[1.4rem] cursor-help"></i>
            </h3>
          </div>
          <div className="toggle-row">
            <label className="switch">
              <input
                type="checkbox"
                checked={cookieBanner}
                onChange={() => setCookieBanner(!cookieBanner)}
              />
              <span className="slider"></span>
            </label>
            <span className="form-helper-text mb-0">Display a Cookie banner on your store.</span>
          </div>

          <div className="branding-section-header mt-12">
            <h3 className="flex items-center gap-2">
              Company information page
              <i className="fa-solid fa-circle-info text-slate-400 text-[1.4rem] cursor-help"></i>
            </h3>
          </div>
          <div className="toggle-row">
            <label className="switch">
              <input
                type="checkbox"
                checked={companyInfoPage}
                onChange={() => setCompanyInfoPage(!companyInfoPage)}
              />
              <span className="slider"></span>
            </label>
            <span className="form-helper-text mb-0">Show a company information page.</span>
          </div>
          <div className="layout-actions">
            <button className="btn-save-layout" onClick={handleSaveCompliance}>
              Save compliance settings
            </button>
          </div>
        </div>
      ) : (
        <div className="settings-form-section placeholder animate-fade-in">
          <p className="form-helper-text">This section is coming soon.</p>
        </div>
      )}
    </div>
  );
};

export default StoreSettingsView;
