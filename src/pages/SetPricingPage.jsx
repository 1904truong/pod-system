import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/SetPricingPage.css";
import MockupWithDesign from "../components/MockupWithDesign";

const DESIGN_DRAFTS_KEY_PREFIX = "pod-system:designer-drafts:v1";

const formatRange = (min, max) => {
  const f = (n) => {
    const value = Number(n);
    const sign = value < 0 ? "-" : "";
    return `${sign}$${Math.abs(value).toFixed(2)}`;
  };
  if (min === max) return f(min);
  return `${f(min)} - ${f(max)}`;
};

const normalizeKey = (value) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "")
    .trim();

const inferCategoryKey = (product) => {
  const category = normalizeKey(product?.category);
  if (category) return category;

  const name = normalizeKey(product?.name);
  if (name.includes("women")) return "womensclothing";
  if (name.includes("men")) return "mensclothing";
  if (name.includes("unisex")) return "unisexclothing";
  if (name.includes("youth") || name.includes("baby")) return "youthbaby";
  if (name.includes("drink")) return "drinkware";
  if (name.includes("homeware")) return "homeware";
  if (name.includes("wallart") || name.includes("wall art")) return "wallart";
  if (name.includes("hat")) return "hats";
  if (name.includes("accessor")) return "accessories";
  return "";
};

const PRODUCT_COSTS = [
  { category: ["mensclothing", "men"], subCategory: ["tshirts", "tshirt"], range: { min: 6.98, max: 11.78 } },
  { category: ["mensclothing", "men"], subCategory: ["hoodies", "hoodie"], range: { min: 16.5, max: 24 } },
  { category: ["mensclothing", "men"], subCategory: ["sweatshirts", "sweatshirt"], range: { min: 14, max: 21 } },
  { category: ["mensclothing", "men"], subCategory: ["longsleveshirts", "longsleeveshirts", "longsleeve", "longsleeves"], range: { min: 10.5, max: 15.5 } },
  { category: ["mensclothing", "men"], subCategory: ["tanktops", "tanktop", "tank"], range: { min: 8.5, max: 12 } },
  { category: ["womensclothing", "women"], subCategory: ["tshirts", "tshirt"], range: { min: 7.5, max: 12.5 } },
  { category: ["womensclothing", "women"], subCategory: ["hoodies", "hoodie"], range: { min: 17, max: 25 } },
  { category: ["womensclothing", "women"], subCategory: ["sweatshirts", "sweatshirt"], range: { min: 14.5, max: 22 } },
  { category: ["womensclothing", "women"], subCategory: ["longsleveshirts", "longsleeveshirts", "longsleeve", "longsleeves"], range: { min: 11, max: 16 } },
  { category: ["womensclothing", "women"], subCategory: ["tanktops", "tanktop", "tank"], range: { min: 8, max: 11.5 } },
  { category: ["unisexclothing", "unisex"], subCategory: ["tshirts", "tshirt"], range: { min: 6.98, max: 11.78 } },
  { category: ["unisexclothing", "unisex"], subCategory: ["hoodies", "hoodie"], range: { min: 16.5, max: 24 } },
  { category: ["unisexclothing", "unisex"], subCategory: ["sweatshirts", "sweatshirt"], range: { min: 14, max: 21 } },
  { category: ["unisexclothing", "unisex"], subCategory: ["longsleveshirts", "longsleeveshirts", "longsleeve", "longsleeves"], range: { min: 10.5, max: 15.5 } },
  { category: ["unisexclothing", "unisex"], subCategory: ["tanktops", "tanktop", "tank"], range: { min: 8.5, max: 12 } },
  { category: ["youthbaby", "youthandbaby", "yb"], subCategory: ["tshirts", "tshirt"], range: { min: 6, max: 8 } },
  { category: ["youthbaby", "youthandbaby", "yb"], subCategory: ["hoodies", "hoodie"], range: { min: 13.5, max: 18 } },
  { category: ["youthbaby", "youthandbaby", "yb"], subCategory: ["sweatshirts", "sweatshirt"], range: { min: 12, max: 16 } },
  { category: ["youthbaby", "youthandbaby", "yb"], subCategory: ["babyclothing", "babyclothes", "baby"], range: { min: 5.5, max: 7.5 } },
  { category: ["drinkware", "drink"], subCategory: ["mugs", "mug"], range: { min: 4.5, max: 7 } },
  { category: ["drinkware", "drink"], subCategory: ["bottles", "bottle"], range: { min: 12, max: 18 } },
  { category: ["drinkware", "drink"], subCategory: ["tumblers", "tumbler"], range: { min: 14.5, max: 20 } },
  { category: ["drinkware", "drink"], subCategory: ["glasses", "glass"], range: { min: 6.5, max: 10 } },
  { category: ["homeware"], subCategory: ["cushionspillows", "cushions", "pillows", "cushion", "pillow"], range: { min: 8.5, max: 18 } },
  { category: ["homeware"], subCategory: ["mats", "mat"], range: { min: 12, max: 25 } },
  { category: ["homeware"], subCategory: ["blankets", "blanket"], range: { min: 22, max: 45 } },
  { category: ["homeware"], subCategory: ["ornaments", "ornament"], range: { min: 3.5, max: 6 } },
  { category: ["homeware"], subCategory: ["yardsign", "yardsigns"], range: { min: 8, max: 15 } },
  { category: ["homeware"], subCategory: ["candles", "candle"], range: { min: 9.5, max: 14 } },
  { category: ["wallart"], subCategory: ["posters", "poster"], range: { min: 3, max: 15 } },
  { category: ["wallart"], subCategory: ["canvases", "canvas"], range: { min: 15, max: 60 } },
  { category: ["hats", "hat"], subCategory: ["caps", "cap"], range: { min: 8.5, max: 14 } },
  { category: ["hats", "hat"], subCategory: ["beanies", "beanie"], range: { min: 7.5, max: 12 } },
  { category: ["hats", "hat"], subCategory: ["visors", "visor"], range: { min: 8, max: 12 } },
  { category: ["accessories"], subCategory: ["allaccessories", "accessories"], range: { min: 4, max: 15 } },
];

const getProductCostRange = (product) => {
  const category = inferCategoryKey(product);
  const subCategory = normalizeKey(product?.subCategory || product?.subcategory || product?.name);

  const matched = PRODUCT_COSTS.find((item) => {
    const matchesCategory = category ? item.category.includes(category) : false;
    const matchesSubCategory = item.subCategory.some((entry) => subCategory.includes(entry));
    return matchesCategory && matchesSubCategory;
  });

  return matched?.range || { min: 6.98, max: 11.78 };
};

const parseRangeFromText = (text) => {
  const v = String(text ?? "");
  const nums = v
    .replace(/[^0-9.-]/g, " ")
    .trim()
    .split(/\s+/)
    .map(Number)
    .filter((n) => Number.isFinite(n));
  if (nums.length >= 2) return { min: nums[0], max: nums[1] };
  if (nums.length === 1) return { min: nums[0], max: nums[0] };
  return null;
};

const parseCurrencyText = (text) => {
  const value = String(text ?? "").replace(/[$,\s]/g, "").trim();
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const SetPricingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const destinations = useMemo(
    () => [
      { value: "US", label: "United States", flag: "🇺🇸" },
      { value: "CA", label: "Canada", flag: "🇨🇦" },
      { value: "GB", label: "United Kingdom", flag: "🇬🇧" },
      { value: "AU", label: "Australia", flag: "🇦🇺" },
      { value: "NZ", label: "New Zealand", flag: "🇳🇿" },
      { value: "DE", label: "Germany", flag: "🇩🇪" },
      { value: "FR", label: "France", flag: "🇫🇷" },
      { value: "ES", label: "Spain", flag: "🇪🇸" },
      { value: "IT", label: "Italy", flag: "🇮🇹" },
      { value: "NL", label: "Netherlands", flag: "🇳🇱" },
      { value: "SE", label: "Sweden", flag: "🇸🇪" },
      { value: "NO", label: "Norway", flag: "🇳🇴" },
      { value: "DK", label: "Denmark", flag: "🇩🇰" },
      { value: "FI", label: "Finland", flag: "🇫🇮" },
      { value: "IE", label: "Ireland", flag: "🇮🇪" },
      { value: "CH", label: "Switzerland", flag: "🇨🇭" },
      { value: "AT", label: "Austria", flag: "🇦🇹" },
      { value: "BE", label: "Belgium", flag: "🇧🇪" },
      { value: "PL", label: "Poland", flag: "🇵🇱" },
      { value: "JP", label: "Japan", flag: "🇯🇵" },
      { value: "KR", label: "South Korea", flag: "🇰🇷" },
      { value: "SG", label: "Singapore", flag: "🇸🇬" },
      { value: "VN", label: "Vietnam", flag: "🇻🇳" },
    ],
    []
  );

  const passedProducts = location.state?.products;
  const pendingCampaign = location.state?.pendingCampaign;
  const designDraftStorageKey = location.state?.designDraftStorageKey || null;
  const resolvedDesignDraftStorageKey =
    designDraftStorageKey ||
    (pendingCampaign?.id || pendingCampaign?.slug
      ? `${DESIGN_DRAFTS_KEY_PREFIX}:${String(pendingCampaign?.id || pendingCampaign?.slug)}`
      : null);
  const products = Array.isArray(passedProducts) && passedProducts.length
    ? passedProducts
    : [
        {
          id: 1,
          name: "Classic Unisex T-shirt",
          models: "Gildan 64000, Gildan 5000",
          category: "unisex clothing",
          subCategory: "t-shirts",
          img: null,
        },
      ];

  const [destination, setDestination] = useState("US");
  const [compareAtEnabled, setCompareAtEnabled] = useState(true);

  const designerDraftsById = useMemo(() => {
    if (!resolvedDesignDraftStorageKey) return {};
    try {
      const parsed = JSON.parse(localStorage.getItem(resolvedDesignDraftStorageKey) || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }, [resolvedDesignDraftStorageKey]);

  const selectedDestination = useMemo(
    () => destinations.find((d) => d.value === destination) ?? destinations[0],
    [destination, destinations]
  );

  const [retailById, setRetailById] = useState(() => {
    const defaultVal = 21.99;
    const map = {};
    for (const p of products) {
      const price = p.retailPrice ? Number(p.retailPrice) : defaultVal;
      map[p.id] = { min: price, max: price };
    }
    return map;
  });

  const [retailInputById, setRetailInputById] = useState(() => {
    const defaultVal = "21.99";
    const map = {};
    for (const p of products) {
      const price = p.retailPrice ? String(p.retailPrice) : defaultVal;
      map[p.id] = price;
    }
    return map;
  });


  const [compareAtById, setCompareAtById] = useState(() => {
    const init = { min: 24.99, max: 28.99 };
    const map = {};
    for (const p of products) map[p.id] = init;
    return map;
  });

  const profitRangeForRetail = (retailRange, productCostRange) => {
    const min = retailRange.min - productCostRange.max;
    const max = retailRange.max - productCostRange.min;
    return { min, max };
  };

  return (
    <div className="set-pricing-wrapper">
      <Navbar />

      <div className="set-pricing-page">
        <div className="set-pricing-top">
          <div className="set-pricing-breadcrumb">
            <span className="crumb-link" onClick={() => navigate("/addpage")}>My Stores</span>
            <span className="crumb-sep">/</span>
            <span className="crumb-link">Store</span>
            <span className="crumb-sep">/</span>
            <span
              className="crumb-link"
              onClick={() =>
                navigate("/designer", {
                  state: {
                    products,
                    pendingCampaign,
                    designDraftStorageKey: resolvedDesignDraftStorageKey,
                  },
                })
              }
            >
              Add Design
            </span>
            <span className="crumb-sep">/</span>
            <span className="crumb-current">Set Pricing</span>
          </div>

          <button
            className="btn-primary"
            type="button"
            onClick={() =>
              navigate("/review", {
                state: {
                  products,
                  destination,
                  retailById,
                  compareAtById,
                  compareAtEnabled,
                  pendingCampaign,
                  designDraftStorageKey: resolvedDesignDraftStorageKey,
                },
              })
            }
          >
            Continue to review
          </button>
        </div>

        <h1 className="set-pricing-title">Set pricing</h1>
        <p className="set-pricing-subtitle">
          Set the profit margin or retail price for your product. Some sizes may have a different cost, so you may want to edit
          individual margins or retail prices.
        </p>

        <div className="set-pricing-divider" />

        <div className="set-pricing-destination">
          <div className="dest-label">Delivery destination</div>
          <div className="dest-select">
            <span className="dest-flag" aria-hidden>
              {selectedDestination?.flag ?? "🌐"}
            </span>
            <select value={destination} onChange={(e) => setDestination(e.target.value)}>
              {destinations.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="set-pricing-table">
          <div className="pricing-head">
            <div className="col item">ITEM</div>
            <div className="col retail">RETAIL PRICE</div>
            <div className="col cost">PRODUCT COST</div>
            <div className="col profit">PROFIT</div>
            <div className="col compare">
              <div className="compare-toggle">
                <span>COMPARE AT</span>
                <button
                  type="button"
                  className={`toggle ${compareAtEnabled ? "on" : ""}`}
                  aria-pressed={compareAtEnabled}
                  onClick={() => setCompareAtEnabled((v) => !v)}
                >
                  <span className="toggle-knob" />
                </button>
              </div>
            </div>
          </div>

          {products.map((p) => {
            const retailRange = retailById[p.id] ?? { min: 21.99, max: 25.99 };
            const compareAtRange = compareAtById[p.id] ?? { min: 24.99, max: 28.99 };
            const productCostRange = getProductCostRange(p);
            const profitRange = profitRangeForRetail(retailRange, productCostRange);
            const hasProfitWarning = profitRange.min < 0 || profitRange.max < 0;
            const retailInputValue = retailInputById[p.id] ?? String(retailRange.min ?? 0);
            return (
            <div key={p.id} className="pricing-row">
              <div className="col item">
                <div className="item-cell">
                  <div className="item-thumb">
                    {p.img ? (
                      <MockupWithDesign
                        mockupSrc={p.img}
                        alt={p.name}
                        product={p}
                        designerDraft={designerDraftsById?.[String(p.id)] || null}
                        variant="thumb"
                      />
                    ) : (
                      <div className="thumb-placeholder" />
                    )}
                  </div>
                  <div className="item-meta">
                    <div className="item-name">{p.name} • 8</div>
                    <div className="item-models">
                      {p.models} <span className="variants">Show variants ▾</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col retail">
                <div className={`range-input ${hasProfitWarning ? "is-invalid" : ""}`}>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={retailInputValue}
                    onChange={(e) => {
                      const nextValue = e.target.value;
                      setRetailInputById((prev) => ({ ...prev, [p.id]: nextValue }));

                      const parsed = parseCurrencyText(nextValue);
                      if (parsed === null) return;
                      setRetailById((prev) => ({ ...prev, [p.id]: { min: parsed, max: parsed } }));
                    }}
                    onBlur={(e) => {
                      const parsed = parseCurrencyText(e.target.value);
                      if (parsed === null) return;
                      const formatted = parsed.toFixed(2);
                      setRetailInputById((prev) => ({ ...prev, [p.id]: formatted }));
                      setRetailById((prev) => ({ ...prev, [p.id]: { min: parsed, max: parsed } }));
                    }}
                    aria-label="Retail price"
                    placeholder="$0.00"
                  />
                  {hasProfitWarning ? <span className="input-alert" aria-hidden>!</span> : null}
                </div>
              </div>

              <div className="col cost">
                <div className="range-text">{formatRange(productCostRange.min, productCostRange.max)}</div>
              </div>

              <div className={`col profit ${hasProfitWarning ? "is-negative" : ""}`}>
                <div className="range-text">{formatRange(profitRange.min, profitRange.max)}</div>
              </div>

              <div className="col compare">
                <div className="range-input">
                  <input
                    type="text"
                    value={compareAtEnabled ? formatRange(compareAtRange.min, compareAtRange.max) : ""}
                    disabled={!compareAtEnabled}
                    onChange={(e) => {
                      const parsed = parseRangeFromText(e.target.value);
                      if (!parsed) return;
                      setCompareAtById((prev) => ({ ...prev, [p.id]: parsed }));
                    }}
                    aria-label="Compare at"
                  />
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SetPricingPage;
