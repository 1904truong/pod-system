import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import "../styles/DiscountsView.css";
// Reuse existing modal + form styles
import "../styles/CollectionsView.css";
import { SHIPPING_COUNTRIES } from "../data/shippingCountries";

const LOCAL_CAMPAIGNS_KEY = "pod-system:campaigns:v1";

const safeJsonParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const normalizeName = (value) => String(value || "").trim().toLowerCase();

const getLocalCampaigns = () => {
  if (typeof window === "undefined") return [];
  const parsed = safeJsonParse(window.localStorage.getItem(LOCAL_CAMPAIGNS_KEY) || "");
  return Array.isArray(parsed) ? parsed : [];
};

const DiscountsView = ({ selectedStore }) => {
  const storeName = selectedStore?.name || "Cothlab Hats";
  const storeUrl = selectedStore?.url || (selectedStore?.id ? String(selectedStore.id) : "cothlab-hats");
  const storeId = selectedStore?.id;

  const [activeTab, setActiveTab] = useState("All");

  const [loading, setLoading] = useState(false);
  const [discounts, setDiscounts] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [page, setPage] = useState(1);

  const [notice, setNotice] = useState(null);

  // Create flow (Step 2-5)
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createScope, setCreateScope] = useState("");
  const [createType, setCreateType] = useState("");
  const [createAudience, setCreateAudience] = useState("");
  const [createCampaignId, setCreateCampaignId] = useState("");
  const [isCampaignPickerOpen, setIsCampaignPickerOpen] = useState(false);
  const [campaignSearch, setCampaignSearch] = useState("");
  const [campaignPickerSelectedId, setCampaignPickerSelectedId] = useState("");
  const [campaignLoadError, setCampaignLoadError] = useState("");

  // Details flow (Step 6)
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [detailName, setDetailName] = useState("");
  const [detailPercentOff, setDetailPercentOff] = useState("");
  const [detailFixedAmount, setDetailFixedAmount] = useState("");
  const [detailPromoCode, setDetailPromoCode] = useState("");
  const [detailMinCartValueMode, setDetailMinCartValueMode] = useState("NONE");
  const [detailMinCartValue, setDetailMinCartValue] = useState("");
  const [detailShippingFee, setDetailShippingFee] = useState("");
  const [detailTransactionFeeRate, setDetailTransactionFeeRate] = useState("");
  const [detailTransactionFeeAmount, setDetailTransactionFeeAmount] = useState("");
  const [detailTargetProfit, setDetailTargetProfit] = useState("5");
  const [detailRegions, setDetailRegions] = useState([]);
  const [detailShippingCountries, setDetailShippingCountries] = useState({});
  const [openShippingRegion, setOpenShippingRegion] = useState("");
  const [shippingCountrySearch, setShippingCountrySearch] = useState("");
  const [showValidation, setShowValidation] = useState(false);
  const [detailCampaignId, setDetailCampaignId] = useState("");
  const [campaigns, setCampaigns] = useState([]);
  const [campaignLoading, setCampaignLoading] = useState(false);

  const [isProfitabilityOpen, setIsProfitabilityOpen] = useState(false);
  const [profitabilityLoading, setProfitabilityLoading] = useState(false);
  const [profitabilityConflicts, setProfitabilityConflicts] = useState([]);
  const [profitabilityWarnings, setProfitabilityWarnings] = useState([]);
  const [profitabilitySummary, setProfitabilitySummary] = useState(null);
  const [isProfitabilitySuccessOpen, setIsProfitabilitySuccessOpen] = useState(false);

  const REGION_LABELS = {
    EUROPE: "Europe",
    NORTH_AMERICA: "North America",
    OCEANIA: "Oceania",
  };

  const tabs = [
    { id: "All", label: "All" },
    { id: "Storewide", label: "Storewide Discounts" },
    { id: "Campaign", label: "Campaign Discounts" },
  ];

  const formatCampaignDate = (iso) => {
    if (!iso) return "";
    const t = new Date(iso);
    if (Number.isNaN(t.getTime())) return "";
    return t.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const formatDiscountDate = (iso) => {
    if (!iso) return "";
    const t = new Date(iso);
    if (Number.isNaN(t.getTime())) return "";
    return t.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
  };

  const formatMoney = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return "-";
    return `$${n.toFixed(2)}`;
  };

  const refreshDiscounts = async () => {
    if (!storeId) {
      setDiscounts([]);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get(`/stores/${storeId}/discounts`);
      setDiscounts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching discounts:", err);
      setDiscounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setEditingDiscount(null);
    setIsCreateOpen(false);
    setNotice(null);
    setPage(1);
    refreshDiscounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  const filteredDiscounts = useMemo(() => {
    if (activeTab === "Storewide") return discounts.filter((d) => d.scope === "STOREWIDE");
    if (activeTab === "Campaign") return discounts.filter((d) => d.scope === "CAMPAIGN");
    return discounts;
  }, [activeTab, discounts]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, rowsPerPage]);

  const resetCreateModal = () => {
    setIsCreateOpen(false);
    setCreateScope("");
    setCreateType("");
    setCreateAudience("");
    setCreateCampaignId("");
    setIsCampaignPickerOpen(false);
    setCampaignSearch("");
    setCampaignPickerSelectedId("");
    setCampaignLoadError("");
  };

  const coerceShippingCountries = (value) => {
    if (!value || typeof value !== "object") return {};
    const out = {};
    for (const key of Object.keys(value)) {
      const regionKey = String(key || "").trim().toUpperCase();
      const raw = value[key];
      if (!Array.isArray(raw)) continue;
      const cleaned = raw
        .map((v) => String(v || "").trim().toUpperCase())
        .filter(Boolean);
      out[regionKey] = Array.from(new Set(cleaned));
    }
    return out;
  };

  const ensureRegionSelected = (regionKey) => {
    const key = String(regionKey || "").trim().toUpperCase();
    if (!key) return;
    setDetailRegions((prev) => (prev.includes(key) ? prev : [...prev, key]));
  };

  const toggleRegion = (regionKey, nextChecked) => {
    const key = String(regionKey || "").trim().toUpperCase();
    if (!key) return;
    setDetailRegions((prev) => {
      if (nextChecked) return prev.includes(key) ? prev : [...prev, key];
      return prev.filter((x) => x !== key);
    });
    if (!nextChecked) {
      setDetailShippingCountries((prev) => {
        const next = { ...(prev || {}) };
        delete next[key];
        return next;
      });
      if (openShippingRegion === key) {
        setOpenShippingRegion("");
        setShippingCountrySearch("");
      }
    }
  };

  const toggleCountryInRegion = (regionKey, countryCode, nextChecked) => {
    const key = String(regionKey || "").trim().toUpperCase();
    const code = String(countryCode || "").trim().toUpperCase();
    if (!key || !code) return;
    ensureRegionSelected(key);
    setDetailShippingCountries((prev) => {
      const base = prev && typeof prev === "object" ? prev : {};
      const existing = Array.isArray(base[key]) ? base[key] : [];
      const set = new Set(existing.map((v) => String(v || "").toUpperCase()));
      if (nextChecked) set.add(code);
      else set.delete(code);
      return { ...base, [key]: Array.from(set) };
    });
  };

  const openCreate = () => {
    if (!storeId) return;
    setIsCreateOpen(true);
  };

  const openCampaignPicker = async () => {
    setCampaignPickerSelectedId(createCampaignId || "");
    setCampaignSearch("");
    setIsCampaignPickerOpen(true);
    await loadCampaigns();
  };

  const createDraft = async () => {
    if (!storeId) return;
    try {
      const res = await api.post(`/stores/${storeId}/discounts`, {
        scope: createScope,
        type: createType,
        audience: createAudience,
        campaignId: createScope === "CAMPAIGN" ? createCampaignId : undefined,
      });
      const created = res.data;
      resetCreateModal();
      setEditingDiscount(created);
      setDetailName("");
      setDetailPercentOff("");
      setDetailFixedAmount("");
      setDetailPromoCode("");
      setDetailMinCartValueMode("NONE");
      setDetailMinCartValue("");
      setDetailShippingFee("");
      setDetailTransactionFeeRate("");
      setDetailTransactionFeeAmount("");
      setDetailTargetProfit("5");
      setDetailRegions([]);
      setDetailShippingCountries({});
      setOpenShippingRegion("");
      setShippingCountrySearch("");
      setShowValidation(false);
      setDetailCampaignId(created?.campaignId ? String(created.campaignId) : "");
    } catch (err) {
      console.error("Error creating discount:", err);
      const msg = err?.response?.data?.message || err?.message || "Failed to create discount.";
      alert(msg);
    }
  };

  const loadCampaigns = useCallback(async () => {
    setCampaignLoading(true);
    setCampaignLoadError("");
    try {
      const res = await api.get("/campaigns", { params: { _: Date.now() } });
      const apiCampaigns = Array.isArray(res.data) ? res.data : [];
      const localCampaigns = getLocalCampaigns();

      const seen = new Set(apiCampaigns.map((c) => normalizeName(c?.title)));
      const merged = [...apiCampaigns];

      for (const c of localCampaigns) {
        const key = normalizeName(c?.title);
        if (!key || seen.has(key)) continue;
        merged.push({
          ...c,
          id: c.id || `local-${key}`,
          createdAt: c.createdAt || new Date().toISOString(),
          _local: true,
        });
        seen.add(key);
      }

      setCampaigns(merged);
    } catch (err) {
      console.error("Error fetching campaigns:", err);
      const rawError = err?.response?.data?.message ?? err?.response?.data?.error ?? err?.message;
      setCampaignLoadError(typeof rawError === "string" ? rawError : "Failed to load campaigns.");
      setCampaigns(getLocalCampaigns());
    } finally {
      setCampaignLoading(false);
    }
  }, []);

  const campaignById = useMemo(() => {
    const map = new Map();
    for (const c of campaigns) map.set(String(c.id), c);
    return map;
  }, [campaigns]);

  const editingDiscountId = editingDiscount?.id;
  const editingDiscountScope = editingDiscount?.scope;

  useEffect(() => {
    if (!editingDiscountId) return;
    if (editingDiscountScope !== "CAMPAIGN") return;
    loadCampaigns();
  }, [editingDiscountId, editingDiscountScope, loadCampaigns]);

  useEffect(() => {
    if (!isCampaignPickerOpen) return;
    loadCampaigns();
  }, [isCampaignPickerOpen, loadCampaigns]);

  const finalize = async (e) => {
    e?.preventDefault?.();
    if (!storeId || !editingDiscount?.id) return;

    const isUpdate = editingDiscount?.status === "READY";

    try {
      const payload = {
        name: detailName,
        percentOff: detailPercentOff,
        fixedAmount: detailFixedAmount,
        promoCode: detailPromoCode,
        minCartValue: detailMinCartValue,
        shippingFee: detailShippingFee,
        transactionFeeRate: detailTransactionFeeRate,
        transactionFeeAmount: detailTransactionFeeAmount,
        targetProfit: detailTargetProfit,
        regions: detailRegions,
        shippingCountries: detailShippingCountries,
        campaignId: detailCampaignId,
      };
      await api.post(`/stores/${storeId}/discounts/${editingDiscount.id}/finalize`, payload);
      setEditingDiscount(null);
      setNotice({ type: "success", text: isUpdate ? "Discount updated." : "Discount created." });
      await refreshDiscounts();
    } catch (err) {
      console.error("Error finalizing discount:", err);
      if (err?.response?.status === 409 && Array.isArray(err?.response?.data?.conflicts)) {
        setProfitabilityConflicts(err.response.data.conflicts);
        setProfitabilityWarnings(Array.isArray(err?.response?.data?.warnings) ? err.response.data.warnings : []);
        setProfitabilitySummary(err?.response?.data?.summary || null);
        setIsProfitabilitySuccessOpen(false);
        setIsProfitabilityOpen(true);
        return;
      }

      const msg = err?.response?.data?.message || err?.message || "Failed to create discount.";
      alert(msg);
    }
  };

  const refreshProfitability = async () => {
    if (!storeId || !editingDiscount?.id) return;

    setProfitabilityLoading(true);
    try {
      const payload = {
        name: detailName,
        percentOff: detailPercentOff,
        fixedAmount: detailFixedAmount,
        promoCode: detailPromoCode,
        minCartValue: detailMinCartValue,
        shippingFee: detailShippingFee,
        transactionFeeRate: detailTransactionFeeRate,
        transactionFeeAmount: detailTransactionFeeAmount,
        targetProfit: detailTargetProfit,
        regions: detailRegions,
        shippingCountries: detailShippingCountries,
        campaignId: detailCampaignId,
      };
      const res = await api.post(
        `/stores/${storeId}/discounts/${editingDiscount.id}/profitability/preview`,
        payload
      );
      const nextConflicts = Array.isArray(res.data?.conflicts) ? res.data.conflicts : [];
      const nextWarnings = Array.isArray(res.data?.warnings) ? res.data.warnings : [];
      setProfitabilityConflicts(nextConflicts);
      setProfitabilityWarnings(nextWarnings);
      setProfitabilitySummary(res.data?.summary || null);
      if (nextConflicts.length === 0) {
        setIsProfitabilityOpen(false);
        setIsProfitabilitySuccessOpen(true);
      }
    } catch (err) {
      console.error("Error previewing profitability:", err);
      const msg = err?.response?.data?.message || err?.message || "Failed to refresh profitability.";
      alert(msg);
    } finally {
      setProfitabilityLoading(false);
    }
  };

  const setActive = async (discount, nextActive) => {
    if (!storeId || !discount?.id) return;

    // Optimistic UI
    setDiscounts((prev) =>
      prev.map((d) => (String(d.id) === String(discount.id) ? { ...d, isActive: nextActive } : d))
    );

    try {
      await api.patch(`/stores/${storeId}/discounts/${discount.id}/active`, { isActive: nextActive });
    } catch (err) {
      console.error("Error setting discount active:", err);
      const msg = err?.response?.data?.message || err?.message || "Failed to update discount.";
      alert(msg);
      // rollback
      setDiscounts((prev) =>
        prev.map((d) => (String(d.id) === String(discount.id) ? { ...d, isActive: discount.isActive } : d))
      );
    }
  };

  const publishChanges = async () => {
    if (!storeId) return;
    try {
      await api.post(`/stores/${storeId}/discounts/publish`);
      setNotice({
        type: "success",
        text: "Changes successfully published. It may take up to 1 minute to see them in your store.",
      });
      await refreshDiscounts();
    } catch (err) {
      console.error("Error publishing discounts:", err);
      const msg = err?.response?.data?.message || err?.message || "Failed to publish changes.";
      alert(msg);
    }
  };

  const makeShareUrl = ({ promoCode }) => {
    const clean = String(promoCode || "").trim();
    if (!storeUrl) return "";
    const base = `${window.location.origin}/store/${storeUrl}`;
    if (!clean) return base;
    return `${base}?code=${encodeURIComponent(clean)}`;
  };

  const copyToClipboard = async (text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setNotice({ type: "success", text: "Link copied to clipboard." });
    } catch {
      try {
        const el = document.createElement("textarea");
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
        setNotice({ type: "success", text: "Link copied to clipboard." });
      } catch (e) {
        console.error(e);
        setNotice({ type: "error", text: "Failed to copy link." });
      }
    }
  };

  const discountDetailsLine = (d) => {
    const parts = [];
    parts.push(d.scope === "STOREWIDE" ? "Store-wide" : "Campaign-wide");

    if (d.type === "FREE_SHIPPING") {
      parts.push("Free shipping");
    }

    if (d.type === "PERCENT_OFF") {
      const pct = Number(d.percentOff || 0);
      parts.push(`${pct}% off all products`);
    }

    if (d.type === "FIXED_AMOUNT") {
      const amt = Number(d.fixedAmount || 0);
      parts.push(`$${amt} off all products`);
    }

    if (d.minCartValue == null) {
      parts.push("No minimum purchase value");
    } else {
      parts.push(`Minimum purchase value $${d.minCartValue}`);
    }

    return parts.join(" • ");
  };

  const openEditDiscount = (d) => {
    if (!d?.id) return;
    setNotice(null);
    setEditingDiscount(d);
    setShowValidation(false);
    setDetailName(d.name || "");
    setDetailPercentOff(d.percentOff != null ? String(d.percentOff) : "");
    setDetailFixedAmount(d.fixedAmount != null ? String(d.fixedAmount) : "");
    setDetailPromoCode(d.promoCode || "");
    if (d.minCartValue == null || d.minCartValue === "") {
      setDetailMinCartValueMode("NONE");
      setDetailMinCartValue("");
    } else {
      setDetailMinCartValueMode("SET");
      setDetailMinCartValue(String(d.minCartValue));
    }
    setDetailRegions(Array.isArray(d.regions) ? d.regions : []);
    setDetailShippingCountries(coerceShippingCountries(d.shippingCountries));
    setOpenShippingRegion("");
    setShippingCountrySearch("");
    setDetailCampaignId(d.campaignId != null ? String(d.campaignId) : "");
  };

  const deleteDiscount = async (d) => {
    if (!storeId || !d?.id) return;
    const idStr = String(d.id);
    // Optimistic UI
    setDiscounts((prev) => prev.filter((x) => String(x.id) !== idStr));
    try {
      await api.delete(`/stores/${storeId}/discounts/${idStr}`);
      setNotice({ type: "success", text: "Discount deleted." });
    } catch (err) {
      console.error("Error deleting discount:", err);
      const msg = err?.response?.data?.message || err?.message || "Failed to delete discount.";
      setNotice({ type: "error", text: msg });
      await refreshDiscounts();
    }
  };

  if (editingDiscount) {
    const isPercent = editingDiscount.type === "PERCENT_OFF";
    const isFixed = editingDiscount.type === "FIXED_AMOUNT";
    const isFreeShipping = editingDiscount.type === "FREE_SHIPPING";
    const isTargeted = editingDiscount.audience === "TARGETED";
    const isCampaign = editingDiscount.scope === "CAMPAIGN";
    const discountTypeHelp = isCampaign
      ? "Offer customers percentage or fixed-amount Discounts."
      : "Offer customers percentage Discounts, or free shipping.";

    const shareUrl = isTargeted ? makeShareUrl({ promoCode: detailPromoCode }) : "";

    const nameOk = Boolean(detailName.trim());
    const percentOk = !isPercent || (Number(detailPercentOff) > 0 && Number(detailPercentOff) <= 100);
    const fixedOk = !isFixed || Number(detailFixedAmount) > 0;
    const regionsOk = !isFreeShipping || (Array.isArray(detailRegions) && detailRegions.length > 0);
    const promoOk = !isTargeted || Boolean(String(detailPromoCode || "").trim());
    const campaignOk = !isCampaign || Boolean(String(detailCampaignId || editingDiscount.campaignId || "").trim());
    const minCartOk =
      detailMinCartValueMode !== "SET" || detailMinCartValue === "" || Number(detailMinCartValue) >= 0;
    const canContinue = nameOk && percentOk && fixedOk && regionsOk && promoOk && campaignOk && minCartOk;

    return (
      <div className="discounts-view-container animate-fade-in font-body">
        {notice?.text && (
          <div className={`discounts-notice ${notice.type === "error" ? "error" : "success"}`} role="status">
            <div className="discounts-notice-content">
              {notice.type === "error" ? (
                <i className="fa-solid fa-circle-exclamation" aria-hidden="true" />
              ) : (
                <i className="fa-solid fa-circle-check" aria-hidden="true" />
              )}
              <span>{notice.text}</span>
            </div>
            <button
              type="button"
              className="discounts-notice-close"
              aria-label="Dismiss notice"
              onClick={() => setNotice(null)}
            >
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
          </div>
        )}

        <div className="discounts-topbar">
          <nav className="breadcrumb-nav" aria-label="Breadcrumb">
            <Link to="#">Dashboard</Link>
            <span className="separator">/</span>
            <Link to="#">My Stores</Link>
            <span className="separator">/</span>
            <Link to="#">{storeName}</Link>
            <span className="separator">/</span>
            <button
              type="button"
              className="breadcrumb-back-link"
              onClick={() => setEditingDiscount(null)}
            >
              <i className="fa-solid fa-chevron-left" aria-hidden="true" />
              <span>store</span>
            </button>
            <span className="separator">/</span>
            <span>New</span>
          </nav>

          <div className="discounts-topbar-actions">
            <button type="button" className="publish-changes-btn" onClick={publishChanges}>
              Publish changes <i className="fa-solid fa-rotate" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="discount-details-header">
          <button
            type="button"
            className="discount-details-back-btn"
            aria-label="Back"
            onClick={() => setEditingDiscount(null)}
          >
            <i className="fa-solid fa-chevron-left" aria-hidden="true" />
          </button>
          <div className="discount-details-header-text">
            <h2>Discount for {storeName}</h2>
            <p className="discount-details-subtitle">
              Boost sales with Storewide Discounts. Create percentage-based or free shipping discounts for all products
              when buyers reach a minimum cart value. Attract more buyers and increase your average order value.
            </p>
          </div>
        </div>

        <hr className="discount-details-divider" />

        <div className="discount-details-section-title">
          {editingDiscount?.status === "READY" ? "Edit Discount" : "Create new Discount"}
        </div>

        <div className="discount-details-layout">
          <div className="discount-details-main">
            <div className="discount-details-card">
              <form
                onSubmit={(e) => {
                  setShowValidation(true);
                  if (!canContinue) {
                    e.preventDefault();
                    return;
                  }
                  finalize(e);
                }}
              >
                <div className="form-group">
                  <label className="form-label">Discount name</label>
                  <input
                    autoFocus
                    type="text"
                    className="form-input"
                    placeholder="e.g. tenpercent"
                    value={detailName}
                    maxLength={80}
                    onChange={(e) => setDetailName(e.target.value)}
                  />
                  <div className="discount-details-muted">Discounts appear on product pages and at checkout.</div>
                </div>

                <div className="form-group">
                  <label className="form-label">Discount type</label>
                  <div className="discounts-field-help">{discountTypeHelp}</div>
                  <div className="discounts-radio-group">
                    {editingDiscount.scope === "STOREWIDE" ? (
                      <>
                        <label className="discounts-radio-item" onClick={() => setEditingDiscount({ ...editingDiscount, type: "PERCENT_OFF" })}>
                          <input type="radio" checked={isPercent} readOnly />
                          <span>Percentage</span>
                        </label>
                        <label className="discounts-radio-item" onClick={() => setEditingDiscount({ ...editingDiscount, type: "FREE_SHIPPING" })}>
                          <input type="radio" checked={isFreeShipping} readOnly />
                          <span>Free shipping in region</span>
                        </label>
                      </>
                    ) : (
                      <>
                        <label className="discounts-radio-item" onClick={() => setEditingDiscount({ ...editingDiscount, type: "PERCENT_OFF" })}>
                          <input type="radio" checked={isPercent} readOnly />
                          <span>Percentage</span>
                        </label>
                        <label className="discounts-radio-item" onClick={() => setEditingDiscount({ ...editingDiscount, type: "FIXED_AMOUNT" })}>
                          <input type="radio" checked={isFixed} readOnly />
                          <span>Fixed amount</span>
                        </label>
                      </>
                    )}
                  </div>
                </div>

                {isPercent && (
                  <div className="form-group">
                    <label className="form-label">Discount value</label>
                    <div className="discounts-value-row">
                      <input
                        type="number"
                        className="form-input discounts-value-input"
                        placeholder=""
                        value={detailPercentOff}
                        min="1"
                        max="100"
                        onChange={(e) => setDetailPercentOff(e.target.value)}
                      />
                      <span className="discounts-value-suffix" aria-hidden="true">%</span>
                    </div>
                  </div>
                )}

                {isCampaign && isFixed && (
                  <div className="form-group">
                    <label className="form-label">Discount value</label>
                    <div className="discounts-mincart-row discounts-value-money-row">
                      <div className="discounts-mincart-prefix" aria-hidden="true">$</div>
                      <input
                        type="number"
                        className="form-input discounts-mincart-input"
                        placeholder=""
                        value={detailFixedAmount}
                        min="0"
                        onChange={(e) => setDetailFixedAmount(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {isFreeShipping && (
                  <div className="form-group">
                    <label className="form-label">Regions</label>
                    <div className="discounts-region-list" role="group" aria-label="Shipping regions">
                      {Object.keys(REGION_LABELS).map((key) => {
                        const checked = detailRegions.includes(key);
                        const open = openShippingRegion === key;
                        const allCountries = Array.isArray(SHIPPING_COUNTRIES?.[key]) ? SHIPPING_COUNTRIES[key] : [];
                        const selectedCodes = Array.isArray(detailShippingCountries?.[key]) ? detailShippingCountries[key] : [];
                        const q = String(open ? shippingCountrySearch : "").trim().toLowerCase();
                        const visibleCountries = !q
                          ? allCountries
                          : allCountries.filter((c) => String(c?.name || "").toLowerCase().includes(q) || String(c?.code || "").toLowerCase().includes(q));

                        return (
                          <div key={key} className="discounts-region-block">
                            <div className="discounts-region-select-row">
                              <label className="discounts-region-select-left">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(e) => toggleRegion(key, e.target.checked)}
                                />
                                <span className="discounts-region-select-label">{REGION_LABELS[key]}</span>
                              </label>

                              <button
                                type="button"
                                className="discounts-region-select-caret-btn"
                                aria-label={open ? "Collapse" : "Expand"}
                                onClick={() => {
                                  if (!checked) toggleRegion(key, true);
                                  setOpenShippingRegion((prev) => (prev === key ? "" : key));
                                  setShippingCountrySearch("");
                                }}
                              >
                                <i
                                  className={`fa-solid fa-chevron-${open ? "up" : "down"} discounts-region-select-caret`}
                                  aria-hidden="true"
                                />
                              </button>
                            </div>

                            {open && (
                              <div className="discounts-region-panel">
                                <div className="discounts-region-panel-top">
                                  <div className="discounts-region-panel-search">
                                    <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
                                    <input
                                      className="discounts-region-panel-search-input"
                                      placeholder={`Search ${REGION_LABELS[key]} countries`}
                                      value={shippingCountrySearch}
                                      onChange={(e) => setShippingCountrySearch(e.target.value)}
                                    />
                                  </div>
                                  <div className="discounts-region-panel-count">
                                    {selectedCodes.length} selected
                                  </div>
                                </div>

                                <div className="discounts-region-country-list">
                                  {visibleCountries.map((c) => {
                                    const code = String(c.code || "").toUpperCase();
                                    const isChecked = selectedCodes.includes(code);
                                    return (
                                      <label key={code} className="discounts-region-country-item">
                                        <input
                                          type="checkbox"
                                          checked={isChecked}
                                          onChange={(e) => toggleCountryInRegion(key, code, e.target.checked)}
                                        />
                                        <span>{c.name}</span>
                                        <span className="discounts-region-country-code">{code}</span>
                                      </label>
                                    );
                                  })}

                                  {visibleCountries.length === 0 && (
                                    <div className="discounts-region-empty">No countries found.</div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {showValidation && !regionsOk && (
                      <div className="discounts-validation-error">
                        Choose one or more Shipping Regions to continue.
                      </div>
                    )}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Minimum cart value</label>
                  <div className="discount-details-muted" style={{ marginBottom: "1.2rem" }}>
                    To be eligible for this Discount, customers must meet the minimum cart value set by you. Your store
                    will display a banner to indicate this requirement.
                  </div>
                  <div className="discounts-radio-group">
                    <label className="discounts-radio-item">
                      <input
                        type="radio"
                        name="mcv"
                        checked={detailMinCartValueMode === "NONE"}
                        onChange={() => {
                          setDetailMinCartValueMode("NONE");
                          setDetailMinCartValue("");
                        }}
                      />
                      <span>None</span>
                    </label>
                    <label className="discounts-radio-item">
                      <input
                        type="radio"
                        name="mcv"
                        checked={detailMinCartValueMode === "SET"}
                        onChange={() => {
                          setDetailMinCartValueMode("SET");
                          setDetailMinCartValue((prev) => {
                            const v = String(prev || "").trim();
                            return v === "" ? "0" : v;
                          });
                        }}
                      />
                      <span>Set amount</span>
                    </label>
                  </div>
                  <div className="discounts-mincart-row">
                    <div className="discounts-mincart-prefix" aria-hidden="true">$</div>
                    <input
                      type="number"
                      className="form-input discounts-mincart-input"
                      placeholder=""
                      value={detailMinCartValue}
                      min="0"
                      disabled={detailMinCartValueMode !== "SET"}
                      onChange={(e) => setDetailMinCartValue(e.target.value)}
                    />
                  </div>
                </div>


                {isTargeted && (
                  <div className="form-group">
                    <label className="form-label">Promo code</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder=""
                      value={detailPromoCode}
                      onChange={(e) => setDetailPromoCode(e.target.value)}
                    />
                    <div className="discounts-promo-url">
                      <div className="discounts-promo-url-label">Share URL</div>
                      <div className="discounts-promo-url-row">
                        <input className="form-input" readOnly value={shareUrl} />
                        <button
                          type="button"
                          className="btn-cancel discounts-copy-btn"
                          onClick={() => copyToClipboard(shareUrl)}
                          disabled={!shareUrl}
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="discount-details-footer">
                  <button
                    type="button"
                    className="discount-details-link"
                    onClick={() => {
                      setEditingDiscount(null);
                      refreshDiscounts();
                    }}
                  >
                    Discard
                  </button>
                  <button type="submit" className="btn-submit" disabled={!canContinue}>
                    Continue
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="discount-details-sidebar">
            <div className="discount-details-sidecard">
              <div className="discount-details-sidecard-title">
                Discount Summary <i className="fa-solid fa-circle-info discounts-sidecard-info" aria-hidden="true" />
              </div>
              <div className="discount-details-sidecard-text">
                {editingDiscount.audience === "TARGETED" ? "Targeted" : "Untargeted"} Discounts<br />
                {editingDiscount.audience === "EVERYONE"
                  ? "Available to all users and does not require a specific link."
                  : "Only customers with the promo URL can use it."}
              </div>
            </div>
            <div className="discount-details-sidecard">
              <div className="discount-details-sidecard-title">
                <i className="fa-solid fa-tag discounts-sidecard-icon" aria-hidden="true" /> Discount Types
              </div>
              <div className="discount-details-sidecard-text">
                {editingDiscount.type === "FREE_SHIPPING" && "Free shipping in region"}
                {editingDiscount.type === "PERCENT_OFF" && "Percentage-based Discount"}
                {editingDiscount.type === "FIXED_AMOUNT" && "Fixed-amount Discount"}
              </div>
            </div>
          </div>
        </div>

        {isProfitabilityOpen && (
          <div className="modal-overlay" onClick={() => setIsProfitabilityOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Price adjustments necessary</h2>
                <button className="close-modal-btn" onClick={() => setIsProfitabilityOpen(false)} type="button">
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              <div className="modal-body">
                <p className="discounts-description" style={{ marginBottom: "1.6rem" }}>
                  <strong style={{ color: "#dc2626" }}>{profitabilityConflicts.length} campaigns</strong> must have a higher retail price to apply this discount.
                </p>

                {profitabilitySummary && (
                  <p className="discounts-description" style={{ marginBottom: "1.6rem" }}>
                    Checked {Number(profitabilitySummary.analyzedVariants || 0)} variants • Target profit {formatMoney(profitabilitySummary.targetProfit || 0)}
                  </p>
                )}

                {profitabilityConflicts.map((c) => (
                  <div key={c.campaignId} className="discounts-profit-card">
                    <div className="discounts-profit-card-title">
                      <strong>{c.campaignTitle}</strong>
                      {c.baseProductName ? <span className="discounts-profit-muted">({c.baseProductName})</span> : null}
                    </div>
                    <div className="discounts-profit-table">
                      <div className="discounts-profit-row discounts-profit-head">
                        <div>Variant</div>
                        <div>Retail</div>
                        <div>Discount</div>
                        <div>Min retail</div>
                        <div>Profit</div>
                      </div>
                      {(c.variants || []).map((v) => (
                        <div key={v.campaignProductId} className="discounts-profit-row">
                          <div>{v.variant}</div>
                          <div>{formatMoney(v.retailPrice)}</div>
                          <div>{formatMoney(v.discount)}</div>
                          <div>{v.minimumRetailPrice != null ? formatMoney(v.minimumRetailPrice) : "-"}</div>
                          <div className="discounts-profit-negative">{formatMoney(v.profit)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {profitabilityWarnings.length > 0 && (
                  <div className="discounts-profit-card">
                    <div className="discounts-profit-card-title">
                      <strong>Low margin warning (&lt; 10%)</strong>
                    </div>
                    <div className="discounts-profit-table">
                      <div className="discounts-profit-row discounts-profit-head">
                        <div>Variant</div>
                        <div>Campaign</div>
                        <div>Profit</div>
                        <div>Margin</div>
                        <div>Min retail</div>
                      </div>
                      {profitabilityWarnings.map((w) => (
                        <div key={`${w.campaignProductId}-${w.campaignId}`} className="discounts-profit-row">
                          <div>{w.variant || "Variant"}</div>
                          <div>{w.campaignTitle || "Campaign"}</div>
                          <div>{formatMoney(w.profit)}</div>
                          <div>{w.marginPercent != null ? `${Number(w.marginPercent).toFixed(2)}%` : "-"}</div>
                          <div>{w.minimumRetailPrice != null ? formatMoney(w.minimumRetailPrice) : "-"}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsProfitabilityOpen(false)}>
                  Close
                </button>
                <button type="button" className="btn-submit" onClick={refreshProfitability} disabled={profitabilityLoading}>
                  {profitabilityLoading ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </div>
          </div>
        )}

        {isProfitabilitySuccessOpen && (
          <div className="modal-overlay" onClick={() => setIsProfitabilitySuccessOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Price adjustments successful</h2>
                <button className="close-modal-btn" onClick={() => setIsProfitabilitySuccessOpen(false)} type="button">
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              <div className="modal-body" style={{ minHeight: "32rem", display: "grid", placeItems: "center" }}>
                <p className="discounts-description" style={{ textAlign: "center", marginBottom: 0 }}>
                  All products are now profitable.<br />
                  Close this modal and create the discount.
                </p>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-submit" onClick={() => setIsProfitabilitySuccessOpen(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="discounts-view-container animate-fade-in font-body">
      {notice?.text && (
        <div className={`discounts-notice ${notice.type === "error" ? "error" : "success"}`} role="status">
          <div className="discounts-notice-content">
            {notice.type === "error" ? (
              <i className="fa-solid fa-circle-exclamation" aria-hidden="true" />
            ) : (
              <i className="fa-solid fa-circle-check" aria-hidden="true" />
            )}
            <span>{notice.text}</span>
          </div>
          <button
            type="button"
            className="discounts-notice-close"
            aria-label="Dismiss notice"
            onClick={() => setNotice(null)}
          >
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>
      )}
      {/* Top Header Action */}
      <div className="header-actions-area">
        <button className="publish-changes-btn" onClick={publishChanges}>
          Publish changes
          <i className="fa-solid fa-arrows-rotate"></i>
        </button>
        <button className="btn-submit" onClick={openCreate}>
          Create a discount
          <i className="fa-solid fa-plus ms-2"></i>
        </button>
      </div>

      {/* Breadcrumbs */}
      <nav className="breadcrumb-nav">
        <Link to="#" className="hover:underline">Dashboard</Link>
        <span className="separator">/</span>
        <Link to="#" className="hover:underline">My Stores</Link>
        <span className="separator">/</span>
        <Link to="#" className="hover:underline">{storeName}</Link>
        <span className="separator">/</span>
        <span>All</span>
      </nav>

      {/* Store Header */}
      <div className="store-header">
        <div className="store-title-row">
          <h1>{storeName}</h1>
          <span className="currency-badge">USD / $</span>
          <Link to={`/store/${storeUrl}`} target="_blank" className="go-to-store">
            Go to store
            <i className="fa-solid fa-arrow-up-right-from-square"></i>
          </Link>
        </div>
        <hr className="section-divider" />
      </div>

      {/* Created Discounts Section */}
      <div className="discounts-section">
        <h2>Created Discounts</h2>
        <p className="discounts-description">
          View and manage discounts, activate or deactivate them, share them via a link, and delete them.
        </p>

        {/* Tabbed Card */}
        <div className="discounts-tabs-card">
          <div className="tabs-header">
            <div className="tabs-list">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="tabs-filter-icon">
              <i className="fa-solid fa-sliders"></i>
            </div>
          </div>

          {loading ? (
            <div className="discounts-empty-state">
              <p className="discounts-description" style={{ marginBottom: 0 }}>
                Loading discounts...
              </p>
            </div>
          ) : filteredDiscounts.length === 0 ? (
            <div className="discounts-empty-state">
              <div className="empty-state-icon-wrapper">
                <i className="fa-solid fa-tag">
                  <i className="fa-solid fa-plus plus-icon"></i>
                </i>
              </div>
              <h3>No discounts yet</h3>
              <p>Create your first discount to start offering promotions.</p>
              <button type="button" className="btn-submit discounts-empty-cta" onClick={openCreate}>
                Create a discount
                <i className="fa-solid fa-plus"></i>
              </button>
            </div>
          ) : (
            (() => {
              const total = filteredDiscounts.length;
              const safeRows = Number(rowsPerPage) > 0 ? Number(rowsPerPage) : 100;
              const maxPage = Math.max(1, Math.ceil(total / safeRows));
              const safePage = Math.min(Math.max(1, page), maxPage);
              const startIdx = (safePage - 1) * safeRows;
              const endIdxExclusive = Math.min(total, startIdx + safeRows);
              const items = filteredDiscounts.slice(startIdx, endIdxExclusive);

              return (
                <>
                  <div className="discounts-table">
                    <div className="discounts-table-head">
                      <div>DISCOUNT DETAILS</div>
                      <div>ACTIVE</div>
                      <div>DATE CREATED</div>
                      <div>AUDIENCE</div>
                      <div aria-label="Actions" />
                    </div>

                    {items.map((d) => {
                      const canCopy = d.isPublished && d.isActive && d.status === "READY";
                      const linkToCopy = d.audience === "TARGETED" && d.promoCode
                        ? makeShareUrl({ promoCode: d.promoCode })
                        : makeShareUrl({ promoCode: "" });

                      return (
                        <div key={d.id} className="discounts-table-row">
                          <div className="discounts-cell details">
                            <div className="discounts-cell-title">{d.name || "Untitled"}</div>
                            <div className="discounts-cell-sub">{discountDetailsLine(d)}</div>
                          </div>

                          <div className="discounts-cell">
                            <label
                              className="discount-toggle"
                              title={d.status === "READY" ? "Toggle active" : "Finalize to enable"}
                            >
                              <input
                                type="checkbox"
                                checked={!!d.isActive}
                                disabled={d.status !== "READY"}
                                onChange={(e) => setActive(d, e.target.checked)}
                              />
                              <span className="discount-toggle-slider" />
                            </label>
                          </div>

                          <div className="discounts-cell">{formatDiscountDate(d.createdAt) || "—"}</div>
                          <div className="discounts-cell">{d.audience === "TARGETED" ? "Targeted" : "Everyone"}</div>

                          <div className="discounts-cell actions">
                            <button
                              type="button"
                              className="action-icon-btn"
                              title={canCopy ? "Copy share URL" : "Publish and activate to enable"}
                              disabled={!canCopy}
                              onClick={() => copyToClipboard(linkToCopy)}
                            >
                              <i className="fa-solid fa-link"></i>
                            </button>
                            <button
                              type="button"
                              className="action-icon-btn"
                              title="Edit"
                              onClick={() => openEditDiscount(d)}
                            >
                              <i className="fa-solid fa-pen"></i>
                            </button>
                            <button
                              type="button"
                              className="action-icon-btn delete"
                              title="Delete"
                              onClick={() => deleteDiscount(d)}
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="discounts-table-footer">
                    <div className="discounts-footer-left">
                      <span>Rows per page:</span>
                      <select
                        className="discounts-rows-select"
                        value={rowsPerPage}
                        onChange={(e) => setRowsPerPage(Number(e.target.value))}
                      >
                        {[10, 25, 50, 100].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="discounts-footer-right">
                      <span>
                        {total === 0 ? "0" : `${startIdx + 1}–${endIdxExclusive}`} of {total}
                      </span>
                      <button
                        type="button"
                        className="discounts-page-btn"
                        disabled={safePage <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        aria-label="Previous"
                      >
                        <i className="fa-solid fa-chevron-left"></i>
                      </button>
                      <button
                        type="button"
                        className="discounts-page-btn"
                        disabled={safePage >= maxPage}
                        onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
                        aria-label="Next"
                      >
                        <i className="fa-solid fa-chevron-right"></i>
                      </button>
                    </div>
                  </div>
                </>
              );
            })()
          )}
        </div>
      </div>

      {/* ── CREATE DISCOUNT MODAL (Mayzing-style) ── */}
      {isCreateOpen && (
        <div className="modal-overlay" onClick={resetCreateModal}>
          <div className="modal-content discounts-create-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create a discount</h2>
              <button className="close-modal-btn" onClick={resetCreateModal} type="button">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="discounts-create-modal">
                <div className="discounts-create-section">
                  <div className="discounts-create-section-title">
                    <strong>Campaign wide</strong>
                    <button
                      type="button"
                      className="discounts-select-link"
                      onClick={() => {
                        setCreateScope("CAMPAIGN");
                        openCampaignPicker();
                      }}
                    >
                      Select
                    </button>
                  </div>

                  {createScope === "CAMPAIGN" && createCampaignId && (
                    <div className="discounts-selected-campaign">
                      Selected: {campaignById.get(String(createCampaignId))?.title || "Campaign"}
                    </div>
                  )}

                  <label className="discounts-radio-item">
                    <input
                      type="radio"
                      name="create-discount-type"
                      checked={createScope === "CAMPAIGN" && createType === "PERCENT_OFF"}
                      onChange={() => {
                        setCreateScope("CAMPAIGN");
                        setCreateType("PERCENT_OFF");
                        loadCampaigns();
                      }}
                    />
                    <span>Percent off</span>
                  </label>
                  <label className="discounts-radio-item">
                    <input
                      type="radio"
                      name="create-discount-type"
                      checked={createScope === "CAMPAIGN" && createType === "FIXED_AMOUNT"}
                      onChange={() => {
                        setCreateScope("CAMPAIGN");
                        setCreateType("FIXED_AMOUNT");
                        loadCampaigns();
                      }}
                    />
                    <span>Fixed amount</span>
                  </label>
                </div>

                <div className="discounts-create-divider" />

                <div className="discounts-create-section">
                  <div className="discounts-create-section-title">
                    <strong>Store wide</strong>
                  </div>
                  <label className="discounts-radio-item">
                    <input
                      type="radio"
                      name="create-discount-type"
                      checked={createScope === "STOREWIDE" && createType === "PERCENT_OFF"}
                      onChange={() => {
                        setCreateScope("STOREWIDE");
                        setCreateType("PERCENT_OFF");
                        setCreateCampaignId("");
                      }}
                    />
                    <span>Percent off</span>
                  </label>
                  <label className="discounts-radio-item">
                    <input
                      type="radio"
                      name="create-discount-type"
                      checked={createScope === "STOREWIDE" && createType === "FREE_SHIPPING"}
                      onChange={() => {
                        setCreateScope("STOREWIDE");
                        setCreateType("FREE_SHIPPING");
                        setCreateCampaignId("");
                      }}
                    />
                    <span>Free shipping</span>
                  </label>
                </div>

                <div className="discounts-create-divider" />

                <div className="discounts-create-section">
                  <div className="discounts-create-section-title">
                    <strong>Select an audience</strong>
                  </div>
                  <label className="discounts-radio-item">
                    <input
                      type="radio"
                      name="create-discount-audience"
                      checked={createAudience === "EVERYONE"}
                      onChange={() => setCreateAudience("EVERYONE")}
                    />
                    <span>Everyone (all customers will see it on the product description page)</span>
                  </label>
                  <label className="discounts-radio-item">
                    <input
                      type="radio"
                      name="create-discount-audience"
                      checked={createAudience === "TARGETED"}
                      onChange={() => setCreateAudience("TARGETED")}
                    />
                    <span>Targeted (only customers with a promo code URL can use it)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={resetCreateModal}>
                View my discounts
              </button>
              <button
                type="button"
                className="btn-submit"
                onClick={createDraft}
                disabled={
                  !createScope ||
                  !createType ||
                  !createAudience ||
                  (createScope === "CAMPAIGN" && !createCampaignId)
                }
              >
                Create Discount +
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SELECT CAMPAIGNS MODAL (max 1) ── */}
      {isCampaignPickerOpen && (
        <div
          className="modal-overlay"
          onClick={() => {
            setIsCampaignPickerOpen(false);
            setCampaignSearch("");
          }}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "92rem" }}>
            <div className="modal-header">
              <h2>Select Campaigns</h2>
              <button
                className="close-modal-btn"
                onClick={() => {
                  setIsCampaignPickerOpen(false);
                  setCampaignSearch("");
                }}
                type="button"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="modal-body" style={{ paddingTop: "1.6rem" }}>
              <div className="campaign-picker-search">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input
                  className="campaign-picker-search-input"
                  placeholder="Search campaigns"
                  value={campaignSearch}
                  onChange={(e) => setCampaignSearch(e.target.value)}
                />
              </div>

              <div className="campaign-picker-table">
                <div className="campaign-picker-head">
                  <div className="campaign-picker-count">
                    {campaignPickerSelectedId ? "1" : "0"} / 1
                  </div>
                  <div className="campaign-picker-col">CAMPAIGN NAME</div>
                  <div className="campaign-picker-col">DATE CREATED</div>
                  <div className="campaign-picker-col">PRODUCTS</div>
                  <div className="campaign-picker-col">UNITS SOLD</div>
                </div>

                <div className="campaign-picker-body">
                  {campaignLoading ? (
                    <div className="campaign-picker-empty">Loading campaigns...</div>
                  ) : campaignLoadError ? (
                    <div className="campaign-picker-empty">
                      {campaignLoadError}
                      <button type="button" className="discounts-select-link" onClick={loadCampaigns} style={{ marginLeft: "0.8rem" }}>
                        Refresh
                      </button>
                    </div>
                  ) : (campaigns || [])
                      .filter((c) => {
                        const q = String(campaignSearch || "").trim().toLowerCase();
                        if (!q) return true;
                        const title = String(c?.title || "").toLowerCase();
                        return title.includes(q);
                      })
                      .map((c) => {
                        const idStr = String(c.id);
                        const checked = campaignPickerSelectedId === idStr;
                        const productsCount = Array.isArray(c.products) ? c.products.length : 0;
                        const thumbUrl =
                          c?.baseProduct?.image ||
                          c?.products?.[0]?.previewUrl ||
                          c?.products?.[0]?.artwork?.fileUrl ||
                          "";
                        return (
                          <div
                            key={idStr}
                            className="campaign-picker-row"
                            onClick={() => setCampaignPickerSelectedId(checked ? "" : idStr)}
                          >
                            <div className="campaign-picker-cell">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => setCampaignPickerSelectedId(checked ? "" : idStr)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            <div className="campaign-picker-cell campaign-picker-name">
                              {thumbUrl ? (
                                <img className="campaign-picker-thumb" src={thumbUrl} alt="" />
                              ) : (
                                <div className="campaign-picker-thumb" aria-hidden="true" />
                              )}
                              <div>
                                <div className="campaign-picker-title">{c.title || "Untitled"}</div>
                                <div className="campaign-picker-slug">/{String(c.slug || "").trim() || idStr}</div>
                              </div>
                            </div>
                            <div className="campaign-picker-cell">{formatCampaignDate(c.createdAt) || "—"}</div>
                            <div className="campaign-picker-cell">{productsCount}</div>
                            <div className="campaign-picker-cell">0</div>
                          </div>
                        );
                      })}

                  {!campaignLoading && !campaignLoadError && (campaigns || []).length === 0 && (
                    <div className="campaign-picker-empty">No campaigns found. Create a campaign first, then refresh.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-submit"
                onClick={() => {
                  if (!campaignPickerSelectedId) return;
                  setCreateScope("CAMPAIGN");
                  setCreateCampaignId(campaignPickerSelectedId);
                  setIsCampaignPickerOpen(false);
                  setCampaignSearch("");
                }}
                disabled={!campaignPickerSelectedId}
              >
                Add Campaigns +
              </button>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => {
                  setIsCampaignPickerOpen(false);
                  setCampaignSearch("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscountsView;
