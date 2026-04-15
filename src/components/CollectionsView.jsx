import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import "../styles/CollectionsView.css";

const toSlug = (value) => {
  const raw = String(value || "")
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");
  return raw.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
};

const CollectionsView = ({ selectedStore }) => {
  const storeName = selectedStore?.name || "Cothlab Hats";
  const storeUrl = selectedStore?.url || (selectedStore?.id ? String(selectedStore.id) : "cothlab-hats");

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createUrl, setCreateUrl] = useState("");
  const [isUrlLinked, setIsUrlLinked] = useState(true);
  const [createParentId, setCreateParentId] = useState(null);

  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [campaignSearch, setCampaignSearch] = useState("");
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [campaignSelections, setCampaignSelections] = useState(new Set());
  const [activeCampaignCollectionId, setActiveCampaignCollectionId] = useState(null);

  // Data State
  const [collections, setCollections] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectedSubId, setSelectedSubId] = useState(null);
  const [loading, setLoading] = useState(false);

  const linkedSlug = useMemo(() => toSlug(createName), [createName]);

  useEffect(() => {
    const storeId = selectedStore?.id;
    if (!storeId) {
      setCollections([]);
      setSelectedIndex(-1);
      setSelectedSubId(null);
      return;
    }
    refreshCollections(storeId);
  }, [selectedStore?.id]);

  const resetCreateModal = () => {
    setIsCreateModalOpen(false);
    setCreateName("");
    setCreateUrl("");
    setIsUrlLinked(true);
    setCreateParentId(null);
  };

  const resetCampaignModal = () => {
    setIsCampaignModalOpen(false);
    setCampaignSearch("");
    setCampaignSelections(new Set());
    setActiveCampaignCollectionId(null);
  };

  const refreshCollections = async (storeId) => {
    setLoading(true);
    try {
      const res = await api.get(`/stores/${storeId}/collections`);
      const nextCollections = Array.isArray(res.data) ? res.data : [];
      setCollections(nextCollections);
      const top = nextCollections.filter((c) => !c.parentId);
      setSelectedIndex(top.length > 0 ? 0 : -1);
    } catch (err) {
      console.error("Error fetching collections:", err);
      setCollections([]);
      setSelectedIndex(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    const storeId = selectedStore?.id;
    if (!storeId) return;

    const name = createName.trim();
    const slug = (isUrlLinked ? linkedSlug : createUrl).trim();
    if (!name) return;

    try {
      await api.post(`/stores/${storeId}/collections`, {
        name,
        slug,
        parentId: createParentId,
      });
      await refreshCollections(storeId);
      resetCreateModal();
    } catch (err) {
      console.error("Error creating collection:", err);
      const msg = err?.response?.data?.message || err?.message || "Failed to create collection.";
      alert(msg);
    }
  };

  const handleDelete = async (e, collectionId) => {
    e.stopPropagation();

    const storeId = selectedStore?.id;
    if (!storeId || !collectionId) return;

    try {
      await api.delete(`/stores/${storeId}/collections/${collectionId}`);
      await refreshCollections(storeId);
    } catch (err) {
      console.error("Error deleting collection:", err);
      const msg = err?.response?.data?.message || err?.message || "Failed to delete collection.";
      alert(msg);
    }
  };

  const topCollections = useMemo(() => collections.filter((c) => !c.parentId), [collections]);
  const subcollectionsByParent = useMemo(() => {
    const map = new Map();
    for (const c of collections) {
      if (!c.parentId) continue;
      const key = String(c.parentId);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(c);
    }
    return map;
  }, [collections]);

  const selectedTopCollection = topCollections[selectedIndex];
  const selectedSubcollections = useMemo(() => {
    const parentId = selectedTopCollection?.id;
    if (!parentId) return [];
    return subcollectionsByParent.get(String(parentId)) || [];
  }, [selectedTopCollection?.id, subcollectionsByParent]);

  useEffect(() => {
    if (!selectedTopCollection) {
      setSelectedSubId(null);
      return;
    }
    const subs = selectedSubcollections;
    if (subs.length === 0) {
      setSelectedSubId(null);
      return;
    }
    const exists = subs.some((s) => String(s.id) === String(selectedSubId));
    if (!exists) setSelectedSubId(subs[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTopCollection?.id, selectedSubcollections.length]);

  const selectedSubcollection = useMemo(() => {
    if (!selectedSubId) return null;
    return selectedSubcollections.find((s) => String(s.id) === String(selectedSubId)) || null;
  }, [selectedSubId, selectedSubcollections]);

  const openCreateTopCollection = () => {
    setCreateParentId(null);
    setIsCreateModalOpen(true);
  };

  const openCreateSubcollection = (parentId) => {
    setCreateParentId(parentId);
    setIsCreateModalOpen(true);
  };

  const openCampaignPicker = async (collectionId) => {
    const storeId = selectedStore?.id;
    if (!storeId || !collectionId) return;
    setActiveCampaignCollectionId(collectionId);
    setIsCampaignModalOpen(true);

    setCampaignLoading(true);
    try {
      const [campaignRes, collectionRes] = await Promise.all([
        api.get("/campaigns"),
        api.get(`/stores/${storeId}/collections`),
      ]);
      const allCampaigns = Array.isArray(campaignRes.data) ? campaignRes.data : [];
      setCampaigns(allCampaigns);

      const cols = Array.isArray(collectionRes.data) ? collectionRes.data : [];
      const current = cols.find((c) => String(c.id) === String(collectionId));
      const currentIds = new Set((current?.campaigns || []).map((c) => String(c.id)));
      setCampaignSelections(currentIds);
    } catch (err) {
      console.error("Error loading campaigns:", err);
      setCampaigns([]);
      setCampaignSelections(new Set());
    } finally {
      setCampaignLoading(false);
    }
  };

  const onToggleCampaign = (campaignId) => {
    setCampaignSelections((prev) => {
      const next = new Set(prev);
      const key = String(campaignId);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const saveCampaignSelection = async () => {
    const storeId = selectedStore?.id;
    const collectionId = activeCampaignCollectionId;
    if (!storeId || !collectionId) return;

    const campaignIds = Array.from(campaignSelections).map((id) => Number(id)).filter(Boolean);

    try {
      await api.put(`/stores/${storeId}/collections/${collectionId}/campaigns`, { campaignIds });
      await refreshCollections(storeId);
      resetCampaignModal();
    } catch (err) {
      console.error("Error saving campaign selection:", err);
      const msg = err?.response?.data?.message || err?.message || "Failed to save campaigns.";
      alert(msg);
    }
  };

  const publishChanges = async () => {
    const storeId = selectedStore?.id;
    if (!storeId) return;
    try {
      await api.post(`/stores/${storeId}/collections/publish`);
      alert("Published changes");
    } catch (err) {
      console.error("Error publishing collections:", err);
      const msg = err?.response?.data?.message || err?.message || "Failed to publish changes.";
      alert(msg);
    }
  };

  const filteredCampaigns = useMemo(() => {
    const q = campaignSearch.trim().toLowerCase();
    if (!q) return campaigns;
    return campaigns.filter((c) => String(c.title || "").toLowerCase().includes(q));
  }, [campaignSearch, campaigns]);

  const removeCampaign = async (campaignId) => {
    const storeId = selectedStore?.id;
    if (!storeId || !selectedSubId || !campaignId) return;
    try {
      await api.delete(`/stores/${storeId}/collections/${selectedSubId}/campaigns/${campaignId}`);
      await refreshCollections(storeId);
    } catch (err) {
      console.error("Error removing campaign:", err);
      const msg = err?.response?.data?.message || err?.message || "Failed to remove campaign.";
      alert(msg);
    }
  };

  return (
    <div className="collections-view-container animate-fade-in font-body">
      {/* Top Header Action */}
      <div className="header-actions-area">
        <button className="publish-changes-btn" onClick={publishChanges}>
          Publish changes
          <i className="fa-solid fa-arrows-rotate"></i>
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
        <span>Collections</span>
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

      {/* Collections Section */}
      <div className="collections-section">
        <h2>Collections</h2>
        <p className="collections-description">
          Collections act as navigation items on your store that will help your customers find the products they want to buy. E.g. Streetwear, Sportswear, Winter sale
        </p>

        {loading && (
          <p className="collections-description">Loading collections...</p>
        )}

        <div className={topCollections.length > 0 ? "collections-layout" : ""}>
          {/* LEFT CARD: Add or remove a collection */}
          <div className="management-card">
            <div className="card-header-row">
              <h3>Add or remove a collection</h3>
              <span className="collections-count">
                Collections • {collections.length}
              </span>
            </div>

            <div className="add-collection-trigger" onClick={openCreateTopCollection}>
              <button className="add-collection-btn">
                Add a new Collection
                <i className="fa-solid fa-circle-plus"></i>
              </button>
            </div>

            {/* List of collections */}
            {topCollections.length > 0 && (
              <div className="collections-list">
                {topCollections.map((col, index) => (
                  <div
                    key={col.id}
                    className={`collection-item-row ${
                      selectedIndex === index ? "selected" : ""
                    }`}
                    onClick={() => {
                      setSelectedIndex(index);
                      setSelectedSubId(null);
                    }}
                  >
                    <div className="collection-item-left">
                      <div
                        className={`collection-radio ${
                          selectedIndex === index ? "active" : ""
                        }`}
                      >
                        <div className="radio-inner" />
                      </div>
                      <span className="collection-name-text">{col.name}</span>
                    </div>
                    <div className="collection-item-actions">
                      <button
                        className="action-icon-btn"
                        title="Add a new Subcollection"
                        onClick={(e) => {
                          e.stopPropagation();
                          openCreateSubcollection(col.id);
                        }}
                      >
                        <i className="fa-solid fa-circle-plus"></i>
                      </button>
                      <button
                        className="action-icon-btn delete"
                        onClick={(e) => handleDelete(e, col.id)}
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT CARD: Selected Collection Details */}
          {topCollections.length > 0 && selectedTopCollection && (
            <div className="management-card">
              <div className="card-header-row">
                <h3>{selectedTopCollection.name}</h3>
                <Link to="#" className="edit-link">
                  Edit
                </Link>
              </div>

              {selectedSubcollections.length === 0 ? (
                <p className="collections-description" style={{ marginBottom: "2rem" }}>
                  No sub-collections yet. Click the plus icon next to the collection to create one.
                </p>
              ) : (
                <div className="collections-list" style={{ marginBottom: "2rem" }}>
                  {selectedSubcollections.map((sub) => (
                    <div
                      key={sub.id}
                      className={`collection-item-row ${String(sub.id) === String(selectedSubId) ? "selected" : ""}`}
                      onClick={() => setSelectedSubId(sub.id)}
                    >
                      <div className="collection-item-left">
                        <span className="collection-name-text">{sub.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedSubcollection && (
                <>
                  <div className="add-campaign-trigger">
                    <button className="add-campaign-btn" type="button" onClick={() => openCampaignPicker(selectedSubcollection.id)}>
                      Add a Campaign to this Collection
                      <i className="fa-solid fa-circle-plus"></i>
                    </button>
                  </div>

                  {(selectedSubcollection.campaigns || []).length > 0 && (
                    <div className="collections-list" style={{ gap: "0.8rem" }}>
                      {(selectedSubcollection.campaigns || []).map((c) => (
                        <div key={c.id} className="collection-item-row" style={{ cursor: "default" }}>
                          <div className="collection-item-left">
                            <span className="collection-name-text" style={{ fontWeight: 600 }}>
                              {c.title}
                            </span>
                          </div>
                          <div className="collection-item-actions">
                            <button
                              className="action-icon-btn delete"
                              title="Remove"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                removeCampaign(c.id);
                              }}
                            >
                              <i className="fa-solid fa-trash-can"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── CREATE COLLECTION MODAL ── */}
      {isCreateModalOpen && (
        <div className="modal-overlay" onClick={resetCreateModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{createParentId ? "Create a subcollection" : "Create a collection"}</h2>
              <button className="close-modal-btn" onClick={resetCreateModal}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="modal-body">
                {/* Collection Name */}
                <div className="form-group">
                  <label className="form-label">{createParentId ? "Subcollection name" : "Collection name"}</label>
                  <input
                    autoFocus
                    type="text"
                    className="form-input"
                    placeholder={createParentId ? "Enter a subcollection name" : "Enter a collection name"}
                    value={createName}
                    maxLength={50}
                    onChange={(e) => setCreateName(e.target.value)}
                  />
                  <span className="char-counter">{createName.length}/50</span>
                </div>

                {/* Collection URL */}
                <div className="form-group">
                  <label className="form-label">Collection URL</label>
                  <p className="form-helper-text">
                    The URL is linked with your collection name. Click the 'link' icon below to unlink and edit.
                  </p>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter a URL"
                      value={isUrlLinked ? linkedSlug : createUrl}
                      readOnly={isUrlLinked}
                      onChange={(e) => setCreateUrl(e.target.value)}
                    />
                    <div
                      className="input-icon"
                      onClick={() => {
                        if (isUrlLinked) {
                          setCreateUrl(linkedSlug);
                          setIsUrlLinked(false);
                        } else {
                          setIsUrlLinked(true);
                        }
                      }}
                      title={isUrlLinked ? "Unlink to edit" : "Link to name"}
                    >
                      <i className={`fa-solid fa-link${isUrlLinked ? "" : "-slash"}`}></i>
                    </div>
                  </div>
                  <span className="url-prefix-text">
                      https://shops.mayzing.com/store/{storeUrl}/p/
                  </span>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={resetCreateModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={!createName.trim()}
                >
                  {createParentId ? "Create subcollection" : "Create collection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── SELECT CAMPAIGNS MODAL ── */}
      {isCampaignModalOpen && (
        <div className="modal-overlay" onClick={resetCampaignModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Select campaigns</h2>
              <button className="close-modal-btn" onClick={resetCampaignModal}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Search campaigns</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search"
                    value={campaignSearch}
                    onChange={(e) => setCampaignSearch(e.target.value)}
                  />
                  <div className="input-icon" style={{ cursor: "default" }}>
                    <i className="fa-solid fa-magnifying-glass"></i>
                  </div>
                </div>
              </div>

              {campaignLoading ? (
                <p className="collections-description">Loading campaigns...</p>
              ) : (
                <div className="collections-list" style={{ gap: "0.8rem" }}>
                  {filteredCampaigns.map((c) => {
                    const checked = campaignSelections.has(String(c.id));
                    return (
                      <div
                        key={c.id}
                        className="collection-item-row"
                        style={{ cursor: "default" }}
                        onClick={() => onToggleCampaign(c.id)}
                      >
                        <div className="collection-item-left">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => onToggleCampaign(c.id)}
                            style={{ width: "1.6rem", height: "1.6rem" }}
                          />
                          <span className="collection-name-text">{c.title}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={resetCampaignModal}>
                Cancel
              </button>
              <button type="button" className="btn-submit" onClick={saveCampaignSelection}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionsView;
