import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./App.css";
import CartDropdown from "./CartDropdown";
import { useCart } from "./Cart";
import { useUser } from "./UserContext";
import UserMenu from "./UserMenu";

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, subtotal, clearCart } = useCart();
  const { user } = useUser();
  const isLoggedIn = !!user?.isLoggedIn;

  const [guestEmail, setGuestEmail] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [error, setError] = useState("");
  const [orderType, setOrderType] = useState("delivery");

  const DELIVERY_FEE = 4.99;
  const deliveryFee = orderType === "delivery" ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;

  const orderEmail = useMemo(() => {
    return isLoggedIn ? user?.email : guestEmail.trim();
  }, [isLoggedIn, user, guestEmail]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError("");

    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (!orderEmail) {
      setError("Please enter an email.");
      return;
    }

    if (orderType === "delivery" && !deliveryAddress.trim()) {
      setError("Please enter a delivery address.");
      return;
    }

    if (
      !cardName.trim() ||
      !cardNumber.trim() ||
      !expiry.trim() ||
      !cvv.trim()
    ) {
      setError("Please complete the payment details.");
      return;
    }

    try {
      const headers = {
        "Content-Type": "application/json",
      };

      if (user?.token) {
        headers.Authorization = `Bearer ${user.token}`;
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers,
        body: JSON.stringify({
          restaurant_id: cart[0]?.restaurant_id || 1,
          address_id: null,
          delivery_address: deliveryAddress,
          post_code: "0000",
          order_type: orderType,
          delivery_fee: deliveryFee,
          total_price: total,
          email: orderEmail,
          items: cart,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Order failed");
      }

      if (!isLoggedIn) {
        localStorage.setItem("feedme_guest_email", orderEmail);
      }

      clearCart();
      navigate(`/orders/${data.orderId}/confirmation`);

    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to place order");
    }
  };

  return (
    <div className="lm-shell">
      <header className="lm-topbar">
        <Link to="/" className="lm-brandLink">
          FeedMe
        </Link>

        <div className="lm-topsearchForm">
          <input
            className="lm-search"
            placeholder="Search restaurants, cuisines, or dishes"
            readOnly
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
            <p>Complete your order and get food flying your way.</p>
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
        </aside>

        <main className="lm-main">
          <div className="checkout-layout">
            <section className="checkout-formCard">
              <h1>Checkout</h1>
              <p>Review your details and place your order.</p>

              <form onSubmit={handlePlaceOrder} className="checkout-form">
                {!isLoggedIn && (
                  <div className="checkout-section">
                    <h3>Guest Details</h3>
                    <input
                      type="email"
                      placeholder="Email address"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                    />
                  </div>
                )}

                <div className="checkout-section">
                  <h3>Order Method</h3>

                  <div className="order-method-row">
                    <label className="order-method-option">
                      <input
                        type="radio"
                        name="orderType"
                        value="delivery"
                        checked={orderType === "delivery"}
                        onChange={(e) => setOrderType(e.target.value)}
                      />
                      Delivery
                    </label>

                    <label className="order-method-option">
                      <input
                        type="radio"
                        name="orderType"
                        value="pickup"
                        checked={orderType === "pickup"}
                        onChange={(e) => setOrderType(e.target.value)}
                      />
                      Pickup
                    </label>
                  </div>
                </div>

                {orderType === "delivery" && (
                  <div className="checkout-section">
                    <h3>Delivery Details</h3>
                    <input
                      type="text"
                      placeholder="Delivery address"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                    />
                  </div>
                )}

                <div className="checkout-section">
                  <h3>Dummy Payment Details</h3>
                  <input
                    type="text"
                    placeholder="Name on card"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Card number"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                  />
                  <div className="checkout-cardRow">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="CVV"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                    />
                  </div>
                </div>

                {error && <div className="checkout-error">{error}</div>}

                <button type="submit" className="checkout-placeBtn">
                  Place Order
                </button>
              </form>
            </section>

            <aside className="checkout-summaryCard">
              <h2>Order Summary</h2>

              {cart.length === 0 ? (
                <p>Your cart is empty.</p>
              ) : (
                <>
                  <div className="checkout-summaryList">
                    {cart.map((item, index) => (
                      <div
                        key={`${item.id}-${index}`}
                        className="checkout-summaryItem"
                      >
                        <div>
                          <strong>{item.name}</strong>
                          <div className="checkout-muted">
                            {item.restaurant}
                          </div>
                          <div className="checkout-muted">
                            Qty: {item.quantity}
                          </div>
                        </div>

                        <div>
                          ${(Number(item.price) * Number(item.quantity)).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="checkout-totalRow">
                    <span>Method</span>
                    <strong>
                      {orderType === "delivery" ? "Delivery" : "Pickup"}
                    </strong>
                  </div>

                  <div className="checkout-totalRow">
                    <span>Subtotal</span>
                    <strong>${subtotal.toFixed(2)}</strong>
                  </div>

                  {orderType === "delivery" && (
                    <div className="checkout-totalRow">
                      <span>Delivery Fee</span>
                      <strong>${deliveryFee.toFixed(2)}</strong>
                    </div>
                  )}

                  <div className="checkout-totalRow checkout-grandTotal">
                    <span>Total</span>
                    <strong>${total.toFixed(2)}</strong>
                  </div>
                </>
              )}
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}