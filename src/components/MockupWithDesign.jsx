import React, { useMemo, useEffect } from "react";
import "../styles/MockupWithDesign.css";

const normalizeKey = (value) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "")
    .trim();

const inferSafeAreaKey = (product) => {
  const category = normalizeKey(product?.category);
  const subCategory = normalizeKey(product?.subCategory || product?.subcategory);
  const name = normalizeKey(product?.name || product?.title);

  const text = `${category} ${subCategory} ${name}`;

  if (text.includes("tanktop") || text.includes("tank")) return "tanktop";

  // Drinkware
  if (text.includes("mug")) return "mug";
  if (text.includes("bottle")) return "bottles";
  if (text.includes("tumbler")) return "tumbler";
  if (text.includes("glass")) return "glass";

  // Homeware
  if (text.includes("cushion") || text.includes("pillow")) return "homeware-cushion";
  if (text.includes("mat")) return "homeware-mats";
  if (text.includes("blanket")) return "homeware-blankets";
  if (text.includes("ornament")) return "homeware-ornament";
  if (text.includes("yardsign") || text.includes("yard")) return "homeware-yardsign";
  if (text.includes("candle")) return "homeware-candle";

  // Wall art
  if (text.includes("poster")) return "wallart-poster";
  if (text.includes("canvas")) return "wallart-canvas";

  // Hats
  if (text.includes("beanie")) return "hat-beanie";
  if (text.includes("visor")) return "hat-visor";
  if (text.includes("cap")) return "hat-cap";

  // Accessories
  if (text.includes("tote")) return "accessories-tote";
  if (text.includes("apron")) return "accessories-apron";
  if (text.includes("pouchsmall") || (text.includes("pouch") && text.includes("small"))) return "accessories-pouch-small";
  if (text.includes("pouchlarge") || (text.includes("pouch") && text.includes("large"))) return "accessories-pouch-large";

  return "tshirt";
};

const normalizeTransform = (t) => {
  const x = Number(t?.x);
  const y = Number(t?.y);
  const scale = Number(t?.scale);
  return {
    x: Number.isFinite(x) ? x : 0,
    y: Number.isFinite(y) ? y : 0,
    scale: Number.isFinite(scale) ? scale : 1,
  };
};

const SAFE_AREA_MM = { width: 355.59, height: 406.4 };

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const API_ORIGIN = "http://localhost:5000";

const resolveUploadUrl = (value) => {
  if (!value || typeof value !== "string") return "";
  if (/^data:image/i.test(value)) return value;
  if (/^https?:\/\//i.test(value)) return value;
  return `${API_ORIGIN}${value}`;
};

// Renders a mockup image with the uploaded design (designImageDataUrl) overlaid
// in the same "print-safe-area" way as Designer preview. Includes layers.
const MockupWithDesign = ({
  mockupSrc,
  alt = "Mockup",
  product,
  designerDraft,
  variant = "thumb", // 'thumb' | 'preview'
  className = "",
  imgClassName = "",
}) => {
  const safeAreaKey = useMemo(() => inferSafeAreaKey(product), [product]);
  
  useEffect(() => {
    if (designerDraft) {
      console.log(`[MockupWithDesign] Received draft for product ${product?.id || 'unknown'}. Layers: ${Array.isArray(designerDraft.layers) ? designerDraft.layers.length : 0}`);
    }
  }, [designerDraft, product?.id]);

  const designImageDataUrl = useMemo(() => {
    // 1. Priority 1: Designer Draft from props (contains Base64 if not yet synced)
    if (typeof designerDraft?.designImageDataUrl === "string") {
      return resolveUploadUrl(designerDraft.designImageDataUrl);
    }
    // 2. Priority 2: Artwork relation from product (contains server file path if synced)
    if (typeof product?.artwork?.fileUrl === "string") {
      return resolveUploadUrl(product.artwork.fileUrl);
    }
    return null;
  }, [designerDraft, product?.artwork]);

  const designTransform = normalizeTransform(designerDraft?.designTransform);
  
  const layers = Array.isArray(designerDraft?.layers) ? designerDraft.layers : [];
  const textLayerCfgById = designerDraft?.textLayerCfgById || {};
  const staticTextLayerCfgById = designerDraft?.staticTextLayerCfgById || {};
  const customImageLayerCfgById = designerDraft?.customImageLayerCfgById || {};

  const hasDesign = Boolean(designImageDataUrl) || layers.length > 0;
  const sizeClass = variant === "thumb" ? "thumb" : "";

  const defaultTextLayerCfg = () => ({ text: "Your text", fontFamily: "Abril Fatface", color: "#000000", fontSizeMm: 40, widthMm: 250, heightMm: 100, leftMm: 52.8, topMm: 153.2, rotateDeg: 0, textAlignX: "left", textAlignY: "middle", textCase: "title" });
  const defaultStaticTextLayerCfg = () => ({ text: "Your text", fontFamily: "Abril Fatface", color: "#000000", fontSizeMm: 40, widthMm: 250, heightMm: 100, leftMm: 52.79, topMm: 153.2, rotateDeg: 0, textAlignX: "center", textAlignY: "middle", textCase: "title" });
  const defaultCustomImageLayerCfg = () => ({ shape: "square", placeholderType: "icon", placeholderText: "Upload an image", placeholderImageSrc: null, promptEnabled: false, promptText: "", widthMm: SAFE_AREA_MM.width * 0.7, heightMm: SAFE_AREA_MM.height * 0.7, leftMm: (SAFE_AREA_MM.width - SAFE_AREA_MM.width * 0.7) / 2, topMm: (SAFE_AREA_MM.height - SAFE_AREA_MM.height * 0.7) / 2 });

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

  const getCustomImageCfg = (layerId) => {
    const cfg = customImageLayerCfgById[layerId] || defaultCustomImageLayerCfg();
    const widthMmRaw = Number.isFinite(cfg.widthMm) ? cfg.widthMm : SAFE_AREA_MM.width * 0.7;
    const heightMmRaw = Number.isFinite(cfg.heightMm) ? cfg.heightMm : SAFE_AREA_MM.height * 0.7;
    const widthMm = clamp(widthMmRaw, 1, SAFE_AREA_MM.width);
    const heightMm = clamp(heightMmRaw, 1, SAFE_AREA_MM.height);
    const leftMmRaw = Number.isFinite(cfg.leftMm) ? cfg.leftMm : (SAFE_AREA_MM.width - widthMm) / 2;
    const topMmRaw = Number.isFinite(cfg.topMm) ? cfg.topMm : (SAFE_AREA_MM.height - heightMm) / 2;
    const leftMm = clamp(leftMmRaw, 0, SAFE_AREA_MM.width - widthMm);
    const topMm = clamp(topMmRaw, 0, SAFE_AREA_MM.height - heightMm);
    return { ...cfg, widthMm, heightMm, leftMm, topMm };
  };

  const renderTextLayers = () => {
    const textLayers = layers.filter((l) => l.type === "text");
    if (textLayers.length === 0) return null;
    return (
      <div className="custom-text-layer-stack" aria-hidden>
        {textLayers.map((layer) => {
          const cfg = getTextCfg(layer.id);
          const style = { width: `${(cfg.widthMm / SAFE_AREA_MM.width) * 100}%`, height: `${(cfg.heightMm / SAFE_AREA_MM.height) * 100}%`, left: `${(cfg.leftMm / SAFE_AREA_MM.width) * 100}%`, top: `${(cfg.topMm / SAFE_AREA_MM.height) * 100}%`, transform: `rotate(${cfg.rotateDeg}deg)`, fontFamily: `${cfg.fontFamily}, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`, fontSize: `${Math.max(8, cfg.fontSizeMm * 0.65)}px`, color: cfg.color };
          const displayText = cfg.textCase === "upper" ? (cfg.text || "").toUpperCase() : cfg.text || "";
          return (
            <div key={layer.id} className={`custom-text-layer alignX-${cfg.textAlignX} alignY-${cfg.textAlignY}`} style={style}>
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
          const style = { width: `${(cfg.widthMm / SAFE_AREA_MM.width) * 100}%`, height: `${(cfg.heightMm / SAFE_AREA_MM.height) * 100}%`, left: `${(cfg.leftMm / SAFE_AREA_MM.width) * 100}%`, top: `${(cfg.topMm / SAFE_AREA_MM.height) * 100}%`, transform: `rotate(${cfg.rotateDeg}deg)`, fontFamily: `${cfg.fontFamily}, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`, fontSize: `${Math.max(8, cfg.fontSizeMm * 0.65)}px`, color: cfg.color };
          const displayText = cfg.textCase === "upper" ? (cfg.text || "").toUpperCase() : cfg.text || "";
          return (
            <div key={layer.id} className={`custom-text-layer alignX-${cfg.textAlignX} alignY-${cfg.textAlignY}`} style={style}>
              <span className="custom-text-content">{displayText}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderCustomImageFrames = () => {
    const customLayers = layers.filter((l) => l.type === "custom-image");
    if (customLayers.length === 0) return null;
    return (
      <div className="custom-image-layer-stack" aria-hidden>
        {customLayers.map((layer) => {
          const cfg = getCustomImageCfg(layer.id);
          const style = { width: `${(cfg.widthMm / SAFE_AREA_MM.width) * 100}%`, height: `${(cfg.heightMm / SAFE_AREA_MM.height) * 100}%`, left: `${(cfg.leftMm / SAFE_AREA_MM.width) * 100}%`, top: `${(cfg.topMm / SAFE_AREA_MM.height) * 100}%` };
          const placeholder = (() => {
            if (cfg.placeholderType === "blank") return null;
            if (cfg.placeholderType === "text") return <span className="custom-image-placeholder-text">{cfg.placeholderText || ""}</span>;
            if (cfg.placeholderType === "custom-image" && cfg.placeholderImageSrc) {
              return <img src={cfg.placeholderImageSrc} alt="Placeholder" className="custom-image-placeholder-img" draggable={false} />;
            }
            return <i className="fa-regular fa-image custom-image-placeholder-icon"></i>;
          })();
          return (
            <div key={layer.id} className={`custom-image-frame shape-${cfg.shape}`} style={style}>
              {placeholder}
            </div>
          );
        })}
      </div>
    );
  };

  const FALLBACK_MOCKUPS = {
    tshirt: "/assets/tshirt-man/t-men-1.webp",
    tanktop: "/assets/tanktop-man/tank-men-1.webp",
    mug: "/assets/drinkware/mug.webp",
    tumbler: "/assets/drinkware/tumbler.webp",
    glass: "/assets/drinkware/glass.webp",
    "homeware-cushion": "/assets/homeware/cushion.webp",
    "homeware-mats": "/assets/homeware/mat.webp",
    "homeware-blankets": "/assets/homeware/blanket.webp",
    "homeware-ornament": "/assets/homeware/ornament.webp",
    "homeware-yardsign": "/assets/homeware/yardsign.webp",
    "homeware-candle": "/assets/homeware/candle.webp",
    "wallart-poster": "/assets/wallart-poster/poster-portrait.webp",
    "wallart-canvas": "/assets/wallart-canvas/canvas-landscape.webp",
    "hat-cap": "/assets/hat-cap/cap-front.webp",
    "hat-beanie": "/assets/hat-cap/cap-front.webp",
    "hat-visor": "/assets/hat-cap/cap-front.webp",
    "accessories-tote": "/assets/accessories/tote-bag.webp",
    "accessories-apron": "/assets/accessories/apron.webp",
    "accessories-pouch-small": "/assets/accessories/pouch.webp",
    "accessories-pouch-large": "/assets/accessories/pouch.webp",
  };

  // The user wants to "Skip default catalog images" and "Map directly via design data"
  // If we have a catalog image passed in (mockupSrc), we check if it looks like a lifestyle image.
  // Actually, we trust the parent passed the "Plain" mockup, but we enforce fallbacks here.
  const currentMockupSrc = mockupSrc || FALLBACK_MOCKUPS[safeAreaKey] || FALLBACK_MOCKUPS.tshirt;

  return (
    <div className={`mockup-design-stage ${className}`.trim()}>
      <img 
        src={currentMockupSrc} 
        alt={alt} 
        className={`mockup-design-base ${imgClassName}`.trim()} 
        onError={(e) => {
          // If the primary image fails, try the category fallback
          if (mockupSrc && e.target.src !== FALLBACK_MOCKUPS[safeAreaKey]) {
            e.target.src = FALLBACK_MOCKUPS[safeAreaKey] || FALLBACK_MOCKUPS.tshirt;
          }
        }}
      />

      {hasDesign ? (
        <div className={`print-safe-area preview ${sizeClass} safe-area-${safeAreaKey}`.trim()}>
          {renderCustomImageFrames()}
          <div className="print-design-viewport preview">
            {designImageDataUrl ? (
              <img
                src={designImageDataUrl}
                alt="Design"
                className="print-design-image"
                crossOrigin="anonymous"
                draggable={false}
                style={{
                  transform: `translate(-50%, -50%) translate(${designTransform.x}px, ${designTransform.y}px) scale(${designTransform.scale})`,
                  backgroundColor: "transparent"
                }}
              />
            ) : null}
          </div>
          {renderTextLayers()}
          {renderStaticTextLayers()}
        </div>
      ) : null}
    </div>
  );
};

export default MockupWithDesign;
