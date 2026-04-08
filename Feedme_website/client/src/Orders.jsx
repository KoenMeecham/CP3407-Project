import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./App.css";
import CartDropdown from "./CartDropdown";
import { useUser } from "./UserContext";
import { useCart } from "./Cart";
import UserMenu from "./UserMenu";

export default function Orders() {
  const { user, logout } = useUser();
  const { addToCart } = useCart();
  const location = useLocation();

  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("newest");

  useEffect(() => {
    const token = localStorage.getItem("feedme_token");
    const guestEmail = localStorage.getItem("feedme_guest_email") || "";

    let url = "/api/orders";
    const headers = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else if (guestEmail) {
      url = `/api/orders?email=${encodeURIComponent(guestEmail)}`;
    }

    fetch(url, { headers })
      .then((res) => res.json())
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Failed to load orders:", err);
        setOrders([]);
      });
  }, []);

  const visibleOrders = useMemo(() => {
    let filteredOrders = [...orders];

    if (search.trim()) {
      const term = search.toLowerCase();

      filteredOrders = filteredOrders.filter((order) => {
        return (
          String(order.id || "").toLowerCase().includes(term) ||
          String(order.status || "").toLowerCase().includes(term) ||
          String(order.order_type || "").toLowerCase().includes(term) ||
          String(order.email || "").toLowerCase().includes(term)
        );
      });
    }

    filteredOrders.sort((a, b) => {
      if (filter === "oldest") {
        return new Date(a.created_at) - new Date(b.created_at);
      }
      return new Date(b.created_at) - new Date(a.created_at);
    });

    return filteredOrders;
  }, [orders, search, filter]);

  return (
    <div className="lm-shell">
      <header className="lm-topbar">
        <Link to="/" className="lm-brandLink">
          FeedMe
        </Link>

        <div className="lm-topsearchForm">
          <input
            className="lm-search"
            placeholder="Search orders"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="lm-topbarRight">
          <CartDropdown />
          <UserMenu />
        </div>
      </header>

      <div className="lm-body">
        <aside className="lm-sidebar">
          <div className="lm-deal">
            <strong>New Deals Alert</strong>
            <p>Check the latest coastal updates</p>
          </div>

          <nav className="lm-nav">
            <Link to="/restaurants" className="lm-navItem">
              Explore Restaurants
            </Link>
            <Link to="/saved" className="lm-navItem">
              Saved Restaurants
            </Link>
            <Link to="/orders" className="lm-navItem">
              Order History
            </Link>
            <Link to="/settings" className="lm-navItem">
              Settings
            </Link>
          </nav>

          <div className="lm-spacer" />

          {user?.isLoggedIn && (
            <button className="lm-signout" onClick={logout}>
              Sign Out
            </button>
          )}
        </aside>

        <main className="lm-main">
          <div className="orders-headerCard">
            <div>
              <h1 className="orders-title">Past Orders</h1>
              <p className="orders-subtitle">
                Track, reorder, and review your past deliveries
              </p>
            </div>

            <div className="orders-controls">
              <input
                className="orders-search"
                placeholder="Search orders"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select
                className="orders-sort"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>

          {location.state?.orderPlaced && (
            <div className="checkout-successBanner">
              Order {location.state.orderNumber} placed successfully.
            </div>
          )}

          {visibleOrders.length === 0 ? (
            <div className="lm-empty">
              No orders yet. Place an order from checkout to see it here.
            </div>
          ) : (
            <div className="orders-list">
              {visibleOrders.map((order) => (
                <div key={order.id} className="order-card">
                  <div className="order-cardLeft">
                    <div className="order-icon">🍔</div>

                    <div>
                      <div className="order-restaurant">
                        Order #{order.id}
                      </div>

                      <div className="order-number">
                        {order.order_type === "delivery" ? "Delivery" : "Pickup"}
                      </div>

                      <div className="order-items">
                        {order.email || "No email"}
                      </div>

                      <div className="order-meta">
                        {new Date(order.created_at).toLocaleString()} • $
                        {Number(order.total_price || 0).toFixed(2)} • {order.status}
                      </div>

                      {order.order_type === "delivery" && (
                        <div className="order-meta">
                          Delivery Fee: ${Number(order.delivery_fee || 0).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    className="order-reorderBtn"
                    onClick={() => {
                      if (order.items && Array.isArray(order.items)) {
                        order.items.forEach((item) => addToCart(item));
                      }
                    }}
                  >
                    Reorder
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}