import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./Landing";
import Restaurants from "./Restaurants";
import Orders from "./Orders";
import RestaurantMenu from "./RestaurantMenu";
import Login from "./Login";
import Register from "./Register";
import SavedRestaurants from "./SavedRestaurants";
import Settings from "./Settings";
import Checkout from "./Checkout";
import "./App.css";

function App() {
  // --- USER STATE ---
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("feedme_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("feedme_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("feedme_user");
  };

  // --- CART STATE ---
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("feedme_cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("feedme_cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item) => {
    setCart((prev) => [...prev, { ...item, cartId: Date.now() }]);
  };

  const removeFromCart = (cartId) => {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const clearCart = () => setCart([]);

  // --- SAVED RESTAURANTS STATE ---
  const [savedItems, setSavedItems] = useState([]);
  const toggleSave = (id) => {
    setSavedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // Shared Props Objects to keep the Route lines clean
  const authProps = { user, login, logout };
  const cartProps = { cart, addToCart, removeFromCart, clearCart };
  const savedProps = { savedItems, toggleSave };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing {...authProps} {...cartProps} />} />
        <Route path="/login" element={<Login login={login} />} />
        <Route path="/register" element={<Register login={login} />} />
        <Route path="/restaurants" element={<Restaurants {...authProps} {...cartProps} {...savedProps} />} />
        <Route path="/restaurants/:id" element={<RestaurantMenu {...authProps} {...cartProps} />} />
        <Route path="/orders" element={<Orders {...authProps} />} />
        <Route path="/saved" element={<SavedRestaurants {...authProps} {...savedProps} />} />
        <Route path="/settings" element={<Settings {...authProps} />} />
        <Route path="/checkout" element={<Checkout {...authProps} {...cartProps} />} />
      </Routes>
    </Router>
  );
}

export default App;