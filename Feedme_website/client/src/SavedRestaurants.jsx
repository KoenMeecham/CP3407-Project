import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./App.css";
import CartDropdown from "./CartDropdown";
import UserMenu from "./UserMenu";
import { useSaved } from "./SavedContext";
import { useUser } from "./UserContext";

const ignore = ["and", "&", "the"];

function getRestaurantInitial(name) {
  if (!name || typeof name !== "string") return "?";

  const words = name
    .trim()
    .split(/\s+/)
    .filter(w => w && !ignore.includes(w.toLowerCase()));

  const initials = words
    .slice(0, 2)
    .map(w => w[0])
    .join("")
    .toUpperCase();

  return initials || "?";
}

function getColorFromName(name) {
  const colors = ["#dbeafe", "#dcfce7", "#fef3c7", "#fee2e2", "#e9d5ff"];
  if (!name) return colors[0];
  return colors[name.length % colors.length];
}

export default function SavedRestaurants() {
  const navigate = useNavigate();
  const { savedRestaurants, isSaved, toggleSaved } = useSaved();
  const { logout } = useUser();

  return (
    <div className="lm-shell">
      <header className="lm-topbar">
        <Link to="/" className="lm-brandLink">
          FeedMe
        </Link>

        <div className="lm-topsearchForm">
          <input
            className="lm-search"
            placeholder="Search favourite restaurants"
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
            <strong>Saved Restaurants</strong>
            <p>Your favourite places, ready when you are.</p>
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

          <button
            className="lm-signout"
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            Sign Out
          </button>
        </aside>

        <main className="lm-main">
          <div className="lm-resultsHeader">
            <h2 className="lm-resultsTitle">Saved Restaurants</h2>
          </div>

          {savedRestaurants.length === 0 ? (
            <div className="lm-empty">
              You have no saved restaurants yet. Browse restaurants and click
              Save to add favourites.
            </div>
          ) : (
            <div className="lm-resultsGrid">
              {savedRestaurants.map((restaurant, idx) => (
                <div className="lm-resultCard" key={restaurant.id ?? idx}>
                  <div
                    className="lm-resultImgFallback"
                    style={{ background: getColorFromName(restaurant.name) }}
                  >
                    {getRestaurantInitial(restaurant.name)}
                  </div>

                  <div className="lm-resultBody">
                    <div className="lm-resultName">
                      {restaurant.name || "Restaurant"}
                    </div>

                    <div className="lm-resultMeta">
                      <span className="lm-star">★</span>
                      <span className="lm-rating">
                        {(Number(restaurant.score) || 0).toFixed(1)}
                      </span>
                      <span className="lm-submeta">
                        {restaurant.ratings
                          ? ` (${restaurant.ratings} ratings)`
                          : ""}
                      </span>
                    </div>

                    <div className="lm-submeta">
                      {restaurant.category || "Restaurant"}
                    </div>

                    <div className="lm-submeta">
                      {restaurant.price_range
                        ? `Price: ${restaurant.price_range}`
                        : ""}
                    </div>

                    <button
                      className="lm-saveBtnWide"
                      onClick={() => toggleSaved(restaurant)}
                    >
                      {isSaved(restaurant.id) ? "♥ Saved" : "♡ Save"}
                    </button>

                    <button
                      className="lm-orderBtnWide"
                      onClick={() => navigate(`/restaurants/${restaurant.id}`)}
                    >
                      Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}