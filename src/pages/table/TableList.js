import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from '../../components/Header';
import { Tooltip } from 'react-tooltip';
import Footer from '../../components/Footer';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash , faArrowLeft,faQrcode,faSpinner,faPlus,faTimes,faCar,faGear, faHandHoldingHeart,faCashRegister,faStore, faDownload, faShare } from "@fortawesome/free-solid-svg-icons";

const TableList = () => {
  const [sections, setSections] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [deleteTableId, setDeleteTableId] = useState(null);
  const navigate = useNavigate();
  const outlet_id = localStorage.getItem('outlet_id');
  const [showDeleteIcons, setShowDeleteIcons] = useState({});
  const [orderType, setOrderType] = useState('dine-in');
  const [loadingSection, setLoadingSection] = useState(null);
  const [deletingTableId, setDeletingTableId] = useState(null);
  const [showIcons, setShowIcons] = useState(false); 
  // const [totalSales, setTotalSales] = useState(0);
  const [liveSales, setLiveSales] = useState(0);
  const [todaySales, setTodaySales] = useState(0);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [isLoadingQr, setIsLoadingQr] = useState(false);
  // Toggle delete icons visibility for a specific section
  const toggleDeleteIcons = (sectionId) => {
    setShowDeleteIcons((prevState) => ({
      ...prevState,
      [sectionId]: !prevState[sectionId], // Toggle visibility for the specific section
    }));
  };
  const fetchTables = async () => {
    try {
      const accessToken = localStorage.getItem("access"); // Retrieve access token
  
      if (!accessToken) {
        console.error("No access token found");
        navigate("/login"); // Redirect if token is missing
        return;
      }
  
      const response = await fetch('https://men4u.xyz/common_api/table_listview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`, // Add Authorization header with token
        },
        body: JSON.stringify({
          outlet_id: outlet_id,
        })
      });
  
      const result = await response.json();
  
      if (response.status === 401) {
        // Handle Unauthorized error
        console.error("Unauthorized access, redirecting to login.");
        navigate("/login"); // Redirect if token is missing
        return;
      }
  
      if (result.st === 1) {
        setSections(result.data);
        setLiveSales(result.live_sales || 0);
        setTodaySales(result.today_total_sales || 0);
      } else {
        console.error("Error fetching tables:", result.msg);
      }
    } catch (error) {
      console.error("Error fetching tables:", error);
    }
  };
  

  useEffect(() => {
 
    fetchTables();

  
    const interval = setInterval(() => {
      fetchTables();
    }, 60000); 

   
    return () => clearInterval(interval);
  }, [outlet_id]);

  const handleAddTable = async (sectionId) => {
    setLoadingSection(sectionId);
  
    try {
      const accessToken = localStorage.getItem("access"); // Retrieve access token
  
      if (!accessToken) {
        console.error("No access token found");
        navigate("/login"); // Redirect if token is missing
        return;
      }
  
      const response = await fetch('https://men4u.xyz/common_api/table_create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`, // Add Authorization header with token
        },
        body: JSON.stringify({
          outlet_id: outlet_id,
          section_id: sectionId,
        }),
      });
  
      const result = await response.json();
  
      if (response.status === 401) {
        // Handle Unauthorized error
        console.error("Unauthorized access, redirecting to login.");
        navigate("/login"); // Redirect if token is missing
        return;
      }
  
      if (result.st === 1) {
        fetchTables(); // Refresh the tables list
      } else {
        alert('Failed to add table: ' + result.msg);
      }
    } catch (error) {
      console.error('Error adding table:', error);
      alert('Error adding table. Please try again.');
    } finally {
      setLoadingSection(null); // Reset loading state
    }
  };
  

  const getFilteredTables = (tables) => {
    if (filterStatus === "all") return tables;
    return tables.filter((table) => {
      switch (filterStatus) {
        case "available":
          return !table.is_occupied;
        case "occupied":
          return table.is_occupied;
        default:
          return true;
      }
    });
  };

  const getStatusColor = (isOccupied) => {
    return isOccupied 
      ? "bg-red-100 border-red-300 border-dashed"
      : "bg-white-100 border-green-300 border-dashed";
  };

  const handleTableClick = (sectionName, sectionId, tableNumber, isOccupied, tableId, orderId, table) => {
    navigate(`/order_create_list`, {
      state: {
        order_type: 'dine-in',
        section_name: sectionName,
        section_id: sectionId,
        table_number: tableNumber,
        is_occupied: isOccupied,
        table_id: tableId,
        order_id: orderId,
        grand_total: table.grand_total || 0,
        order_number: table.order_number || ''
      },
    });
  };
  
  

  const getTotalStats = () => {
    const totalStats = {
      forecast: 0,
      available: 0,
      ordered: 0,
      total: 0
    };

    sections.forEach(section => {
      totalStats.total += section.tables.length;
      totalStats.available += section.tables.filter(t => !t.is_occupied).length;
      totalStats.ordered += section.tables.filter(t => t.is_occupied).length;
      totalStats.forecast += section.tables.reduce((sum, table) => sum + (table.grand_total || 0), 0);
    });

    return totalStats;
  };

  const stats = getTotalStats();
 
  const handleDeleteClick = async (tableId, sectionId) => {
    setDeletingTableId(tableId); // Set the deleting table ID to show spinner
    
    const requestData = {
      outlet_id: outlet_id,
      section_id: sectionId,
    };
  
    try {
      const accessToken = localStorage.getItem("access"); // Retrieve access token
  
      if (!accessToken) {
        console.error("No access token found");
        navigate("/login"); // Redirect if token is missing
        return;
      }
  
      const response = await fetch("https://men4u.xyz/common_api/table_delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`, // Add Authorization header with token
        },
        body: JSON.stringify(requestData),
      });
  
      const result = await response.json();
  
      if (response.status === 401) {
        // Handle Unauthorized error
        console.error("Unauthorized access, redirecting to login.");
        navigate("/login"); // Redirect if token is missing
        return;
      }
  
      if (result.st === 1) {
        await fetchTables(); // Refresh tables after successful deletion
      } else {
        console.error("Error deleting table:", result.msg);
      }
    } catch (error) {
      console.error("Error deleting table:", error);
    } finally {
      setDeletingTableId(null); // Reset deleting table ID
      setShowDeleteIcons({}); // Hide delete icons after deletion
    }
  };
  
  
  const calculateTimeDifference = (occupiedTime) => {
    const currentTime = new Date();
    
    // Parse the occupied time string into a Date object
    const occupiedDate = new Date(occupiedTime); // Date object will automatically parse the string
  
    const difference = Math.abs(currentTime - occupiedDate); // Difference in ms
    const minutesDiff = Math.floor(difference / 60000); // Convert ms to minutes
    const hoursDiff = Math.floor(minutesDiff / 60);
  
    if (hoursDiff >= 3) {
      return "3h+";
    } else if (hoursDiff > 0) {
      return `${hoursDiff}h ${minutesDiff % 60}m`;
    } else if (minutesDiff > 0) {
      return `${minutesDiff}m ago`;
    } else {
      return "0m ago";
    }
  };
    
  
  

  const handleDriveThrough = () => {
    navigate('/order_create_list', {
      state: {
        order_type: 'drive-through',
        table_id: null,
        table_number: null,
        section_id: null,
        section_name: null,
        is_occupied: false
      }
    });
  };

  const handleParcel = () => {
    navigate('/order_create_list', {
      state: {
        order_type: 'parcel',
        table_id: null,
        table_number: null,
        section_id: null,
        section_name: null,
        is_occupied: false
      }
    });
  };

  const handleCounter = () => {
    navigate('/order_create_list', {
      state: {
        order_type: 'counter',
        table_id: null,
        table_number: null,
        section_id: null,
        section_name: null,
        is_occupied: false
      }
    });
  };

  const handleQrCodeClick = async (e, tableId, sectionId, tableNumber) => {
    e.stopPropagation();
    setIsLoadingQr(true);
    setShowQrModal(true);
  
    try {
      const accessToken = localStorage.getItem("access"); // Retrieve access token
  
      if (!accessToken) {
        console.error("No access token found");
        navigate("/login"); // Redirect if token is missing
        return;
      }
  
      const response = await fetch('https://men4u.xyz/common_api/table_view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`, // Add Authorization header with token
        },
        body: JSON.stringify({
          outlet_id: outlet_id,
          section_id: sectionId,
          table_number: tableNumber,
        }),
      });
  
      const data = await response.json();
  
      if (response.status === 401) {
        // Handle Unauthorized error
        console.error("Unauthorized access, redirecting to login.");
        navigate("/login"); // Redirect if token is missing
        return;
      }
  
      if (data.st === 1) {
        setQrData(data.data); // Set the QR data if successful
      } else {
        console.error('Error fetching QR code:', data.msg);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoadingQr(false); // Set loading state to false after request completes
    }
  };
  

  const handleDownloadQr = async () => {
    try {
      // Ensure qr_code_url is valid
      if (!qrData?.qr_code_url) {
        throw new Error("QR code URL is not available");
      }
  
      const response = await fetch(qrData.qr_code_url);
  
      if (!response.ok) {
        throw new Error("Failed to download QR code");
      }
  
      // Convert the response to a blob
      const blob = await response.blob();
  
      // Create a download link for the file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      const fileName = `table-${qrData.table_number}-qr.png`;
  
      a.href = url;
      a.download = fileName;
  
      document.body.appendChild(a);
      a.click();
  
      // Clean up
      window.URL.revokeObjectURL(url);
      a.remove();
  
      // Show success toast
      window.showToast?.("success", `QR code downloaded successfully as ${fileName}`);
    } catch (error) {
      console.error("Error downloading QR code:", error);
      // Show error toast
      window.showToast?.("error", "Failed to download QR code. Please try again.");
    }
  };
  

  const handleShareQr = () => {
    // Ensure qr_code_url is valid
    if (!qrData?.qr_code_url) {
      window.showToast?.("error", "QR code URL is not available for sharing");
      return;
    }
  
    // Social media share URLs
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(qrData.qr_code_url)}&text=Check%20out%20this%20QR%20code!`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(qrData.qr_code_url)}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(qrData.qr_code_url)}`;
  
    // Open a new window with the share URL
    const shareWindow = window.open(facebookUrl, "_blank");
  
    // Fallback to other URLs (Twitter, WhatsApp) or handle them accordingly
  };
  
  
  const handleBackClick = () => {
    navigate(-1); // Navigate to the previous page
  };
  return (
    <div className="min-h-screen bg-gray-50">
     <Header/>
      <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
  {/* <div className="flex justify-between items-center mb-6"> */}
          {/* Left Section: Back Button & Title */}
          <div className="flex items-center w-1/4">
            <button
              onClick={handleBackClick}
              className="text-gray-500 w-8 h-8 rounded-full mr-3 hover:bg-gray-200"
              data-tooltip-id="tooltip-back"
              data-tooltip-content="Back" 
              data-tooltip-place="bottom"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
              Tables
            </h2>
            </div>
            {/* Centered Drive Through and Parcel buttons */}
            <div className="flex justify-center items-center space-x-10 mb-4 md:mb-0">
              <button
                onClick={handleDriveThrough}
                className={`px-2 py-1 rounded-md text-sm font-medium ${
                  orderType === "drive-through"
                    ? "bg-gray-500 text-white"
                    : "bg-white text-gray-600 border border-gray-500 hover:bg-gray-50"
                }`}
              >
                <FontAwesomeIcon icon={faCar} className="mr-2" />
                Drive Through
              </button>
              <button
                onClick={handleParcel}
                className={`px-2 py-1 rounded-md text-sm font-medium ${
                  orderType === "parcel"
                    ? "bg-gray-500 text-white"
                    : "bg-white text-gray-600 border border-gray-500 hover:bg-gray-50"
                }`}
              >
                <FontAwesomeIcon icon={faHandHoldingHeart} className="mr-2" />
                Parcel
              </button>
              <button
                onClick={handleCounter}
                className={`px-2 py-1 rounded-md text-sm font-medium ${
                  orderType === "counter"
                    ? "bg-gray-500 text-white"
                    : "bg-white text-gray-600 border border-gray-500 hover:bg-gray-50"
                }`}
              >
                <FontAwesomeIcon icon={faStore} className="mr-2" />
                Counter
              </button>
            </div>

            {/* Right-aligned All, Available, and Occupied buttons */}
            <div className="flex justify-end items-center space-x-3">

              <button
                onClick={() => setFilterStatus("all")}
                className={`px-2 py-1 rounded-md text-sm font-medium transition-colors duration-150 ${
                  filterStatus === "all"
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus("available")}
                className={`px-2 py-1 rounded-md text-sm font-medium transition-colors duration-150 ${
                  filterStatus === "available"
                    ? "bg-green-500 text-white"
                    : "bg-white text-green-600 border border-green-500 hover:bg-green-50"
                }`}
              >
                Available
              </button>
              <button
                onClick={() => setFilterStatus("occupied")}
                className={`px-2 py-1 rounded-md text-sm font-medium transition-colors duration-150 ${
                  filterStatus === "occupied"
                    ? "bg-red-500 text-white"
                    : "bg-white text-red-600 border border-red-500 hover:bg-red-50"
                }`}
              >
                Occupied
              </button>
              <button
                className={`text-gray-500 w-8 h-8 rounded-full mr-3 ${
                  showIcons ? 'bg-black text-white' : ''
                }`}
                data-tooltip-id="tooltip-settings"
                data-tooltip-content="Settings"
                onClick={() => setShowIcons(!showIcons)} // Toggle showIcons state
              >
                <FontAwesomeIcon icon={faGear} className="text-md" />
              </button>
            </div>
          </div>

          {/* Display Available and Occupied indicators */}
          <div className="flex justify-end space-x-4 pb-5">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
              <span className="text-sm text-gray-600">Available</span>
            </div>
          
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
              <span className="text-sm text-gray-600">Occupied</span>
            </div>
          </div>

          {sections.map((section) => (
            <div key={section.section_id}>
              <div className="flex justify-between  pt-4 border-t border-gray-400 mb-6">
                {/* Left: Section Name */}
                <div className="text-left">
                  <h3 className="text-xl uppercase font-bold text-gray-900">
                    {section.section_name}
                  </h3>
                </div>

                <div className="flex space-x-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {section.tables.length}
                    </div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">
                      {section.tables.filter((t) => !t.is_occupied).length}
                    </div>
                    <div className="text-sm text-gray-600">Available</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-500">
                      {section.tables.filter((t) => t.is_occupied).length}
                    </div>
                    <div className="text-sm text-gray-600">Occupied</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-1   mb-7 ">
                {section.tables &&
                  getFilteredTables(section.tables).map((table, index) => {
                    const isLastTable = index === section.tables.length - 1;

                    return (
                      <div
                        key={table.table_id}
                        onClick={() =>
                          handleTableClick(
                            section.section_name,
                            section.section_id,
                            table.table_number,
                            table.is_occupied,
                            table.table_id,
                            table.order_id,
                            table // Pass the entire table object
                          )
                        }
                        className={`relative p-4 border-2 mt-3 rounded-lg cursor-pointer min-h-[100px] ${getStatusColor(table.is_occupied)}`}
                      >
                        {table.is_occupied ? (
                          <>
                            {/* Grand Total */}
                            {table.grand_total && Number(table.grand_total) > 0 && (
                              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 border-red-300 bg-red-100 px-3 py-1 border text-sm font-semibold text-gray-600">
                                ₹{Number(table.grand_total).toFixed(2)}
                              </div>
                            )}

                            {/* Blinker and Table Number */}
                            <div className="mt-4 flex items-center justify-center space-x-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full blinking"></div>
                              <div className="text-center text-lg font-semibold text-gray-700">
                                {table.table_number || 'N/A'}
                              </div>
                            </div>

                            {/* Occupied Time */}
                            {table.occupied_time &&
                              table.occupied_time !== '0' &&
                              table.occupied_time !== '00:00' && (
                                <div className="flex items-center justify-center space-x-2">
                                  <div className="text-xs text-gray-600">
                                    {calculateTimeDifference(table.occupied_time)}
                                  </div>
                                </div>
                              )}
                          </>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center text-lg font-semibold text-gray-700">
                              {table.table_number || 'N/A'}
                            </div>
                          </div>
                        )}
                        


                        {!table.is_occupied && isLastTable && showDeleteIcons[section.section_id] && (
                          <div
                            className="absolute top-2 right-2 text-md text-gray-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(table.table_id, section.section_id);
                            }}
                            data-tooltip-id="tooltip-table-delete"
                            data-tooltip-content={`Delete Table ${table.table_number}`}  // Display table number in tooltip
                          >
                            {deletingTableId === table.table_id ? (
                              <FontAwesomeIcon icon={faSpinner} spin />
                            ) : (
                              <FontAwesomeIcon icon={faTrash} />
                            )}
                          </div>
                        )}
                      
  {showIcons && (
                        <div
                          className="absolute bottom-1 right-1 text-md text-gray-600 text-xs"
                          onClick={(e) => handleQrCodeClick(e, table.table_id ,section.section_id,table.table_number,table.is_occupied,table.order_id,table)}
                          data-tooltip-id="tooltip-table-qr"
                          data-tooltip-content={`Table ${table.table_number} QR Code`}
                        >
                          <FontAwesomeIcon icon={faQrcode} className="py-1 px-1 bg-gray-300 rounded-full" />
                        </div>
  )}
                      </div>
                    );
                  })
                }

                <div className="ml-auto flex items-center space-x-3">
                {showIcons && (
                  <div className="flex items-center space-x-2">
                    {/* Add Table Button */}
                    <button
                      className={`px-2 py-2 border border-green-500 text-green-500 rounded-md hover:bg-green-500 hover:text-white flex items-center space-x-2 ${
                        loadingSection === section.section_id ? 'opacity-50 pointer-events-none' : ''
                      }`}
                      onClick={() => handleAddTable(section.section_id)} // Pass section_id on click
                      disabled={loadingSection === section.section_id} // Disable button while loading
                      data-tooltip-id="tooltip-add"
                      data-tooltip-content="Create New Table"
                    >
                      {loadingSection === section.section_id ? (
                        <FontAwesomeIcon icon={faSpinner} spin />
                      ) : (
                        <FontAwesomeIcon icon={faPlus} />
                      )}
                    </button>

                    {/* Delete Button */}
                    
                    <button
                      className="px-2 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-500 hover:text-white flex items-center space-x-2"
                      onClick={() => toggleDeleteIcons(section.section_id)} // Toggle visibility of trash icon for this section
                      data-tooltip-id="tooltip-delete"
                      data-tooltip-content="Delete"
                    >
                      <FontAwesomeIcon icon={showDeleteIcons[section.section_id] ? faTimes : faTrash} />
                    </button>
                  </div>
                )}
                </div>
              </div>
            </div>
          ))}
      
      </div>

 <Footer/>
      <div className="h-20"></div>
      
      {/* Bottom fixed stats bar */}
      <div className="fixed border-t border-gray-300 bottom-0 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-50 to-blue-50 shadow-md rounded-t-lg px-4 py-2 w-full max-w-7xl">
  <div className="flex justify-between items-center text-sm">
    {/* Left side: Today Sales */}
    <div className="flex flex-row items-start space-x-2">
  <div className="px-4 py-2 rounded-md text-blue-600 bg-blue-100 shadow-inner border border-blue-300">
    <strong>Live Sales:</strong> ₹{liveSales.toFixed(2)}
    
  </div>
  <Link to="/order_list" className="px-4 py-2 rounded-md text-blue-600 bg-blue-100 shadow-inner border border-blue-300">
    <strong>Todays Sales:</strong> ₹{todaySales.toFixed(2)}
  </Link>
</div>

    {/* Right side: Buttons */}
    <div className="flex gap-4">
      <div
        // onClick={() => setFilterStatus("available")}
        className={`px-4 py-2 text-sm font-semibold rounded-md shadow-md transition-colors duration-300 ${
          filterStatus === "available"
            ? "bg-green-500 text-white hover:bg-green-600"
            : "bg-green-200 text-green-600 border border-green-300 hover:bg-green-200"
        }`}
      >
        Available: {stats.available}
      </div>
      <div
        // onClick={() => setFilterStatus("occupied")}
        className={`px-4 py-2 text-sm font-semibold rounded-md shadow-md transition-colors duration-300 ${
          filterStatus === "occupied"
            ? "bg-red-500 text-white hover:bg-red-600"
            : "bg-red-200 text-red-600 border border-red-300 hover:bg-red-200"
        }`}
      >
        Occupied: {stats.ordered}
      </div>
    </div>
  </div>
</div>


      {/* Styles */}
      <style jsx>{`
        @keyframes blink {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        .blinking {
          animation: blink 1s ease-in-out infinite;
        }
      `}</style>

      {/* Tooltips */}
      <Tooltip id="tooltip-add" />
      <Tooltip id="tooltip-delete" />
      <Tooltip id="tooltip-table-delete" />
      <Tooltip id="tooltip-table-qr" />
      <Tooltip id="tooltip-back" />

      {/* QR Modal */}
      {showQrModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowQrModal(false);
              setQrData(null);
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {qrData ? `Table ${qrData.table_number} QR Code` : 'Loading QR Code...'}
                </h3>
                <button
                  onClick={() => {
                    setShowQrModal(false);
                    setQrData(null);
                  }}
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-xl" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex flex-col items-center space-y-4">
                {isLoadingQr ? (
                  <div className="w-64 h-64 flex items-center justify-center">
                    <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-gray-400" />
                  </div>
                ) : qrData?.qr_code_url ? (
                  <div className="relative">
                    <img 
                      src={qrData.qr_code_url} 
                      alt={`QR Code for Table ${qrData.table_number}`}
                      className="w-64 h-64 object-contain rounded-lg"
                    />
                    {/* <p className="text-center mt-2 text-sm text-gray-600">
                      Section: {qrData.section_id}
                    </p> */}
                  </div>
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center text-gray-400">
                    No QR Code available
                  </div>
                )}

                {/* Action Buttons */}
                {qrData?.qr_code_url && (
                  <div className="flex space-x-4 w-full mt-4">
                    <button
                      onClick={handleDownloadQr}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                      <FontAwesomeIcon icon={faDownload} />
                      <span>Download</span>
                    </button>
                    {/* <button
                      onClick={handleShareQr}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                    >
                      <FontAwesomeIcon icon={faShare} />
                      <span>Share</span>
                    </button> */}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableList;

