import React, { useState, useEffect, useCallback } from "react";
import api from "../utils/api";

const MyStoresView = ({
  onManageStore,
  onStoresChanged,
  onStoreCreated,
  openCreateStore,
  onCreateStoreOpened,
}) => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddStore, setShowAddStore] = useState(false);
  const [createStep, setCreateStep] = useState(1); // 1: choose platform, 2: store setup form
  const [newStore, setNewStore] = useState({ name: "", url: "", platform: "CUSTOM" });
  const [storeCurrency, setStoreCurrency] = useState('USD');
  const [openMenuStoreId, setOpenMenuStoreId] = useState(null);

  const checkoutCountries = [
    'Australia',
    'Austria',
    'Belgium',
    'Bulgaria',
    'Canada',
    'Croatia',
    'Czech Republic',
    'Denmark',
    'Estonia',
    'Finland',
    'France',
    'Germany',
    'Greece',
    'Hungary',
    'Iceland',
    'Ireland',
    'Italy',
    'Latvia',
    'Lithuania',
    'Luxembourg',
    'Malta',
    'Netherlands',
    'New Zealand',
    'Norway',
    'Poland',
    'Portugal',
    'Romania',
    'Slovakia',
    'Slovenia',
    'Spain',
    'Sweden',
    'Switzerland',
    'United Kingdom',
    'United States',
  ];
  const checkoutMid = Math.ceil(checkoutCountries.length / 2);
  const checkoutLeft = checkoutCountries.slice(0, checkoutMid);
  const checkoutRight = checkoutCountries.slice(checkoutMid);

  const openCreateStoreFlow = () => {
    setCreateStep(1);
    setNewStore({ name: "", url: "", platform: "CUSTOM" });
    setStoreCurrency('USD');
    setShowAddStore(true);
  };

  const closeCreateStoreFlow = () => {
    setShowAddStore(false);
    setCreateStep(1);
  };

  const fetchStores = useCallback(async () => {
    try {
      const res = await api.get("/stores");
      setStores(res.data);
      onStoresChanged && onStoresChanged(res.data);
    } catch (err) {
      console.error("Error fetching stores:", err);
    } finally {
      setLoading(false);
    }
  }, [onStoresChanged]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (openMenuStoreId == null) return;
      const menuRoot = e.target.closest(`[data-store-menu="${openMenuStoreId}"]`);
      if (!menuRoot) setOpenMenuStoreId(null);
    };

    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuStoreId]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  useEffect(() => {
    if (!openCreateStore) return;
    openCreateStoreFlow();
    onCreateStoreOpened && onCreateStoreOpened();
  }, [openCreateStore, onCreateStoreOpened]);

  const handleAddStore = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: newStore.name,
        url: newStore.url?.trim() ? newStore.url.trim() : null,
        platform: newStore.platform,
      };
      const res = await api.post("/stores", payload);
      setShowAddStore(false);
      setNewStore({ name: "", url: "", platform: "CUSTOM" });
      onStoreCreated && onStoreCreated(res.data);
      fetchStores();
    } catch (err) {
      console.error("Error creating store:", err);
      const msg = err?.response?.data?.message || err?.message || "Failed to create store.";
      alert(msg);
    }
  };

  const handleDeleteStore = async (id) => {
    if (!window.confirm("Are you sure you want to disconnect this store? This will NOT delete data on the platform, only from this dashboard.")) return;

    try {
      await api.delete(`/stores/${id}`);
      const nextStores = stores.filter(s => s.id !== id);
      setStores(nextStores);
      onStoresChanged && onStoresChanged(nextStores);
    } catch (err) {
      console.error("Error deleting store:", err);
      alert("Failed to disconnect store.");
    }
  };

  const stats = [
    { label: "Total Stores", value: stores.length.toString(), icon: "store", colorClass: "bg-primary/10 text-primary" },
    { label: "Active Stores", value: stores.length.toString(), icon: "check_circle", colorClass: "bg-tertiary-container/20 text-tertiary" },
    { label: "Total Revenue", value: "$0.00", icon: "payments", colorClass: "bg-secondary-container text-on-secondary-container" },
    { label: "Avg. Monthly Growth", value: "0%", icon: "trending_up", colorClass: "bg-tertiary-container/20 text-tertiary" },
  ];

  return (
    <div className="stores-view-container animate-fade-in w-full max-w-[1600px] mx-auto text-[1.4rem]">
      {/* Header Section */}
      <section className="mb-12 flex flex-wrap justify-between items-end gap-6">
        <div>
          <h2 className="font-headline text-[1.4rem] font-extrabold tracking-tight text-on-surface mb-3">My stores</h2>
          <p className="text-on-surface-variant text-[1.4rem] max-w-3xl">Manage your digital retail empire. Overview and controls for all your connected storefronts.</p>
        </div>
        <button 
          onClick={openCreateStoreFlow}
          className="bg-cta-gradient text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 ambient-shadow hover:brightness-110 active:scale-95 transition-all text-[1.4rem]"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          Create new store
        </button>
      </section>

      {/* Stats Bar */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-14">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-surface-container-lowest p-8 rounded-2xl ambient-shadow">
            <p className="text-on-surface-variant text-[1.4rem] font-medium mb-2">{stat.label}</p>
            <div className="flex items-center justify-between">
              <span className="text-[1.4rem] font-extrabold font-headline">{stat.value}</span>
              <div className={`${stat.colorClass} p-3 rounded-xl`}>
                <span className="material-symbols-outlined text-[22px]">{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Filters & Search */}
      <section className="flex flex-wrap items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-6">
          <div className="bg-surface-container-lowest px-5 py-3 rounded-xl ambient-shadow flex items-center gap-3 min-w-[260px]">
            <span className="material-symbols-outlined text-outline text-[20px]">filter_list</span>
            <select className="bg-transparent border-none text-[1.4rem] font-medium text-on-surface focus:ring-0 w-full cursor-pointer outline-none">
              <option>All Statuses</option>
              <option>Online Only</option>
              <option>Maintenance Mode</option>
            </select>
          </div>
          <div className="bg-surface-container-lowest px-5 py-3 rounded-xl ambient-shadow flex items-center gap-3 min-w-[240px]">
            <span className="material-symbols-outlined text-outline text-[20px]">sort</span>
            <select className="bg-transparent border-none text-[1.4rem] font-medium text-on-surface focus:ring-0 w-full cursor-pointer outline-none">
              <option>Sort by: Newest</option>
              <option>Sort by: Revenue</option>
              <option>Sort by: Alphabetical</option>
            </select>
          </div>
        </div>
        <p className="text-on-surface-variant text-[1.4rem] italic">Showing 1-6 of 12 stores</p>
      </section>

      {/* Create/Connect Store (2-step modal) */}
      {showAddStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/40" onClick={closeCreateStoreFlow} />

          <div className="relative w-full max-w-3xl bg-surface-container-lowest rounded-3xl ambient-shadow border border-outline-variant/30 overflow-hidden">
            <div className="flex items-center justify-between px-8 py-6 border-b border-outline-variant/20">
              <h3 className="text-[1.4rem] font-black font-headline text-on-surface">
                {createStep === 1 ? 'Create or connect a store' : 'Welcome to your new store!'}
              </h3>
              <button
                type="button"
                onClick={closeCreateStoreFlow}
                className="text-outline hover:text-on-surface transition-colors"
                aria-label="Close"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {createStep === 1 ? (
              <div className="px-8 py-8">
                <div className="space-y-4">
                  {[
                    { key: 'CUSTOM', title: 'Custom API', desc: 'Create a custom store' },
                    { key: 'SHOPIFY', title: 'Shopify', desc: 'Connect a store you have already created on Shopify' },
                    { key: 'WOOCOMMERCE', title: 'WooCommerce', desc: 'Connect a WooCommerce store' },
                  ].map((opt) => (
                    <label
                      key={opt.key}
                      className="flex items-start gap-4 p-5 rounded-2xl border border-outline-variant/30 bg-white hover:bg-surface-container-low transition-colors cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="platform"
                        className="mt-1"
                        checked={newStore.platform === opt.key}
                        onChange={() => setNewStore((s) => ({ ...s, platform: opt.key }))}
                      />
                      <div className="flex-1">
                        <div className="text-[1.4rem] font-bold text-on-surface">{opt.title}</div>
                        <div className="text-[1.4rem] text-on-surface-variant">{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="flex justify-end gap-3 mt-8">
                  <button
                    type="button"
                    className="px-6 py-3 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container-low transition-colors"
                    onClick={closeCreateStoreFlow}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:brightness-110 active:scale-95 transition-all"
                    onClick={() => setCreateStep(2)}
                  >
                    Continue
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAddStore} className="px-8">
                <div className="py-8 max-h-[70vh] overflow-y-auto">
                  <div className="divide-y divide-outline-variant/20">
                    <div className="pb-8">
                      <div className="text-[1.4rem] font-bold text-on-surface">Name your store</div>
                      <div className="text-[1.4rem] text-on-surface-variant">Start by naming your store.</div>
                      <input
                        className="mt-3 w-full px-6 py-3.5 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl focus:ring-2 focus:ring-primary/30 outline-none transition-all text-[1.4rem]"
                        placeholder="Enter your store name"
                        value={newStore.name}
                        onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="pt-8 pb-8">
                      <div className="text-[1.4rem] font-bold text-on-surface">Checkout availability</div>
                      <div className="text-[1.4rem] text-on-surface-variant mt-1">
                        Currently, customers from the following countries can successfully checkout in your store:
                      </div>

                      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-20 gap-y-2">
                        <ul className="list-disc pl-6 space-y-1 text-[1.4rem] text-on-surface-variant">
                          {checkoutLeft.map((name) => (
                            <li key={name}>{name}</li>
                          ))}
                        </ul>
                        <ul className="list-disc pl-6 space-y-1 text-[1.4rem] text-on-surface-variant">
                          {checkoutRight.map((name) => (
                            <li key={name}>{name}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="text-[1.4rem] text-on-surface-variant mt-5">
                        If a customer is outside these countries, they won't be able to complete their purchase. Rest assured, we're working to expand our reach and add more countries soon.
                      </div>
                    </div>

                    <div className="pt-8">
                      <div className="text-[1.4rem] font-bold text-on-surface">Choose your pricing currency</div>
                      <div className="text-[1.4rem] text-on-surface-variant mt-1">Select one of the following</div>

                      <div className="mt-4 space-y-3">
                        {[
                          { code: 'EUR', label: 'Euros', suffix: '(EUR / €)' },
                          { code: 'GBP', label: 'British Pounds', suffix: '(GBP / £)' },
                          { code: 'USD', label: 'US Dollars', suffix: '(USD / $)' },
                        ].map((opt) => (
                          <label key={opt.code} className="flex items-start gap-4">
                            <input
                              type="radio"
                              name="currency"
                              className="mt-1"
                              checked={storeCurrency === opt.code}
                              onChange={() => setStoreCurrency(opt.code)}
                            />
                            <div className="text-[1.4rem] text-on-surface-variant">
                              <span className="mr-2">{opt.label}</span>
                              <span className="font-semibold text-on-surface">{opt.suffix}</span>
                            </div>
                          </label>
                        ))}
                      </div>

                      <div className="text-[1.4rem] text-on-surface-variant mt-4">
                        Be aware that once chosen, this currency cannot be changed later. <span className="font-semibold text-on-surface">Please note:</span> Your buyers will see prices in their local currencies, where applicable.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="py-6 border-t border-outline-variant/20 flex justify-between items-center gap-3">
                  <button
                    type="button"
                    className="px-6 py-3 rounded-xl font-bold text-primary hover:underline"
                    onClick={closeCreateStoreFlow}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:brightness-110 active:scale-95 transition-all disabled:bg-outline-variant/30 disabled:text-outline disabled:hover:brightness-100 disabled:active:scale-100 disabled:cursor-not-allowed"
                    disabled={!newStore.name.trim()}
                  >
                    Create store
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Store Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {loading ? (
          <div className="col-span-full py-20 text-center text-outline animate-pulse">Loading your stores...</div>
        ) : stores.length === 0 ? (
          <div className="col-span-full py-20 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-6xl mb-4 opacity-20">storefront</span>
            <p className="text-[1.4rem] font-medium">No stores connected yet.</p>
          </div>
        ) : (
          stores.map((store, idx) => (
            <div key={idx} className="group bg-surface-container-lowest rounded-2xl p-8 ambient-shadow hover:scale-[1.01] transition-all duration-300">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-primary/10 flex items-center justify-center text-primary">
                    {store.logo ? (
                      <img alt={store.name} className="w-full h-full object-cover" src={store.logo} />
                    ) : (
                      <span className="material-symbols-outlined text-[32px]">store</span>
                    ) }
                  </div>
                  <div>
                    <h3 className="font-headline text-[1.4rem] font-bold text-on-surface">{store.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                      <span className="text-[1.4rem] font-bold text-tertiary uppercase tracking-wider">{store.platform}</span>
                    </div>
                  </div>
                </div>
                <div className="relative" data-store-menu={store.id}>
                  <button
                    type="button"
                    className="text-outline hover:text-on-surface transition-colors"
                    aria-haspopup="menu"
                    aria-expanded={openMenuStoreId === store.id}
                    onClick={() =>
                      setOpenMenuStoreId((prev) => (prev === store.id ? null : store.id))
                    }
                  >
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>

                  {openMenuStoreId === store.id && (
                    <div
                      role="menu"
                      className="absolute right-0 top-full mt-3 w-56 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl ambient-shadow overflow-hidden z-20"
                    >
                      <button
                        type="button"
                        role="menuitem"
                        className="w-full px-4 py-3 flex items-center gap-3 text-left text-error hover:bg-error/10 transition-colors"
                        onClick={() => {
                          setOpenMenuStoreId(null);
                          handleDeleteStore(store.id);
                        }}
                      >
                        <span className="material-symbols-outlined">delete</span>
                        <span className="font-semibold">Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="mb-6">
                {store.url ? (
                  <a className="text-[1.4rem] text-primary font-medium hover:underline flex items-center gap-1" href={`https://${store.url}`} target="_blank" rel="noopener noreferrer">
                    {store.url}
                    <span className="material-symbols-outlined text-xs">open_in_new</span>
                  </a>
                ) : (
                  <div className="text-[1.4rem] text-on-surface-variant">No store URL</div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-6 mb-10 bg-surface-container-low p-6 rounded-2xl">
                <div>
                  <p className="text-[1.4rem] uppercase tracking-widest text-on-surface-variant mb-2">Sales</p>
                  <p className="text-[1.4rem] font-bold font-headline">$0</p>
                </div>
                <div>
                  <p className="text-[1.4rem] uppercase tracking-widest text-on-surface-variant mb-2">Status</p>
                  <p className="text-[1.4rem] font-bold font-headline text-tertiary">Active</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  className="flex-1 bg-surface-container-highest text-on-secondary-container py-3.5 rounded-xl font-bold text-[1.4rem] hover:brightness-95 transition-all"
                  onClick={() => onManageStore && onManageStore(store)}
                >
                  Manage Store
                </button>
                <button 
                  className="w-12 h-12 flex items-center justify-center border border-error/20 rounded-xl hover:bg-error/10 transition-colors text-error"
                  onClick={() => handleDeleteStore(store.id)}
                  title="Disconnect store"
                >
                  <span className="material-symbols-outlined">link_off</span>
                </button>
                <button className="w-11 h-11 flex items-center justify-center border border-outline-variant/30 rounded-xl hover:bg-surface-container-high transition-colors text-outline">
                  <span className="material-symbols-outlined">analytics</span>
                </button>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default MyStoresView;
