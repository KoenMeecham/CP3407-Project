import React, { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./App.css";
import CartDropdown from "./CartDropdown";
import { useUser } from "./UserContext";
import { useCart } from "./Cart";
import UserMenu from "./UserMenu";

export default function Orders() {
  const { user, logout } = useUser();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("newest");
  const { addToCart } = useCart();
  const location = useLocation();

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("/api/orders")
      .then(res => res.json())
      .then(data => setOrders(data));
  }, []);

  const visibleOrders = useMemo(() => {
    let orders = [...allOrders];

    const guestEmail = localStorage.getItem("feedme_guest_email") || "";

    if (user.isLoggedIn) {
      orders = orders.filter((order) => order.email === user.email);
    } else if (guestEmail) {
      orders = orders.filter((order) => order.email === guestEmail);
    } else {
      orders = [];
    }

    if (search.trim()) {
      const term = search.toLowerCase();
      orders = orders.filter((order) => {
        const restaurantNames = order.items
          .map((item) => item.restaurant || "")
          .join(" ")
          .toLowerCase();

        const itemNames = order.items
          .map((item) => item.name || "")
          .join(" ")
          .toLowerCase();

        return (
          String(order.orderNumber).toLowerCase().includes(term) ||
          restaurantNames.includes(term) ||
          itemNames.includes(term)
        );
      });
    }

    orders.sort((a, b) => {
      if (filter === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return orders;
  }, [allOrders, user, search, filter]);

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

          <button className="lm-signout" onClick={logout}>
            Sign Out
          </button>
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
              {visibleOrders.map((order) => {
                const restaurantNames = [
                  ...new Set(order.items.map((item) => item.restaurant)),
                ].join(", ");

                const itemSummary = order.items
                  .map((item) => `${item.name} x${item.quantity}`)
                  .join(", ");

                return (
                  <div key={order.id} className="order-card">
                    <div className="order-cardLeft">
                      <div className="order-icon">🍔</div>

                      <div>
                        <div className="order-restaurant">
                          {restaurantNames || "Restaurant"}
                        </div>
                        <div className="order-number">{order.orderNumber}</div>
                        <div className="order-items">{itemSummary}</div>
                        <div className="order-meta">
                          {new Date(order.createdAt).toLocaleString()} • $
                          {Number(order.total || 0).toFixed(2)} • {order.status}
                        </div>
                      </div>
                    </div>

                    <button
                      className="order-reorderBtn"
                      onClick={() => {
                        order.items.forEach((item) => addToCart(item));
                      }}
                    >
                      Reorder
                    </button>
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