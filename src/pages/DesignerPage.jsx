import React, { useMemo, useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/DesignerPage.css";
import { compressImage } from "../utils/imageUtils";
import api from "../utils/api";
import {
  defaultMockupImg as defaultTshirtMockupImg,
  mockupList as tshirtMockupList,
} from "../data/mockups";
import { defaultHoodieMockupImg, hoodieMockupList } from "../data/mockupsHoodie";
import {
  defaultSweatshirtMockupImg,
  sweatshirtMockupList,
} from "../data/mockupsSweatshirt";
import {
  defaultLongSleeveMockupImg,
  longSleeveMockupList,
} from "../data/mockupsLongSleeve";
import { defaultTankTopMockupImg, tankTopMockupList } from "../data/mockupsTankTop";
import { defaultKidTshirtMockupImg, kidTshirtMockupList } from "../data/mockupsKidTshirt";
import { defaultKidHoodieMockupImg, kidHoodieMockupList } from "../data/mockupsKidHoodie";
import {
  defaultKidSweatshirtMockupImg,
  kidSweatshirtMockupList,
} from "../data/mockupsKidSweatshirt";
import { defaultBabyYbMockupImg, babyYbMockupList } from "../data/mockupsBabyYB";

import {
  defaultDrinkMugMockupImg,
  drinkMugMockupList,
} from "../data/mockupsDrinkMug";
import {
  defaultDrinkBottleMockupImg,
  drinkBottleMockupList,
} from "../data/mockupsDrinkBottles";
import {
  defaultDrinkTumblerMockupImg,
  drinkTumblerMockupList,
} from "../data/mockupsDrinkTumbler";
import {
  defaultDrinkGlassMockupImg,
  drinkGlassMockupList,
} from "../data/mockupsDrinkGlass";

import {
  defaultWallartPosterMockupImg,
  wallartPosterMockupList,
} from "../data/mockupsWallartPoster";
import {
  defaultWallartCanvasMockupImg,
  wallartCanvasMockupList,
} from "../data/mockupsWallartCanvases";

import {
  defaultHomewareCushionMockupImg,
  homewareCushionMockupList,
} from "../data/mockupsHomewareCushion";
import {
  defaultHomewareMatsMockupImg,
  homewareMatsMockupList,
} from "../data/mockupsHomewareMats";
import {
  defaultHomewareBlanketsMockupImg,
  homewareBlanketsMockupList,
} from "../data/mockupsHomewareBlankets";
import {
  defaultHomewareOrnamentMockupImg,
  homewareOrnamentMockupList,
} from "../data/mockupsHomewareOrnaments";
import {
  defaultHomewareYardSignMockupImg,
  homewareYardSignMockupList,
} from "../data/mockupsHomewareYardSign";
import {
  defaultHomewareCandleMockupImg,
  homewareCandleMockupList,
} from "../data/mockupsHomewareCandles";

import { defaultHatCapsMockupImg, hatCapsMockupList } from "../data/mockupsHatCaps";
import {
  defaultHatBeaniesMockupImg,
  hatBeaniesMockupList,
} from "../data/mockupsHatBeanies";
import { defaultHatVisorsMockupImg, hatVisorsMockupList } from "../data/mockupsHatVisors";

import {
  defaultAccessoriesToteMockupImg,
  accessoriesToteMockupList,
} from "../data/mockupsAccessoriesTote";
import {
  defaultAccessoriesApronMockupImg,
  accessoriesApronMockupList,
} from "../data/mockupsAccessoriesApron";
import {
  defaultAccessoriesPouchSmallMockupImg,
  accessoriesPouchSmallMockupList,
} from "../data/mockupsAccessoriesPouchSmall";
import {
  defaultAccessoriesPouchLargeMockupImg,
  accessoriesPouchLargeMockupList,
} from "../data/mockupsAccessoriesPouchLarge";

const DesignerPage = () => {
  const navigate = useNavigate();
  const [side, setSide] = useState("Front");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState("upload");
  const imageFileInputRef = useRef(null);
  const [designImageSrc, setDesignImageSrc] = useState(null);
  const [designImageDataUrl, setDesignImageDataUrl] = useState(null);
  const [designTransform, setDesignTransform] = useState({ x: 0, y: 0, scale: 1 });
  const customPlaceholderInputRefs = useRef({});
  const uploadFontInputRef = useRef(null);
  const arbitraryTextColorInputRef = useRef(null);
  const [arbitraryColorTarget, setArbitraryColorTarget] = useState(null); // { layerId, kind: 'text'|'static-text' }
  const [uploadedFonts, setUploadedFonts] = useState([]); // { family, label, url }
  const [libraryArtworks, setLibraryArtworks] = useState([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const dragStateRef = useRef({
    dragging: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });
  // edit và preview
  const [mode, setMode] = useState("edit");
  const [selectedMockup, setSelectedMockup] = useState(0);

  // Products list & menu
  // ─── RECEIVE PRODUCTS FROM AddPage ───
  const location = useLocation();
  const passedProducts = location.state?.products;
  const pendingCampaign = location.state?.pendingCampaign;

  const safeJsonParse = (value) => {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  };

  const DESIGN_DRAFTS_KEY_PREFIX = "pod-system:designer-drafts:v1";
  const designDraftScope = String(pendingCampaign?.id || pendingCampaign?.slug || "ad-hoc");
  const designDraftStorageKey = `${DESIGN_DRAFTS_KEY_PREFIX}:${designDraftScope}`;

  const designDraftsRef = useRef(() => {
    const parsed = safeJsonParse(localStorage.getItem(designDraftStorageKey) || "");
    return parsed && typeof parsed === "object" ? parsed : {};
  });

  // The ref above is initialized with a function for lazy init; unwrap it once.
  if (typeof designDraftsRef.current === "function") {
    designDraftsRef.current = designDraftsRef.current();
  }

  const draftSaveTimerRef = useRef(null);
  const cleanupOldDrafts = () => {
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(DESIGN_DRAFTS_KEY_PREFIX)) {
          keys.push(key);
        }
      }
      // Sort keys (simplistic, could be better if we had timestamps)
      // Just delete the first 3 drafts found that aren't the current one.
      let deletedCount = 0;
      for (const k of keys) {
        if (k !== designDraftStorageKey) {
          localStorage.removeItem(k);
          deletedCount++;
          if (deletedCount >= 3) break;
        }
      }
      console.log(`[Designer] Cleaned up ${deletedCount} old draft(s) from localStorage.`);
    } catch (e) {
      console.error("[Designer] Cleanup failed:", e);
    }
  };

  const flushPersistDrafts = (manualDraft = null) => {
    if (draftSaveTimerRef.current) window.clearTimeout(draftSaveTimerRef.current);
    draftSaveTimerRef.current = null;
    if (!designDraftStorageKey) return;

    try {
      const currentKey = String(selectedProductId);
      const latestDraft = manualDraft || packDesignDraft();
      const nextDrafts = {
        ...(designDraftsRef.current || {}),
        [currentKey]: latestDraft,
      };
      designDraftsRef.current = nextDrafts;
      
      const serialized = JSON.stringify(nextDrafts);
      localStorage.setItem(designDraftStorageKey, serialized);
      console.log(`[Designer] Flushed drafts to localStorage. Key: ${designDraftStorageKey}, Size: ${serialized.length} bytes`);
    } catch (err) {
      if (err.name === 'QuotaExceededError' || err.code === 22) {
        console.warn("[Designer] LocalStorage full. Attempting cleanup...");
        cleanupOldDrafts();
        // Try one more time after cleanup
        try {
          localStorage.setItem(designDraftStorageKey, JSON.stringify(designDraftsRef.current || {}));
        } catch (retryErr) {
          console.error("[Designer] Still failing after cleanup:", retryErr);
        }
      } else {
        console.error("[Designer] Failed to flush drafts:", err);
      }
    }
  };

  const schedulePersistDrafts = () => {
    if (draftSaveTimerRef.current) window.clearTimeout(draftSaveTimerRef.current);
    draftSaveTimerRef.current = window.setTimeout(() => {
      flushPersistDrafts();
    }, 500); // slightly longer debounce to avoid excessive writes
  };

  const getMockupPackForProduct = (product) => {
    const sub = String(product?.subCategory || product?.subcategory || "").toLowerCase();
    const subCompact = sub.replace(/[\s-]+/g, "");
    const category = String(product?.category || "").toLowerCase();
    const isYouthBaby = category === "yb" || category === "youthbaby";
    const name = String(product?.name || "").toLowerCase();

    if (isYouthBaby) {
      if (
        sub === "t-shirts" ||
        sub === "tshirt" ||
        subCompact.startsWith("tshirt")
      ) {
        return {
          key: "tshirt-yb",
          defaultImg: defaultKidTshirtMockupImg,
          list: kidTshirtMockupList,
        };
      }
      if (sub === "hoodies" || sub === "hoodie") {
        return {
          key: "hoodie-yb",
          defaultImg: defaultKidHoodieMockupImg,
          list: kidHoodieMockupList,
        };
      }
      if (sub === "sweatshirts" || sub === "sweatshirt") {
        return {
          key: "sweatshirt-yb",
          defaultImg: defaultKidSweatshirtMockupImg,
          list: kidSweatshirtMockupList,
        };
      }
      if (sub === "babycothing" || subCompact.includes("baby")) {
        return {
          key: "baby-yb",
          defaultImg: defaultBabyYbMockupImg,
          list: babyYbMockupList,
        };
      }
    }

    if (category === "drink") {
      if (sub === "mugs") {
        return {
          key: "mug",
          defaultImg: defaultDrinkMugMockupImg,
          list: drinkMugMockupList,
        };
      }
      if (sub === "bottle") {
        return {
          key: "bottles",
          defaultImg: defaultDrinkBottleMockupImg,
          list: drinkBottleMockupList,
        };
      }
      if (sub === "tumblers") {
        return {
          key: "tumbler",
          defaultImg: defaultDrinkTumblerMockupImg,
          list: drinkTumblerMockupList,
        };
      }
      if (sub === "glass") {
        return {
          key: "glass",
          defaultImg: defaultDrinkGlassMockupImg,
          list: drinkGlassMockupList,
        };
      }
    }

    if (category === "homeware") {
      if (sub === "cushion") {
        return {
          key: "homeware-cushion",
          defaultImg: defaultHomewareCushionMockupImg,
          list: homewareCushionMockupList,
        };
      }
      if (sub === "mats") {
        return {
          key: "homeware-mats",
          defaultImg: defaultHomewareMatsMockupImg,
          list: homewareMatsMockupList,
        };
      }
      if (sub === "blankets") {
        return {
          key: "homeware-blankets",
          defaultImg: defaultHomewareBlanketsMockupImg,
          list: homewareBlanketsMockupList,
        };
      }
      if (sub === "ornament") {
        return {
          key: "homeware-ornament",
          defaultImg: defaultHomewareOrnamentMockupImg,
          list: homewareOrnamentMockupList,
        };
      }
      if (sub === "yardsign") {
        return {
          key: "homeware-yardsign",
          defaultImg: defaultHomewareYardSignMockupImg,
          list: homewareYardSignMockupList,
        };
      }
      if (sub === "candle") {
        return {
          key: "homeware-candle",
          defaultImg: defaultHomewareCandleMockupImg,
          list: homewareCandleMockupList,
        };
      }
    }

    if (category === "wallart") {
      if (sub === "poster" || sub === "posters") {
        return {
          key: "wallart-poster",
          defaultImg: defaultWallartPosterMockupImg,
          list: wallartPosterMockupList,
        };
      }
      if (sub === "canvas" || sub === "canvases") {
        return {
          key: "wallart-canvas",
          defaultImg: defaultWallartCanvasMockupImg,
          list: wallartCanvasMockupList,
        };
      }
    }

    if (category === "hat") {
      if (sub === "cap" || sub === "caps") {
        return {
          key: "hat-cap",
          defaultImg: defaultHatCapsMockupImg,
          list: hatCapsMockupList,
        };
      }
      if (sub === "beanie" || sub === "beanies") {
        return {
          key: "hat-beanie",
          defaultImg: defaultHatBeaniesMockupImg,
          list: hatBeaniesMockupList,
        };
      }
      if (sub === "visor" || sub === "visors") {
        return {
          key: "hat-visor",
          defaultImg: defaultHatVisorsMockupImg,
          list: hatVisorsMockupList,
        };
      }
    }

    if (category === "accessories") {
      if (name.includes("tote")) {
        return {
          key: "accessories-tote",
          defaultImg: defaultAccessoriesToteMockupImg,
          list: accessoriesToteMockupList,
        };
      }
      if (name.includes("apron")) {
        return {
          key: "accessories-apron",
          defaultImg: defaultAccessoriesApronMockupImg,
          list: accessoriesApronMockupList,
        };
      }
      if (name.includes("pouch") && name.includes("small")) {
        return {
          key: "accessories-pouch-small",
          defaultImg: defaultAccessoriesPouchSmallMockupImg,
          list: accessoriesPouchSmallMockupList,
        };
      }
      if (name.includes("pouch") && name.includes("large")) {
        return {
          key: "accessories-pouch-large",
          defaultImg: defaultAccessoriesPouchLargeMockupImg,
          list: accessoriesPouchLargeMockupList,
        };
      }

      // Fallback: if the name doesn't match, use tote as a sensible default.
      return {
        key: "accessories-tote",
        defaultImg: defaultAccessoriesToteMockupImg,
        list: accessoriesToteMockupList,
      };
    }

    if (sub === "hoodies" || sub === "hoodie") {
      return { key: "hoodie", defaultImg: defaultHoodieMockupImg, list: hoodieMockupList };
    }
    if (sub === "sweatshirts" || sub === "sweatshirt") {
      return {
        key: "sweatshirt",
        defaultImg: defaultSweatshirtMockupImg,
        list: sweatshirtMockupList,
      };
    }
    if (
      sub === "longsleeve-shirts" ||
      subCompact === "longsleeve" ||
      subCompact === "longsleeves" ||
      subCompact === "longsleeveshirt" ||
      subCompact === "longsleeveshirts" ||
      subCompact.startsWith("longsleeve")
    ) {
      return {
        key: "longsleeve",
        defaultImg: defaultLongSleeveMockupImg,
        list: longSleeveMockupList,
      };
    }
    if (
      sub === "tank-tops" ||
      sub === "tanktop" ||
      sub === "tanktops" ||
      subCompact === "tanktop" ||
      subCompact === "tanktops" ||
      subCompact === "tanktopshirt" ||
      subCompact === "tanktopshirts" ||
      subCompact.startsWith("tanktop")
    ) {
      return {
        key: "tanktop",
        defaultImg: defaultTankTopMockupImg,
        list: tankTopMockupList,
      };
    }
    return { key: "tshirt", defaultImg: defaultTshirtMockupImg, list: tshirtMockupList };
  };

  const [products, setProducts] = useState(
    passedProducts && passedProducts.length > 0
      ? passedProducts.map((p, i) => ({
          id: p.id || i + 1,
          name: p.name,
          models: p.brand || "",
          category: p.category || "",
          subCategory: p.subCategory || p.subcategory || "",
          img: getMockupPackForProduct(p).defaultImg,
          retailPrice: p.retailPrice || "",
        }))
      : [
          {
            id: 1,
            name: "Classic Unisex T-shirt",
            models: "Gildan 64000, Gildan 5000",
            category: "",
            subCategory: "t-shirts",
            img: defaultTshirtMockupImg,
          },
        ]
  );
  const [selectedProductId, setSelectedProductId] = useState(
    passedProducts && passedProducts.length > 0 ? passedProducts[0].id || 1 : 1
  );
  const [openMenuId, setOpenMenuId] = useState(null);

  const [isAboutProductsModalOpen, setIsAboutProductsModalOpen] = useState(false);

  const activeProduct = useMemo(() => {
    return products.find((p) => String(p.id) === String(selectedProductId)) || products[0];
  }, [products, selectedProductId]);

  const activeMockupPack = useMemo(() => getMockupPackForProduct(activeProduct), [activeProduct]);

  // Keep Product views in a stable, Mayzing-like order
  const orderedMockups = useMemo(() => {
    const baseList = Array.isArray(activeMockupPack?.list) ? activeMockupPack.list : [];
    if (
      activeMockupPack?.key === "hoodie" ||
      activeMockupPack?.key === "sweatshirt" ||
      activeMockupPack?.key === "longsleeve" ||
      activeMockupPack?.key === "tanktop" ||
      activeMockupPack?.key === "tshirt-yb" ||
      activeMockupPack?.key === "hoodie-yb" ||
      activeMockupPack?.key === "sweatshirt-yb" ||
      activeMockupPack?.key === "baby-yb" ||
      activeMockupPack?.key === "mug" ||
      activeMockupPack?.key === "bottles" ||
      activeMockupPack?.key === "tumbler" ||
      activeMockupPack?.key === "glass" ||
      activeMockupPack?.key === "homeware-cushion" ||
      activeMockupPack?.key === "homeware-mats" ||
      activeMockupPack?.key === "homeware-blankets" ||
      activeMockupPack?.key === "homeware-ornament" ||
      activeMockupPack?.key === "homeware-yardsign" ||
      activeMockupPack?.key === "homeware-candle" ||
      activeMockupPack?.key === "wallart-poster" ||
      activeMockupPack?.key === "wallart-canvas" ||
      activeMockupPack?.key === "hat-cap" ||
      activeMockupPack?.key === "hat-beanie" ||
      activeMockupPack?.key === "hat-visor" ||
      activeMockupPack?.key === "accessories-tote" ||
      activeMockupPack?.key === "accessories-apron" ||
      activeMockupPack?.key === "accessories-pouch-small" ||
      activeMockupPack?.key === "accessories-pouch-large"
    ) {
      // These mockup packs are already authored in the exact desired order.
      return baseList;
    }

    const preferredOrder = [1, 2, 3, 4, 5, 6, 7, 11, 12];
    const byId = new Map(baseList.map((m) => [String(m.id), m]));
    const ordered = preferredOrder
      .map((id) => byId.get(String(id)))
      .filter(Boolean);
    const seen = new Set(ordered.map((m) => String(m.id)));
    const rest = baseList.filter((m) => !seen.has(String(m.id)));
    return [...ordered, ...rest];
  }, [activeMockupPack?.key, activeMockupPack?.list]);

  const isDrinkware =
    activeMockupPack?.key === "mug" ||
    activeMockupPack?.key === "bottles" ||
    activeMockupPack?.key === "tumbler" ||
    activeMockupPack?.key === "glass";

  const drinkwareEditMockup = useMemo(() => {
    if (!isDrinkware) return null;
    const list = orderedMockups || [];
    if (list.length === 0) return null;

    if (activeMockupPack?.key === "mug") {
      return (
        list.find((m) => String(m?.name || "").toLowerCase() === "flat front") ||
        list.find((m) => String(m?.name || "").toLowerCase().includes("front")) ||
        list[0]
      );
    }

    return (
      list.find((m) => String(m?.name || "").toLowerCase().includes("front")) ||
      list[0]
    );
  }, [activeMockupPack?.key, isDrinkware, orderedMockups]);

  const getMockupLabel = (mockup) => mockup?.name || "";

  useEffect(() => {
    setSelectedMockup(0);
    setSide("Front");
  }, [activeMockupPack?.list]);

  const hasBackView = useMemo(() => {
    if (isDrinkware) return false;
    return (orderedMockups || []).some((m) => /\bback\b/i.test(String(m?.name || "")));
  }, [isDrinkware, orderedMockups]);

  const handleDuplicate = (product) => {
    const newProduct = { ...product, id: Date.now() };
    setProducts((prev) => [...prev, newProduct]);
    setSelectedProductId(newProduct.id);
    setOpenMenuId(null);
  };

  const handleRemove = (id) => {
    if (products.length === 1) return; // không xóa sản phẩm cuối
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setSelectedProductId((prev) => {
      if (prev === id) return products.find((p) => p.id !== id)?.id;
      return prev;
    });
    setOpenMenuId(null);
  };
  // Mockups are selected per product (e.g., hoodies vs t-shirts)
  // Logic chuyển view
  const [sidebarView, setSidebarView] = useState("picker");

  // State theo dõi cuộn để thay đổi padding-top của wrapper khi navbar thu nhỏ / ẩn top-bar
  const [isScrolled, setIsScrolled] = useState(false);

  // Lắng nghe sự kiện scroll nội bộ để cập nhật giao diện DesignerPage
  useEffect(() => {
    const handleNavScroll = (e) => {
      const currentScrollY = e.detail?.scrollTop ?? 0;
      setIsScrolled(currentScrollY > 40);
    };
    window.addEventListener("nav-scroll", handleNavScroll);
    return () => window.removeEventListener("nav-scroll", handleNavScroll);
  }, []);

  useEffect(() => {
    return () => {
      if (typeof designImageSrc === "string" && designImageSrc.startsWith("blob:")) {
        URL.revokeObjectURL(designImageSrc);
      }
    };
  }, [designImageSrc]);

  // These match the existing default numbers shown in the UI
  const SAFE_AREA_MM = { width: 355.59, height: 406.4 };

  const normalizeCustomImageLayout = (cfg) => {
    const widthMmRaw = Number.isFinite(cfg.widthMm)
      ? cfg.widthMm
      : SAFE_AREA_MM.width * 0.7;
    const heightMmRaw = Number.isFinite(cfg.heightMm)
      ? cfg.heightMm
      : SAFE_AREA_MM.height * 0.7;

    const widthMm = clamp(widthMmRaw, 1, SAFE_AREA_MM.width);
    const heightMm = clamp(heightMmRaw, 1, SAFE_AREA_MM.height);

    const leftMmRaw = Number.isFinite(cfg.leftMm)
      ? cfg.leftMm
      : (SAFE_AREA_MM.width - widthMm) / 2;
    const topMmRaw = Number.isFinite(cfg.topMm)
      ? cfg.topMm
      : (SAFE_AREA_MM.height - heightMm) / 2;

    const leftMm = clamp(leftMmRaw, 0, SAFE_AREA_MM.width - widthMm);
    const topMm = clamp(topMmRaw, 0, SAFE_AREA_MM.height - heightMm);

    return { ...cfg, widthMm, heightMm, leftMm, topMm };
  };

  const defaultCustomImageLayerCfg = () =>
    normalizeCustomImageLayout({
      shape: "square", // square | circle | star | certificate | heart
      placeholderType: "icon", // icon | text | blank | custom-image
      placeholderText: "Upload an image",
      placeholderImageSrc: null,
      promptEnabled: false,
      promptText: "",
      widthMm: SAFE_AREA_MM.width * 0.7,
      heightMm: SAFE_AREA_MM.height * 0.7,
      leftMm: (SAFE_AREA_MM.width - SAFE_AREA_MM.width * 0.7) / 2,
      topMm: (SAFE_AREA_MM.height - SAFE_AREA_MM.height * 0.7) / 2,
    });

  const [customImageLayerCfgById, setCustomImageLayerCfgById] = useState({});

  const defaultTextLayerCfg = () =>
    ({
      text: "Your text",
      fontFamily: "Abril Fatface",
      color: "#000000",
      promptEnabled: false,
      promptText: "",
      fontSizeMm: 40,
      widthMm: 250,
      heightMm: 100,
      leftMm: 52.8,
      topMm: 153.2,
      rotateDeg: 0,
      textAlignX: "left", // left | center | right
      textAlignY: "middle", // top | middle | bottom
      textCase: "title", // title | upper
    });

  const [textLayerCfgById, setTextLayerCfgById] = useState({});

  const defaultStaticTextLayerCfg = () =>
    ({
      text: "Your text",
      fontFamily: "Abril Fatface",
      color: "#000000",
      fontSizeMm: 40,
      widthMm: 250,
      heightMm: 100,
      leftMm: 52.79,
      topMm: 153.2,
      rotateDeg: 0,
      textAlignX: "center", // left | center | right
      textAlignY: "middle", // top | middle | bottom
      textCase: "title", // title | upper
    });

  const [staticTextLayerCfgById, setStaticTextLayerCfgById] = useState({});

  // Cleanup uploaded font object URLs
  useEffect(() => {
    return () => {
      uploadedFonts.forEach((f) => {
        if (f?.url) URL.revokeObjectURL(f.url);
      });
    };
  }, [uploadedFonts]);

  const getTextCfg = (layerId) => {
    const cfg = textLayerCfgById[layerId] || defaultTextLayerCfg();
    const widthMm = clamp(Number(cfg.widthMm) || 1, 1, SAFE_AREA_MM.width);
    const heightMm = clamp(Number(cfg.heightMm) || 1, 1, SAFE_AREA_MM.height);
    const leftMm = clamp(Number(cfg.leftMm) || 0, 0, SAFE_AREA_MM.width - widthMm);
    const topMm = clamp(Number(cfg.topMm) || 0, 0, SAFE_AREA_MM.height - heightMm);
    const rotateDeg = Number.isFinite(Number(cfg.rotateDeg)) ? Number(cfg.rotateDeg) : 0;
    const fontSizeMm = clamp(Number(cfg.fontSizeMm) || 1, 1, 9999);
    const color = typeof cfg.color === "string" && cfg.color ? cfg.color : "#000000";
    return { ...cfg, widthMm, heightMm, leftMm, topMm, rotateDeg, fontSizeMm, color };
  };

  const patchTextCfg = (layerId, patch) => {
    setTextLayerCfgById((prev) => ({
      ...prev,
      [layerId]: { ...(prev[layerId] || defaultTextLayerCfg()), ...patch },
    }));
  };

  const sanitizeFontFamily = (name) => {
    const base = (name || "Uploaded Font")
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-zA-Z0-9 _-]/g, "")
      .trim();
    return base || "Uploaded Font";
  };

  const handleUploadFont = async (file) => {
    if (!file) return;
    const okExt = /\.(ttf|otf|woff|woff2)$/i.test(file.name || "");
    if (!okExt) return;

    const url = URL.createObjectURL(file);
    const familyBase = sanitizeFontFamily(file.name);
    const family = `${familyBase} ${Date.now()}`;
    const label = familyBase;

    try {
      const fontFace = new FontFace(family, `url(${url})`);
      const loaded = await fontFace.load();
      document.fonts.add(loaded);
      setUploadedFonts((prev) => [{ family, label, url }, ...prev]);

      // Apply to the expanded text layer if any
      if (expandedLayerId) {
        const layer = layers.find((l) => l.id === expandedLayerId);
        if (layer?.type === "text") {
          patchTextCfg(expandedLayerId, { fontFamily: family });
        }
        if (layer?.type === "static-text") {
          patchStaticTextCfg(expandedLayerId, { fontFamily: family });
        }
      }
    } catch {
      URL.revokeObjectURL(url);
    } finally {
      if (uploadFontInputRef.current) uploadFontInputRef.current.value = "";
    }
  };

  const getStaticTextCfg = (layerId) => {
    const cfg = staticTextLayerCfgById[layerId] || defaultStaticTextLayerCfg();
    const widthMm = clamp(Number(cfg.widthMm) || 1, 1, SAFE_AREA_MM.width);
    const heightMm = clamp(Number(cfg.heightMm) || 1, 1, SAFE_AREA_MM.height);
    const leftMm = clamp(Number(cfg.leftMm) || 0, 0, SAFE_AREA_MM.width - widthMm);
    const topMm = clamp(Number(cfg.topMm) || 0, 0, SAFE_AREA_MM.height - heightMm);
    const rotateDeg = Number.isFinite(Number(cfg.rotateDeg)) ? Number(cfg.rotateDeg) : 0;
    const fontSizeMm = clamp(Number(cfg.fontSizeMm) || 1, 1, 9999);
    const color = typeof cfg.color === "string" && cfg.color ? cfg.color : "#000000";
    return { ...cfg, widthMm, heightMm, leftMm, topMm, rotateDeg, fontSizeMm, color };
  };

  const patchStaticTextCfg = (layerId, patch) => {
    setStaticTextLayerCfgById((prev) => ({
      ...prev,
      [layerId]: { ...(prev[layerId] || defaultStaticTextLayerCfg()), ...patch },
    }));
  };

  const openArbitraryColorPickerForLayer = (layerId, kind) => {
    setArbitraryColorTarget({ layerId, kind });
    const current =
      kind === "static-text" ? getStaticTextCfg(layerId).color : getTextCfg(layerId).color;
    if (arbitraryTextColorInputRef.current) {
      arbitraryTextColorInputRef.current.value = current;
      arbitraryTextColorInputRef.current.click();
    }
  };

  const alignStaticTextLayerInSafeArea = (layerId, align) => {
    const cfg = getStaticTextCfg(layerId);
    let leftMm = cfg.leftMm;
    let topMm = cfg.topMm;

    if (align === "left") leftMm = 0;
    if (align === "centerX") leftMm = (SAFE_AREA_MM.width - cfg.widthMm) / 2;
    if (align === "right") leftMm = SAFE_AREA_MM.width - cfg.widthMm;
    if (align === "top") topMm = 0;
    if (align === "centerY") topMm = (SAFE_AREA_MM.height - cfg.heightMm) / 2;
    if (align === "bottom") topMm = SAFE_AREA_MM.height - cfg.heightMm;

    patchStaticTextCfg(layerId, { leftMm, topMm });
  };

  const alignTextLayerInSafeArea = (layerId, align) => {
    const cfg = getTextCfg(layerId);
    let leftMm = cfg.leftMm;
    let topMm = cfg.topMm;

    if (align === "left") leftMm = 0;
    if (align === "centerX") leftMm = (SAFE_AREA_MM.width - cfg.widthMm) / 2;
    if (align === "right") leftMm = SAFE_AREA_MM.width - cfg.widthMm;
    if (align === "top") topMm = 0;
    if (align === "centerY") topMm = (SAFE_AREA_MM.height - cfg.heightMm) / 2;
    if (align === "bottom") topMm = SAFE_AREA_MM.height - cfg.heightMm;

    patchTextCfg(layerId, { leftMm, topMm });
  };

  const renderTextLayers = () => {
    const textLayers = layers.filter((l) => l.type === "text");
    if (textLayers.length === 0) return null;

    return (
      <div className="custom-text-layer-stack" aria-hidden>
        {textLayers.map((layer) => {
          const cfg = getTextCfg(layer.id);
          const style = {
            width: `${(cfg.widthMm / SAFE_AREA_MM.width) * 100}%`,
            height: `${(cfg.heightMm / SAFE_AREA_MM.height) * 100}%`,
            left: `${(cfg.leftMm / SAFE_AREA_MM.width) * 100}%`,
            top: `${(cfg.topMm / SAFE_AREA_MM.height) * 100}%`,
            transform: `rotate(${cfg.rotateDeg}deg)`,
            fontFamily: `${cfg.fontFamily}, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`,
            fontSize: `${Math.max(8, cfg.fontSizeMm * 0.65)}px`,
            color: cfg.color,
          };

          const displayText =
            cfg.textCase === "upper"
              ? (cfg.text || "").toUpperCase()
              : cfg.text || "";

          return (
            <div
              key={layer.id}
              className={`custom-text-layer alignX-${cfg.textAlignX} alignY-${cfg.textAlignY}`}
              style={style}
            >
              <span className="custom-text-content">{displayText}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderStaticTextLayers = () => {
    const staticLayers = layers.filter((l) => l.type === "static-text");
    if (staticLayers.length === 0) return null;

    return (
      <div className="static-text-layer-stack" aria-hidden>
        {staticLayers.map((layer) => {
          const cfg = getStaticTextCfg(layer.id);
          const style = {
            width: `${(cfg.widthMm / SAFE_AREA_MM.width) * 100}%`,
            height: `${(cfg.heightMm / SAFE_AREA_MM.height) * 100}%`,
            left: `${(cfg.leftMm / SAFE_AREA_MM.width) * 100}%`,
            top: `${(cfg.topMm / SAFE_AREA_MM.height) * 100}%`,
            transform: `rotate(${cfg.rotateDeg}deg)`,
            fontFamily: `${cfg.fontFamily}, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`,
            fontSize: `${Math.max(8, cfg.fontSizeMm * 0.65)}px`,
            color: cfg.color,
          };

          const displayText =
            cfg.textCase === "upper" ? (cfg.text || "").toUpperCase() : cfg.text || "";

          return (
            <div
              key={layer.id}
              className={`custom-text-layer alignX-${cfg.textAlignX} alignY-${cfg.textAlignY}`}
              style={style}
            >
              <span className="custom-text-content">{displayText}</span>
            </div>
          );
        })}
      </div>
    );
  };

  // Cleanup object URLs for custom placeholder images on unmount
  useEffect(() => {
    return () => {
      Object.values(customImageLayerCfgById).forEach((cfg) => {
        if (cfg?.placeholderImageSrc) URL.revokeObjectURL(cfg.placeholderImageSrc);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCustomImageCfg = (layerId) =>
    normalizeCustomImageLayout(
      customImageLayerCfgById[layerId] || defaultCustomImageLayerCfg()
    );

  const patchCustomImageCfg = (layerId, patch) => {
    setCustomImageLayerCfgById((prev) => {
      const current = normalizeCustomImageLayout(
        prev[layerId] || defaultCustomImageLayerCfg()
      );
      const merged = normalizeCustomImageLayout({ ...current, ...patch });
      return { ...prev, [layerId]: merged };
    });
  };

  const alignCustomImageLayer = (layerId, align) => {
    const cfg = getCustomImageCfg(layerId);
    let leftMm = cfg.leftMm;
    let topMm = cfg.topMm;

    if (align === "left") leftMm = 0;
    if (align === "centerX") leftMm = (SAFE_AREA_MM.width - cfg.widthMm) / 2;
    if (align === "right") leftMm = SAFE_AREA_MM.width - cfg.widthMm;
    if (align === "top") topMm = 0;
    if (align === "centerY") topMm = (SAFE_AREA_MM.height - cfg.heightMm) / 2;
    if (align === "bottom") topMm = SAFE_AREA_MM.height - cfg.heightMm;

    patchCustomImageCfg(layerId, { leftMm, topMm });
  };

  const setCustomPlaceholderImage = (layerId, file) => {
    if (!file) return;
    if (!file.type || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = async () => {
      let dataUrl = typeof reader.result === "string" ? reader.result : null;
      if (!dataUrl) return;

      // Compress image before storing
      try {
        dataUrl = await compressImage(dataUrl);
      } catch (err) {
        console.warn("[Designer] Compression failed, using original:", err);
      }

      setCustomImageLayerCfgById((prev) => {
        const current = prev[layerId] || defaultCustomImageLayerCfg();
        // If it was a blob URL, revoke it. But now we prefer Data URLs for persistence.
        if (typeof current.placeholderImageSrc === "string" && current.placeholderImageSrc.startsWith("blob:")) {
          URL.revokeObjectURL(current.placeholderImageSrc);
        }
        return {
          ...prev,
          [layerId]: {
            ...current,
            placeholderType: "custom-image",
            placeholderImageSrc: dataUrl,
          },
        };
      });
    };
    reader.readAsDataURL(file);
  };

  const setUploadedDesignImage = async (file) => {
    if (!file) return;
    if (!file.type || !file.type.startsWith('image/')) return;

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('artwork', file);
      // Optional: you can add a default title or wait for reader
      const uploadRes = await api.post('/artworks/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log("[Designer] Artwork uploaded to library:", uploadRes.data);
      // Refresh library if it was already loaded
      if (libraryArtworks.length > 0) {
        setLibraryArtworks(prev => [uploadRes.data, ...prev]);
      }
    } catch (err) {
      console.error("[Designer] Failed to upload artwork to library:", err);
    } finally {
      setUploadingImage(false);
    }

    const url = URL.createObjectURL(file);

    const reader = new FileReader();
    reader.onload = async () => {
      let dataUrl = typeof reader.result === "string" ? reader.result : null;
      if (!dataUrl) return;

      // Compress image before storing
      try {
        dataUrl = await compressImage(dataUrl);
      } catch (err) {
        console.warn("[Designer] Compression failed, using original:", err);
      }

      setDesignImageDataUrl(dataUrl);
    };
    try {
      reader.readAsDataURL(file);
    } catch {
      // ignore
    }

    setDesignImageSrc((prev) => {
      if (typeof prev === "string" && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return url;
    });
    setDesignTransform({ x: 0, y: 0, scale: 1 });
    setIsImageModalOpen(false);
    setActiveModalTab('upload');
  };

  // ─── FETCH LIBRARY ARTWORKS ───
  useEffect(() => {
    if (isImageModalOpen && activeModalTab === "library") {
      const fetchLibrary = async () => {
        setLibraryLoading(true);
        try {
          const res = await api.get("/artworks");
          setLibraryArtworks(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
          console.error("[Designer] Failed to fetch library artworks:", err);
        } finally {
          setLibraryLoading(false);
        }
      };
      fetchLibrary();
    }
  }, [isImageModalOpen, activeModalTab]);

  const handleSelectFromLibrary = async (artwork) => {
    if (!artwork.fileUrl) return;
    
    // Artwork fileUrl is relative (e.g. /uploads/...)
    let fullUrl = artwork.fileUrl;
    if (!fullUrl.startsWith('http') && !fullUrl.startsWith('data:')) {
      const server = api.defaults.baseURL?.replace('/api', '') || 'http://localhost:5000';
      fullUrl = `${server}${fullUrl}`;
    }

    try {
      setIsImageModalOpen(false);
      setDesignImageSrc(fullUrl);
      setDesignTransform({ x: 0, y: 0, scale: 1 });
      
      // We also need the dataURL for the draft
      const response = await fetch(fullUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        setDesignImageDataUrl(reader.result);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error("[Designer] Failed to load image from library:", err);
    }
  };

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  const handleDesignPointerDown = (e) => {
    if (!designImageSrc) return;
    e.preventDefault();
    dragStateRef.current.dragging = true;
    dragStateRef.current.startX = e.clientX;
    dragStateRef.current.startY = e.clientY;
    dragStateRef.current.originX = designTransform.x;
    dragStateRef.current.originY = designTransform.y;
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleDesignPointerMove = (e) => {
    if (!dragStateRef.current.dragging) return;
    e.preventDefault();
    const dx = e.clientX - dragStateRef.current.startX;
    const dy = e.clientY - dragStateRef.current.startY;
    setDesignTransform((prev) => ({
      ...prev,
      x: dragStateRef.current.originX + dx,
      y: dragStateRef.current.originY + dy,
    }));
  };

  const endDrag = () => {
    dragStateRef.current.dragging = false;
  };

  const handleDesignWheel = (e) => {
    if (!designImageSrc) return;
    e.preventDefault();
    const direction = e.deltaY < 0 ? 1 : -1;
    const factor = direction > 0 ? 1.08 : 0.92;
    setDesignTransform((prev) => ({
      ...prev,
      scale: clamp(prev.scale * factor, 0.2, 6),
    }));
  };

  const renderMayzingAlignIcon = (kind) => {
    const common = {
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      className: "mz-align-svg",
      "aria-hidden": true,
      focusable: false,
    };

    const Stroke = ({ children }) => (
      <g stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </g>
    );

    if (kind === "left") {
      return (
        <svg {...common}>
          <Stroke>
            <path d="M6 4V20" />
            <path d="M18 12H9" />
            <path d="M11 9L8 12L11 15" />
          </Stroke>
        </svg>
      );
    }
    if (kind === "centerX") {
      return (
        <svg {...common}>
          <Stroke>
            <path d="M12 4V20" />
            <path d="M4 12H11" />
            <path d="M20 12H13" />
            <path d="M9 9L12 12L9 15" />
            <path d="M15 9L12 12L15 15" />
          </Stroke>
        </svg>
      );
    }
    if (kind === "right") {
      return (
        <svg {...common}>
          <Stroke>
            <path d="M18 4V20" />
            <path d="M6 12H15" />
            <path d="M13 9L16 12L13 15" />
          </Stroke>
        </svg>
      );
    }
    if (kind === "bottom") {
      return (
        <svg {...common}>
          <Stroke>
            <path d="M4 18H20" />
            <path d="M12 6V15" />
            <path d="M9 13L12 16L15 13" />
          </Stroke>
        </svg>
      );
    }
    if (kind === "centerY") {
      return (
        <svg {...common}>
          <Stroke>
            <path d="M4 12H20" />
            <path d="M12 4V11" />
            <path d="M12 20V13" />
            <path d="M9 9L12 12L15 9" />
            <path d="M9 15L12 12L15 15" />
          </Stroke>
        </svg>
      );
    }
    // top
    return (
      <svg {...common}>
        <Stroke>
          <path d="M4 6H20" />
          <path d="M12 18V9" />
          <path d="M9 11L12 8L15 11" />
        </Stroke>
      </svg>
    );
  };

  const handlePanelScroll = (e) => {
    const scrollTop = e.currentTarget.scrollTop;
    window.dispatchEvent(
      new CustomEvent("nav-scroll", { detail: { scrollTop } })
    );
  };

  // Giả lập scroll cho vùng vải vẽ (vùng giữa không bị tràn màn)
  const handleCanvasWheel = (e) => {
    if (e.deltaY > 0) {
      window.dispatchEvent(
        new CustomEvent("nav-scroll", { detail: { scrollTop: 50 } })
      );
    } else if (e.deltaY < 0) {
      window.dispatchEvent(
        new CustomEvent("nav-scroll", { detail: { scrollTop: 0 } })
      );
    }
  };

  // ─── Danh sách layer động ───
  // Mỗi layer: { id, type: 'custom-image'|'text'|'static-text', expanded: bool }
  const [layers, setLayers] = useState([]);
  const [expandedLayerId, setExpandedLayerId] = useState(null);

  const packDesignDraft = () => ({
    designImageDataUrl: typeof designImageDataUrl === "string" ? designImageDataUrl : null,
    designTransform,
    layers,
    expandedLayerId,
    sidebarView,
    customImageLayerCfgById,
    textLayerCfgById,
    staticTextLayerCfgById,
  });

  const applyDesignDraft = (draft) => {
    const nextImg = typeof draft?.designImageDataUrl === "string" ? draft.designImageDataUrl : null;
    setDesignImageDataUrl(nextImg);
    setDesignImageSrc(nextImg);

    const t = draft?.designTransform;
    setDesignTransform(
      t && typeof t === "object" && Number.isFinite(Number(t.x)) && Number.isFinite(Number(t.y)) && Number.isFinite(Number(t.scale))
        ? { x: Number(t.x), y: Number(t.y), scale: Number(t.scale) }
        : { x: 0, y: 0, scale: 1 }
    );

    setLayers(Array.isArray(draft?.layers) ? draft.layers : []);
    setExpandedLayerId(draft?.expandedLayerId ?? null);
    setSidebarView(typeof draft?.sidebarView === "string" ? draft.sidebarView : "picker");
    setCustomImageLayerCfgById(draft?.customImageLayerCfgById && typeof draft.customImageLayerCfgById === "object" ? draft.customImageLayerCfgById : {});
    setTextLayerCfgById(draft?.textLayerCfgById && typeof draft.textLayerCfgById === "object" ? draft.textLayerCfgById : {});
    setStaticTextLayerCfgById(
      draft?.staticTextLayerCfgById && typeof draft.staticTextLayerCfgById === "object" ? draft.staticTextLayerCfgById : {}
    );
  };

  const resetDesignDraftState = () => {
    setDesignImageSrc(null);
    setDesignImageDataUrl(null);
    setDesignTransform({ x: 0, y: 0, scale: 1 });
    setLayers([]);
    setExpandedLayerId(null);
    setSidebarView("picker");
    setCustomImageLayerCfgById({});
    setTextLayerCfgById({});
    setStaticTextLayerCfgById({});
  };

  const prevProductIdRef = useRef(null);

  // Load the correct draft when switching products; persist the previous product draft.
  useEffect(() => {
    const currentKey = String(selectedProductId);
    const prevKey = prevProductIdRef.current;

    if (prevKey && prevKey !== currentKey) {
      designDraftsRef.current = {
        ...(designDraftsRef.current || {}),
        [prevKey]: packDesignDraft(),
      };
      schedulePersistDrafts();
    }

    const nextDraft = designDraftsRef.current?.[currentKey];
    if (nextDraft) applyDesignDraft(nextDraft);
    else resetDesignDraftState();

    prevProductIdRef.current = currentKey;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProductId]);

  // Persist current product draft as user edits.
  useEffect(() => {
    const currentKey = String(selectedProductId);
    designDraftsRef.current = {
      ...(designDraftsRef.current || {}),
      [currentKey]: packDesignDraft(),
    };
    schedulePersistDrafts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedProductId,
    designImageDataUrl,
    designTransform,
    layers,
    expandedLayerId,
    sidebarView,
    customImageLayerCfgById,
    textLayerCfgById,
    staticTextLayerCfgById,
  ]);

  // Thêm layer mới khi chọn từ picker
  const addLayer = (type) => {
    const newLayer = { id: Date.now(), type };
    setLayers((prev) => [...prev, newLayer]);
    setExpandedLayerId(newLayer.id);
    // Chuyển sang settings view tương ứng
    if (type === "custom-image") {
      setSidebarView("custom-image-settings");
      setCustomImageLayerCfgById((prev) => ({
        ...prev,
        [newLayer.id]: prev[newLayer.id] || defaultCustomImageLayerCfg(),
      }));
    }
    if (type === "text") setSidebarView("text-settings");
    if (type === "static-text") setSidebarView("static-text-settings");

    if (type === "text") {
      setTextLayerCfgById((prev) => ({
        ...prev,
        [newLayer.id]: prev[newLayer.id] || defaultTextLayerCfg(),
      }));
    }

    if (type === "static-text") {
      setStaticTextLayerCfgById((prev) => ({
        ...prev,
        [newLayer.id]: prev[newLayer.id] || defaultStaticTextLayerCfg(),
      }));
    }
  };

  // Xóa layer
  const removeLayer = (id) => {
    setLayers((prev) => {
      const remaining = prev.filter((l) => l.id !== id);
      // Nếu xóa hết → về picker
      if (remaining.length === 0) setSidebarView("picker");
      return remaining;
    });
    if (expandedLayerId === id) setExpandedLayerId(null);

    setCustomImageLayerCfgById((prev) => {
      const current = prev[id];
      if (!current) return prev;
      if (current.placeholderImageSrc) URL.revokeObjectURL(current.placeholderImageSrc);
      const next = { ...prev };
      delete next[id];
      return next;
    });

    setTextLayerCfgById((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });

    setStaticTextLayerCfgById((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  // Toggle expand/collapse layer
  const toggleExpand = (id) => {
    setExpandedLayerId((prev) => {
      const next = prev === id ? null : id;
      if (next) {
        const layer = layers.find((l) => l.id === id);
        if (layer?.type === "custom-image") setSidebarView("custom-image-settings");
        if (layer?.type === "text") setSidebarView("text-settings");
        if (layer?.type === "static-text") setSidebarView("static-text-settings");
      }
      return next;
    });
  };

  // Config hiển thị theo type
  const layerConfig = {
    "custom-image": {
      icon: "fa-solid fa-image",
      title: "Custom image layer",
      desc: "Allow customers to add their own image.",
    },
    text: {
      icon: "fa-solid fa-font",
      title: "Your text",
      desc: "Customizable text layer",
    },
    "static-text": {
      icon: "fa-solid fa-font",
      title: "Your text",
      desc: "Text layer",
    },
  };

  const layerTypes = [
    {
      title: "Image layer",
      desc: "Upload a file or choose an asset from your library",
      icon: "fa-regular fa-image",
    },
    {
      title: "Custom image layer",
      desc: "Allow customers to add their own image.",
      icon: "fa-solid fa-wand-magic-sparkles",
    },
    {
      title: "Customizable text layer",
      desc: "Add a customizable text layer",
      icon: "fa-solid fa-t",
    },
    {
      title: "Text layer",
      desc: "Add a static text layer",
      icon: "fa-solid fa-text-height",
    },
  ];

  const _renderRightPanelContent = () => {
    if (mode === "preview") {
      return (
        <div className="mockup-grid">
          {orderedMockups.map((mockup, i) => (
            <div
              key={i}
              className={`mockup-thumb ${selectedMockup === i ? "active" : ""}`}
              onClick={() => setSelectedMockup(i)}
            >
              <img src={mockup.img} alt={mockup.name} />
              <span>{getMockupLabel(mockup)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null; // edit mode content stays inline
  };

  const hasAnyDesignApplied = Boolean(designImageSrc) || layers.length > 0;

  const isBackViewName = (name) => /\bback\b/i.test(String(name || ""));
  const isSelectedBackView =
    !isDrinkware && isBackViewName(orderedMockups?.[selectedMockup]?.name);

  const proceedToPricing = () => {
    flushPersistDrafts();
    navigate("/pricing", { state: { products, pendingCampaign, designDraftStorageKey } });
  };

  const handleContinueToPricing = () => {
    if (!hasAnyDesignApplied) {
      setIsAboutProductsModalOpen(true);
      return;
    }

    proceedToPricing();
  };
  // ─── Colors (Product variants) ───
  // In Mayzing this section represents which PRODUCT colors/variants are available,
  // not the font/text color.
  const [openColorPickerView, setOpenColorPickerView] = useState(null);
  const colorPopoverRef = useRef(null); // dùng để detect click ra ngoài

  // Global product colors (shared across all 4 settings views)
  const [productColors, setProductColors] = useState(["#000000"]);

  // Helper: lấy state + setter theo view hiện tại (hoặc theo view truyền vào)
  const getColorState = (_view) => {
    // all views share productColors
    return [productColors, setProductColors];
  };

  const renderCustomImageFrames = () => {
    const customLayers = layers.filter((l) => l.type === "custom-image");
    if (customLayers.length === 0) return null;

    return (
      <div className="custom-image-layer-stack" aria-hidden>
        {customLayers.map((layer) => {
          const cfg = getCustomImageCfg(layer.id);
          const style = {
            width: `${(cfg.widthMm / SAFE_AREA_MM.width) * 100}%`,
            height: `${(cfg.heightMm / SAFE_AREA_MM.height) * 100}%`,
            left: `${(cfg.leftMm / SAFE_AREA_MM.width) * 100}%`,
            top: `${(cfg.topMm / SAFE_AREA_MM.height) * 100}%`,
          };
          const placeholder = (() => {
            if (cfg.placeholderType === "blank") return null;
            if (cfg.placeholderType === "text") {
              return (
                <span className="custom-image-placeholder-text">
                  {cfg.placeholderText || ""}
                </span>
              );
            }
            if (cfg.placeholderType === "custom-image" && cfg.placeholderImageSrc) {
              return (
                <img
                  src={cfg.placeholderImageSrc}
                  alt="Placeholder"
                  className="custom-image-placeholder-img"
                  draggable={false}
                />
              );
            }
            // icon (default)
            return <i className="fa-regular fa-image custom-image-placeholder-icon"></i>;
          })();

          return (
            <div
              key={layer.id}
              className={`custom-image-frame shape-${cfg.shape}`}
              style={style}
            >
              {placeholder}
            </div>
          );
        })}
      </div>
    );
  };

  // Đóng popover khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        colorPopoverRef.current &&
        !colorPopoverRef.current.contains(e.target)
      ) {
        setOpenColorPickerView(null);
      }
    };
    if (openColorPickerView) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openColorPickerView]);

  // Danh sách 21 màu chuẩn theo ảnh
  const allColors = [
    "#ffffff",
    "#000000",
    "#c6b59c",
    "#d87093",
    "#ff6347",
    "#d1001c",
    "#8b0000",
    "#778899",
    "#4169e1",
    "#4b0082",
    "#000080",
    "#008000",
    "#556b2f",
    "#d3d3d3",
    "#2f4f4f",
    "#ffd700",
    "#add8e6",
    "#191970",
    "#228b22",
    "#708090",
    "#008b8b",
  ];

  // Toggle một màu cho view đang mở
  const toggleColor = (color) => {
    const [selectedColors, setSelectedColors] =
      getColorState(openColorPickerView);
    if (selectedColors.includes(color)) {
      if (selectedColors.length > 1) {
        setSelectedColors(selectedColors.filter((c) => c !== color));
      }
    } else {
      setSelectedColors([...selectedColors, color]);
    }
  };

  // Chọn / bỏ chọn tất cả cho view đang mở
  const handleSelectAll = (checked) => {
    const [, setSelectedColors] = getColorState(openColorPickerView);
    setSelectedColors(checked ? allColors : ["#ffffff"]);
  };

  // Render phần color section tái sử dụng cho cả 3 view
  const renderColorSection = (view) => {
    const [selectedColors] = getColorState(view);
    const isOpen = openColorPickerView === view;
    return (
      /* ── SECTION MÀU ── dùng chung cho cả 3 view */
      <div className="color-section">
        <p className="sub-label">Colors • {selectedColors.length}</p>
        <div
          className="color-options-row"
          ref={isOpen ? colorPopoverRef : null}
        >
          {/* Hiển thị các màu đã chọn */}
          <div className="selected-colors-list">
            {selectedColors.slice(0, 5).map((color, idx) => (
              <div
                key={idx}
                className="color-circle active"
                style={{ background: color }}
              >
                <i
                  className="fa-solid fa-check"
                  style={{ color: color === "#ffffff" ? "#000" : "#fff" }}
                ></i>
              </div>
            ))}
            {selectedColors.length > 5 && (
              <span className="more-count">+{selectedColors.length - 5}</span>
            )}
          </div>

          {/* Nút mở bảng chọn màu */}
          <div
            className="color-add"
            onClick={() => setOpenColorPickerView(isOpen ? null : view)}
          >
            <i className="fa-solid fa-plus"></i>
          </div>

          {/* POPOVER CHỌN MÀU – đóng khi click ra ngoài */}
          {isOpen && (
            <div className="color-picker-popover" ref={colorPopoverRef}>
              <div className="popover-header">
                {selectedColors.length} out of {allColors.length} colors
              </div>
              <label className="select-all-row">
                <input
                  type="checkbox"
                  checked={selectedColors.length === allColors.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
                <span>Select all</span>
              </label>
              <div className="color-grid-picker">
                {allColors.map((color, idx) => (
                  <div
                    key={idx}
                    className="color-item"
                    style={{ background: color }}
                    onClick={() => toggleColor(color)}
                  >
                    {selectedColors.includes(color) && (
                      <i
                        className="fa-solid fa-check"
                        style={{
                          color: color === "#ffffff" ? "#000" : "#fff",
                        }}
                      ></i>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <span className="available-text">
          Available colors • {allColors.length}
        </span>
      </div>
    );
  };

  return (
    <div className={`designer-wrapper ${isScrolled ? "scrolled" : ""}`}>


      {/* Hidden inputs used for advanced pickers */}
      <input
        ref={uploadFontInputRef}
        type="file"
        accept=".ttf,.otf,.woff,.woff2,font/ttf,font/otf,font/woff,font/woff2"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleUploadFont(f);
        }}
      />
      <input
        ref={arbitraryTextColorInputRef}
        type="color"
        style={{ display: "none" }}
        onChange={(e) => {
          const picked = e.target.value;
          const target = arbitraryColorTarget;
          if (!picked || !target?.layerId || !target?.kind) return;
          if (target.kind === "static-text") {
            patchStaticTextCfg(target.layerId, { color: picked });
          } else {
            patchTextCfg(target.layerId, { color: picked });
          }
        }}
      />

      <header className="designer-header-v2">
        <div className="header-left-part">
          <h2>Classic Unisex T-shirt</h2>
          <span>Gildan 64000, Gildan 5000</span>
        </div>
        <div className="header-center-part">
          {/* Điều khiển chuyển Mode */}
          <button
            className={`btn-mode-tab ${mode === "edit" ? "active" : ""}`}
            onClick={() => setMode("edit")}
          >
            Edit
          </button>
          <button
            className={`btn-mode-tab ${mode === "preview" ? "active" : ""}`}
            onClick={() => setMode("preview")}
          >
            Preview
          </button>
        </div>
        <div className="header-right-part">
          {/* Tiêu đề cột phải thay đổi theo Mode */}
          <h3>{mode === "edit" ? "Product details" : "Product views"}</h3>
        </div>
      </header>

      <div className="designer-layout-v2">
        {/* CỘT 1: LEFT PANEL */}
        <aside className="left-panel-v2" onClick={() => setOpenMenuId(null)}>
          <div className="panel-content-area" onScroll={handlePanelScroll}>
            <div className="panel-header">Product • {products.length}</div>
            {products.map((product) => (
              <div
                key={product.id}
                className={`active-product-card ${
                  selectedProductId === product.id ? "selected" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedProductId(product.id);
                  setOpenMenuId(null);
                }}
              >
                <div className="prod-img">
                  <img src={product.img} alt="thumb" />
                </div>
                <div className="prod-meta">
                  <h4>{product.name}</h4>
                  <span>{product.models}</span>
                </div>
                <div
                  className="more-btn-wrapper"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="more-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(
                        openMenuId === product.id ? null : product.id
                      );
                    }}
                  >
                    <i className="fa-solid fa-ellipsis-vertical"></i>
                  </button>
                  {openMenuId === product.id && (
                    <div className="product-dropdown-menu">
                      <button onClick={() => handleDuplicate(product)}>
                        Duplicate product
                      </button>
                      <button
                        className={products.length === 1 ? "disabled" : ""}
                        onClick={() =>
                          products.length > 1 && handleRemove(product.id)
                        }
                      >
                        Remove product
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="panel-footer-v2">
            <button className="add-prod-footer">
              Add product <span>+</span>
            </button>
          </div>
        </aside>

        {/* CỘT 2: CANVAS */}
        <section className="canvas-section-v2" onWheel={handleCanvasWheel}>
          {mode === "edit" ? (
            <div className="panel-content-area" onScroll={handlePanelScroll}>
              {hasBackView && (
                <div className="side-switches">
                  <button
                    className={side === "Front" ? "active" : ""}
                    onClick={() => setSide("Front")}
                  >
                    Front
                  </button>
                  <button
                    className={side === "Back" ? "active" : ""}
                    onClick={() => setSide("Back")}
                  >
                    Back
                  </button>
                </div>
              )}
              <div className="main-canvas">
                <img
                  src={
                    isDrinkware
                      ? (drinkwareEditMockup?.img ||
                          activeMockupPack?.defaultImg ||
                          defaultTshirtMockupImg)
                      : !hasBackView
                        ? (orderedMockups[0]?.img ||
                            activeMockupPack?.defaultImg ||
                            defaultTshirtMockupImg)
                        : side === "Front"
                          ? (orderedMockups[0]?.img ||
                              activeMockupPack?.defaultImg ||
                              defaultTshirtMockupImg)
                          : (orderedMockups[1]?.img ||
                              activeMockupPack?.defaultImg ||
                              defaultTshirtMockupImg)
                  }
                  alt="Product"
                  className="shirt-img"
                />
                <div
                  className={`print-safe-area safe-area-${activeMockupPack?.key || "tshirt"} ${
                    designImageSrc ? "interactive" : ""
                  }`}
                >
                  {renderCustomImageFrames()}
                  {renderTextLayers()}
                  {renderStaticTextLayers()}
                  {designImageSrc && (
                    <div
                      className="print-design-viewport"
                      onPointerDown={handleDesignPointerDown}
                      onPointerMove={handleDesignPointerMove}
                      onPointerUp={endDrag}
                      onPointerCancel={endDrag}
                      onLostPointerCapture={endDrag}
                      onWheel={handleDesignWheel}
                      onDoubleClick={() => setDesignTransform({ x: 0, y: 0, scale: 1 })}
                    >
                      <img
                        src={designImageSrc}
                        alt="Design"
                        className="print-design-image"
                        draggable={false}
                        style={{
                          transform: `translate(-50%, -50%) translate(${designTransform.x}px, ${designTransform.y}px) scale(${designTransform.scale})`,
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* GIAO DIỆN PREVIEW */
            <div className="preview-container">
              {!hasAnyDesignApplied && (
                <div className="blank-notice">
                  <i className="fa-solid fa-circle-info"></i> This product is
                  blank. Please add a design.
                </div>
              )}
              <div className="main-preview-mockup">
                <div className="preview-mockup-stage">
                  {(() => {
                    const active = orderedMockups[selectedMockup] || orderedMockups[0];
                    return (
                      <img
                        src={active?.img || activeMockupPack?.defaultImg || defaultTshirtMockupImg}
                        alt={active?.name || "Mockup"}
                      />
                    );
                  })()}

                  {hasAnyDesignApplied && !isSelectedBackView && (
                    <div
                      className={`print-safe-area preview safe-area-${
                        activeMockupPack?.key || "tshirt"
                      }`}
                    >
                      {renderCustomImageFrames()}
                      {renderTextLayers()}
                      {renderStaticTextLayers()}
                      {designImageSrc && (
                        <div className="print-design-viewport preview">
                          <img
                            src={designImageSrc}
                            alt="Design"
                            className="print-design-image"
                            draggable={false}
                            style={{
                              transform: `translate(-50%, -50%) translate(${designTransform.x}px, ${designTransform.y}px) scale(${designTransform.scale})`,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="panel-footer-v2 canvas-footer-gap"></div>
        </section>

        {/* CỘT 3: RIGHT PANEL (FIXED LOGIC) */}
        <aside className="right-panel-v2">
          <div className="panel-content-area" onScroll={handlePanelScroll}>
            {mode === "edit" ? (
              sidebarView === "picker" ? (
                /* --- VIEW CHỌN LAYER --- */
                <div className="layer-picker">
                  <p className="sub-label">Choose a layer type</p>
                  {layerTypes.map((layer, i) => (
                    <div
                      key={i}
                      className="layer-option-card"
                      onClick={() => {
                        if (i === 0) setIsImageModalOpen(true);
                        if (i === 1) addLayer("custom-image");
                        if (i === 2) addLayer("text");
                        if (i === 3) addLayer("static-text");
                      }}
                    >
                      <div className="icon-box">
                        <i className={layer.icon}></i>
                      </div>
                      <div className="text-box">
                        <h5>{layer.title}</h5>
                        <p>{layer.desc}</p>
                      </div>
                    </div>
                  ))}
                  <div className="file-specs">
                    <p className="sub-label">Print file requirements</p>
                    <ul>
                      <li>
                        <strong>JPG and PNG</strong> file types supported
                      </li>
                      <li>
                        Maximum file size <strong>50 MB</strong>
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                /* ─── SETTINGS VIEW (image-settings / text-settings / static-text-settings) ─── */
                <div className="design-management">
                  {/* ── PHẦN MÀU – dùng hàm tái sử dụng theo sidebarView hiện tại ── */}
                  {renderColorSection(sidebarView)}

                  {/* ── YOUR DESIGN + DANH SÁCH LAYER ── */}
                  <div className="your-design-section">
                    <p className="sub-label">Your design</p>

                    {/* Nút "Add another layer" → quay về picker để chọn thêm */}
                    <div
                      className="add-layer-dotted"
                      onClick={() => setSidebarView("picker")}
                    >
                      <div className="add-icon-box">
                        <i className="fa-solid fa-plus"></i>
                      </div>
                      <div className="add-text-box">
                        <h5>Add another layer</h5>
                        <p>
                          Print area size{" "}
                          <strong>4200 x 4800 px (300 dpi)</strong>
                        </p>
                      </div>
                    </div>

                    {/* ── DANH SÁCH LAYER ĐỘNG ── */}
                    {layers.map((layer) => {
                      const cfg = layerConfig[layer.type];
                      const isOpen = expandedLayerId === layer.id;
                      const customCfg =
                        layer.type === "custom-image"
                          ? getCustomImageCfg(layer.id)
                          : null;
                      return (
                        <div
                          key={layer.id}
                          className={`layer-card-v2 ${
                            isOpen ? "expanded" : ""
                          }`}
                        >
                          {/* HEADER: click để expand/collapse */}
                          <div
                            className="layer-card-header"
                            onClick={() => toggleExpand(layer.id)}
                          >
                            <div className="left-info">
                              <i className="fa-solid fa-grip-vertical drag-dots"></i>
                              <i className={`${cfg.icon} layer-icon-main`}></i>
                              <div className="title-stack">
                                <h5>{cfg.title}</h5>
                                <p>
                                  {cfg.desc}{" "}
                                  <i className="fa-solid fa-circle-info"></i>
                                </p>
                              </div>
                            </div>
                            <div
                              className="right-actions"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {/* Icon copy – mở expand (giống click header) */}
                              <i
                                className="fa-regular fa-copy"
                                title="Duplicate layer"
                                style={{ cursor: "pointer" }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const clone = { ...layer, id: Date.now() };
                                  setLayers((prev) => {
                                    const idx = prev.findIndex(
                                      (l) => l.id === layer.id
                                    );
                                    const next = [...prev];
                                    next.splice(idx + 1, 0, clone);
                                    return next;
                                  });
                                  setExpandedLayerId(clone.id);
                                }}
                              ></i>
                              {/* Icon thùng rác – xóa layer */}
                              <i
                                className="fa-regular fa-trash-can"
                                title="Delete layer"
                                style={{ cursor: "pointer", color: "#e53935" }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeLayer(layer.id);
                                }}
                              ></i>
                            </div>
                          </div>

                          {/* BODY: chỉ hiện khi isOpen */}
                          {isOpen && (
                            <div className="layer-card-body">
                              {/* ── Custom image layer body ── */}
                              {layer.type === "custom-image" && (
                                <>
                                  <div className="input-group-v2">
                                    <label>
                                      Create a prompt for your buyers{" "}
                                      <i className="fa-solid fa-circle-info"></i>
                                    </label>
                                    <div className="input-with-toggle">
                                      <input
                                        type="text"
                                        placeholder=""
                                        value={customCfg.promptText || ""}
                                        disabled={!customCfg.promptEnabled}
                                        onChange={(e) =>
                                          patchCustomImageCfg(layer.id, {
                                            promptText: e.target.value,
                                          })
                                        }
                                      />
                                      <label className="toggle-switch" title="Enable prompt">
                                        <input
                                          type="checkbox"
                                          checked={Boolean(customCfg.promptEnabled)}
                                          onChange={(e) =>
                                            patchCustomImageCfg(layer.id, {
                                              promptEnabled: e.target.checked,
                                            })
                                          }
                                        />
                                        <span className="toggle-slider" />
                                      </label>
                                    </div>
                                  </div>
                                  <div className="shape-section">
                                    <label>Image area shape</label>
                                    <p>
                                      Choose the shape of your custom image
                                      frame
                                    </p>
                                    <div className="shape-grid">
                                      <button
                                        className={
                                          customCfg.shape === "square"
                                            ? "active"
                                            : ""
                                        }
                                        onClick={(e) => {
                                          e.preventDefault();
                                          patchCustomImageCfg(layer.id, {
                                            shape: "square",
                                          });
                                        }}
                                      >
                                        <i className="fa-solid fa-square"></i>
                                      </button>
                                      <button
                                        className={
                                          customCfg.shape === "circle"
                                            ? "active"
                                            : ""
                                        }
                                        onClick={(e) => {
                                          e.preventDefault();
                                          patchCustomImageCfg(layer.id, {
                                            shape: "circle",
                                          });
                                        }}
                                      >
                                        <i className="fa-solid fa-circle"></i>
                                      </button>
                                      <button
                                        className={
                                          customCfg.shape === "star"
                                            ? "active"
                                            : ""
                                        }
                                        onClick={(e) => {
                                          e.preventDefault();
                                          patchCustomImageCfg(layer.id, {
                                            shape: "star",
                                          });
                                        }}
                                      >
                                        <i className="fa-solid fa-star"></i>
                                      </button>
                                      <button
                                        className={
                                          customCfg.shape === "certificate"
                                            ? "active"
                                            : ""
                                        }
                                        onClick={(e) => {
                                          e.preventDefault();
                                          patchCustomImageCfg(layer.id, {
                                            shape: "certificate",
                                          });
                                        }}
                                      >
                                        <i className="fa-solid fa-certificate"></i>
                                      </button>
                                      <button
                                        className={
                                          customCfg.shape === "heart"
                                            ? "active"
                                            : ""
                                        }
                                        onClick={(e) => {
                                          e.preventDefault();
                                          patchCustomImageCfg(layer.id, {
                                            shape: "heart",
                                          });
                                        }}
                                      >
                                        <i className="fa-solid fa-heart"></i>
                                      </button>
                                    </div>
                                    <span className="blue-link">
                                      Custom shape{" "}
                                      <span className="blue-bold">
                                        Select custom shape
                                      </span>
                                    </span>
                                  </div>
                                  <div className="placeholder-options">
                                    <label>Placeholder image</label>
                                    <p>
                                      Choose how to display the image area to
                                      your customers
                                    </p>
                                    <div className="radio-group">
                                      <label className="radio-item">
                                        <input
                                          type="radio"
                                          name={`place-${layer.id}`}
                                          checked={
                                            customCfg.placeholderType ===
                                            "icon"
                                          }
                                          onChange={() =>
                                            patchCustomImageCfg(layer.id, {
                                              placeholderType: "icon",
                                            })
                                          }
                                        />{" "}
                                        <span>Icon</span>
                                      </label>
                                      <label className="radio-item">
                                        <input
                                          type="radio"
                                          name={`place-${layer.id}`}
                                          checked={
                                            customCfg.placeholderType ===
                                            "text"
                                          }
                                          onChange={() =>
                                            patchCustomImageCfg(layer.id, {
                                              placeholderType: "text",
                                            })
                                          }
                                        />{" "}
                                        <span>Text</span>
                                      </label>
                                      <label className="radio-item">
                                        <input
                                          type="radio"
                                          name={`place-${layer.id}`}
                                          checked={
                                            customCfg.placeholderType ===
                                            "blank"
                                          }
                                          onChange={() =>
                                            patchCustomImageCfg(layer.id, {
                                              placeholderType: "blank",
                                            })
                                          }
                                        />{" "}
                                        <span>Blank</span>
                                      </label>
                                      <label className="radio-item">
                                        <input
                                          type="radio"
                                          name={`place-${layer.id}`}
                                          checked={
                                            customCfg.placeholderType ===
                                            "custom-image"
                                          }
                                          onChange={() =>
                                            patchCustomImageCfg(layer.id, {
                                              placeholderType: "custom-image",
                                            })
                                          }
                                        />{" "}
                                        <span>Custom placeholder image</span>
                                      </label>
                                    </div>

                                    {customCfg.placeholderType === "text" && (
                                      <div className="input-group-v2" style={{ marginTop: 10 }}>
                                        <label className="sub-field-label">Placeholder text</label>
                                        <input
                                          type="text"
                                          value={customCfg.placeholderText}
                                          onChange={(e) =>
                                            patchCustomImageCfg(layer.id, {
                                              placeholderText: e.target.value,
                                            })
                                          }
                                          className="full-input"
                                        />
                                      </div>
                                    )}

                                    {customCfg.placeholderType ===
                                      "custom-image" && (
                                      <div className="input-group-v2" style={{ marginTop: 10 }}>
                                        <label className="sub-field-label">
                                          Upload placeholder image
                                        </label>
                                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                          <button
                                            type="button"
                                            className="btn-upload-placeholder"
                                            onClick={() =>
                                              customPlaceholderInputRefs.current[
                                                layer.id
                                              ]?.click()
                                            }
                                          >
                                            Choose file
                                          </button>
                                          <input
                                            type="file"
                                            accept="image/*"
                                            style={{ display: "none" }}
                                            ref={(el) => {
                                              if (el)
                                                customPlaceholderInputRefs.current[
                                                  layer.id
                                                ] = el;
                                            }}
                                            onChange={(e) => {
                                              const f = e.target.files?.[0];
                                              if (f)
                                                setCustomPlaceholderImage(
                                                  layer.id,
                                                  f
                                                );
                                            }}
                                          />
                                          {customCfg.placeholderImageSrc && (
                                            <span className="placeholder-file-hint">
                                              Selected
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <div className="size-section">
                                    <label>Size</label>
                                    <div className="size-pos-grid">
                                      <div className="field">
                                        <label className="sub-field-label">
                                          Width
                                        </label>
                                        <div className="unit-input">
                                          <input
                                            type="number"
                                            value={customCfg.widthMm}
                                            onChange={(e) =>
                                              patchCustomImageCfg(layer.id, {
                                                widthMm: Number(e.target.value),
                                              })
                                            }
                                          />{" "}
                                          <span>mm</span>
                                        </div>
                                      </div>
                                      <div className="link-icon-box">
                                        <i className="fa-solid fa-link"></i>
                                      </div>
                                      <div className="field">
                                        <label className="sub-field-label">
                                          Height
                                        </label>
                                        <div className="unit-input">
                                          <input
                                            type="number"
                                            value={customCfg.heightMm}
                                            onChange={(e) =>
                                              patchCustomImageCfg(layer.id, {
                                                heightMm: Number(e.target.value),
                                              })
                                            }
                                          />{" "}
                                          <span>mm</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="position-section">
                                    <label>Positioning</label>
                                    <div className="size-pos-grid no-link">
                                      <div className="field">
                                        <label className="sub-field-label">
                                          Left
                                        </label>
                                        <div className="unit-input">
                                          <input
                                            type="number"
                                            value={customCfg.leftMm}
                                            onChange={(e) =>
                                              patchCustomImageCfg(layer.id, {
                                                leftMm: Number(e.target.value),
                                              })
                                            }
                                          />{" "}
                                          <span>mm</span>
                                        </div>
                                      </div>
                                      <div className="field">
                                        <label className="sub-field-label">
                                          Top
                                        </label>
                                        <div className="unit-input">
                                          <input
                                            type="number"
                                            value={customCfg.topMm}
                                            onChange={(e) =>
                                              patchCustomImageCfg(layer.id, {
                                                topMm: Number(e.target.value),
                                              })
                                            }
                                          />{" "}
                                          <span>mm</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="align-section">
                                    <label>Align</label>
                                    <div className="align-buttons">
                                      <button
                                        type="button"
                                        title="Align Left"
                                        onClick={() =>
                                          alignCustomImageLayer(layer.id, "left")
                                        }
                                      >
                                        {renderMayzingAlignIcon("left")}
                                      </button>
                                      <button
                                        type="button"
                                        title="Align Center"
                                        onClick={() =>
                                          alignCustomImageLayer(layer.id, "centerX")
                                        }
                                      >
                                        {renderMayzingAlignIcon("centerX")}
                                      </button>
                                      <button
                                        type="button"
                                        title="Align Right"
                                        onClick={() =>
                                          alignCustomImageLayer(layer.id, "right")
                                        }
                                      >
                                        {renderMayzingAlignIcon("right")}
                                      </button>
                                      <button
                                        type="button"
                                        title="Align Bottom"
                                        onClick={() =>
                                          alignCustomImageLayer(layer.id, "bottom")
                                        }
                                      >
                                        {renderMayzingAlignIcon("bottom")}
                                      </button>
                                      <button
                                        type="button"
                                        title="Align Center Vertical"
                                        onClick={() =>
                                          alignCustomImageLayer(layer.id, "centerY")
                                        }
                                      >
                                        {renderMayzingAlignIcon("centerY")}
                                      </button>
                                      <button
                                        type="button"
                                        title="Align Top"
                                        onClick={() =>
                                          alignCustomImageLayer(layer.id, "top")
                                        }
                                      >
                                        {renderMayzingAlignIcon("top")}
                                      </button>
                                    </div>
                                  </div>
                                </>
                              )}

                              {/* ── Customizable text layer body ── */}
                              {layer.type === "text" && (
                                <>
                                  <div className="input-group-v2">
                                    <label>Customizable text placeholder</label>
                                    <input
                                      type="text"
                                      value={getTextCfg(layer.id).text}
                                      onChange={(e) =>
                                        patchTextCfg(layer.id, {
                                          text: e.target.value,
                                        })
                                      }
                                      className="full-input"
                                    />
                                  </div>
                                  <div className="input-group-v2">
                                    <label>
                                      Create a prompt for your buyers{" "}
                                      <i className="fa-solid fa-circle-info"></i>
                                    </label>
                                    <div className="input-with-toggle">
                                      <input
                                        type="text"
                                        value={getTextCfg(layer.id).promptText || ""}
                                        disabled={!getTextCfg(layer.id).promptEnabled}
                                        onChange={(e) =>
                                          patchTextCfg(layer.id, {
                                            promptText: e.target.value,
                                          })
                                        }
                                      />
                                      <label className="toggle-switch" title="Enable prompt">
                                        <input
                                          type="checkbox"
                                          checked={Boolean(getTextCfg(layer.id).promptEnabled)}
                                          onChange={(e) =>
                                            patchTextCfg(layer.id, {
                                              promptEnabled: e.target.checked,
                                            })
                                          }
                                        />
                                        <span className="toggle-slider" />
                                      </label>
                                    </div>
                                  </div>
                                  <div className="font-settings">
                                    <label className="section-label">
                                      Font
                                    </label>
                                    <div className="input-group-v2">
                                      <label className="sub-field-label">
                                        Color
                                      </label>
                                      <div className="color-picker-input">
                                        <div
                                          className="color-preview"
                                          style={{ background: getTextCfg(layer.id).color }}
                                        ></div>
                                        <span>{getTextCfg(layer.id).color}</span>
                                        <i
                                          className="fa-solid fa-pencil edit-pencil"
                                          style={{ cursor: "pointer" }}
                                          onClick={() =>
                                            openArbitraryColorPickerForLayer(layer.id, "text")
                                          }
                                        ></i>
                                      </div>
                                    </div>
                                    <div className="input-group-v2">
                                      <label className="sub-field-label">
                                        Font
                                      </label>
                                      <div className="font-selector">
                                        <select
                                          value={getTextCfg(layer.id).fontFamily}
                                          onChange={(e) =>
                                            patchTextCfg(layer.id, {
                                              fontFamily: e.target.value,
                                            })
                                          }
                                        >
                                          <option value="Abril Fatface">
                                            Abril Fatface
                                          </option>
                                          <option value="Inter">Inter</option>
                                          <option value="Arial">Arial</option>
                                          <option value="Times New Roman">
                                            Times New Roman
                                          </option>
                                          {uploadedFonts.map((f) => (
                                            <option key={f.family} value={f.family}>
                                              {f.label}
                                            </option>
                                          ))}
                                        </select>
                                        <span
                                          className="upload-font-link"
                                          style={{ cursor: "pointer" }}
                                          onClick={() =>
                                            uploadFontInputRef.current?.click()
                                          }
                                        >
                                          Upload font
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-align-section">
                                    <label>Text alignment</label>
                                    <div className="align-buttons">
                                      <button
                                        type="button"
                                        className={
                                          getTextCfg(layer.id).textAlignX ===
                                          "left"
                                            ? "active"
                                            : ""
                                        }
                                        onClick={() =>
                                          patchTextCfg(layer.id, {
                                            textAlignX: "left",
                                          })
                                        }
                                      >
                                        {renderMayzingAlignIcon("left")}
                                      </button>
                                      <button
                                        type="button"
                                        className={
                                          getTextCfg(layer.id).textAlignX ===
                                          "center"
                                            ? "active"
                                            : ""
                                        }
                                        onClick={() =>
                                          patchTextCfg(layer.id, {
                                            textAlignX: "center",
                                          })
                                        }
                                      >
                                        {renderMayzingAlignIcon("centerX")}
                                      </button>
                                      <button
                                        type="button"
                                        className={
                                          getTextCfg(layer.id).textAlignX ===
                                          "right"
                                            ? "active"
                                            : ""
                                        }
                                        onClick={() =>
                                          patchTextCfg(layer.id, {
                                            textAlignX: "right",
                                          })
                                        }
                                      >
                                        {renderMayzingAlignIcon("right")}
                                      </button>
                                      <button
                                        type="button"
                                        className={
                                          getTextCfg(layer.id).textAlignY ===
                                          "top"
                                            ? "active"
                                            : ""
                                        }
                                        onClick={() =>
                                          patchTextCfg(layer.id, {
                                            textAlignY: "top",
                                          })
                                        }
                                      >
                                        {renderMayzingAlignIcon("top")}
                                      </button>
                                      <button
                                        type="button"
                                        className={
                                          getTextCfg(layer.id).textAlignY ===
                                          "middle"
                                            ? "active"
                                            : ""
                                        }
                                        onClick={() =>
                                          patchTextCfg(layer.id, {
                                            textAlignY: "middle",
                                          })
                                        }
                                      >
                                        {renderMayzingAlignIcon("centerY")}
                                      </button>
                                      <button
                                        type="button"
                                        className={
                                          getTextCfg(layer.id).textAlignY ===
                                          "bottom"
                                            ? "active"
                                            : ""
                                        }
                                        onClick={() =>
                                          patchTextCfg(layer.id, {
                                            textAlignY: "bottom",
                                          })
                                        }
                                      >
                                        {renderMayzingAlignIcon("bottom")}
                                      </button>
                                    </div>
                                  </div>
                                  <div className="size-section">
                                    <label>Size</label>
                                    <div className="input-group-v2">
                                      <label className="sub-field-label">
                                        Font size
                                      </label>
                                      <div className="unit-input">
                                        <input
                                          type="number"
                                          value={getTextCfg(layer.id).fontSizeMm}
                                          onChange={(e) =>
                                            patchTextCfg(layer.id, {
                                              fontSizeMm: Number(e.target.value),
                                            })
                                          }
                                        />{" "}
                                        <span>mm</span>
                                      </div>
                                    </div>
                                    <div className="size-pos-grid no-link">
                                      <div className="field">
                                        <label className="sub-field-label">
                                          Width
                                        </label>
                                        <div className="unit-input">
                                          <input
                                            type="number"
                                            value={getTextCfg(layer.id).widthMm}
                                            onChange={(e) =>
                                              patchTextCfg(layer.id, {
                                                widthMm: Number(e.target.value),
                                              })
                                            }
                                          />{" "}
                                          <span>mm</span>
                                        </div>
                                      </div>
                                      <div className="field">
                                        <label className="sub-field-label">
                                          Height
                                        </label>
                                        <div className="unit-input">
                                          <input
                                            type="number"
                                            value={getTextCfg(layer.id).heightMm}
                                            onChange={(e) =>
                                              patchTextCfg(layer.id, {
                                                heightMm: Number(e.target.value),
                                              })
                                            }
                                          />{" "}
                                          <span>mm</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="position-section">
                                    <label>Positioning</label>
                                    <div className="size-pos-grid no-link">
                                      <div className="field">
                                        <label className="sub-field-label">
                                          Left
                                        </label>
                                        <div className="unit-input">
                                          <input
                                            type="number"
                                            value={getTextCfg(layer.id).leftMm}
                                            onChange={(e) =>
                                              patchTextCfg(layer.id, {
                                                leftMm: Number(e.target.value),
                                              })
                                            }
                                          />{" "}
                                          <span>mm</span>
                                        </div>
                                      </div>
                                      <div className="field">
                                        <label className="sub-field-label">
                                          Top
                                        </label>
                                        <div className="unit-input">
                                          <input
                                            type="number"
                                            value={getTextCfg(layer.id).topMm}
                                            onChange={(e) =>
                                              patchTextCfg(layer.id, {
                                                topMm: Number(e.target.value),
                                              })
                                            }
                                          />{" "}
                                          <span>mm</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="transform-section">
                                    <label>Transform</label>
                                    <div className="field">
                                      <label className="sub-field-label">
                                        Rotate
                                      </label>
                                      <div className="unit-input">
                                        <input
                                          type="number"
                                          value={getTextCfg(layer.id).rotateDeg}
                                          onChange={(e) =>
                                            patchTextCfg(layer.id, {
                                              rotateDeg: Number(e.target.value),
                                            })
                                          }
                                        />{" "}
                                        <span>deg</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="align-section">
                                    <label>Align</label>
                                    <div className="align-buttons">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          alignTextLayerInSafeArea(
                                            layer.id,
                                            "left"
                                          )
                                        }
                                      >
                                        {renderMayzingAlignIcon("left")}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          alignTextLayerInSafeArea(
                                            layer.id,
                                            "centerX"
                                          )
                                        }
                                      >
                                        {renderMayzingAlignIcon("centerX")}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          alignTextLayerInSafeArea(
                                            layer.id,
                                            "right"
                                          )
                                        }
                                      >
                                        {renderMayzingAlignIcon("right")}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          alignTextLayerInSafeArea(
                                            layer.id,
                                            "bottom"
                                          )
                                        }
                                      >
                                        {renderMayzingAlignIcon("bottom")}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          alignTextLayerInSafeArea(
                                            layer.id,
                                            "centerY"
                                          )
                                        }
                                      >
                                        {renderMayzingAlignIcon("centerY")}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          alignTextLayerInSafeArea(
                                            layer.id,
                                            "top"
                                          )
                                        }
                                      >
                                        {renderMayzingAlignIcon("top")}
                                      </button>
                                    </div>
                                  </div>
                                  <div className="case-section">
                                    <label>Case</label>
                                    <div className="case-buttons">
                                      <button
                                        type="button"
                                        className={
                                          getTextCfg(layer.id).textCase ===
                                          "title"
                                            ? "active"
                                            : ""
                                        }
                                        onClick={() =>
                                          patchTextCfg(layer.id, {
                                            textCase: "title",
                                          })
                                        }
                                      >
                                        Tt
                                      </button>
                                      <button
                                        type="button"
                                        className={
                                          getTextCfg(layer.id).textCase ===
                                          "upper"
                                            ? "active"
                                            : ""
                                        }
                                        onClick={() =>
                                          patchTextCfg(layer.id, {
                                            textCase: "upper",
                                          })
                                        }
                                      >
                                        TT
                                      </button>
                                    </div>
                                  </div>
                                </>
                              )}

                              {/* ── Static text layer body ── */}
                              {layer.type === "static-text" && (
                                <>
                                  <div className="input-group-v2">
                                    <label>Text</label>
                                    <input
                                      type="text"
                                      value={getStaticTextCfg(layer.id).text}
                                      onChange={(e) =>
                                        patchStaticTextCfg(layer.id, {
                                          text: e.target.value,
                                        })
                                      }
                                      className="full-input"
                                    />
                                  </div>
                                  <div className="font-section">
                                    <label>Font</label>
                                    <div className="field">
                                      <label className="sub-field-label">
                                        Color
                                      </label>
                                      <div className="color-picker-box">
                                        <div
                                          className="color-sample"
                                          style={{ background: getStaticTextCfg(layer.id).color }}
                                        ></div>
                                        <span>{getStaticTextCfg(layer.id).color}</span>
                                        <i
                                          className="fa-solid fa-pencil"
                                          style={{ cursor: "pointer" }}
                                          onClick={() =>
                                            openArbitraryColorPickerForLayer(
                                              layer.id,
                                              "static-text"
                                            )
                                          }
                                        ></i>
                                      </div>
                                    </div>
                                    <div className="field">
                                      <label className="sub-field-label">
                                        Font
                                      </label>
                                      <div className="font-selector-row">
                                        <select
                                          className="font-dropdown"
                                          value={getStaticTextCfg(layer.id).fontFamily}
                                          onChange={(e) =>
                                            patchStaticTextCfg(layer.id, {
                                              fontFamily: e.target.value,
                                            })
                                          }
                                        >
                                          <option value="Abril Fatface">Abril Fatface</option>
                                          <option value="Inter">Inter</option>
                                          <option value="Arial">Arial</option>
                                          <option value="Times New Roman">Times New Roman</option>
                                          {uploadedFonts.map((f) => (
                                            <option key={f.family} value={f.family}>
                                              {f.label}
                                            </option>
                                          ))}
                                        </select>
                                        <span
                                          className="upload-link"
                                          style={{ cursor: "pointer" }}
                                          onClick={() => uploadFontInputRef.current?.click()}
                                        >
                                          Upload font
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-align-section">
                                    <label>Text alignment</label>
                                    <div className="align-buttons">
                                      <button
                                        type="button"
                                        className={
                                          getStaticTextCfg(layer.id).textAlignX === "left"
                                            ? "active"
                                            : ""
                                        }
                                        onClick={() =>
                                          patchStaticTextCfg(layer.id, { textAlignX: "left" })
                                        }
                                      >
                                        {renderMayzingAlignIcon("left")}
                                      </button>
                                      <button
                                        type="button"
                                        className={
                                          getStaticTextCfg(layer.id).textAlignX === "center"
                                            ? "active"
                                            : ""
                                        }
                                        onClick={() =>
                                          patchStaticTextCfg(layer.id, { textAlignX: "center" })
                                        }
                                      >
                                        {renderMayzingAlignIcon("centerX")}
                                      </button>
                                      <button
                                        type="button"
                                        className={
                                          getStaticTextCfg(layer.id).textAlignX === "right"
                                            ? "active"
                                            : ""
                                        }
                                        onClick={() =>
                                          patchStaticTextCfg(layer.id, { textAlignX: "right" })
                                        }
                                      >
                                        {renderMayzingAlignIcon("right")}
                                      </button>
                                      <button
                                        type="button"
                                        className={
                                          getStaticTextCfg(layer.id).textAlignY === "top"
                                            ? "active"
                                            : ""
                                        }
                                        onClick={() =>
                                          patchStaticTextCfg(layer.id, { textAlignY: "top" })
                                        }
                                      >
                                        {renderMayzingAlignIcon("top")}
                                      </button>
                                      <button
                                        type="button"
                                        className={
                                          getStaticTextCfg(layer.id).textAlignY === "middle"
                                            ? "active"
                                            : ""
                                        }
                                        onClick={() =>
                                          patchStaticTextCfg(layer.id, { textAlignY: "middle" })
                                        }
                                      >
                                        {renderMayzingAlignIcon("centerY")}
                                      </button>
                                      <button
                                        type="button"
                                        className={
                                          getStaticTextCfg(layer.id).textAlignY === "bottom"
                                            ? "active"
                                            : ""
                                        }
                                        onClick={() =>
                                          patchStaticTextCfg(layer.id, { textAlignY: "bottom" })
                                        }
                                      >
                                        {renderMayzingAlignIcon("bottom")}
                                      </button>
                                    </div>
                                  </div>
                                  <div className="size-section">
                                    <label>Size</label>
                                    <div className="field">
                                      <label className="sub-field-label">
                                        Font size
                                      </label>
                                      <div className="unit-input">
                                        <input
                                          type="number"
                                          value={getStaticTextCfg(layer.id).fontSizeMm}
                                          onChange={(e) =>
                                            patchStaticTextCfg(layer.id, {
                                              fontSizeMm: Number(e.target.value),
                                            })
                                          }
                                        />{" "}
                                        <span>mm</span>
                                      </div>
                                    </div>
                                    <div className="size-pos-grid no-link">
                                      <div className="field">
                                        <label className="sub-field-label">
                                          Width
                                        </label>
                                        <div className="unit-input">
                                          <input
                                            type="number"
                                            value={getStaticTextCfg(layer.id).widthMm}
                                            onChange={(e) =>
                                              patchStaticTextCfg(layer.id, {
                                                widthMm: Number(e.target.value),
                                              })
                                            }
                                          />{" "}
                                          <span>mm</span>
                                        </div>
                                      </div>
                                      <div className="field">
                                        <label className="sub-field-label">
                                          Height
                                        </label>
                                        <div className="unit-input">
                                          <input
                                            type="number"
                                            value={getStaticTextCfg(layer.id).heightMm}
                                            onChange={(e) =>
                                              patchStaticTextCfg(layer.id, {
                                                heightMm: Number(e.target.value),
                                              })
                                            }
                                          />{" "}
                                          <span>mm</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="position-section">
                                    <label>Positioning</label>
                                    <div className="size-pos-grid no-link">
                                      <div className="field">
                                        <label className="sub-field-label">
                                          Left
                                        </label>
                                        <div className="unit-input">
                                          <input
                                            type="number"
                                            value={getStaticTextCfg(layer.id).leftMm}
                                            onChange={(e) =>
                                              patchStaticTextCfg(layer.id, {
                                                leftMm: Number(e.target.value),
                                              })
                                            }
                                          />{" "}
                                          <span>mm</span>
                                        </div>
                                      </div>
                                      <div className="field">
                                        <label className="sub-field-label">
                                          Top
                                        </label>
                                        <div className="unit-input">
                                          <input
                                            type="number"
                                            value={getStaticTextCfg(layer.id).topMm}
                                            onChange={(e) =>
                                              patchStaticTextCfg(layer.id, {
                                                topMm: Number(e.target.value),
                                              })
                                            }
                                          />{" "}
                                          <span>mm</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="transform-section">
                                    <label>Transform</label>
                                    <div className="field">
                                      <label className="sub-field-label">
                                        Rotate
                                      </label>
                                      <div className="unit-input">
                                        <input
                                          type="number"
                                          value={getStaticTextCfg(layer.id).rotateDeg}
                                          onChange={(e) =>
                                            patchStaticTextCfg(layer.id, {
                                              rotateDeg: Number(e.target.value),
                                            })
                                          }
                                        />{" "}
                                        <span>deg</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="align-section">
                                    <label>Align</label>
                                    <div className="align-buttons">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          alignStaticTextLayerInSafeArea(layer.id, "left")
                                        }
                                      >
                                        {renderMayzingAlignIcon("left")}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          alignStaticTextLayerInSafeArea(
                                            layer.id,
                                            "centerX"
                                          )
                                        }
                                      >
                                        {renderMayzingAlignIcon("centerX")}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          alignStaticTextLayerInSafeArea(layer.id, "right")
                                        }
                                      >
                                        {renderMayzingAlignIcon("right")}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          alignStaticTextLayerInSafeArea(layer.id, "bottom")
                                        }
                                      >
                                        {renderMayzingAlignIcon("bottom")}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          alignStaticTextLayerInSafeArea(
                                            layer.id,
                                            "centerY"
                                          )
                                        }
                                      >
                                        {renderMayzingAlignIcon("centerY")}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          alignStaticTextLayerInSafeArea(layer.id, "top")
                                        }
                                      >
                                        {renderMayzingAlignIcon("top")}
                                      </button>
                                    </div>
                                  </div>
                                  <div className="case-section">
                                    <label>Case</label>
                                    <div className="case-buttons">
                                      <button
                                        type="button"
                                        className={
                                          getStaticTextCfg(layer.id).textCase === "title"
                                            ? "active"
                                            : ""
                                        }
                                        onClick={() =>
                                          patchStaticTextCfg(layer.id, {
                                            textCase: "title",
                                          })
                                        }
                                      >
                                        Tt
                                      </button>
                                      <button
                                        type="button"
                                        className={
                                          getStaticTextCfg(layer.id).textCase === "upper"
                                            ? "active"
                                            : ""
                                        }
                                        onClick={() =>
                                          patchStaticTextCfg(layer.id, {
                                            textCase: "upper",
                                          })
                                        }
                                      >
                                        TT
                                      </button>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            ) : null}

            {/* preview mode - product views grid (Mayzing-like) */}
            {mode === "preview" && (
              <div className="product-views-wrapper">
                <div className="panel-header">Product views</div>
                <div className="mockup-grid">
                  {orderedMockups.map((mockup, i) => (
                    <div
                      key={i}
                      className={`mockup-thumb ${
                        selectedMockup === i ? "active" : ""
                      }`}
                      onClick={() => setSelectedMockup(i)}
                    >
                      <div className="mockup-thumb-stage">
                        <img src={mockup.img} alt={mockup.name} />

                        {(() => {
                          const isBackView = !isDrinkware && isBackViewName(mockup?.name);
                          if (!hasAnyDesignApplied || isBackView) return null;
                          return (
                            <div
                              className={`print-safe-area preview thumb safe-area-${
                                activeMockupPack?.key || "tshirt"
                              }`}
                            >
                              {renderCustomImageFrames()}
                              {renderTextLayers()}
                              {renderStaticTextLayers()}
                              {designImageSrc && (
                                <div className="print-design-viewport preview">
                                  <img
                                    src={designImageSrc}
                                    alt="Design"
                                    className="print-design-image"
                                    draggable={false}
                                    style={{
                                      transform: `translate(-50%, -50%) translate(${designTransform.x}px, ${designTransform.y}px) scale(${designTransform.scale})`,
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                      <span>{getMockupLabel(mockup)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ngắt 1 */}
          </div>
          <div className="panel-footer-v2">
            <button className="btn-primary-continue" onClick={handleContinueToPricing}>
              Continue to pricing <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </aside>
      </div>

      {isAboutProductsModalOpen && (
        <div
          className="about-products-overlay"
          onClick={() => setIsAboutProductsModalOpen(false)}
        >
          <div
            className="about-products-modal"
            role="dialog"
            aria-modal="true"
            aria-label="About your products"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="about-products-header">
              <h3>About your products</h3>
              <button
                type="button"
                className="about-products-close"
                onClick={() => setIsAboutProductsModalOpen(false)}
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <div className="about-products-body">
              <p>
                Not all products have designs applied to them and may appear blank.
              </p>
            </div>
            <div className="about-products-footer">
              <button
                type="button"
                className="about-products-keep-editing"
                onClick={() => setIsAboutProductsModalOpen(false)}
              >
                Keep editing products
              </button>
              <button
                type="button"
                className="about-products-continue btn-primary-continue"
                onClick={() => {
                  setIsAboutProductsModalOpen(false);
                  proceedToPricing();
                }}
              >
                Continue to pricing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL IMAGE layer GIỮ NGUYÊN */}
      {isImageModalOpen && (
        <div
          className="image-modal-overlay"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div
            className="image-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Add a new image</h3>
              <button
                className="close-x"
                onClick={() => setIsImageModalOpen(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-tabs">
              <button
                className={activeModalTab === "upload" ? "active" : ""}
                onClick={() => setActiveModalTab("upload")}
              >
                Upload Image
              </button>
              <button
                className={activeModalTab === "library" ? "active" : ""}
                onClick={() => setActiveModalTab("library")}
              >
                My library
              </button>
            </div>
            <div className="modal-body">
              {activeModalTab === "upload" ? (
                <div
                  className="upload-dropzone"
                  onClick={() => imageFileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer?.files?.[0];
                    setUploadedDesignImage(file);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      imageFileInputRef.current?.click();
                    }
                  }}
                >
                  <i className="fa-regular fa-image"></i>
                  <p>
                    Drop image here or{" "}
                    <span
                      className="browse-text"
                      onClick={(e) => {
                        e.stopPropagation();
                        imageFileInputRef.current?.click();
                      }}
                    >
                      browse
                    </span>
                  </p>
                  <input
                    ref={imageFileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      setUploadedDesignImage(file);
                      e.target.value = '';
                    }}
                  />
                </div>
              ) : (
                <div className="library-placeholder">
                  Your library is empty.
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-save-disabled" disabled>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignerPage;
