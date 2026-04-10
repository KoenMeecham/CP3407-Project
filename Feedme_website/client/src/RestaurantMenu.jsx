import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCart } from "./Cart";
import CartDropdown from "./CartDropdown";
import "./App.css";
import UserMenu from "./UserMenu";

const ignore = ["and", "&", "the"];

function getMenuInitial(name) {
  if (!name || typeof name !== "string") return "?";

  const words = name
    .trim()
    .split(/\s+/)
    .filter((w) => w && !ignore.includes(w.toLowerCase()));

  const initials = words
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return initials || "?";
}

function getColorFromName(name) {
  const colors = ["#dbeafe", "#dcfce7", "#fef3c7", "#fee2e2", "#e9d5ff"];
  if (!name) return colors[0];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

export default function RestaurantMenu() {
  const { id } = useParams();

  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch(`/api/restaurants/${id}`);
        const restaurantData = await r.json();

        const m = await fetch(`/api/restaurants/${id}/menu`);
        const menuData = await m.json();

        setRestaurant(restaurantData);
        setMenu(menuData);
      } catch (error) {
        console.error("Failed to load restaurant menu:", error);
        setRestaurant(null);
        setMenu([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) return <div className="lm-empty">Loading...</div>;

  if (!restaurant) return <div className="lm-empty">Restaurant not found.</div>;

  return (
    <div className="lm-shell">
      <header className="lm-topbar">
        <Link to="/" className="lm-brandLink">
          FeedMe
        </Link>

        <div className="lm-navSpacer" />

        <CartDropdown />

        <UserMenu />
      </header>

      <main className="lm-main">
        <div className="lm-restaurantHeader">
          <h1>{restaurant.name}</h1>
          <p>{restaurant.category}</p>
        </div>

        <div className="lm-contentWrap">
          <div className="lm-menuGrid">
            {menu.map((item) => (
              <div className="lm-menuCard" key={item.id}>
                <div
                  className="lm-menuImgFallback"
                  style={{ background: getColorFromName(item.name) }}
                >
                  {getMenuInitial(item.name)}
                </div>

                <div className="lm-menuTitle">{item.name}</div>

                <div className="lm-menuDesc">
                  {item.description || "No description available."}
                </div>

                <div className="lm-menuBottom">
                  <span className="lm-menuPrice">
                    ${Number(item.price).toFixed(2)}
                  </span>

                  <button
                    className="lm-addBtn"
                    onClick={() =>
                      addToCart({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        restaurant: restaurant.name,
                        restaurant_id: restaurant.id,
                      })
                    }
                  >
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}