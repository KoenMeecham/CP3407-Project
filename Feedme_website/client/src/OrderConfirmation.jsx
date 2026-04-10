import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./App.css";
import CartDropdown from "./CartDropdown";
import UserMenu from "./UserMenu";

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("feedme_token");
    const guestEmail = localStorage.getItem("feedme_guest_email") || "";

    let url = `/api/orders/${id}`;
    const headers = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else if (guestEmail) {
      url += `?email=${encodeURIComponent(guestEmail)}`;
    }

    fetch(url, { headers })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || data.message || "Failed to load order");
        }

        return data;
      })
      .then((data) => {
        setOrder(data);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="lm-shell">
        <main className="lm-main">Loading order...</main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lm-shell">
        <main className="lm-main">{error}</main>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="lm-shell">
        <main className="lm-main">Order not found.</main>
      </div>
    );
  }

  return (
    <div className="lm-shell">
      <header className="lm-topbar">
        <Link to="/" className="lm-brandLink">FeedMe</Link>
        <div className="lm-topsearchForm">
          <input
            className="lm-search"
            readOnly
            placeholder="Search restaurants, cuisines, or dishes"
          />
        </div>
        <div className="lm-topbarRight">
          <CartDropdown />
          <UserMenu />
        </div>
      </header>

      <div className="lm-body">
        <main className="lm-main">
          <div className="checkout-formCard">
            <h1>Order Confirmed</h1>
            <p>Your order has been placed successfully.</p>

            <div className="checkout-summaryList">
              <div className="checkout-summaryItem">
                <span>Order Number</span>
                <strong>#{order.id}</strong>
              </div>

              <div className="checkout-summaryItem">
                <span>Status</span>
                <strong>{order.status}</strong>
              </div>

              <div className="checkout-summaryItem">
                <span>Order Method</span>
                <strong>{order.order_type}</strong>
              </div>
            </div>

            <h3 style={{ marginTop: "1rem" }}>Items</h3>
            <div className="checkout-summaryList">
              {order.items?.map((item, index) => (
                <div key={`${item.id}-${index}`} className="checkout-summaryItem">
                  <div>
                    <strong>{item.name}</strong>
                    <div className="checkout-muted">Qty: {item.quantity}</div>
                  </div>
                  <div>
                    ${(Number(item.price) * Number(item.quantity)).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="checkout-totalRow">
              <span>Subtotal + Fees</span>
              <strong>${Number(order.total_price || 0).toFixed(2)}</strong>
            </div>

            <div
              style={{
                marginTop: "1rem",
                display: "flex",
                gap: "0.75rem",
                flexWrap: "wrap",
              }}
            >
              <Link
                to="/orders"
                className="checkout-placeBtn"
                style={{
                  textDecoration: "none",
                  display: "inline-block",
                  textAlign: "center",
                }}
              >
                Track Order
              </Link>

              <Link
                to="/restaurants"
                className="lm-navItem"
                style={{ textDecoration: "none" }}
              >
                Continue Browsing
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}