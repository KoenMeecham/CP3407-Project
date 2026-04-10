import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./App.css";
import CartDropdown from "./CartDropdown";
import { useUser } from "./UserContext";
import UserMenu from "./UserMenu";
import { useSaved } from "./SavedContext";

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

export default function Landing() {
  const { logout } = useUser();
  const navigate = useNavigate();
  const [featuredRestaurants, setFeaturedRestaurants] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [featuredError, setFeaturedError] = useState("");
  const { isSaved, toggleSaved } = useSaved();

  useEffect(() => {
    const loadFeaturedRestaurants = async () => {
      try {
        setLoadingFeatured(true);
        setFeaturedError("");

        const res = await fetch("/api/restaurants?limit=4");

        if (!res.ok) {
          throw new Error("Failed to load featured restaurants");
        }

        const data = await res.json();
        setFeaturedRestaurants(data.restaurants || []);
      } catch (err) {
        console.error(err);
        setFeaturedRestaurants([]);
        setFeaturedError("Could not load featured restaurants.");
      } finally {
        setLoadingFeatured(false);
      }
    };

    loadFeaturedRestaurants();
  }, []);

  return (
    <div className="lm-shell">
      <header className="lm-topbar">
        <Link to="/" className="lm-brandLink">
          FeedMe
        </Link>

        <form
          className="lm-topsearchForm"
          onSubmit={(e) => {
            e.preventDefault();
            const value = e.target.search.value.trim();
            if (value) {
              navigate(`/restaurants?q=${encodeURIComponent(value)}&page=1`);
            } else {
              navigate("/restaurants");
            }
          }}
        >
          <input
            name="search"
            className="lm-search"
            placeholder="Search restaurants"
          />
        </form>

        <div className="lm-topbarRight">
          <CartDropdown />
          <UserMenu />
        </div>
      </header>

      <div className="lm-body">
        <aside className="lm-sidebar">
          <div className="lm-deal">
            <strong>New Deals Alert</strong>
            <p>Check the latest updates</p>
          </div>

          <nav>
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
          <section className="lm-hero">
            <div className="lm-heroText">
              <h1>Food that flies to your door</h1>
              <p>
                Order from hundreds of local restaurants.
                <br />
                Real-time tracking and lightning-fast delivery.
              </p>

              <div className="lm-heroForm">
                <input placeholder="Enter your delivery address" />
                <Link to="/restaurants">
                  <button>Find Food</button>
                </Link>
              </div>
            </div>

            <img
              className="lm-heroImage"
              src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1"
              alt="delivery"
            />
          </section>

          <h2>Featured Restaurants</h2>

          {loadingFeatured ? (
            <div className="lm-empty">Loading featured restaurants...</div>
          ) : featuredError ? (
            <div className="lm-empty">{featuredError}</div>
          ) : featuredRestaurants.length === 0 ? (
            <div className="lm-empty">
              No featured restaurants available right now.
            </div>
          ) : (
            <div className="lm-cardRow">
              {featuredRestaurants.map((restaurant) => (
                <div key={restaurant.id} className="lm-card">
                  <div
                    className="lm-resultImgFallback"
                    style={{ background: getColorFromName(restaurant.name) }}
                  >
                    {getRestaurantInitial(restaurant.name)}
                  </div>

                  <h3>{restaurant.name || "Restaurant"}</h3>

                  <p>
                    ⭐ {(Number(restaurant.score) || 0).toFixed(1)}
                    {restaurant.ratings
                      ? ` (${restaurant.ratings} ratings)`
                      : ""}
                  </p>

                  <p>{restaurant.category || "Restaurant"}</p>

                  <div className="lm-cardActions">
                    <button
                      className="lm-saveBtn"
                      onClick={() => toggleSaved(restaurant)}
                    >
                      {isSaved(restaurant.id) ? "♥ Saved" : "♡ Save"}
                    </button>

                    <button
                      className="lm-orderBtn"
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