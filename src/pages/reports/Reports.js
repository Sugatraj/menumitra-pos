import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileAlt, faUsers, faBoxes,faArrowLeft,faShoppingCart,faWarehouse } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import ReportLock from "../../components/ReportLock";
import { Tooltip } from 'react-tooltip';
const Reports = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate(); // Hook to get the navigate function

  // Timer variable to store the inactivity timeout
  let inactivityTimer = null;

  // Function to reset the inactivity timer
  const resetInactivityTimer = () => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }
    inactivityTimer = setTimeout(() => {
      // After 1 minute of inactivity, navigate to the Operation screen
      navigate('/operation'); // Replace '/operation' with the actual route
    }, 120000); // 1 minute = 60000 milliseconds
  };

  useEffect(() => {
    // Check localStorage for authentication status whenever the component is rendered
    const storedAccess = localStorage.getItem('report_access') === 'true';
    setIsAuthenticated(storedAccess);

    // Cleanup when component unmounts or route changes
    return () => {
      localStorage.removeItem('report_access'); // Clears the report_access value
      if (inactivityTimer) {
        clearTimeout(inactivityTimer); // Clear the timeout when the component unmounts
      }
    };
  }, []); // This effect runs once when the component mounts and cleans up on unmount

  // Event listeners for user activities
  useEffect(() => {
    const handleUserActivity = () => {
      resetInactivityTimer(); // Reset the inactivity timer on any user activity
    };

    // Add event listeners for mousemove, click, and keypress to reset timer
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('click', handleUserActivity);
    window.addEventListener('keypress', handleUserActivity);

    // Start the inactivity timer when the component mounts
    resetInactivityTimer();

    // Cleanup event listeners when the component unmounts
    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('keypress', handleUserActivity);
      if (inactivityTimer) {
        clearTimeout(inactivityTimer); // Clear timeout if the component is unmounted
      }
    };
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    localStorage.setItem('report_access', 'true'); // Save to localStorage when authenticated
  };
const handleBackClick = () => {
  navigate(-1);
}
  return (
    <div className="bg-white">
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-8 py-10">
        <div className="flex justify-between items-center mb-6">

        <div className="flex items-center w-1/4">
                  <button
                    onClick={handleBackClick}
                    className="text-gray-500 w-8 h-8 rounded-full mr-3 hover:bg-gray-200"
                    data-tooltip-id="tooltip-back"
                    data-tooltip-content="Back"
                  >
                    <FontAwesomeIcon icon={faArrowLeft} />
                  </button>
          <h1 className="text-2xl font-semibold text-gray-800 ">Reports</h1>
          </div>
          </div>
          {!isAuthenticated && <ReportLock onSuccess={handleAuthSuccess} />}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Order Report Card */}
            <Link
              to="/order_report"
              className="bg-gray-100 rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-all"
            >
              <FontAwesomeIcon
                icon={faShoppingCart}
                className="text-blue-600 text-4xl mb-4"
              />
              <h2 className="text-xl font-semibold mb-2">Order Report</h2>
              <p className="text-gray-700">
                View comprehensive details of all orders to track performance and
                trends.
              </p>
            </Link>
            {/* Staff Report Card */}
            <Link
              to="/staff_report" 
              className="bg-gray-100 rounded-lg shadow-md p-6 text-center"
            >
              <FontAwesomeIcon
                icon={faUsers}
                className="text-purple-600 text-4xl mb-4"
              />
              <h2 className="text-xl font-semibold mb-2">Staff Report</h2>
              <p className="text-gray-700">
                Analyze staff performance and track work hours for effective
                management.
              </p>
            </Link>
            {/* Inventory Report Card */}
            <Link
              to="/inventory_report" 
              className="bg-gray-100 rounded-lg shadow-md p-6 text-center"
            >
              <FontAwesomeIcon
                icon={faWarehouse}
                className="text-green-600 text-4xl mb-4"
              />
              <h2 className="text-xl font-semibold mb-2">Inventory Report</h2>
              <p className="text-gray-700">
                Monitor inventory levels and track stock movement for seamless
                operations.
              </p>
            </Link>
          </div>
        </div>
          </div>
      <Footer />
      <Tooltip id="tooltip-back" />
    </div>
  );
};

export default Reports;
