import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const ProductContext = createContext();
const BACKEND = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [prodRes, catRes, banRes, setRes] = await Promise.all([
        axios.get(`${BACKEND}/api/products`),
        axios.get(`${BACKEND}/api/categories`),
        axios.get(`${BACKEND}/api/banners`),
        axios.get(`${BACKEND}/api/settings`)
      ]);

      const normalizedProducts = prodRes.data.map(p => ({
        ...p,
        id: p._id,
        compare: p.comparePrice ? `₹${Number(p.comparePrice).toLocaleString("en-IN")}` : "",
        price: `₹${Number(p.price).toLocaleString("en-IN")}`,
        pct: p.pct || ""
      }));

      setProducts(normalizedProducts);
      setCategories(catRes.data);
      setBanners(banRes.data.filter(b => b.isActive));
      setSettings(setRes.data);
    } catch (e) {
      console.error("Error fetching storefront data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const socket = io(BACKEND);

    socket.on("product_changed", ({ action, data }) => {
      setProducts(prev => {
        if (action === "delete") {
          return prev.filter(p => p._id !== data._id);
        }
        
        const normalized = {
          ...data,
          id: data._id,
          compare: data.comparePrice ? `₹${Number(data.comparePrice).toLocaleString("en-IN")}` : "",
          price: `₹${Number(data.price).toLocaleString("en-IN")}`,
          pct: data.pct || ""
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

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <ProductContext.Provider value={{ products, categories, banners, settings, loading, refreshData: fetchData }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  return useContext(ProductContext);
}
export default ProductContext;
