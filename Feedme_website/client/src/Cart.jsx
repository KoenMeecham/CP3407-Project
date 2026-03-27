import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("feedme_cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("feedme_cart", JSON.stringify(cart));
  }, [cart]);

  function addToCart(item) {
  setCart((prevCart) => {
    const existingItem = prevCart.find(
      (cartItem) =>
        cartItem.id === item.id &&
        cartItem.restaurant === item.restaurant
    );

    if (existingItem) {
      return prevCart.map((cartItem) =>
        cartItem.id === item.id &&
        cartItem.restaurant === item.restaurant
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      );
    }

    return [
      ...prevCart,
      {
        id: item.id,
        name: item.name,
        price: Number(item.price || 0),
        quantity: 1,
        restaurant: item.restaurant || "Unknown Restaurant",
      },
    ];
  });
}

  function decreaseQuantity(itemId, restaurantName) {
  setCart((prevCart) =>
    prevCart
      .map((item) =>
        item.id === itemId && item.restaurant === restaurantName
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
      .filter((item) => item.quantity > 0)
  );
}

  function removeFromCart(itemId, restaurantName) {
  setCart((prevCart) =>
    prevCart.filter(
      (item) =>
        !(item.id === itemId && item.restaurant === restaurantName)
    )
  );
}

  function clearCart() {
    setCart([]);
  }

  const totalItems = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
