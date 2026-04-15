import React, { useMemo, useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { mockupList } from "../data/mockups";
import MockupWithDesign from "./MockupWithDesign";

const LOCAL_CAMPAIGNS_KEY = "pod-system:campaigns:v1";
const DESIGN_DRAFTS_KEY_PREFIX = "pod-system:designer-drafts:v1";

const safeJsonParse = (v) => {
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
};

const normalizeName = (v) => String(v || "").trim().toLowerCase();

const getLocalCampaigns = () => {
  const parsed = safeJsonParse(localStorage.getItem(LOCAL_CAMPAIGNS_KEY) || "");
  return Array.isArray(parsed) ? parsed : [];
};

const safeJsonObject = (v) => {
  const parsed = safeJsonParse(v);
  return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
};

const CampaignsView = ({ selectedStore, openCampaignId = null, onStartProductSelection }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [range, setRange] = useState("All");
  const [publishing, setPublishing] = useState(false);

  const navigate = useNavigate();

  const menuRef = useRef(null);
  const [menuState, setMenuState] = useState(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [campaignSlug, setCampaignSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  const storeName = selectedStore?.name || "Select store";
  const storeUrl = selectedStore?.url || (selectedStore?.id ? String(selectedStore.id) : "");

  const storeLink = storeUrl ? `/store/${storeUrl}` : "";

  const getDesignerDraftFor = (camp, product) => {
    if (product?.designerDraft) return product.designerDraft;
    const scope = String(camp?.id || camp?.slug || "");
    if (!scope) return null;
    const key = `${DESIGN_DRAFTS_KEY_PREFIX}:${scope}`;
    const drafts = safeJsonObject(localStorage.getItem(key) || "");
    if (!drafts) return null;
    const productId = product?.id;
    if (productId === null || productId === undefined) return null;
    return drafts[String(productId)] || null;
  };

  const syncLocalCampaigns = async () => {
    const local = campaigns.filter(c => c._local || String(c.id).startsWith("local-"));
    if (local.length === 0) return;

    console.log("[CampaignsView] Syncing local campaigns to server...", local.length);
    
    for (const camp of local) {
      try {
        const payload = {
          title: camp.title,
          slug: camp.slug,
          storeId: selectedStore?.id,
          // Convert products to server format if needed. 
          // Based on campaignController.js, it expects artworks: [{ artworkId, color, size, salePrice }]
          // However, our local products are more descriptive. We'll send the full object and let the server handle it.
          // Better: Ensure we include the designerDraft as it contains the Base64 artwork.
          products: (camp.products || []).map(p => ({
            ...p,
            designerDraft: p.designerDraft || getDesignerDraftFor(camp, p)
          }))
        };

        const res = await api.post("/campaigns", payload);
        console.log(`[CampaignsView] Synced campaign: ${camp.title} -> Server ID: ${res.data.id}`);
        
        // Remove from local storage once synced
        deleteLocalCampaign(camp.id);
      } catch (err) {
        console.error(`[CampaignsView] Failed to sync campaign ${camp.title}:`, err);
        throw new Error(`Sync failed for "${camp.title}".`);
      }
    }
  };

  const publishChanges = async () => {
    const storeId = selectedStore?.id;
    if (!storeId) return;
    setPublishing(true);
    try {
      // 1. Sync local campaigns first
      await syncLocalCampaigns();

      // 2. Refresh local list from server
      await fetchCampaigns();

      // 3. Trigger publish
      await api.post(`/stores/${storeId}/collections/publish`);
      
      if (storeLink) {
        const win = window.open(storeLink, "_blank", "noopener,noreferrer");
        if (!win) navigate(storeLink);
      }
    } catch (err) {
      console.error("Error publishing storefront changes:", err);
      const msg = err?.response?.data?.message || err?.message || "Failed to publish changes.";
      alert(msg);
    } finally {
      setPublishing(false);
    }
  };

  const onAddCampaign = () => {
    setIsCreateOpen(true);
  };

  useEffect(() => {
    const onPointerDown = (e) => {
      if (!menuState) return;
      if (menuRef.current && menuRef.current.contains(e.target)) return;
      if (menuState.anchorEl && menuState.anchorEl.contains(e.target)) return;
      setMenuState(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [menuState]);

  useEffect(() => {
    if (!menuState) return;
    const close = () => setMenuState(null);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [menuState]);

  const closeCreate = () => {
    setIsCreateOpen(false);
    setCampaignName("");
    setCampaignSlug("");
    setSlugTouched(false);
  };

  const slugify = (value) => {
    const input = (value || "").trim().toLowerCase();
    // remove accents
    const noMarks = input.normalize("NFD").replace(/\p{Diacritic}+/gu, "");
    // keep a-z 0-9 spaces & dashes, collapse whitespace to dashes
    return noMarks
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const storeIdForPrefix = selectedStore?.id ? String(selectedStore.id) : "T98j";
  const campaignPrefix = `https://shops.mayzing.com/store/${storeIdForPrefix}/`;

  const [editingId, setEditingId] = useState(openCampaignId ? String(openCampaignId) : null);
  const [editDraft, setEditDraft] = useState(null);
  const [isSavingDetails, setIsSavingDetails] = useState(false);

  useEffect(() => {
    if (openCampaignId) setEditingId(String(openCampaignId));
  }, [openCampaignId]);

  const campaignById = useMemo(() => {
    const map = new Map();
    for (const c of campaigns) map.set(String(c.id), c);
    return map;
  }, [campaigns]);

  const getLocalCampaignById = (id) => {
    const local = getLocalCampaigns();
    return local.find((c) => String(c.id) === String(id)) || null;
  };

  const saveLocalCampaignPatch = (id, patch) => {
    const local = getLocalCampaigns();
    const next = local.map((c) => (String(c.id) === String(id) ? { ...c, ...patch } : c));
    localStorage.setItem(LOCAL_CAMPAIGNS_KEY, JSON.stringify(next));
    setCampaigns((prev) => prev.map((c) => (String(c.id) === String(id) ? { ...c, ...patch } : c)));
  };

  const deleteLocalCampaign = (id) => {
    const local = getLocalCampaigns();
    const next = local.filter((c) => String(c.id) !== String(id));
    localStorage.setItem(LOCAL_CAMPAIGNS_KEY, JSON.stringify(next));
  };

  const onDeleteCampaign = async (camp) => {
    const id = camp?.id;
    if (!id) return;
    setMenuState(null);

    const idStr = String(id);

    // Optimistic UI
    setCampaigns((prev) => prev.filter((c) => String(c.id) !== idStr));

    // Best-effort delete against API; always remove local copy.
    deleteLocalCampaign(idStr);

    // Local-only campaigns should not hit the API.
    if (camp?._local || idStr.startsWith("local-")) return;
    try {
      await api.delete(`/campaigns/${idStr}`);
    } catch {
      // ignore
    }
  };

  const isNewCampaign = (createdAt) => {
    if (!createdAt) return false;
    const t = new Date(createdAt).getTime();
    if (!Number.isFinite(t)) return false;
    return Date.now() - t < 1000 * 60 * 60 * 24 * 2;
  };

  const openMenuFor = (camp, anchorEl) => {
    if (!anchorEl) return;
    const rect = anchorEl.getBoundingClientRect();
    const width = 220;
    const padding = 12;
    let left = rect.right - width;
    left = Math.max(padding, Math.min(left, window.innerWidth - width - padding));
    let top = rect.bottom + 8;
    top = Math.max(padding, Math.min(top, window.innerHeight - padding));
    setMenuState({ campId: String(camp.id), anchorEl, top, left, width });
  };

  const menuCampaign = useMemo(() => {
    if (!menuState?.campId) return null;
    return campaigns.find((c) => String(c.id) === String(menuState.campId)) || null;
  }, [menuState?.campId, campaigns]);

  useEffect(() => {
    fetchCampaigns();
  }, [selectedStore?.id]);

  const fetchCampaigns = async () => {
    try {
      const res = await api.get("/campaigns");
      const apiCampaigns = Array.isArray(res.data) ? res.data : [];
      const local = getLocalCampaigns();

      const seen = new Set(apiCampaigns.map((c) => normalizeName(c.title)));
      const merged = [...apiCampaigns];
      for (const c of local) {
        const key = normalizeName(c.title);
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
      const local = getLocalCampaigns();
      setCampaigns(local);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!editingId) {
      setEditDraft(null);
      return;
    }

    const camp = campaignById.get(String(editingId)) || getLocalCampaignById(editingId);
    if (!camp) return;

    setEditDraft({
      id: camp.id,
      title: camp.title || "",
      slug: camp.slug || "",
      coverProductId: camp.coverProductId ?? (Array.isArray(camp.products) ? camp.products[0]?.id : null),
      products: Array.isArray(camp.products) ? camp.products : [],
    });
  }, [editingId, campaignById]);

  const onExitEdit = () => {
    setEditingId(null);
    setEditDraft(null);
  };

  const onSaveDetails = () => {
    if (!editDraft) return;
    setIsSavingDetails(true);
    // For now we persist to localStorage (works for locally created campaigns).
    saveLocalCampaignPatch(editDraft.id, {
      title: editDraft.title,
      slug: editDraft.slug,
      coverProductId: editDraft.coverProductId,
      products: editDraft.products,
    });
    setTimeout(() => setIsSavingDetails(false), 2000);
  };

  const onRemoveProduct = (productId) => {
    setEditDraft((prev) => {
      const nextProducts = prev.products.filter((p) => String(p.id) !== String(productId));
      const nextCoverId = String(prev.coverProductId) === String(productId)
        ? (nextProducts[0]?.id || null)
        : prev.coverProductId;
      return { ...prev, products: nextProducts, coverProductId: nextCoverId };
    });
  };

  const handleRedesignProduct = (p) => {
    // Navigate to designer with the single product and the current campaign context
    navigate("/designer", {
      state: {
        products: [{
          id: p.id,
          name: p.title || p.name,
          brand: p.models || "",
          category: p.category || "",
          subCategory: p.subCategory || p.subcategory || "",
          mockups: p.mockups || null,
          retailPrice: p.retailPrice || ""
        }],
        pendingCampaign: {
          id: editDraft.id,
          title: editDraft.title,
          slug: editDraft.slug
        }
      }
    });
  };

  if (editingId && editDraft) {
    const coverProduct = editDraft.products.find((p) => String(p.id) === String(editDraft.coverProductId)) || editDraft.products[0];
    const mockupById = new Map(mockupList.map((m) => [String(m.id), m]));
    
    // Improved mockup lookup: try specific mainId, then fallback to first available image
    const getProductImg = (product) => {
      if (!product) return null;
      if (product.mockups?.mainId) {
        return mockupById.get(String(product.mockups.mainId))?.img;
      }
      if (product.img) return product.img;
      return mockupList[0]?.img || null;
    };

    const coverImg = getProductImg(coverProduct);

    return (
      <div className="campaigns-view-container animate-fade-in w-full text-[1.4rem]">
        <div className="w-full max-w-[1200px]">
          <div className="flex items-center gap-2 text-[1.2rem] font-semibold text-on-surface-variant mb-6">
            <Link to="/addpage" className="hover:underline text-primary font-semibold">My Stores</Link>
            <span className="opacity-60">/</span>
            <span className="text-primary font-semibold">{storeName}</span>
            <span className="opacity-60">/</span>
            <span>Campaign Management</span>
            <span className="opacity-60">/</span>
            <span className="text-primary font-semibold">{editDraft.title || editDraft.id}</span>
            <span className="opacity-60">/</span>
            <span>Edit</span>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <button
              type="button"
              onClick={onExitEdit}
              className="w-10 h-10 rounded-lg border border-outline-variant/30 bg-surface-container-lowest flex items-center justify-center text-on-surface hover:bg-surface-container-low"
              aria-label="Back"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <h1 className="font-headline font-black text-on-surface text-[3.2rem] leading-tight">Edit Campaign</h1>
          </div>

          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden">
            <div className="px-8 py-6 border-b border-outline-variant/20">
              <div className="font-black text-on-surface text-[1.6rem]">Campaign details</div>
            </div>

            <div className="px-8 py-8 grid grid-cols-[180px_1fr] gap-8 items-start">
              <div>
                <div className="w-[160px] h-[160px] rounded-lg border border-outline-variant/30 bg-surface-container-low overflow-hidden flex items-center justify-center">
                  {coverImg ? (
                    <MockupWithDesign
                      mockupSrc={coverImg}
                      alt="Cover product"
                      product={coverProduct}
                      designerDraft={getDesignerDraftFor(editDraft, coverProduct)}
                      variant="preview"
                      imgClassName="w-full h-full"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-outline/50">
                      <span className="material-symbols-outlined text-[48px]">image</span>
                    </div>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-2 text-[1.3rem] text-on-surface-variant">
                  <span>Cover product</span>
                  <span className="material-symbols-outlined text-[18px]">info</span>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <div className="font-black text-on-surface text-[1.6rem]">Campaign name</div>
                  <div className="mt-2 relative">
                    <input
                      value={editDraft.title}
                      onChange={(e) => setEditDraft((prev) => ({ ...prev, title: e.target.value }))}
                      maxLength={255}
                      className="w-full px-6 py-4 bg-surface-container-lowest border border-outline-variant/30 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 text-[1.4rem]"
                      placeholder="Enter a name for your campaign"
                    />
                    <div className="mt-2 text-right text-[1.2rem] text-on-surface-variant">{(editDraft.title || "").length}/255</div>
                  </div>
                </div>

                <div>
                  <div className="font-black text-on-surface text-[1.6rem]">Campaign URL</div>
                  <div className="mt-3 relative">
                    <input
                      value={editDraft.slug}
                      onChange={(e) => setEditDraft((prev) => ({ ...prev, slug: e.target.value }))}
                      className="w-full pr-14 pl-6 py-4 bg-surface-container-lowest border border-outline-variant/30 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 text-[1.4rem]"
                      placeholder="your-slug"
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-outline"
                      aria-label="Link"
                      tabIndex={-1}
                    >
                      <span className="material-symbols-outlined">link</span>
                    </button>
                  </div>
                  <div className="mt-3 text-[1.2rem] text-on-surface-variant">{campaignPrefix}{editDraft.slug || ""}</div>
                </div>
              </div>
            </div>

            <div className="px-8 py-6 border-t border-outline-variant/20 flex justify-end">
              <button
                type="button"
                onClick={onSaveDetails}
                disabled={isSavingDetails}
                className={`px-6 py-3 rounded-lg font-black transition-all ${isSavingDetails ? "bg-tertiary text-white" : "bg-outline-variant/30 text-outline hover:brightness-95"}`}
              >
                {isSavingDetails ? (
                  <span className="flex items-center gap-2">
                    Saved! <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  </span>
                ) : "Save details"}
              </button>
            </div>
          </div>

          <div className="mt-8 bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden">
            <div className="px-8 py-6 border-b border-outline-variant/20 flex items-center justify-between">
              <div className="font-black text-on-surface text-[1.6rem]">Products in Campaign • {editDraft.products.length}</div>
            </div>

            <div className="px-8 py-6">
              {editDraft.products.length === 0 ? (
                <div className="text-on-surface-variant">No products</div>
              ) : (
                <div className="space-y-4">
                  {editDraft.products.map((p) => (
                    <div key={p.id} className="flex items-center justify-between gap-4 p-4 rounded-xl border border-outline-variant/30">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-lg border border-outline-variant/30 bg-surface-container-low overflow-hidden">
                          {(() => {
                            const imgSrc = getProductImg(p);
                            if (!imgSrc) return null;
                            return (
                              <MockupWithDesign
                                mockupSrc={imgSrc}
                                alt={p.title}
                                product={p}
                                designerDraft={getDesignerDraftFor(editDraft, p)}
                                variant="thumb"
                              />
                            );
                          })()}
                        </div>
                        <div className="font-black text-on-surface truncate">{p.title}</div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setEditDraft((prev) => ({ ...prev, coverProductId: p.id }))}
                          className={`px-4 py-2 rounded-lg font-black transition-all ${String(editDraft.coverProductId) === String(p.id) ? "bg-primary text-white" : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"}`}
                        >
                          {String(editDraft.coverProductId) === String(p.id) ? "Cover item" : "Set as cover"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRedesignProduct(p)}
                          className="p-2 rounded-lg hover:bg-surface-container-high text-outline transition-colors"
                          aria-label="Edit product design"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button 
                          type="button" 
                          onClick={() => onRemoveProduct(p.id)}
                          className="p-2 rounded-lg hover:bg-error-container hover:text-error text-outline transition-colors" 
                          aria-label="Remove"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}

                    <button 
                      type="button" 
                      onClick={() => onStartProductSelection?.(editDraft.title, editDraft.slug, editDraft.id)}
                      className="text-primary font-bold hover:underline flex items-center gap-2 mt-4"
                    >
                      <span className="material-symbols-outlined text-[18px]">add_circle</span>
                      Add more products
                    </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="campaigns-view-container animate-fade-in w-full text-[1.4rem]">
      {/* Top row: breadcrumbs + right actions */}
      <div className="w-full max-w-[1200px]">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 text-on-surface-variant">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              className="w-9 h-9 rounded-full border border-outline-variant/30 bg-surface-container-lowest flex items-center justify-center text-on-surface hover:bg-surface-container-low"
              aria-label="Back"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <div className="flex items-center gap-2 text-[1.2rem] font-semibold flex-wrap">
              <Link to="/addpage" className="hover:underline text-primary font-semibold">Dashboard</Link>
              <span className="opacity-60">/</span>
              <span className="text-primary font-semibold">My Stores</span>
              <span className="opacity-60">/</span>
              <span className="text-primary font-semibold">{storeName}</span>
              <span className="opacity-60">/</span>
              <span>Campaign Management</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={publishChanges}
              disabled={publishing}
              className="px-4 py-2 rounded-lg border border-outline-variant/30 bg-surface-container-lowest text-on-surface font-bold hover:bg-surface-container-low"
            >
              {publishing ? "Publishing..." : "Publish changes"}
              <span className="material-symbols-outlined align-middle ml-2 text-[18px]">sync</span>
            </button>
            <button
              type="button"
              onClick={onAddCampaign}
              className="bg-primary text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all"
            >
              Add Campaign
              <span className="material-symbols-outlined text-[18px]">add</span>
            </button>
          </div>
        </div>

      {/* Store header */}
        <div className="mb-10">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-headline font-black text-on-surface text-[3.6rem] leading-tight">{storeName}</h1>
          <span className="px-2.5 py-1 rounded-md bg-surface-container-lowest border border-outline-variant/30 text-on-surface-variant font-semibold text-[1.2rem]">
            USD / $
          </span>
          {selectedStore && storeLink && (
            <a
              href={storeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-bold hover:underline flex items-center gap-2"
            >
              Go to store
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            </a>
          )}
        </div>
        <p className="mt-2 text-on-surface-variant">
          Create and edit campaigns, review analytics, and add discounts.
        </p>
        </div>

      {/* Main card */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30">
        {/* Toolbar */}
          <div className="p-5 md:p-6 flex flex-col lg:flex-row lg:items-center gap-4 border-b border-outline-variant/20">
          <div className="flex items-center gap-6 min-w-0 justify-start flex-none">
            <div className="font-black text-on-surface">Campaigns</div>
            <div className="flex items-center gap-2 bg-surface-container-low px-3 py-2 rounded-lg w-full sm:w-[320px] lg:w-[340px]">
              <span className="material-symbols-outlined text-[18px] text-outline">search</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent w-full text-on-surface outline-none border-none ring-0 shadow-none appearance-none focus:outline-none focus:ring-0 focus:border-none focus:shadow-none"
                placeholder="Search campaign name or URL"
              />
            </div>
          </div>

            <div className="flex items-center gap-6 flex-wrap md:flex-nowrap md:justify-between flex-1 min-w-0">
            <div className="flex items-center rounded-lg overflow-hidden border border-outline-variant/30 bg-surface-container-lowest divide-x divide-outline-variant/30">
              {["Today", "1D", "7D", "1M", "1Y", "All", "Custom"].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setRange(k)}
                  className={`px-3 py-2 font-bold text-[1.2rem] whitespace-nowrap ${range === k ? "bg-primary text-white" : "text-on-surface-variant hover:bg-surface-container-low"}`}
                >
                  {k}
                </button>
              ))}
            </div>

              <div className="flex items-center gap-10 flex-none">
              <div className="text-right">
                <div className="text-[1.1rem] uppercase tracking-widest text-on-surface-variant">Units Sold</div>
                <div className="font-black text-on-surface">0</div>
              </div>
              <div className="text-right">
                <div className="text-[1.1rem] uppercase tracking-widest text-on-surface-variant">Total Profit</div>
                <div className="font-black text-on-surface">$0.00</div>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
          <div className="p-5 md:p-6">
          <div className="hidden md:grid grid-cols-[48px_2.2fr_1fr_1fr_1fr_160px] gap-4 px-4 py-3 text-[1.1rem] font-black text-on-surface-variant tracking-widest uppercase border-b border-outline-variant/20">
            <div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div>
            <div>Campaign</div>
            <div className="flex items-center gap-2">
              Created On
              <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
            </div>
            <div>Units Sold</div>
            <div>Profit</div>
            <div className="text-center">Actions</div>
          </div>

          {loading ? (
            <div className="py-20 text-center animate-pulse text-outline">Loading campaigns...</div>
          ) : campaigns.length === 0 ? (
            <div className="py-24 md:py-28 flex flex-col items-center text-center">
              <div className="w-28 h-28 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[72px] text-outline/35" style={{ fontVariationSettings: "'FILL' 0" }}>campaign</span>
              </div>
              <h3 className="font-headline font-black text-on-surface text-[2.2rem] leading-tight">Promote related products in
                <br />
                Campaigns
              </h3>
              <p className="mt-4 max-w-xl text-on-surface-variant">
                Drive traffic to your campaign product pages and increase your AOV. e.g. products with the same design or theme, like seasonal holidays or back to school.
              </p>
              <button
                type="button"
                onClick={onAddCampaign}
                className="mt-8 bg-primary text-white px-5 py-3 rounded-lg font-bold flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all"
              >
                Add Campaign
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full">
                <tbody>
                  {campaigns
                    .filter((camp) => {
                      const q = search.trim().toLowerCase();
                      if (!q) return true;
                      return (camp.title || "").toLowerCase().includes(q);
                    })
                    .map((camp) => (
                      <tr
                        key={camp.id}
                        className="grid grid-cols-[48px_2.2fr_1fr_1fr_1fr_160px] gap-4 px-4 py-4 border-b border-outline-variant/30 hover:bg-surface-container-lowest transition-all items-center"
                      >
                        <td className="flex justify-center"><input type="checkbox" className="w-4 h-4 rounded" /></td>
                        <td>
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-lg border border-outline-variant/30 bg-surface-container-low overflow-hidden flex items-center justify-center">
                              {(() => {
                                const products = Array.isArray(camp.products) ? camp.products : [];
                                const coverProduct =
                                  products.find((p) => String(p.id) === String(camp.coverProductId)) || products[0] || null;
                                const mockupById = new Map(mockupList.map((m) => [String(m.id), m]));
                                const baseSrc = coverProduct?.mockups?.mainId
                                  ? mockupById.get(String(coverProduct.mockups.mainId))?.img
                                  : coverProduct?.img || mockupList[0]?.img;
                                if (!baseSrc) {
                                  return <span className="material-symbols-outlined text-outline">image</span>;
                                }
                                return (
                                  <MockupWithDesign
                                    mockupSrc={baseSrc}
                                    alt={camp.title}
                                    product={coverProduct}
                                    designerDraft={getDesignerDraftFor(camp, coverProduct)}
                                    variant="thumb"
                                  />
                                );
                              })()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-black text-on-surface truncate">
                                {camp.title}
                                <span className="text-on-surface-variant font-semibold"> ({Array.isArray(camp.products) ? camp.products.length : 1})</span>
                              </div>
                              <div className="text-[1.1rem] text-on-surface-variant truncate">
                                {camp._local || String(camp.id).startsWith("local-") 
                                  ? "Publish store to view Campaign URL" 
                                  : `${campaignPrefix}${camp.slug || camp.id}`}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="text-on-surface-variant">
                          <div className="flex items-center gap-3">
                            {isNewCampaign(camp.createdAt) ? (
                              <span className="px-2 py-1 rounded-md border border-outline-variant/30 bg-surface-container-lowest text-[1.1rem] font-bold text-on-surface-variant">New</span>
                            ) : null}
                            <span>{new Date(camp.createdAt).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="font-black text-on-surface">0</td>
                        <td className="font-black text-tertiary">$0.00</td>
                        <td className="flex justify-center gap-1 relative">
                          <button className="p-2 hover:bg-surface-container-high rounded-lg text-outline" type="button" aria-label="Orders">
                            <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
                          </button>
                          <button className="p-2 hover:bg-surface-container-high rounded-lg text-outline" type="button" aria-label="Discounts">
                            <span className="material-symbols-outlined text-[18px]">sell</span>
                          </button>
                          <button className="p-2 hover:bg-surface-container-high rounded-lg text-outline" type="button" aria-label="View">
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                          <button
                            className="p-2 hover:bg-surface-container-high rounded-lg text-outline"
                            type="button"
                            aria-label="Edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingId(String(camp.id));
                            }}
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            className="p-2 hover:bg-surface-container-high rounded-lg text-outline"
                            type="button"
                            aria-label="More"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (menuState && String(menuState.campId) === String(camp.id)) {
                                setMenuState(null);
                              } else {
                                openMenuFor(camp, e.currentTarget);
                              }
                            }}
                          >
                            <span className="material-symbols-outlined text-[18px]">more_vert</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {menuState && menuCampaign
            ? createPortal(
                <div
                  ref={menuRef}
                  style={{ position: "fixed", top: menuState.top, left: menuState.left, width: menuState.width, zIndex: 1000 }}
                  className="rounded-lg border border-outline-variant/30 bg-surface-container-lowest shadow-lg overflow-hidden"
                >
                  <div className="divide-y divide-outline-variant/20">
                    {[
                      { icon: "track_changes", label: "Campaign pixels" },
                      { icon: "content_copy", label: "Bulk clone" },
                      { icon: "file_copy", label: "Duplicate" },
                      { icon: "download", label: "Download mockups" },
                      { icon: "analytics", label: "Analytics" },
                      { icon: "folder", label: "Manage Collections" },
                    ].map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => setMenuState(null)}
                        className="w-full px-3 py-2.5 flex items-center gap-3 text-left hover:bg-surface-container-low text-on-surface"
                      >
                        <span className="material-symbols-outlined text-[18px] text-outline">{item.icon}</span>
                        <span className="text-[1.3rem] font-medium">{item.label}</span>
                      </button>
                    ))}

                    <div className="px-3 py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[18px] text-outline">star</span>
                        <span className="text-[1.3rem] font-medium text-on-surface">Best seller</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const next = !menuCampaign.bestSeller;
                          saveLocalCampaignPatch(menuCampaign.id, { bestSeller: next });
                        }}
                        className={`w-9 h-5 rounded-full border border-outline-variant/30 px-1 flex items-center transition-colors ${menuCampaign.bestSeller ? "bg-primary" : "bg-surface-container-low"}`}
                        aria-label="Toggle best seller"
                      >
                        <span className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${menuCampaign.bestSeller ? "translate-x-4" : "translate-x-0"}`} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteCampaign(menuCampaign)}
                      className="w-full px-3 py-2.5 flex items-center gap-3 text-left hover:bg-surface-container-low text-on-surface"
                    >
                      <span className="material-symbols-outlined text-[18px] text-outline">delete</span>
                      <span className="text-[1.3rem] font-medium">Delete</span>
                    </button>
                  </div>
                </div>,
                document.body
              )
            : null}
        </div>
      </div>
      </div>

      {/* Create campaign modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/40" onClick={closeCreate} />

          <div className="relative w-full max-w-3xl bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden">
            <div className="flex items-center justify-between px-8 py-6 border-b border-outline-variant/20">
              <div className="font-headline font-black text-on-surface text-[2.4rem]">Create a campaign</div>
              <button
                type="button"
                onClick={closeCreate}
                className="text-outline hover:text-on-surface transition-colors"
                aria-label="Close"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="px-8 py-8">
              <div className="space-y-8">
                <div>
                  <div className="font-black text-on-surface text-[1.8rem]">Campaign name</div>
                  <div className="mt-2 relative">
                    <input
                      value={campaignName}
                      onChange={(e) => {
                        const next = e.target.value;
                        setCampaignName(next);
                        if (!slugTouched) setCampaignSlug(slugify(next));
                      }}
                      maxLength={255}
                      className="w-full px-6 py-4 bg-surface-container-lowest border border-outline-variant/30 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 text-[1.6rem]"
                      placeholder="Enter a name for your campaign"
                    />
                    <div className="mt-2 text-right text-on-surface-variant">{campaignName.length}/255</div>
                  </div>
                </div>

                <div>
                  <div className="font-black text-on-surface text-[1.8rem]">Campaign URL</div>
                  <div className="text-on-surface-variant mt-2">
                    The URL is automatically created with your campaign name. Click into the field to edit.
                  </div>

                  <div className="mt-3 relative">
                    <input
                      value={campaignSlug}
                      onChange={(e) => {
                        setSlugTouched(true);
                        setCampaignSlug(slugify(e.target.value));
                      }}
                      onFocus={() => setSlugTouched(true)}
                      className="w-full pr-14 pl-6 py-4 bg-surface-container-lowest border border-outline-variant/30 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 text-[1.6rem]"
                      placeholder="your-slug"
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-outline"
                      aria-label="Link"
                      tabIndex={-1}
                    >
                      <span className="material-symbols-outlined">link</span>
                    </button>
                  </div>

                  <div className="mt-3 text-on-surface-variant">{campaignPrefix}</div>
                </div>
              </div>
            </div>

            <div className="px-8 py-6 border-t border-outline-variant/20 flex justify-end items-center gap-4">
              <button
                type="button"
                onClick={closeCreate}
                className="px-4 py-2 font-black text-primary hover:underline"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!campaignName.trim()}
                onClick={() => onStartProductSelection?.(campaignName, campaignSlug)}
                className="px-6 py-3 rounded-lg font-black bg-primary text-white disabled:bg-outline-variant/30 disabled:text-outline disabled:cursor-not-allowed"
              >
                Add products
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignsView;
