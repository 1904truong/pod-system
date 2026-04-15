import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import "../styles/ArtworkLibraryView.css";

const ArtworkLibraryView = () => {
  const [viewMode, setViewMode] = useState("List"); // List or Grid
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [user, setUser] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchArtworks();
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/user/profile");
      setUser(res.data);
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const fetchArtworks = async () => {
    try {
      const res = await api.get("/artworks");
      setAssets(res.data);
    } catch (err) {
      console.error("Error fetching artworks:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("artwork", file);
    formData.append("title", file.name);

    setUploading(true);
    try {
      await api.post("/artworks/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchArtworks(); // Refresh list
    } catch (err) {
      console.error("Error uploading artwork:", err);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this artwork?")) return;

    try {
      await api.delete(`/artworks/${id}`);
      setAssets(assets.filter((asset) => asset.id !== id));
    } catch (err) {
      console.error("Error deleting artwork:", err);
      alert("Delete failed. Please try again.");
    }
  };

  const handleRename = async (id) => {
    if (!newTitle.trim()) return setEditingId(null);

    try {
      const res = await api.patch(`/artworks/${id}`, { title: newTitle });
      setAssets(assets.map((asset) => (asset.id === id ? res.data : asset)));
      setEditingId(null);
    } catch (err) {
      console.error("Error renaming artwork:", err);
      alert("Rename failed.");
    }
  };

  const startEditing = (asset) => {
    setEditingId(asset.id);
    setNewTitle(asset.title);
  };

  return (
    <div className="artwork-library-container animate-fade-in font-body">
      {/* Breadcrumbs */}
      <nav className="artwork-breadcrumb">
        <Link to="#">Dashboard</Link>
        <span className="separator">/</span>
        <span>Image Library</span>
      </nav>

      {/* Header */}
      <header className="artwork-header">
        <h1>Image library</h1>
        <p>
          Upload your own design images for reuse across other products. Images are automatically stored in the Image Library when you use them in the Product Builder.
        </p>
      </header>

      {/* Library Controls */}
      <div className="library-controls">
        <h2>Images in your library ({assets.length})</h2>
        <div className="control-actions">
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileUpload}
            accept="image/*"
          />
          <button 
            className="btn-add-image" 
            onClick={() => fileInputRef.current.click()}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Add image"} <i className="fa-solid fa-plus font-bold"></i>
          </button>
          <div className="view-switcher">
            <button 
              className={`view-btn ${viewMode === "List" ? "active" : ""}`}
              onClick={() => setViewMode("List")}
            >
              <i className="fa-solid fa-list-ul"></i>
            </button>
            <button 
              className={`view-btn ${viewMode === "Grid" ? "active" : ""}`}
              onClick={() => setViewMode("Grid")}
            >
              <i className="fa-solid fa-table-cells-large"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Asset Table */}
      <div className="artwork-table-wrapper">
        <table className="artwork-table">
          <thead>
            <tr>
              <th style={{ width: '50%' }}>IMAGE</th>
              <th style={{ width: '25%' }}>CREATED BY</th>
              <th style={{ width: '20%' }}>MODIFIED ON</th>
              <th style={{ width: '5%' }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>Loading artworks...</td></tr>
            ) : assets.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No images found. Upload your first design!</td></tr>
            ) : (
              assets.map((asset) => (
                <tr key={asset.id} className="artwork-row">
                  <td>
                    <div className="image-cell">
                      <div className="thumbnail-box">
                        <img 
                          src={asset.fileUrl.startsWith('http') || asset.fileUrl.startsWith('data:')
                            ? asset.fileUrl 
                            : `${api.defaults.baseURL?.replace('/api', '') || ''}${asset.fileUrl}`} 
                          alt={asset.title} 
                        />
                      </div>
                      <div className="image-meta">
                        <span className="meta-id">ID: {asset.id}</span>
                        {editingId === asset.id ? (
                          <div className="edit-title-box">
                            <input 
                              type="text" 
                              value={newTitle} 
                              onChange={(e) => setNewTitle(e.target.value)}
                              autoFocus
                              className="edit-title-input"
                            />
                            <button onClick={() => handleRename(asset.id)} className="btn-save-title">
                              <i className="fa-solid fa-check"></i>
                            </button>
                            <button onClick={() => setEditingId(null)} className="btn-cancel-title">
                              <i className="fa-solid fa-xmark"></i>
                            </button>
                          </div>
                        ) : (
                          <strong className="meta-name">{asset.title}</strong>
                        )}
                        <span className="meta-filename">{asset.mimeType} ({(asset.sizeBytes / 1024).toFixed(1)} KB)</span>
                      </div>
                    </div>
                  </td>
                  <td className="creator-cell">{user?.name || "You"}</td>
                  <td className="date-cell">{new Date(asset.createdAt).toLocaleString()}</td>
                  <td className="options-cell">
                    <button 
                      className="btn-edit-artwork" 
                      onClick={() => startEditing(asset)}
                      title="Rename design"
                    >
                      <i className="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button 
                      className="btn-delete-artwork" 
                      onClick={() => handleDelete(asset.id)}
                      title="Delete design"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                    <button className="btn-more-options">
                      <i className="fa-solid fa-ellipsis-vertical"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="library-pagination">
          <span>1-1 of 1</span>
          <div className="pagination-arrows">
            <i className="fa-solid fa-chevron-left"></i>
            <i className="fa-solid fa-chevron-right"></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtworkLibraryView;
