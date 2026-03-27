import React, { useState } from "react";
import { Link } from "react-router-dom";

function UserMenu({ user, logout }) {
  const [open, setOpen] = useState(false);

  if (!user) {
    return (
      <div className="lm-topbarRight">
        <Link strokeWidth="2" to="/login" className="lm-navItem" style={{background: 'white'}}>Login</Link>
      </div>
    );
  }

  return (
    <div className="user-menu">
      <button className="user-menu-btn" onClick={() => setOpen(!open)}>
        Hi, {user.name || 'User'} ▼
      </button>
      {open && (
        <div className="user-menu-dropdown">
          <div className="user-menu-header">
            <strong>{user.name}</strong>
            <div className="user-menu-email">{user.email}</div>
          </div>
          <Link strokeWidth="2" to="/orders" className="user-menu-item">My Orders</Link>
          <Link strokeWidth="2" to="/settings" className="user-menu-item">Settings</Link>
          <button onClick={logout} className="user-menu-item user-menu-danger">Sign Out</button>
        </div>
      )}
    </div>
  );
}

export default UserMenu;