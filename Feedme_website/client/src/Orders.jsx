import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./App.css";
import CartDropdown from "./CartDropdown";
import { useUser } from "./UserContext";
import { useCart } from "./Cart";
import UserMenu from "./UserMenu";


export default function Orders() {
  const { user, logout } = useUser();
  const { addToCart } = useCart();

  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("newest");
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("feedme_token");
      const guestEmail = localStorage.getItem("feedme_guest_email") || "";

      let url = "/api/orders";
      const headers = {};

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      } else if (guestEmail) {
        url = `/api/orders?email=${encodeURIComponent(guestEmail)}`;
      }

      const res = await fetch(url, { headers });
      const data = await res.json();

      if (res.status === 401) {
        localStorage.removeItem("feedme_token");
        localStorage.removeItem("feedme_user");
        setOrders([]);
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to load orders");
      }

      setOrders(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      console.error("Failed to load orders:", err);
      setError(err.message || "Failed to load orders");
      setOrders([]);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const activeOrders = orders.some((order) =>
      order.status === "pending"
    );

    if (!activeOrders) return;

    const interval = setInterval(() => {
      fetchOrders();
    }, 10000);

    return () => clearInterval(interval);
  }, [orders]);

  const handleCancelOrder = async (orderId) => {
    try {
      const token = localStorage.getItem("feedme_token");
      const guestEmail = localStorage.getItem("feedme_guest_email") || "";

      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          email: token ? undefined : guestEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to cancel order");
      }

      await fetchOrders();
    } catch (err) {
      alert(err.message || "Failed to cancel order");
    }
  };

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
                Track, reorder, and manage your active deliveries
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

          {error && <div className="checkout-error">{error}</div>}

          {visibleOrders.length === 0 ? (
            <div className="lm-empty">
              No orders yet. Place an order from checkout to see it here.
            </div>
          ) : (
            <div className="orders-list">
              {visibleOrders.map((order) => {

                return (
                  <div key={order.id} className="order-card" style={{ display: "block" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "1rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <div className="order-cardLeft">
                        <div className="order-icon">🍔</div>

                        <div>
                          <div className="order-restaurant">Order #{order.id}</div>

                          <div className="order-number">
                            {order.order_type === "delivery" ? "Delivery" : "Pickup"}
                          </div>

                          <div className="order-items">{order.email || "No email"}</div>

                          <div className="order-meta">
                            {new Date(order.created_at).toLocaleString()} • $
                            {Number(order.total_price || 0).toFixed(2)} • {order.status}
                          </div>

                          {order.order_type === "delivery" && (
                            <div className="order-meta">
                              Delivery Fee: $
                              {Number(order.delivery_fee || 0).toFixed(2)}
                            </div>
                          )}


                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", flexWrap: "wrap" }}>
                        <button
                          className="order-reorderBtn"
                          onClick={() => {
                            if (order.items && Array.isArray(order.items)) {
                              order.items.forEach((item) => addToCart(item));
                              alert("Items added to cart.");
                            }
                          }}
                        >
                          Reorder
                        </button>

                        {order.status === "pending" && (
                          <button
                            className="order-reorderBtn"
                            onClick={() => handleCancelOrder(order.id)}
                          >
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </div>


                    {order.items?.length > 0 && (
                      <div style={{ marginTop: "1rem" }}>
                        <strong>Items</strong>
                        <div className="checkout-summaryList" style={{ marginTop: "0.5rem" }}>
                          {order.items.map((item, index) => (
                            <div
                              key={`${item.id}-${index}`}
                              className="checkout-summaryItem"
                            >
                              <div>
                                <strong>{item.name}</strong>
                                <div className="checkout-muted">
                                  Qty: {item.quantity}
                                </div>
                              </div>
                              <div>
                                $
                                {(
                                  Number(item.price || 0) * Number(item.quantity || 0)
                                ).toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}