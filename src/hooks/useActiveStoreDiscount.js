import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../utils/api";

const ACTIVE_STORE_URL_KEY = "pod-system:active-store-url:v1";

const parseStoreUrlFromPathname = (pathname) => {
  const match = String(pathname || "").match(/^\/store\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : "";
};

const pickStoreUrlFromSearch = (search) => {
  const params = new URLSearchParams(search || "");
  return params.get("store") || params.get("storeUrl") || params.get("shop") || "";
};

const pickPromoCodeFromSearch = (search) => {
  const params = new URLSearchParams(search || "");
  return params.get("code") || params.get("promo") || params.get("promoCode") || "";
};

export const setActiveStoreUrl = (storeUrl) => {
  const next = typeof storeUrl === "string" ? storeUrl.trim() : "";
  if (!next) return;
  try {
    window.localStorage.setItem(ACTIVE_STORE_URL_KEY, next);
  } catch {
    // ignore
  }
};

const getStoredActiveStoreUrl = () => {
  try {
    return String(window.localStorage.getItem(ACTIVE_STORE_URL_KEY) || "").trim();
  } catch {
    return "";
  }
};

export default function useActiveStoreDiscount() {
  const location = useLocation();

  const explicitStoreUrl = useMemo(() => {
    const fromPath = parseStoreUrlFromPathname(location.pathname);
    if (fromPath) {
      setActiveStoreUrl(fromPath);
      return fromPath;
    }
    const fromSearch = pickStoreUrlFromSearch(location.search);
    if (fromSearch) {
      setActiveStoreUrl(fromSearch);
      return fromSearch;
    }
    return getStoredActiveStoreUrl();
  }, [location.pathname, location.search]);

  const [autoStoreUrl, setAutoStoreUrl] = useState("");

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (explicitStoreUrl || autoStoreUrl) return;

      // Avoid triggering auth redirects for public users.
      let token = "";
      try {
        token = String(window.localStorage.getItem("token") || "").trim();
      } catch {
        token = "";
      }
      if (!token) return;

      try {
        const res = await api.get("/stores");
        if (!mounted) return;
        const stores = Array.isArray(res.data) ? res.data : [];
        const preferred =
          stores.find((s) => Boolean(s?.discountsPublishedAt)) ||
          stores.find((s) => typeof s?.url === "string" && s.url.trim()) ||
          stores[0];

        const key =
          typeof preferred?.url === "string" && preferred.url.trim()
            ? preferred.url.trim()
            : Number.isInteger(preferred?.id)
              ? String(preferred.id)
              : "";

        if (!key) return;
        setActiveStoreUrl(key);
        setAutoStoreUrl(key);
      } catch {
        // ignore
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, [explicitStoreUrl, autoStoreUrl]);

  const storeUrl = explicitStoreUrl || autoStoreUrl;

  const promoCode = useMemo(() => pickPromoCodeFromSearch(location.search), [location.search]);

  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (!storeUrl) {
        setDiscounts([]);
        return;
      }

      setLoading(true);
      try {
        const qs = promoCode ? `?code=${encodeURIComponent(promoCode)}` : "";
        const res = await api.get(`/public/stores/${storeUrl}/discounts${qs}`);
        if (!mounted) return;
        setDiscounts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        if (!mounted) return;
        setDiscounts([]);
        console.error("Error fetching storefront discounts:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, [storeUrl, promoCode]);

  const discountInPlay = useMemo(() => {
    return discounts && discounts.length > 0 ? discounts[0] : null;
  }, [discounts]);

  return { storeUrl, promoCode, discounts, discountInPlay, loading };
}
