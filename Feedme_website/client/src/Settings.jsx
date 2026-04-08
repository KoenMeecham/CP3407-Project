import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./App.css";
import CartDropdown from "./CartDropdown";
import UserMenu from "./UserMenu";
import { useUser } from "./UserContext";

export default function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useUser();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError("New password must be different from your current password.");
      return;
    }

    try {
      setSavingPassword(true);

      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordError(data.message || "Could not change password.");
        return;
      }

      setPasswordSuccess("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      setPasswordError("Could not change password.");
    } finally {
      setSavingPassword(false);
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
            <strong>Account Settings</strong>
            <p>Manage your profile and account details.</p>
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
          <div className="settings-pageWrap">
            <div className="settings-headerCard">
              <h1 className="settings-pageTitle">Settings</h1>
              <p className="settings-pageSubtitle">
                View your account information and app preferences
              </p>
            </div>

            {!user || !user.isLoggedIn ? (
              <div className="settings-card">
                <h2 className="settings-sectionTitle">Guest Account</h2>
                <p>
                  You are currently browsing as a guest. Login or register to
                  save your account details and personalise your experience.
                </p>

                <div className="checkout-authRow">
                  <Link to="/login" className="checkout-linkBtn">
                    Login
                  </Link>
                  <Link to="/register" className="checkout-linkBtn">
                    Register
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="settings-card">
                  <h2 className="settings-sectionTitle">Profile Information</h2>

                  <div className="settings-infoRow">
                    <span className="settings-label">First Name</span>
                    <span className="settings-value">{user.firstName || "-"}</span>
                  </div>

                  <div className="settings-infoRow">
                    <span className="settings-label">Last Name</span>
                    <span className="settings-value">{user.lastName || "-"}</span>
                  </div>

                  <div className="settings-infoRow">
                    <span className="settings-label">Email</span>
                    <span className="settings-value">{user.email || "-"}</span>
                  </div>

                  <div className="settings-infoRow">
                    <span className="settings-label">Role</span>
                    <span className="settings-value">{user.role || "customer"}</span>
                  </div>

                  <div className="settings-infoRow">
                    <span className="settings-label">Account Type</span>
                    <span className="settings-value">Registered User</span>
                  </div>
                </div>

                <div className="settings-card">
                  <h2 className="settings-sectionTitle">Security</h2>

                  <form onSubmit={handleChangePassword} className="settings-passwordForm">
                    <input
                      type="password"
                      placeholder="Current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />

                    <input
                      type="password"
                      placeholder="New password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />

                    <input
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />

                    {passwordError && (
                      <div className="checkout-error">{passwordError}</div>
                    )}

                    {passwordSuccess && (
                      <div className="checkout-successBanner">{passwordSuccess}</div>
                    )}

                    <button
                      type="submit"
                      className="checkout-placeBtn settings-passwordBtn"
                      disabled={savingPassword}
                    >
                      {savingPassword ? "Updating..." : "Change Password"}
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
