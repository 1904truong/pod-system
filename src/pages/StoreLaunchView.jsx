import React, { useLayoutEffect, useMemo, useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import DiscountBanner from "../components/DiscountBanner";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import "../styles/StoreLaunchView.css";

const API_ORIGIN = "http://localhost:5000";

const resolveUploadUrl = (value) => {
  if (!value || typeof value !== "string") return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `${API_ORIGIN}${value}`;
};

const StoreLaunchView = () => {
  const { storeUrl } = useParams();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [cookieDismissed, setCookieDismissed] = useState(false);
  const [campaignProducts, setCampaignProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const [likedIds, setLikedIds] = useState(() => new Set());
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const domainBannerRef = useRef(null);

  useEffect(() => {
    const fetchStorefrontData = async () => {
      if (!storeUrl) return;
      setLoading(true);
      setError("");
      try {
        const [settingsRes, campaignsRes] = await Promise.all([
          fetch(`${API_ORIGIN}/api/public/stores/${storeUrl}/settings`),
          fetch(`${API_ORIGIN}/api/public/stores/${storeUrl}/campaigns`),
        ]);

        if (!settingsRes.ok) throw new Error("Failed to load store settings");
        const settingsData = await settingsRes.json();
        setSettings(settingsData);
        if (settingsData?.name) document.title = settingsData.name;
        if (settingsData?.favicon) {
          const link = document.querySelector("link[rel='icon']") || document.createElement("link");
          link.rel = "icon";
          link.href = resolveUploadUrl(settingsData.favicon);
          if (!link.parentNode) document.head.appendChild(link);
        }

        if (campaignsRes.ok) {
          const campaigns = await campaignsRes.json();

          const mapCategoryToType = (cat) => {
            const map = {
              'men': "Men's",
              'won': "Women's",
              'uni': "Unisex",
              'youth-baby': "Youth & Baby",
              'kid': "Kid's",
            };
            return map[String(cat).toLowerCase()] || "Unisex";
          };

          const mapSubCategoryToLabel = (sub) => {
            if (!sub) return "General";
            return sub.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
          };

          const flattened = (campaigns || []).flatMap((campaign) => {
            const baseName = campaign?.baseProduct?.name || "Campaign";
            const baseImage = campaign?.baseProduct?.image || null;
            const products = Array.isArray(campaign?.products) ? campaign.products : [];
            const campaignUpdatedAt = campaign?.updatedAt ? new Date(campaign.updatedAt).toISOString() : null;
            
            return products.map((product) => {
              // Map catalog fields to storefront labels
              const storefrontCategory = mapSubCategoryToLabel(product.subCategory || campaign.baseProduct?.subCategory);
              const storefrontType = mapCategoryToType(product.category || campaign.baseProduct?.category);

              // Derive a clean headline and sub-label
                const headline = campaign.title || product.title || "Product";
                const subHeadline = product.name || campaign.baseProduct?.name || "";

                // Intelligent Selection:
                // 1. If it's a custom design, we need a PLAIN base (usually the campaign's base product image).
                // 2. If it's a standard catalog item, we want the nice MARKETING preview (previewUrl).
                const isCustom = Boolean(product.designerDraft);
                
                const renderingBase = campaign.baseProduct?.image || product.previewUrl || product.img || null;
                const marketingImage = product.previewUrl || campaign.baseProduct?.image || product.img || null;

              return {
                id: `${campaign.id}-${product.id}`,
                name: headline,
                label: subHeadline,
                category: storefrontCategory,
                type: storefrontType,
                price: typeof product.salePrice === "number" 
                  ? `$${product.salePrice.toFixed(2)}` 
                  : (typeof product.retailPrice === "number" ? `$${product.retailPrice.toFixed(2)}` : "$0.00"),
                imageUrl: isCustom ? renderingBase : marketingImage,
                campaignId: campaign.id,
                campaignUpdatedAt,
                designerDraft: product.designerDraft || null,
                artwork: product.artwork || null,
                baseProduct: campaign.baseProduct || null,
              };
            });
          });
          setCampaignProducts(flattened);
        } else {
          setCampaignProducts([]);
        }
      } catch (err) {
        console.error(err);
        setError("Unable to load store data.");
        setCampaignProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStorefrontData();
  }, [storeUrl]);

  const showDomainBanner = useMemo(() => {
    const raw = typeof settings?.url === "string" ? settings.url.trim() : "";
    if (!raw) return true;
    return !raw.includes(".");
  }, [settings?.url]);

  useLayoutEffect(() => {
    const root = document.documentElement;
    if (!showDomainBanner) {
      root.style.setProperty("--domain-banner-height", "0px");
      return;
    }

    const el = domainBannerRef.current;
    if (!el) {
      root.style.setProperty("--domain-banner-height", "0px");
      return;
    }

    const update = () => {
      const h = Math.ceil(el.getBoundingClientRect().height);
      root.style.setProperty("--domain-banner-height", `${h}px`);
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
      ro.disconnect();
    };
  }, [showDomainBanner]);

  const availableCategories = useMemo(() => {
    const set = new Set();
    for (const product of campaignProducts) {
      if (product?.category) set.add(product.category);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [campaignProducts]);

  const availableTypes = useMemo(() => {
    const set = new Set();
    for (const product of campaignProducts) {
      if (selectedCategory && product?.category !== selectedCategory) continue;
      if (product?.type) set.add(product.type);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [campaignProducts, selectedCategory]);

  useEffect(() => {
    if (selectedType && !availableTypes.includes(selectedType)) {
      setSelectedType("");
    }
  }, [availableTypes, selectedType]);

  const products = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();

    let filtered = term
      ? campaignProducts.filter((product) =>
          [product.name, product.label, product.category, product.type]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(term))
        )
      : campaignProducts;

    if (selectedCategory) {
      filtered = filtered.filter((product) => product.category === selectedCategory);
    }

    if (selectedType) {
      filtered = filtered.filter((product) => product.type === selectedType);
    }

    if (showSavedOnly) {
      filtered = filtered.filter((product) => likedIds.has(product.id));
    }

    if (activeTab === "NEW") {
      filtered = [...filtered].sort((a, b) => {
        const ta = a?.campaignUpdatedAt ? new Date(a.campaignUpdatedAt).getTime() : 0;
        const tb = b?.campaignUpdatedAt ? new Date(b.campaignUpdatedAt).getTime() : 0;
        return tb - ta;
      });
    }

    if (activeTab === "BEST") {
      filtered = [...filtered].sort((a, b) => (Number(b.price || 0) - Number(a.price || 0)));
    }

    const limit = Number.isInteger(settings?.initialProductCount)
      ? settings.initialProductCount
      : 12;

    return filtered.slice(0, limit);
  }, [activeTab, campaignProducts, likedIds, searchQuery, selectedCategory, selectedType, settings, showSavedOnly]);

  const desktopCols = settings?.desktopColumns ?? 3;
  const mobileCols = settings?.mobileColumns ?? 2;
  const showFilters = settings?.filtersEnabled ?? true;
  const showSearch = settings?.searchEnabled ?? true;
  const showCookieBanner = settings?.cookieBannerEnabled && !cookieDismissed;

  const savedCount = likedIds.size;

  return (
    <div className="storefront">
      <DiscountBanner />

      {showDomainBanner && (
        <div ref={domainBannerRef} className="storefront-domain-banner" role="status">
          This store is not live. Connect a domain to launch your store.
        </div>
      )}

      <header className="storefront-header">
        <div className="storefront-header-inner">
          <div className="brand-block">
            {settings?.logo ? (
              <img
                className="brand-logo"
                src={resolveUploadUrl(settings.logo)}
                alt={settings?.name || "Store logo"}
              />
            ) : (
              <div className="brand-fallback">{settings?.name || "Store"}</div>
            )}
          </div>
          {showSearch && (
            <div className="storefront-search">
              <span className="material-symbols-outlined">search</span>
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
          <div className="storefront-actions">
            <button className="icon-button" aria-label="Account">
              <span className="material-symbols-outlined">account_circle</span>
            </button>
            <button
              className={`icon-button ${showSavedOnly ? "active" : ""}`}
              aria-label="Cart"
              type="button"
              onClick={() => {
                if (savedCount === 0) return;
                setShowSavedOnly((v) => !v);
              }}
            >
              <span className="material-symbols-outlined">shopping_bag</span>
              {savedCount > 0 && <span className="cart-badge">{savedCount}</span>}
            </button>
          </div>
        </div>
      </header>

      {settings?.banner && (
        <section className="storefront-banner">
          <img src={resolveUploadUrl(settings.banner)} alt="Store banner" />
        </section>
      )}

      <main className="storefront-main" style={{ "--grid-columns": desktopCols, "--grid-columns-mobile": mobileCols }}>
        <div className={`storefront-layout ${showFilters ? "with-filters" : "no-filters"}`}>
          {showFilters && (
            <aside className="storefront-filters">
              <div className="filter-header">
                <span className="material-symbols-outlined">filter_alt</span>
                Filter
              </div>
              <div className="filter-section">
                <h4>Category</h4>
                {availableCategories.length > 0 ? (
                  <>
                    <label>
                      <input
                        type="radio"
                        name="category"
                        checked={!selectedCategory}
                        onChange={() => setSelectedCategory("")}
                      />
                      All
                    </label>
                    {availableCategories.map((category) => (
                      <label key={category}>
                        <input
                          type="radio"
                          name="category"
                          checked={selectedCategory === category}
                          onChange={() => setSelectedCategory(category)}
                        />
                        {category}
                      </label>
                    ))}
                  </>
                ) : (
                  <div style={{ color: "#6b7280", fontSize: "1.3rem" }}>No categories</div>
                )}
              </div>
              <div className="filter-section">
                <h4>Type</h4>
                {availableTypes.length > 0 ? (
                  <>
                    <label>
                      <input
                        type="radio"
                        name="type"
                        checked={!selectedType}
                        onChange={() => setSelectedType("")}
                      />
                      All
                    </label>
                    {availableTypes.map((type) => (
                      <label key={type}>
                        <input
                          type="radio"
                          name="type"
                          checked={selectedType === type}
                          onChange={() => setSelectedType(type)}
                        />
                        {type}
                      </label>
                    ))}
                  </>
                ) : (
                  <div style={{ color: "#6b7280", fontSize: "1.3rem" }}>No types</div>
                )}
              </div>
            </aside>
          )}

          <section className="storefront-content">
            <div className="storefront-toolbar">
              <div className="storefront-tabs">
                <button
                  className={`tab ${activeTab === "ALL" ? "active" : ""}`}
                  onClick={() => setActiveTab("ALL")}
                  type="button"
                >
                  All
                </button>
                <button
                  className={`tab ${activeTab === "NEW" ? "active" : ""}`}
                  onClick={() => setActiveTab("NEW")}
                  type="button"
                >
                  New
                </button>
                <button
                  className={`tab ${activeTab === "BEST" ? "active" : ""}`}
                  onClick={() => setActiveTab("BEST")}
                  type="button"
                >
                  Best sellers
                </button>
              </div>
              <div className="storefront-count">
                {loading ? "Loading..." : `Showing ${products.length} items`}
              </div>
            </div>

            {error && <div className="storefront-error">{error}</div>}

            <div className="storefront-grid">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  liked={likedIds.has(product.id)}
                  onToggleLike={(nextLiked) => {
                    setLikedIds((prev) => {
                      const next = new Set(prev);
                      if (nextLiked) next.add(product.id);
                      else next.delete(product.id);
                      return next;
                    });
                  }}
                />
              ))}
            </div>
            {!loading && !error && products.length === 0 && (
              <div className="storefront-empty">
                No products found. Publish collections with campaigns to show items here.
              </div>
            )}
          </section>
        </div>
      </main>

      {showCookieBanner && (
        <div className="cookie-banner">
          <div>
            This store uses cookies to ensure the best experience.
          </div>
          <button className="btn-cookie" onClick={() => setCookieDismissed(true)}>
            Accept
          </button>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default StoreLaunchView;
