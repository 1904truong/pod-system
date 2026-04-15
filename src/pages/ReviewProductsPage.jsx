import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/ReviewProductsPage.css";
import api from "../utils/api";
import { mockupList } from "../data/mockups";
import MockupWithDesign from "../components/MockupWithDesign";

const clampText = (value, max) => {
  if (typeof value !== "string") return "";
  return value.length > max ? value.slice(0, max) : value;
};

const REVIEW_DRAFT_KEY = "pod-system:review-draft:v1";
const LOCAL_CAMPAIGNS_KEY = "pod-system:campaigns:v1";
const DESIGN_DRAFTS_KEY_PREFIX = "pod-system:designer-drafts:v1";

const safeJsonParse = (v) => {
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
};

const safeJsonArray = (v) => {
  const parsed = safeJsonParse(v);
  return Array.isArray(parsed) ? parsed : [];
};

const normalizeName = (v) => String(v || "").trim().toLowerCase();

const slugify = (value) => {
  const input = (value || "").trim().toLowerCase();
  const noMarks = input.normalize("NFD").replace(/\p{Diacritic}+/gu, "");
  return noMarks
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

const formatRange = (min, max) => {
  const f = (n) => `$${Number(n).toFixed(2)}`;
  if (min === max) return f(min);
  return `${f(min)} - ${f(max)}`;
};

const normalizeId = (v) => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
};

const safeJsonObject = (v) => {
  const parsed = safeJsonParse(v);
  return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
};

const ReviewProductsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const products = useMemo(() => {
    const passed = location.state?.products;
    if (Array.isArray(passed) && passed.length) return passed;
    return [
      {
        id: 1,
        name: "Classic Unisex T-shirt",
        models: "Gildan 64000, Gildan 5000",
        img: null,
      },
    ];
  }, [location.state]);

  const storeName = location.state?.storeName || "Store";

  const retailById = location.state?.retailById || {};
  const compareAtById = location.state?.compareAtById || {};
  const compareAtEnabled = location.state?.compareAtEnabled ?? true;

  const mockupById = useMemo(() => new Map(mockupList.map((m) => [String(m.id), m])), []);

  const pendingCampaign = location.state?.pendingCampaign;
  const designDraftStorageKey =
    location.state?.designDraftStorageKey ||
    (pendingCampaign?.id || pendingCampaign?.slug
      ? `${DESIGN_DRAFTS_KEY_PREFIX}:${String(pendingCampaign?.id || pendingCampaign?.slug)}`
      : null);

  const [draft, setDraft] = useState(() => {
    const stored = safeJsonParse(localStorage.getItem(REVIEW_DRAFT_KEY) || "");
    const base = {
      campaignName: pendingCampaign?.title || "",
      campaignSlug: pendingCampaign?.slug || "",
      productEdits: {},
    };
    return stored && typeof stored === "object" ? { ...base, ...stored } : base;
  });

  useEffect(() => {
    setDraft((prev) => {
      const next = { ...prev, productEdits: { ...(prev.productEdits || {}) } };
      for (const p of products) {
        if (!next.productEdits[p.id]) {
          next.productEdits[p.id] = {
            name: p.name || "",
            aboutDesign: "",
          };
        } else {
          if (typeof next.productEdits[p.id].name !== "string") next.productEdits[p.id].name = p.name || "";
          if (typeof next.productEdits[p.id].aboutDesign !== "string") next.productEdits[p.id].aboutDesign = "";
        }
      }
      return next;
    });
  }, [products]);

  useEffect(() => {
    localStorage.setItem(REVIEW_DRAFT_KEY, JSON.stringify(draft));
  }, [draft]);

  const [saveError, setSaveError] = useState({ campaignName: "", campaignSlug: "", duplicate: "" });
  const [isSaving, setIsSaving] = useState(false);

  const [mockupModal, setMockupModal] = useState({ open: false, productId: null });
  const [mockupDraft, setMockupDraft] = useState({ mainId: null, additionalIds: [] });

  const designerDraftsById = useMemo(() => {
    if (!designDraftStorageKey) return {};
    const parsed = safeJsonObject(localStorage.getItem(designDraftStorageKey) || "");
    return parsed || {};
  }, [designDraftStorageKey]);

  const openMockupModal = (productId) => {
    const existing = draft.productEdits?.[productId]?.mockups;
    const defaultMainId = mockupList[0]?.id ?? 1;
    const defaultAdditional = (mockupList[1]?.id ? [mockupList[1].id] : []).filter(Boolean);

    const existingMain = normalizeId(existing?.mainId);
    const existingAdditional = Array.isArray(existing?.additionalIds)
      ? existing.additionalIds.map(normalizeId).filter(Boolean)
      : null;

    const mainId = existingMain ?? defaultMainId;
    const additionalIds = (existingAdditional ?? defaultAdditional)
      .map(normalizeId)
      .filter((id) => id && id !== mainId);

    setMockupDraft({
      mainId,
      additionalIds,
    });
    setMockupModal({ open: true, productId });
  };

  const closeMockupModal = () => {
    setMockupModal({ open: false, productId: null });
  };

  const saveMockupSelection = () => {
    const productId = mockupModal.productId;
    if (!productId) return;

    const mainId = normalizeId(mockupDraft.mainId) ?? (mockupList[0]?.id ?? 1);
    const additionalIds = Array.from(new Set((mockupDraft.additionalIds || []).map(normalizeId).filter(Boolean))).filter(
      (id) => id !== mainId
    );

    setDraft((prev) => ({
      ...prev,
      productEdits: {
        ...(prev.productEdits || {}),
        [productId]: {
          ...(prev.productEdits?.[productId] || {}),
          mockups: {
            mainId,
            additionalIds,
          },
        },
      },
    }));

    closeMockupModal();
  };

  const toggleAdditionalMockup = (id) => {
    setMockupDraft((prev) => {
      const nextId = normalizeId(id);
      const mainId = normalizeId(prev.mainId);
      if (!nextId) return prev;
      if (nextId === mainId) return { ...prev, additionalIds: (prev.additionalIds || []).filter((x) => x !== nextId) };
      const set = new Set(prev.additionalIds || []);
      if (set.has(nextId)) set.delete(nextId);
      else set.add(nextId);
      return { ...prev, additionalIds: Array.from(set) };
    });
  };

  const saveAndContinue = async () => {
    setSaveError({ campaignName: "", campaignSlug: "", duplicate: "" });

    const title = (draft.campaignName || "").trim();
    let slug = (draft.campaignSlug || "").trim();
    if (!slug && title) {
      slug = slugify(title);
      setDraft((prev) => ({ ...prev, campaignSlug: slug }));
    }

    const errors = { campaignName: "", campaignSlug: "", duplicate: "" };
    if (!title) errors.campaignName = "Campaign name is required";
    if (!slug) errors.campaignSlug = "Campaign URL is required";

    if (errors.campaignName || errors.campaignSlug) {
      setSaveError(errors);
      return;
    }

    const local = safeJsonArray(localStorage.getItem(LOCAL_CAMPAIGNS_KEY) || "");
    const key = normalizeName(title);
    
    // Uniqueness check, skipping the current editing campaign
    const otherCampaigns = pendingCampaign?.id 
      ? local.filter(c => String(c.id) !== String(pendingCampaign.id))
      : local;

    const localDup = otherCampaigns.some((c) => normalizeName(c.title) === key);
    if (localDup) {
      setSaveError({ ...errors, duplicate: "Campaign name already exists" });
      return;
    }

    const slugKey = normalizeName(slug);
    const localSlugDup = otherCampaigns.some((c) => normalizeName(c.slug) === slugKey);
    if (localSlugDup) {
      setSaveError({ ...errors, campaignSlug: "That campaign slug is taken. Try another." });
      return;
    }

    setIsSaving(true);
    try {
      // Best-effort check against API campaigns if user is logged in.
      try {
        const res = await api.get("/campaigns");
        const apiCampaigns = Array.isArray(res.data) ? res.data : [];
        const apiDup = apiCampaigns.some((c) => normalizeName(c.title) === key && String(c.id) !== String(pendingCampaign?.id));
        if (apiDup) {
          setSaveError({ ...errors, duplicate: "Campaign name already exists" });
          return;
        }

        const apiSlugDup = apiCampaigns.some((c) => normalizeName(c.slug) === slugKey && String(c.id) !== String(pendingCampaign?.id));
        if (apiSlugDup) {
          setSaveError({ ...errors, campaignSlug: "That campaign slug is taken. Try another." });
          return;
        }
      } catch {
        // ignore API check failures
      }

      const campaignProducts = products.map((p) => {
        const perProduct = draft.productEdits?.[p.id] || {};
        const retailRng = retailById?.[p.id] || { min: 21.99, max: 21.99 };

        const fullDraft = designerDraftsById ? designerDraftsById[String(p.id)] || null : null;
        
        // IMPORTANT: Strip the massive designImageDataUrl (Base64) before saving to LOCAL_CAMPAIGNS_KEY.
        // The full draft is already safe in its own localStorage entry.
        // This prevents the QuotaExceededError in localStorage.
        let designerDraft = null;
        if (fullDraft) {
          const { designImageDataUrl, ...rest } = fullDraft;
          designerDraft = rest;
        }

        return {
          id: p.id,
          title: perProduct.name || p.name || "Product",
          name: perProduct.name || p.name || "Product",
          models: p.models || p.brand || "",
          category: p.category || "",
          subCategory: p.subCategory || p.subcategory || "",
          img: p.img || null,
          mockups: perProduct.mockups || null,
          retailPrice: retailRng.min, 
          designerDraft,
        };
      });


      let nextLocal;
      const targetId = pendingCampaign?.id;

      if (targetId) {
        // UPDATE Existing
        nextLocal = local.map(c => {
          if (String(c.id) === String(targetId)) {
            const existingProducts = c.products || [];
            const newProducts = campaignProducts;

            const updatedProductsMap = new Map();
            existingProducts.forEach(p => updatedProductsMap.set(String(p.id), p));
            newProducts.forEach(p => updatedProductsMap.set(String(p.id), p));

            const finalProducts = Array.from(updatedProductsMap.values());

            return {
              ...c,
              title,
              slug,
              products: finalProducts,
              coverProductId: c.coverProductId ?? finalProducts[0]?.id ?? null,
            };
          }
          return c;
        });
      } else {
        // CREATE New
        const created = {
          id: `local-${Date.now()}`,
          title,
          slug,
          createdAt: new Date().toISOString(),
          products: campaignProducts,
          coverProductId: campaignProducts[0]?.id ?? null,
        };
        nextLocal = [created, ...local];
      }

      localStorage.setItem(LOCAL_CAMPAIGNS_KEY, JSON.stringify(nextLocal));
      localStorage.removeItem(REVIEW_DRAFT_KEY);

      navigate("/addpage", {
        state: {
          dashActive: "Campaigns",
          campaignEditId: targetId || nextLocal[0]?.id,
        },
      });
    } catch (err) {
      console.error("[ReviewProductsPage] Save failed:", err);
      alert("Failed to save campaign. Your browser's local storage might be full. Try removing some old campaigns.");
    } finally {
      setIsSaving(false);
    }
  };

  const descriptionText =
    "The soft, ring-spun cotton of this t-shirt is also long-lasting. With a classic fit and seam-free body, you'll want to wear it every day.\n\n100% soft ring-spun cotton (Sport Gray is 90% ring-spun cotton, 10% polyester; Dark Heather is 65% polyester, 35% cotton.)\nModern classic fit\nTubular body\nDouble-needle sleeve and bottom hems\nTaped neck and shoulders\nRibbed collar\nWash cool, hang dry or tumble dry low\nCool iron inside-out";

  return (
    <div className="review-wrapper">
      <Navbar />

      <div className="review-page">
        <div className="review-top">
          <div className="review-breadcrumb">
            <span className="crumb-link" onClick={() => navigate("/addpage")}>
              My Stores
            </span>
            <span className="crumb-sep">/</span>
            <span className="crumb-link">{storeName}</span>
            <span className="crumb-sep">/</span>
            <span className="crumb-link" onClick={() => navigate("/pricing", { state: location.state })}>
              Set Pricing
            </span>
            <span className="crumb-sep">/</span>
            <span className="crumb-current">Review</span>
          </div>

          <button className="btn-primary" type="button" onClick={saveAndContinue} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save and continue"}
          </button>
        </div>

        <h1 className="review-title">Review products</h1>
        <p className="review-subtitle">
          Review and edit your product mockups, name your products, and add customer information for your store.
        </p>

        <div className="review-card">
          <div className="review-card-header">Assign a campaign to your products</div>
          <div className="review-card-body">
            <div className="form-row">
              <label className={`form-label ${saveError.campaignName || saveError.duplicate ? "error" : ""}`}>
                Campaign name
                <div className="form-field">
                  <input
                    value={draft.campaignName}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        campaignName: clampText(e.target.value, 255),
                      }))
                    }
                    placeholder="Enter a name for your campaign"
                  />
                  <div className="field-counter">{draft.campaignName.length}/255</div>
                </div>
                {saveError.campaignName ? <div className="form-error">{saveError.campaignName}</div> : null}
                {saveError.duplicate ? <div className="form-error">{saveError.duplicate}</div> : null}
              </label>
            </div>

            <div className="form-row">
              <label className={`form-label ${saveError.campaignSlug ? "error" : ""}`}>
                Campaign URL
                <div className={`form-field url-field ${saveError.campaignSlug ? "has-error" : ""}`}>
                  <input
                    value={draft.campaignSlug}
                    onChange={(e) => setDraft((prev) => ({ ...prev, campaignSlug: slugify(e.target.value) }))}
                    placeholder="your-slug"
                  />
                  <button className="icon-btn" type="button" aria-label="Copy link">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M10.5 13.5L13.5 10.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M9 17a5 5 0 0 1 0-7l1.25-1.25a5 5 0 0 1 7 0"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M15 7a5 5 0 0 1 0 7L13.75 15.25a5 5 0 0 1-7 0"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
                <div className="form-help">https://shops.mayzing.com/store/T98j/</div>
                {saveError.campaignSlug ? <div className="form-error">{saveError.campaignSlug}</div> : null}
              </label>
            </div>
          </div>
        </div>

        {products.map((p) => {
          const edit = draft.productEdits?.[p.id] || { name: p.name || "", aboutDesign: "" };

          const selectedMockups = edit.mockups;
          const mainMockupId = normalizeId(selectedMockups?.mainId) ?? (mockupList[0]?.id ?? 1);
          const additionalIds = Array.isArray(selectedMockups?.additionalIds)
            ? selectedMockups.additionalIds.map(normalizeId).filter(Boolean)
            : [];
          const mainMockup = mockupById.get(String(mainMockupId)) || mockupList[0];
          const additionalMockups = additionalIds.map((id) => mockupById.get(String(id))).filter(Boolean);

          const retailRange = retailById?.[p.id];
          const compareAtRange = compareAtById?.[p.id];

          const priceText = retailRange
            ? formatRange(retailRange.min, retailRange.max)
            : "$21.99 - $25.99";

          const details = {
            Details: p.models || "Gildan 64000, Gildan 5000",
            Prices: priceText,
            "Print areas": "Front",
            Sizes: "S/M/L/XL/2XL/3XL/4XL/5XL",
            "Fulfillment locations": "Europe, United Kingdom, United States",
            Colors: "",
          };

          return (
            <div key={p.id} className="review-card">
              <div className="review-card-header">{p.name || "Product"}</div>
              <div className="review-card-body">
                <div className="section-row">
                  <div className="section-title">Select mockups</div>
                  <button className="link-btn" type="button" onClick={() => openMockupModal(p.id)}>
                    Manage mockups
                    <span className="gear" aria-hidden>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          d="M19.4 15a8.7 8.7 0 0 0 .1-1 8.7 8.7 0 0 0-.1-1l2-1.6-2-3.4-2.4.9a7.7 7.7 0 0 0-1.7-1l-.4-2.5H9.1l-.4 2.5c-.6.2-1.2.6-1.7 1L4.6 8l-2 3.4L4.6 13a8.7 8.7 0 0 0-.1 1c0 .3 0 .6.1 1l-2 1.6 2 3.4 2.4-.9c.5.4 1.1.7 1.7 1l.4 2.5h5.8l.4-2.5c.6-.2 1.2-.6 1.7-1l2.4.9 2-3.4-2-1.6Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </button>
                </div>

                <div className="mockup-grid">
                  <div className="mockup-card main">
                    <div className="mockup-img">
                      {mainMockup?.img ? (
                        <MockupWithDesign
                          mockupSrc={mainMockup.img}
                          alt={mainMockup.name || "Main mockup"}
                          product={p}
                          designerDraft={designerDraftsById?.[String(p.id)] || null}
                          variant="preview"
                        />
                      ) : (
                        <div className="mockup-placeholder" />
                      )}
                    </div>
                    <div className="mockup-caption">Main mockup</div>
                  </div>

                  <div className="mockup-side-grid">
                    {additionalMockups.map((m, idx) => (
                      <div key={m.id} className="mockup-card small">
                        <div className="mockup-img">
                          {m?.img ? (
                            <MockupWithDesign
                              mockupSrc={m.img}
                              alt={m.name || "Mockup"}
                              product={p}
                              designerDraft={designerDraftsById?.[String(p.id)] || null}
                              variant="thumb"
                            />
                          ) : (
                            <div className="mockup-placeholder" />
                          )}
                        </div>
                        <div className="mockup-caption">Mockup {idx + 2}</div>
                      </div>
                    ))}

                    <button
                      className="mockup-card add"
                      type="button"
                      aria-label="Add mockup"
                      onClick={() => openMockupModal(p.id)}
                    >
                      <div className="add-plus">+</div>
                    </button>
                  </div>
                </div>

                <div className="divider" />

                <div className="section-title">Product information</div>

                <div className="form-row">
                  <label className="form-label">
                    Product name
                    <div className="form-field">
                      <input
                        value={edit.name}
                        onChange={(e) =>
                          setDraft((prev) => ({
                            ...prev,
                            productEdits: {
                              ...(prev.productEdits || {}),
                              [p.id]: {
                                ...(prev.productEdits?.[p.id] || {}),
                                name: e.target.value,
                              },
                            },
                          }))
                        }
                      />
                    </div>
                  </label>
                </div>

                <div className="form-row">
                  <label className="form-label">
                    <span className="label-with-icon">
                      About this Design
                      <span className="info" aria-hidden>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                          <path d="M12 10v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          <path d="M12 7h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                      </span>
                    </span>
                    <div className="form-field">
                      <textarea
                        value={edit.aboutDesign}
                        onChange={(e) =>
                          setDraft((prev) => ({
                            ...prev,
                            productEdits: {
                              ...(prev.productEdits || {}),
                              [p.id]: {
                                ...(prev.productEdits?.[p.id] || {}),
                                aboutDesign: e.target.value,
                              },
                            },
                          }))
                        }
                        placeholder="E.g Cats are cool kitty design"
                        rows={3}
                      />
                    </div>
                  </label>
                </div>

                <div className="divider" />

                <div className="overview-head">
                  <div className="section-title">Product details overview</div>
                  <button className="link-btn" type="button">
                    Edit details
                    <span className="pencil" aria-hidden>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M4 20h4l10.5-10.5a2.8 2.8 0 0 0 0-4L16.5 3a2.8 2.8 0 0 0-4 0L2 13.5V18a2 2 0 0 0 2 2Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinejoin="round"
                        />
                        <path d="M12.5 5.5l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </span>
                  </button>
                </div>

                <div className="details-grid">
                  <div className="details-left">
                    {Object.entries(details).map(([k, v]) => (
                      <div key={k} className="detail-row">
                        <div className="detail-key">{k}</div>
                        <div className="detail-val">{v || <span className="swatch" />}</div>
                      </div>
                    ))}
                    {compareAtEnabled && compareAtRange ? (
                      <div className="detail-row">
                        <div className="detail-key">Compare at</div>
                        <div className="detail-val">{formatRange(compareAtRange.min, compareAtRange.max)}</div>
                      </div>
                    ) : null}
                  </div>

                  <div className="details-right">
                    <div className="detail-key">Description</div>
                    <div className="detail-desc">{descriptionText}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {mockupModal.open ? (
          <div className="mockup-modal" role="dialog" aria-modal="true">
            <div className="mockup-modal-backdrop" onClick={closeMockupModal} />

            <div className="mockup-modal-panel">
              <div className="mockup-modal-header">
                <div className="mockup-modal-title">Select mockups</div>
                <div className="mockup-modal-actions">
                  <button className="mockup-upload" type="button">
                    Upload image
                    <span aria-hidden className="upload-ico">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 16V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M7 9l5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M4 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </span>
                  </button>
                  <button className="mockup-close" type="button" onClick={closeMockupModal} aria-label="Close">
                    ×
                  </button>
                </div>
              </div>

              <div className="mockup-modal-body">
                <div className="mockup-section">
                  <div className="mockup-section-title">Select a main product image</div>
                  <div className="mockup-picker-grid">
                    {mockupList.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        className={`mockup-picker-card ${mockupDraft.mainId === m.id ? "selected" : ""}`}
                        onClick={() =>
                          setMockupDraft((prev) => ({
                            ...prev,
                            mainId: m.id,
                            additionalIds: (prev.additionalIds || []).filter((x) => x !== m.id),
                          }))
                        }
                      >
                        <span className={`mockup-radio ${mockupDraft.mainId === m.id ? "on" : ""}`} aria-hidden />
                        <div className="mockup-picker-img">
                          <img src={m.img} alt={m.name} />
                        </div>
                        <div className="mockup-picker-label">{m.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mockup-section">
                  <div className="mockup-section-row">
                    <div className="mockup-section-title">Choose additional mockups</div>
                    <button
                      type="button"
                      className="mockup-select-all"
                      onClick={() =>
                        setMockupDraft((prev) => ({
                          ...prev,
                          additionalIds: mockupList.map((x) => x.id).filter((id) => id !== prev.mainId),
                        }))
                      }
                    >
                      Select all
                    </button>
                  </div>

                  <div className="mockup-picker-grid">
                    {mockupList.map((m) => {
                      const checked = (mockupDraft.additionalIds || []).includes(m.id);
                      return (
                        <button
                          key={m.id}
                          type="button"
                          className={`mockup-picker-card ${checked ? "checked" : ""}`}
                          onClick={() => toggleAdditionalMockup(m.id)}
                        >
                          <span className={`mockup-checkbox ${checked ? "on" : ""}`} aria-hidden />
                          <div className="mockup-picker-img">
                            <img src={m.img} alt={m.name} />
                          </div>
                          <div className="mockup-picker-label">{m.name}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mockup-modal-footer">
                <button className="mockup-cancel" type="button" onClick={closeMockupModal}>
                  Cancel
                </button>
                <button className="mockup-save" type="button" onClick={saveMockupSelection}>
                  Save selection
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ReviewProductsPage;
