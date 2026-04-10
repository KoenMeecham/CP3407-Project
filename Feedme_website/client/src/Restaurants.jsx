import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import "./App.css";
import CartDropdown from "./CartDropdown";
import { useUser } from "./UserContext";
import UserMenu from "./UserMenu";
import { useSaved } from "./SavedContext";

function getRestaurantInitial(name) {
  if (!name || typeof name !== "string") return "?";
  return name.trim().charAt(0).toUpperCase() || "?";
}

function getColorFromName(name) {
  const colors = ["#dbeafe", "#dcfce7", "#fef3c7", "#fee2e2", "#e9d5ff"];
  if (!name) return colors[0];
  return colors[name.length % colors.length];
}

export default function Restaurants() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const q = (params.get("q") || "").trim();
  const rawPage = Number(params.get("page") || 1);
  const page = rawPage > 0 ? rawPage : 1;

  const [search, setSearch] = useState(q);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalPages, setTotalPages] = useState(0);

  const { logout } = useUser();
  const { isSaved, toggleSaved } = useSaved();

  useEffect(() => {
    setSearch(q);
  }, [q]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const query = new URLSearchParams();
        if (q) query.append("q", q);
        query.append("page", page);
        query.append("limit", 20);

        const res = await fetch(`/api/restaurants?${query.toString()}`);

        if (!res.ok) {
          throw new Error("Failed to load restaurants");
        }

        const data = await res.json();

        setRestaurants(data.restaurants || []);
        setTotalPages(data.totalPages || 0);
      } catch (err) {
        console.error(err);
        setRestaurants([]);
        setTotalPages(0);
        setError("Could not load restaurants.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [q, page]);

  const onSubmit = (e) => {
    e.preventDefault();
    const next = search.trim();

    if (next) {
      setParams({ q: next, page: "1" });
    } else {
      setParams({});
    }
  };

  return (
    <div className="lm-shell">
      <header className="lm-topbar">
        <Link to="/" className="lm-brandLink">
          FeedMe
        </Link>

        <form className="lm-topsearchForm" onSubmit={onSubmit}>
          <input
            className="lm-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search restaurants, cuisines, or dishes"
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
            <h2 className="lm-resultsTitle">
              {q ? `Results for "${q}"` : "Explore Restaurants"}
            </h2>
          </div>

          {loading ? (
            <div className="lm-empty">Loading...</div>
          ) : error ? (
            <div className="lm-empty">{error}</div>
          ) : restaurants.length === 0 ? (
            <div className="lm-empty">
              No results {q ? <>for <b>"{q}"</b></> : null}.
            </div>
          ) : (
            <>
              <div
                className={
                  restaurants.length === 1
                    ? "lm-resultsGrid lm-resultsGridSingle"
                    : "lm-resultsGrid"
                }
              >
                {restaurants.map((r, idx) => (
                  <div className="lm-resultCard" key={r.id ?? idx}>
                    <div
                      className="lm-resultImgFallback"
                      style={{ background: getColorFromName(r.name) }}
                    >
                      {getRestaurantInitial(r.name)}
                    </div>

                    <div className="lm-resultBody">
                      <div className="lm-resultName">
                        {r.name || "Restaurant"}
                      </div>

                      <div className="lm-resultMeta">
                        <span className="lm-star">★</span>
                        <span className="lm-rating">
                          {(Number(r.score) || 0).toFixed(1)}
                        </span>
                        <span className="lm-submeta">
                          {r.ratings ? ` (${r.ratings} ratings)` : ""}
                        </span>
                      </div>

                      <div className="lm-submeta">
                        {r.category || "Restaurant"}
                      </div>

                      <div className="lm-submeta">
                        {r.price_range ? `Price: ${r.price_range}` : ""}
                      </div>

                      <button
                        className="lm-saveBtnWide"
                        onClick={() => toggleSaved(r)}
                      >
                        {isSaved(r.id) ? "♥ Saved" : "♡ Save"}
                      </button>

                      <button
                        className="lm-orderBtnWide"
                        onClick={() => navigate(`/restaurants/${r.id}`)}
                      >
                        Order
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="lm-pagination">
                  <button
                    disabled={page <= 1}
                    onClick={() =>
                      setParams({
                        ...(q ? { q } : {}),
                        page: String(page - 1),
                      })
                    }
                  >
                    Previous
                  </button>

                  <span className="lm-pageInfo">
                    Page {page} of {totalPages}
                  </span>

                  <button
                    disabled={page >= totalPages}
                    onClick={() =>
                      setParams({
                        ...(q ? { q } : {}),
                        page: String(page + 1),
                      })
                    }
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}