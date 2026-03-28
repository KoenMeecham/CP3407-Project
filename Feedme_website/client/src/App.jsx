mport React from "react";
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
import { CartProvider } from "./Cart";
import { UserProvider } from "./UserContext";
import "./App.css";
import { SavedProvider } from "./SavedContext";

function App() {
  return (
    <UserProvider>
      <SavedProvider>
        <CartProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/restaurants" element={<Restaurants />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/restaurants/:id" element={<RestaurantMenu />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/saved" element={<SavedRestaurants />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/checkout" element={<Checkout />} />
            </Routes>
          </Router>
        </CartProvider>
      </SavedProvider>
    </UserProvider>
  );
}

export default App;
