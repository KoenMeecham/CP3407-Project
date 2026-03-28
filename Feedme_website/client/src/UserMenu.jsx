import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./App.css";
import { useUser } from "./UserContext";

export default function UserMenu() {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="user-menu" ref={menuRef}>
      <button
        className="user-menu-btn"
        onClick={() => setOpen((prev) => !prev)}
      >
        {user.name}
      </button>

      {open && (
        <div className="user-menu-dropdown">
          <div className="user-menu-header">
            <strong>{user.name}</strong>
            {user.email && <div className="user-menu-email">{user.email}</div>}
          </div>

          {user.isLoggedIn ? (
            <>
              <Link
                to="/settings"
                className="user-menu-item"
                onClick={() => setOpen(false)}
              >
                Settings
              </Link>

              <button
                className="user-menu-item user-menu-danger"
                onClick={() => {
                  logout();
                  setOpen(false);
                  navigate("/");
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="user-menu-item"
                onClick={() => setOpen(false)}
              >
                Login
              </Link>

              <Link
                to="/register"
                className="user-menu-item"
                onClick={() => setOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
