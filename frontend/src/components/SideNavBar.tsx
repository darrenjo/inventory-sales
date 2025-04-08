import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const SideNavbar: React.FC = () => {
  const [showLogoutPopup, setShowLogoutPopup] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleLogout = (): void => {
    // Remove authentication token
    window.history.replaceState(null, "", "/login");

    // Redirect to login page
    navigate("/login");
  };

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div
        className="bg-dark text-white p-3"
        style={{ width: "250px", height: "100vh" }}
      >
        <div className="logo mb-4">
          <h2>Manajemen Kain</h2>
        </div>
        <ul className="nav flex-column">
          <li className="nav-item">
            <Link to="/home" className="nav-link text-white">
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/add-inventory" className="nav-link text-white">
              Color Catalogue
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/search" className="nav-link text-white">
              Price Catalogue
            </Link>
          </li>
          <li className="nav-item">
            <button
              className="nav-link text-white bg-transparent border-0"
              onClick={() => setShowLogoutPopup(true)}
            >
              Log Out
            </button>
          </li>
        </ul>
      </div>

      {/* Bootstrap Modal (Centered) */}
      {showLogoutPopup && (
        <>
          <div className="modal fade show d-block" tabIndex={-1} role="dialog">
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Logout</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => setShowLogoutPopup(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to log out?</p>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowLogoutPopup(false)}
                  >
                    Cancel
                  </button>
                  <button className="btn btn-danger" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Overlay Background */}
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
};

export default SideNavbar;
