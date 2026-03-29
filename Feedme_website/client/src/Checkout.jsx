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

  const orderEmail = useMemo(() => {
  return isLoggedIn
    ? user?.email
    : guestEmail.trim();
}, [isLoggedIn, user, guestEmail]);

  const deliveryFee = cart.length > 0 ? 4.99 : 0;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (!isLoggedIn && !guestEmail.trim()) {
      setError("Please enter an email.");
      return;
    }

    if (!isLoggedIn) {
      setError("Please login to place an order.");
      return;
    }

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          restaurant_id: cart[0]?.restaurant_id || 1,
          address_id: 1,
          total_price: total,
          email: orderEmail,
          items: cart,
        }),
      });

      if (!res.ok) throw new Error("Order failed");

      clearCart();
      navigate("/orders");

    } catch (err) {
      console.error(err);
      setError("Failed to place order");
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

              {!isLoggedIn && (
                <div className="checkout-authRow">
                </div>
              )}

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
                  <h3>Delivery Details</h3>
                  <input
                    type="text"
                    placeholder="Delivery address"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                  />
                </div>

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
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="checkout-totalRow">
                    <span>Subtotal</span>
                    <strong>${subtotal.toFixed(2)}</strong>
                  </div>

                  <div className="checkout-totalRow">
                    <span>Delivery Fee</span>
                    <strong>${deliveryFee.toFixed(2)}</strong>
                  </div>

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