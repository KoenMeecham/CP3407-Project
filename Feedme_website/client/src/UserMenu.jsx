import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "react-oidc-context";
import "./App.css";

export default function UserMenu() {
  const auth = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!auth.isAuthenticated) {
    return (
      <button
        className="user-menu-btn"
        onClick={() => auth.signinRedirect()}
      >
        Login
      </button>
    );
  }

  return (
    <div className="user-menu" ref={ref}>
      <button
        className="user-menu-btn"
        onClick={() => setOpen(!open)}
      >
        {auth.user?.profile.email}
      </button>

      {open && (
        <div className="user-menu-dropdown">
          <div className="user-menu-header">
            <strong>{auth.user?.profile.email}</strong>
            <div className="user-menu-email">Signed in</div>
          </div>

          <button
            className="user-menu-item user-menu-danger"
            onClick={() => auth.signoutRedirect()}
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}