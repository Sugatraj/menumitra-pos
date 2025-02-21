import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faCog,
  faSignOutAlt,
  faQuestionCircle,
  faGear,
  faUser,
  faShoppingCart,
  faConciergeBell
} from "@fortawesome/free-solid-svg-icons";
import { Tooltip } from "react-tooltip";
import hotellogo from "../assets/hotel.png";
import axios from "axios";
import { onMessageListener, showNotification } from '../firebase-config';
import NetworkDetector from "../dinosaurGame/NetworkDetector";
import MenuMitra from "../assets/menumitra.png";
import { Link } from "react-router-dom";
function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isImageError, setIsImageError] = useState(false);
  const [outletName, setOutletName] = useState(
    localStorage.getItem("outlet_name") || "Hotel Name"
  );
  const [notification, setNotification] = useState(null);

  const outlet_id = localStorage.getItem("outlet_id");
  const user_id = localStorage.getItem("user_id");
  const [image, setImage] = useState(localStorage.getItem("image"));
  
  const isActive = (path) =>
    location.pathname === path
      ? "text-white bg-cyan-600 hover:bg-cyan-700 shadow-lg"
      : "text-cyan-200 hover:text-white hover:bg-cyan-500 transition-colors";

  const outlet_name = localStorage.getItem('outlet_name');
  const owner_name = localStorage.getItem('owner_name');

  const handleLogout = async () => {
    try {
      const user_id = localStorage.getItem("user_id"); // Fetch user_id from localStorage
      const role ="manager"; // Default to "owner"
      const app = "pos";
  
      const response = await axios.post("https://menusmitra.xyz/common_api/logout", {
        user_id,
        role,
        app,
      });
  
      if (response.data.st === 1) {
        localStorage.clear();
        navigate("/login");
      } else {
        console.error("Logout failed:", response.data.message);
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };
  useEffect(() => {
    const handleStorageChange = () => {
      setOutletName(localStorage.getItem("outlet_name") || "Hotel Name");
    };

    // Listen for changes to localStorage
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const [loading, setLoading] = useState(false);
  const handleCallWaiter = async () => {
    setLoading(true);

    const outlet_id = localStorage.getItem('outlet_id');
    const user_id = localStorage.getItem('user_id');

    console.log('Outlet ID:', outlet_id);
    console.log('User ID:', user_id);

    try {

      
      const accessToken = localStorage.getItem('access'); // Retrieve access token
  
      if (!accessToken) {
        console.warn('No access token found, redirecting to login');
        navigate('/login'); // Redirect if token is missing
        return;
      }

        const response = await axios.post('https://menusmitra.xyz/common_api/call_waiter', {
            outlet_id: parseInt(outlet_id),
            user_id: parseInt(user_id),
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (response.data.st === 1) {
            window.showToast?.('success', 'Waiter has been called ');
        } else {
            window.showToast?.('error', response.data.msg || 'Failed to call the waiter');
        }
    } catch (error) {
        console.error('Error Object:', error); // Logs the complete error object
        window.showToast?.(
            'error',
            error.response?.data?.msg || error.message || 'Something went wrong. Please try again later.'
        );
    } finally {
        setLoading(false);
    }
};

  useEffect(() => {
    const isElectron = window && window.process && window.process.type;
    
    if (!isElectron && 'Notification' in window) {
      try {
        // Listen for background messages
        navigator.serviceWorker?.addEventListener('message', (event) => {
          if (event.data?.type === 'BACKGROUND_NOTIFICATION') {
            window.showToast?.('notification', 
              `${event.data.title}: ${event.data.body}`
            );
          }
        });

        // Listen for foreground messages
        onMessageListener()
          .then(payload => {
            if (payload?.notification) {
              showNotification(
                payload.notification.title,
                payload.notification.body
              );
              setNotification(payload);
            }
          })
          .catch(err => {
            console.warn('Header message listener error:', err);
          });
      } catch (error) {
        console.warn('Error setting up message listener:', error);
      }
    }
  }, []);


  const [isNetworkVisible, setIsNetworkVisible] = useState(false);

  useEffect(() => {
    // Simulating network detection visibility
    const checkNetworkStatus = () => {
      // Assume NetworkDetector updates a global state or emits an event
      // For now, let's assume it appears when offline
      setIsNetworkVisible(navigator.onLine === false);
    };

    window.addEventListener("online", checkNetworkStatus);
    window.addEventListener("offline", checkNetworkStatus);

    checkNetworkStatus(); // Initial check

    return () => {
      window.removeEventListener("online", checkNetworkStatus);
      window.removeEventListener("offline", checkNetworkStatus);
    };
  }, []);
  return (
    <>
   {isNetworkVisible && (
        <div className="fixed top-0 w-full z-50 bg-white text-center">
          <NetworkDetector />
        </div>
      )}

      {/* Main Header */}
      <header
        className={`bg-purple-500 shadow-lg fixed w-full z-50 transition-all duration-300 ${
          isNetworkVisible ? "top-5 mt-2" : "top-0 mt-0"
        }`}
      >        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            {/* Logo and Hotel Name - Left */}
            <div className="flex-shrink-0 flex items-center space-x-4">
            {/* <div className="w-10 h-10 flex items-center justify-center rounded-full overflow-hidden bg-white">
        <img
          src={MenuMitra}
          alt="MenuMitra"
          className="w-full h-full object-cover"
        />
      </div> */}
            {!isImageError && image ? (
      <div className="w-10 h-10 flex items-center justify-center rounded-full overflow-hidden bg-white">
        <img
          src={image}
          alt="Hotel Logo"
          className="w-full h-full object-cover"
          onError={() => setIsImageError(true)} // Handle image load error
        />
      </div>
    ) : (
      <div className="w-10 h-10 flex items-center justify-center rounded-full overflow-hidden bg-gray-200">
        {/* Alternative placeholder for icon */}
        <span className="text-gray-500 text-xl font-bold">    {outletName ? outletName.charAt(0).toUpperCase() : 'H'}
        </span> {/* Placeholder */}
      </div>
    )}

              <div className="flex flex-col">
                <Link to="/home" className="text-xl font-bold text-white capitalize">
                  {outletName}
                </Link>
              </div>
            </div>

            {/* Navigation - Center */}
            <div className="flex-1 flex justify-center space-x-6">
              <button
                onClick={() => navigate("/operation")}
                className={`px-4 py-2 rounded-full border border-cyan-300 text-sm font-medium ${isActive(
                  "/operation"
                )}`}
              >
                <FontAwesomeIcon icon={faCog} className="mr-2" />
                Operations
              </button>
              <button
                onClick={() => navigate("/order_list")}
                className={`px-4 py-2 rounded-full border border-cyan-300 text-sm font-medium ${isActive(
                  "/order_list"
                )}`}
              >
                <FontAwesomeIcon icon={faShoppingCart} className="mr-2" />
                Orders
              </button>
               <button
      onClick={handleCallWaiter}
      disabled={loading}
      className={`px-4 py-2 rounded-full border border-cyan-300 text-sm font-medium ${isActive(
        "/call_waiter"
      )}`}
    >
      <FontAwesomeIcon icon={faConciergeBell} className="mr-2" />
      {loading ? 'Calling...' : 'Call Waiter'}
    </button> 
            </div>

            {/* Actions - Right */}
            <div className="flex-shrink-0 flex items-center space-x-4">
              <button
                onClick={() => navigate("/home")}
                className={`p-2 rounded-full w-10 h-10 ${isActive(
                  "/home"
                )} text-cyan-100`}
                data-tooltip-id="tooltip-home"
                data-tooltip-content="Home"
              >
                <FontAwesomeIcon icon={faHome} className="text-lg" />
              </button>

              <button
              onClick={() => navigate("/support")}
  className={`p-2 rounded-full w-10 h-10 ${isActive(
    "/support"
  )} text-cyan-100`}                data-tooltip-id="tooltip-support"
                data-tooltip-content="Support"
              >
                <FontAwesomeIcon icon={faQuestionCircle} className="text-lg" />
              </button>

              {/* <button
                onClick={() => navigate("/setting")}
                className={`p-2 rounded-full w-10 h-10 ${isActive(
                  "/setting"
                )} text-cyan-100`}
                data-tooltip-id="tooltip-settings"
                data-tooltip-content="Settings"
              >
                <FontAwesomeIcon icon={faGear} className="text-lg" />
              </button> */}

              <button
                onClick={() => navigate("/profile")}
                className={`p-2 rounded-full w-10 h-10 ${isActive(
                  "/profile"
                )} text-cyan-100`}
                data-tooltip-id="tooltip-profile"
                data-tooltip-content="Profile"
              >
                <FontAwesomeIcon icon={faUser} className="text-lg" />
              </button>

              <button
                onClick={handleLogout}
                className="p-2 text-cyan-100 hover:text-white rounded-full w-10 h-10 hover:bg-cyan-500"
                data-tooltip-id="tooltip-logout"
                data-tooltip-content="Logout"
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="text-lg" />
              </button>
            </div>

            {/* Tooltips */}
            <Tooltip id="tooltip-home" />
            <Tooltip id="tooltip-profile" />
            <Tooltip id="tooltip-support" />
            <Tooltip id="tooltip-settings" />
            <Tooltip id="tooltip-logout" />
          </div>
        </div>
      </header>

      {/* Spacing to avoid content overlap */}
      <div className="h-20"></div>
    </>
  );
}

export default Header;
