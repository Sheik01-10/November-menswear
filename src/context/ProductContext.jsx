import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

const ProductContext = createContext();
const BACKEND = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [productsData, categoriesData, bannersData, settingsData] = await Promise.all([
        fetch(`${BACKEND}/api/products`).then(r => r.json()),
        fetch(`${BACKEND}/api/categories`).then(r => r.json()),
        fetch(`${BACKEND}/api/banners`).then(r => r.json()),
        fetch(`${BACKEND}/api/settings`).then(r => r.json())
      ]);

      const normalizedProducts = productsData.map(p => {
        let pct = p.pct || "";
        if (p.comparePrice && p.comparePrice > p.price) {
          const discount = Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100);
          pct = `-${discount}%`;
        }
        return {
          ...p,
          id: p._id,
          compare: p.comparePrice ? `₹${Number(p.comparePrice).toLocaleString("en-IN")}` : "",
          price: `₹${Number(p.price).toLocaleString("en-IN")}`,
          pct
        };
      });

      setProducts(normalizedProducts);
      setCategories(categoriesData);
      setBanners(bannersData.filter(b => b.isActive));
      setSettings(settingsData);
    } catch (e) {
      console.error("Error fetching storefront data:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    let socket;

    // Dynamically import socket.io-client to reduce initial bundle size
    import("socket.io-client").then(({ io }) => {
      socket = io(BACKEND);

      socket.on("product_changed", ({ action, data }) => {
        setProducts(prev => {
          if (action === "delete") {
            return prev.filter(p => p._id !== data._id);
          }
          
          let pct = data.pct || "";
          if (data.comparePrice && data.comparePrice > data.price) {
            const discount = Math.round(((data.comparePrice - data.price) / data.comparePrice) * 100);
            pct = `-${discount}%`;
          }
          const normalized = {
            ...data,
            id: data._id,
            compare: data.comparePrice ? `₹${Number(data.comparePrice).toLocaleString("en-IN")}` : "",
            price: `₹${Number(data.price).toLocaleString("en-IN")}`,
            pct
          };

          if (action === "create") {
            return [normalized, ...prev];
          }
          if (action === "update") {
            return prev.map(p => p._id === data._id ? normalized : p);
          }
          return prev;
        });
      });

      socket.on("category_changed", ({ action, data }) => {
        setCategories(prev => {
          if (action === "delete") {
            return prev.filter(c => c._id !== data._id);
          }
          if (action === "create") {
            return [...prev, data];
          }
          if (action === "update") {
            return prev.map(c => c._id === data._id ? data : c);
          }
          return prev;
        });
      });

      socket.on("banner_changed", ({ action, data }) => {
        setBanners(prev => {
          if (action === "delete") {
            return prev.filter(b => b._id !== data._id);
          }
          if (action === "create") {
            return data.isActive ? [...prev, data] : prev;
          }
          if (action === "update") {
            if (!data.isActive) return prev.filter(b => b._id !== data._id);
            const exists = prev.some(b => b._id === data._id);
            if (exists) return prev.map(b => b._id === data._id ? data : b);
            return [...prev, data];
          }
          return prev;
        });
      });

      socket.on("settings_changed", (updatedSettings) => {
        setSettings(updatedSettings);
      });
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [fetchData]);

  const value = useMemo(() => ({
    products,
    categories,
    banners,
    settings,
    loading,
    refreshData: fetchData
  }), [products, categories, banners, settings, loading, fetchData]);

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  return useContext(ProductContext);
}
export default ProductContext;
