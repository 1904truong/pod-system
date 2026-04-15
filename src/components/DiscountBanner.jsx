import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import useActiveStoreDiscount from "../hooks/useActiveStoreDiscount";
import "../styles/DiscountBanner.css";

const DiscountBanner = () => {
  const { discountInPlay, loading } = useActiveStoreDiscount();
  const [isVisible, setIsVisible] = useState(true);
  const bannerRef = useRef(null);

  const bannerText = useMemo(() => {
    if (!discountInPlay) return "";

    const pct = Number(discountInPlay.percentOff || 0);
    const mcv = typeof discountInPlay.minCartValue === "number" ? discountInPlay.minCartValue : null;

    // Direct match for "10% off all orders applied in cart"
    if (discountInPlay.scope === "STOREWIDE" && discountInPlay.type === "PERCENT_OFF" && discountInPlay.audience === "EVERYONE") {
      return `${pct}% off all orders applied in cart`;
    }

    if (discountInPlay.type === "FREE_SHIPPING") {
      const regions = Array.isArray(discountInPlay.regions) ? discountInPlay.regions.join(", ") : "";
      if (mcv) {
        return `Spend $${mcv} and get free shipping${regions ? ` to ${regions}` : ""}`;
      }
      return `Free shipping active${regions ? ` to ${regions}` : ""}`;
    }

    if (discountInPlay.type === "PERCENT_OFF") {
      return `${pct}% off active${mcv ? ` on orders over $${mcv}` : ""}`;
    }

    if (discountInPlay.type === "FIXED_AMOUNT") {
      const amt = Number(discountInPlay.fixedAmount || 0);
      return `$${amt} off active${mcv ? ` on orders over $${mcv}` : ""}`;
    }

    return "Discount active";
  }, [discountInPlay]);

  useLayoutEffect(() => {
    const root = document.documentElement;

    if (loading || !discountInPlay || !isVisible) {
      root.style.setProperty("--discount-banner-height", "0px");
      return;
    }

    const el = bannerRef.current;
    if (!el) {
      root.style.setProperty("--discount-banner-height", "0px");
      return;
    }

    const update = () => {
      const h = Math.ceil(el.getBoundingClientRect().height);
      root.style.setProperty("--discount-banner-height", `${h}px`);
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
      ro.disconnect();
    };
  }, [discountInPlay, isVisible, loading]);

  if (loading || !discountInPlay || !isVisible) return null;

  return (
    <div ref={bannerRef} className="discount-banner">
      <div className="discount-banner-content">
        {bannerText}
      </div>
      <button 
        className="discount-banner-close" 
        onClick={() => setIsVisible(false)}
        aria-label="Close banner"
      >
        <i className="fa-solid fa-xmark"></i>
      </button>
    </div>
  );
};

export default DiscountBanner;
