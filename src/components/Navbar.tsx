import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

const Navbar: React.FC = () => {
    const { user, setUser } = useUser();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem("user"); // Clear user from local storage
        localStorage.removeItem("token"); // Clear token from local storage
    }

    return (
        <nav style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem",
          backgroundColor: "#222",
          color: "#fff"
        }}>
            <div>
                <Link to="/login" style={{ marginRight: 16, color: "#61dafb" }}>Login</Link>
                <Link to="/register" style={{ marginRight: 16, color: "#61dafb" }}>Register</Link>
                <Link to="/predictions" style={{ color: "#61dafb" }}>Predictions</Link>
            </div>
    
            {user && (
                <div style={{ position: "relative" }}>
                <button onClick={() => setDropdownOpen(!dropdownOpen)} style={{ background: "none", color: "#fff", border: "none", cursor: "pointer" }}>
                    {user.email} ▼
                </button>
                {dropdownOpen && (
                    <div style={{
                    position: "absolute",
                    right: 0,
                    top: "2rem",
                    backgroundColor: "#333",
                    padding: "0.5rem",
                    borderRadius: 4,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
                    }}>
                    <Link to="/profile" style={{ display: "block", color: "#fff", marginBottom: 8 }}>Profile</Link>
                    <button onClick={handleLogout} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
                        Logout
                    </button>
                    </div>
                )}
                </div>
            )}
        </nav>
    );
  };

const styles: { [key: string]: React.CSSProperties } = {
    dropdownOpen: {
        position: "absolute",
        right: 0,
        top: "2rem",
        backgroundColor: "#333",
        padding: "0.5rem",
        borderRadius: 4,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
    }
}

export default Navbar;