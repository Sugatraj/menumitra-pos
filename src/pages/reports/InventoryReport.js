import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSave ,faArrowLeft} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
const InventoryReport = () => {
  const [fileLink, setFileLink] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timePeriod, setTimePeriod] = useState("today"); // Default to 'today'
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDateModal, setShowDateModal] = useState(false); // Initially hidden
  const outlet_id = localStorage.getItem("outlet_id");

  const formatDate = (date) => {
    if (!date) return "";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(date).toLocaleDateString("en-GB", options);
  };

  const fetchReportData = async () => {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      window.showToast("error", "Start date cannot be greater than end date.");
      return;
    }
  
    setLoading(true);
    try {
      const requestData = {
        outlet_id: outlet_id,
        time_period: timePeriod,
      };
  
      if (startDate && endDate) {
        requestData.start_date = formatDate(startDate);
        requestData.end_date = formatDate(endDate);
      }
  
      const accessToken = localStorage.getItem("access"); // Retrieve access token
  
      if (!accessToken) {
        console.error("No access token found");
        navigate('/login'); // Redirect to login page
        return;
      }
  
      const response = await axios.post(
        "https://men4u.xyz/pos_outlet/inventory_report_generate",
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`  // Include the access token in the header
          }
        }
      );
  
      if (response.data.st === 1) {
        setFileLink(response.data.file_link);
        window.showToast("success", "Report generated successfully!");
      } else {
        setError("Error: " + response.data.msg);
        window.showToast("error", response.data.msg || "Failed to generate report.");
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Handle 401 error (Unauthorized)
        console.error("Unauthorized: Redirecting to login");
        navigate('/login'); // Redirect to login page
      } else {
        setError("Error fetching report: " + error.message);
        window.showToast("error", error.message || "Failed to fetch report.");
      }
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    if (startDate && endDate) {
      setTimePeriod(""); // Clear timePeriod when dates are set
    }
  }, [startDate, endDate]);


  const navigate = useNavigate();
  
  useEffect(() => {
    // Set timeout for 10 seconds (10000ms)
    const inactivityTimeout = setTimeout(() => {
      navigate('/operation'); // Navigate to the operations screen
    }, 120000); // 10 seconds of inactivity
  
    // Reset timer on any user activity (mousemove, keypress, click, or scroll)
    const resetTimer = () => {
      clearTimeout(inactivityTimeout);
      setTimeout(() => {
        navigate('/operation');
      }, 120000); // Reset the 10-second inactivity timer
    };
  
    // Event listeners for user interaction
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('scroll', resetTimer);
  
    // Cleanup function to remove event listeners when the component unmounts
    return () => {
      clearTimeout(inactivityTimeout); // Clear the timeout
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('scroll', resetTimer);
    };
  }, [navigate]);

  // Logic to check if the "Generate Report" button should be shown
  const isGenerateButtonDisabled = !timePeriod && (!startDate || !endDate);
const handleBackClick = () => {
  navigate(-1);
}
  return (
    <div className=" bg-white">
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-8 py-10">
            <div className="flex items-center w-1/4">
                                      <button
                                        onClick={handleBackClick}
                                        className="text-gray-500 w-8 h-8 rounded-full mr-3 hover:bg-gray-200"
                                        data-tooltip-id="tooltip-back"
                                        data-tooltip-content="Back"
                                      >
                                        <FontAwesomeIcon icon={faArrowLeft} />
                                      </button>
          <h1 className="text-2xl font-semibold text-gray-800 "> Inventory Report</h1>
          </div>

          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            {["all", "today", "yesterday", "this_week", "last_week", "this_month", "last_month", "6_months"].map((period) => (
              <button
                key={period}
                onClick={() => {
                  setTimePeriod(period);
                  if (period !== "6_months") {
                    setStartDate("");
                    setEndDate("");
                  }
                }}
                className={`px-6 py-3 border rounded-lg text-sm font-medium transition-all ${
                  timePeriod === period
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-200 text-gray-800 hover:bg-blue-100"
                }`}
              >
                {period === "all" && "All"}
                {period === "today" && "Today"}
                {period === "yesterday" && "Yesterday"}
                {period === "this_week" && "This Week"}
                {period === "last_week" && "Last Week"}
                {period === "this_month" && "This Month"}
                {period === "last_month" && "Last Month"}
                {period === "6_months" && "Last 6 Months"}
              </button>
            ))}
            <button
              onClick={() => {
                setTimePeriod(""); // Remove time period when selecting custom date range
                setShowDateModal(true); // Open the date modal
              }}
              className={`px-6 py-3 font-medium rounded-lg transition-all ${
                timePeriod === "" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-blue-100"
              }`}
            >
              Select Date
            </button>
          </div>

          {/* Show "Generate Report" button only if a time period or date range is selected */}
          {!isGenerateButtonDisabled && (
            <div className="mt-6 text-center">
              <button
                onClick={fetchReportData}
                className="px-8 py-3 bg-green-600 text-white text-lg font-medium rounded-lg hover:bg-green-500 transition-all"
              >
                Generate Report
              </button>
            </div>
          )}
 {!isGenerateButtonDisabled && (
<>
          {loading ? (
            <p className="mt-6 text-gray-600 text-center">Loading...</p>
          ) : error ? (
            <p className="mt-6 text-red-600 text-center">{error}</p>
          ) : fileLink ? (
            <div className="mt-6 text-center">
              <p className="text-green-600 text-xl font-medium">Report generated successfully!</p>
              <a
                href={fileLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline text-lg mt-4 block"
              >
                Download Report
              </a>
            </div>
          ) : (
            <p className="mt-6 text-gray-600 text-center">No report available.</p>
          )}
          </>
 )}
        </div>
      
      </div>

      {showDateModal && (
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowDateModal(false)}
        >
          <div
            className="bg-white p-6 rounded-lg w-300 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowDateModal(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
            >
              <FontAwesomeIcon icon={faTimes} className="text-gray-500 mr-3" />
            </button>
            <h2 className="text-xl font-semibold text-gray-700 text-center">Select Date</h2>
            <div className="mt-4 flex items-center justify-center space-x-6">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-3 border rounded-lg w-3/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-lg font-medium text-gray-700">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-3 border rounded-lg w-3/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
              <div className="flex justify-between space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setShowDateModal(false)}
                className="px-2 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none "
              >
              <FontAwesomeIcon icon={faTimes} className="text-gray-500 mr-1" />  Cancel
              </button>
              <button
                onClick={() => {
                  setShowDateModal(false);
                  fetchReportData();
                }}
                className="ml-4 px-2 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-500 transition-all"
              >
                <FontAwesomeIcon icon={faSave} className="text-success-500 mr-1" /> Save
              </button>
            </div>
          </div>
        </div>
      )}

<Footer />
<Tooltip id="tooltip-back" />
    </div>
  );
};


export default InventoryReport;
