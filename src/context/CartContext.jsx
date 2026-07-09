import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useProducts } from "./ProductContext";

const CartContext = createContext();

export function CartProvider({ children }) {

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("november_cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("november_cart", JSON.stringify(cart));
  }, [cart]);

  const { products } = useProducts();

  // ==========================
  // ADD TO CART
  // ==========================

  const addToCart = (product, selectedSize) => {

    setCart((prev) => {

      const cartItemId = product.id + (selectedSize ? `-${selectedSize}` : "");
      const existing = prev.find(
        (item) => item.id === cartItemId
      );

      const maxStock = product.stockQuantity !== undefined ? product.stockQuantity : Infinity;

      if (existing) {

        if (existing.quantity >= maxStock) {
          return prev;
        }

        return prev.map((item) =>
          item.id === cartItemId
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );

      }

      return [
        ...prev,
        {
          ...product,
          id: cartItemId,
          productId: product.id,
          selectedSize,
          quantity: 1,
        },
      ];

    });

  };

  // ==========================
  // REMOVE
  // ==========================

  const removeFromCart = (id) => {
    setCart((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  // ==========================
  // QUANTITY +
  // ==========================

  const increaseQty = (id) => {

    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const originalProduct = products.find(p => p.id === item.productId || p.id === item.id);
          const maxStock = originalProduct ? originalProduct.stockQuantity : Infinity;
          if (item.quantity >= maxStock) {
            return item;
          }
          return {
            ...item,
            quantity: item.quantity + 1,
          };
        }
        return item;
      })
    );

  };

  // ==========================
  // QUANTITY -
  // ==========================

  const decreaseQty = (id) => {

    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );

  };

  // ==========================
  // CLEAR
  // ==========================

  const clearCart = () => {
    setCart([]);
  };

  // ==========================
  // TOTAL ITEMS
  // ==========================

  const totalItems = useMemo(() => {

    return cart.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

  }, [cart]);

  // ==========================
  // TOTAL PRICE
  // ==========================

  const totalPrice = useMemo(() => {

    return cart.reduce((sum, item) => {

      const price = Number(
        String(item.price).replace(/[^\d]/g, "")
      );

      return sum + price * item.quantity;

    }, 0);

  }, [cart]);

  // ==========================
  // SHIPPING TOTAL
  // ==========================

  const shippingTotal = useMemo(() => {
    if (totalPrice >= 5000) return 0;
    return cart.reduce((sum, item) => sum + (item.deliveryCharge || 0) * item.quantity, 0);
  }, [cart, totalPrice]);

  // ==========================
  // GRAND TOTAL
  // ==========================

  const grandTotal = useMemo(() => {
    return totalPrice + shippingTotal;
  }, [totalPrice, shippingTotal]);

  return (

    <CartContext.Provider
      value={{

        cart,

        addToCart,

        removeFromCart,

        increaseQty,

        decreaseQty,

        clearCart,

        totalItems,

        totalPrice,

        shippingTotal,

        grandTotal,

      }}
    >

      {children}

    </CartContext.Provider>

  );

}

export function useCart() {
  return useContext(CartContext);
}