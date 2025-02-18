import React, { useState,useEffect } from "react";
import Header from "../../components/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faSearch,
  faPlus,
  faEye,
  faTimes,
  faUser,
  faCalendar,
  faPhone,
  faIdCard,
  faMapMarker,
  faGear,
  faExclamationTriangle,
  faArrowLeft
} from "@fortawesome/free-solid-svg-icons";
import CaptainForm from "./CaptainForm";
import ViewCaptain from "./ViewCaptain";
import { Tooltip } from "react-tooltip";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import axios from "axios";

function CaptainList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [selectedcaptain, setSelectedcaptain] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [captainToDelete, setcaptainToDelete] = useState(null);
  const [showViewPanel, setShowViewPanel] = useState(false);
  const [captainList, setcaptainList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [captainDetails, setcaptainDetails] = useState(null); // State to store captain details
 const [showIcons, setShowIcons] = useState(false); 
  const outlet_id = localStorage.getItem('outlet_id');
const handleBackClick = () => {
    navigate(-1); 
}
  const user_id = localStorage.getItem("user_id");

  const fetchcaptainList = async () => {
    setLoading(true);
    setError(null);
    try {
      const accessToken = localStorage.getItem('access'); // Retrieve access token
  
      if (!accessToken) {
        console.warn('No access token found, redirecting to login');
        navigate('/login'); // Redirect if token is missing
        return;
      }
      const response = await axios.post(
        "https://men4u.xyz/common_api/captain_listview",
        { outlet_id: outlet_id},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Attach token in headers
          },
        }
      );
      if (response.data.st === 1) {
        const captainData = response.data.data.map((captain) => ({
          id: captain.user_id,
          name: captain.name,
         
        
          mobile: captain.mobile,
          aadhar_number: captain.aadhar_number,
          address: captain.address,
         
        }));
        setcaptainList(captainData);
        console.log(captainData); // Log the captain data
      } else {
        throw new Error(response.data.msg || "Failed to fetch captain data.");
      }
    } catch (err) {
      console.error(err); // Log the error
      setError(err.message || "An error occurred while fetching captain data.");
      if (err.response && err.response.status === 401) {
        console.warn("Unauthorized - Token expired or invalid");
        localStorage.removeItem("access"); // Clear expired token
        navigate("/login"); // Redirect to login page
      } else {
        setError(err.message || "An error occurred while fetching staff data.");
      }
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
  
  
    fetchcaptainList();
  }, []);
  

  const filteredcaptain = captainList.filter((captain) => {
    const searchTermLower = searchTerm.toLowerCase().trim();
    
    return (
      (captain.name && captain.name.toLowerCase().includes(searchTermLower)) ||
     
      (captain.mobile && captain.mobile.toString().includes(searchTermLower)) ||
      (captain.aadhar_number && captain.aadhar_number.toString().includes(searchTermLower))
    );
  });


  

  const handleDelete = async (captainId) => {
    try {
      const accessToken = localStorage.getItem('access'); // Retrieve access token
  
      if (!accessToken) {
        console.warn('No access token found, redirecting to login');
        navigate('/login'); // Redirect if token is missing
        return;
      }
      const response = await axios.post('https://men4u.xyz/common_api/captain_delete', {
        outlet_id: outlet_id,  // Replace with actual restaurant ID
        user_id: captainId,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`, // Attach token in headers
        },
      });
  
      if (response.status === 200) {
        // Update the captain list after deletion
        setcaptainList(captainList.filter((captain) => captain.id !== captainId));
  
        // Hide the modal and clear the captainToDelete
        setShowDeleteModal(false);
        setcaptainToDelete(null);
  
        // Optionally, show a success message
        console.log('captain deleted successfully');
      }
    } catch (error) {
      // Handle error
      console.error('Error deleting captain:', error);
      // Optionally, show an error message
      if (error.response && error.response.status === 401) {
        console.warn("Unauthorized - Token expired or invalid");
        localStorage.removeItem("access"); // Clear expired token
        navigate("/login"); // Redirect to login page
      } else {
        // Optionally, show an error message
        console.error("Error deleting staff:", error.message);
      }
    }
  };
  
  



  const handleEdit = async (captain) => {
    // Close other panels first
    setShowCreatePanel(false);
    setShowViewPanel(false);
    
    try {
      const accessToken = localStorage.getItem('access'); // Retrieve access token
  
      if (!accessToken) {
        console.warn('No access token found, redirecting to login');
        navigate('/login'); // Redirect if token is missing
        return;
      }
      // Fetch detailed captain data from view API
      const response = await axios.post("https://men4u.xyz/common_api/captain_view", {
        outlet_id: outlet_id,
        user_id: captain.id
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`, // Attach token in headers
        },
      });

      if (response.data.st === 1) {
        // Format the data for the form
        const captainData = {
          ...response.data.data,
          captain_id: response.data.data.user_id,
         
        };

        setSelectedcaptain(captainData);
        setShowEditPanel(true);
      } else {
        console.error('Failed to fetch captain details:', response.data.msg);
      }
    } catch (error) {
      console.error('Error fetching captain details:', error);
      if (error.response && error.response.status === 401) {
        console.warn("Unauthorized - Token expired or invalid");
        localStorage.removeItem("access"); // Clear expired token
        navigate("/login"); // Redirect to login page
      } else {
        // Optionally, show an error message
        console.error("Error deleting staff:", error.message);
      }
    }
  };
  

  const handleCloseEdit = () => {
    setSelectedcaptain(null);
    setShowEditPanel(false);
  };

  const handleCreatecaptain = async (formData) => {
    try {
      const accessToken = localStorage.getItem('access'); // Retrieve access token
  
      if (!accessToken) {
        console.warn('No access token found, redirecting to login');
        navigate('/login'); // Redirect if token is missing
        return;
      }
      const response = await axios.post(
        'https://men4u.xyz/common_api/captain_create',
        formData, // Already formatted in captainForm
        {
          headers: {
            'Content-Type': 'application/json',
          
                Authorization: `Bearer ${accessToken}`, // Attach token in headers
             
            
          },
        }
      );
  
      if (response.data.st === 1) {
        fetchcaptainList();
        setShowCreatePanel(false);
        window.showToast?.("success", "captain created successfully");
      } else {
        console.error('API Error:', response.data.msg);
        window.showToast?.("error", response.data.msg || "Failed to create captain");
      }
    } catch (error) {
      console.error('Error:', error);
      window.showToast?.("error", "Something went wrong. Please try again later.");
      if (error.response && error.response.status === 401) {
        console.warn("Unauthorized - Token expired or invalid");
        localStorage.removeItem("access"); // Clear expired token
        navigate("/login"); // Redirect to login page
      } else {
        // Optionally, show an error message
        console.error("Error deleting staff:", error.message);
      }
    }
  };
  
  
  

 

 

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleView = async (captain) => {
    // Close other panels first
    setShowCreatePanel(false);
    setShowEditPanel(false);
    
    setSelectedcaptain(captain);
    setShowViewPanel(true);

    // Fetch detailed captain data
    try {
      const accessToken = localStorage.getItem('access'); // Retrieve access token
  
      if (!accessToken) {
        console.warn('No access token found, redirecting to login');
        navigate('/login'); // Redirect if token is missing
        return;
      }
      const response = await axios.post("https://men4u.xyz/common_api/captain_view", {
        outlet_id: outlet_id, // Replace with actual restaurant ID
        user_id: captain.id, // Pass the captain's ID
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`, // Attach token in headers
        },
      }
    );
      if (response.data.st === 1) {
        setcaptainDetails(response.data.data); // Set the retrieved captain details
      } else {
        setError(response.data.msg || "Failed to fetch captain details.");
      }
    } catch (err) {
      setError("An error occurred while fetching captain details.");
      console.error(err);
      if (error.response && error.response.status === 401) {
        console.warn("Unauthorized - Token expired or invalid");
        localStorage.removeItem("access"); // Clear expired token
        navigate("/login"); // Redirect to login page
      } else {
        // Optionally, show an error message
        console.error("Error deleting staff:", error.message);
      }
    }
  };
  

  const handleCloseView = () => {
    setSelectedcaptain(null);
    setShowViewPanel(false);
    setcaptainDetails(null); // Clear captain details when closing the view
  };
  const handleUpdatecaptain = async (formData) => {
    try {
      if (!formData.user_id) {
        window.showToast?.("error", "captain ID is required for update");
        return;
      }
      const accessToken = localStorage.getItem('access'); // Retrieve access token
  
      if (!accessToken) {
        console.warn('No access token found, redirecting to login');
        navigate('/login'); // Redirect if token is missing
        return;
      }
      const response = await axios.post(
        'https://men4u.xyz/common_api/captain_update',
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${accessToken}`, // Attach token in headers
          },
        }
      );
  
      if (response.data.st === 1) {
        fetchcaptainList();
        setShowEditPanel(false);
        window.showToast?.("success", "captain updated successfully");
      } else {
        console.error('API Error:', response.data.msg);
        window.showToast?.("error", response.data.msg || "Failed to update captain");
      }
    } catch (error) {
      console.error('Error:', error);
      window.showToast?.("error", "Something went wrong. Please try again later.");
      if (error.response && error.response.status === 401) {
        console.warn("Unauthorized - Token expired or invalid");
        localStorage.removeItem("access"); // Clear expired token
        navigate("/login"); // Redirect to login page
      } else {
        // Optionally, show an error message
        console.error("Error deleting staff:", error.message);
      }
    }
  };
  
  

  const handleCreateClick = () => {
    // Close other panels first
    setShowEditPanel(false);
    setShowViewPanel(false);
    setSelectedcaptain(null);
    setShowCreatePanel(true);
  };

  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
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
          <h1 className="text-2xl font-semibold text-gray-800 w-1/4">Captain</h1>
          </div>

          <div className="flex justify-center w-1/3">
            <div className="relative w-50">
              <input
                type="text"
                placeholder="Search Captain..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="text-gray-400 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end w-1/4">
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
            <button
              onClick={handleCreateClick}  // Changed from setShowCreatePanel(true)
              className="inline-flex items-center justify-center w-8 h-8 bg-sky-600 text-white rounded-full hover:bg-sky-700"
              >
              <FontAwesomeIcon icon={faPlus}  />
             
            </button>
          </div>
        </div>
        {/* Main Content Area */}
        <div className="grid grid-cols-12 gap-4">
         
  
        <div
        className={`transition-all duration-300 ease-in-out ${
          showEditPanel || showCreatePanel || showViewPanel
            ? "col-span-6"
            : "col-span-12"
        }`}
      >
        <div
          className={`grid gap-4 ${
            showEditPanel || showCreatePanel || showViewPanel
              ? "grid-cols-1 sm:grid-cols-2"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          }`}
        >
          {filteredcaptain.map((captain) => (
            <div
              key={captain.id}
              className="bg-white border-r-4 border  border-yellow-500 cursor-pointer rounded-lg shadow-md overflow-hidden relative"
              onClick={() => handleView(captain)}
            >
              {/* Icons at the Top */}
              {showIcons && (
              <div className="absolute top-2 right-2 flex space-x-2">
            
                <button
                   onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering handleView
                    handleEdit(captain);   // Trigger Update
                  }}
                  className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                  data-tooltip-id="tooltip-edit"
                  data-tooltip-content="Update"
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button
                     onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering handleView
                      setcaptainToDelete(captain);  // Store captain to delete
                      setShowDeleteModal(true); // Show the confirmation modal
                   }}

                  data-tooltip-id="tooltip-delete"
                  data-tooltip-content="Delete"
                  className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
              )}
              <div className="p-3">
                <div className="flex items-center">
                  {/* captain Image */}
                  {/* <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100">
                  {captain.photo ? (
  <img
    src={captain.photo}
    alt={captain.name}
    className="w-full h-full object-cover"
  />
) : (
  <div className="flex items-center justify-center w-full h-full text-white bg-yellow-400 rounded-full">
    <span className="text-2xl font-semibold">{captain.name.charAt(0).toUpperCase()}</span>
  </div>
)}

                  </div> */}

                  {/* captain Details */}
                  <div className="flex-1 pl-4">
                    <h3 className="text-lg font-semibold capitalize text-gray-900">
                      {captain.name}
                    </h3>
                    <p className="text-sm text-blue-600 capitalize font-medium">
                      {captain.role}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                     
                      {captain.mobile}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {showEditPanel && (
  <div className="col-span-6 transition-all duration-300">
    <div className="bg-white rounded-lg shadow-lg h-full">
      <div className="border-b">
        <div className="flex justify-between items-center p-4">
          <h2 className="text-xl font-semibold">Edit Captain</h2>
          <button
            onClick={handleCloseEdit}
            className=" text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full w-8 h-8 "
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      </div>
      <div className="p-4">
        <CaptainForm
          captain={selectedcaptain}  // Pass selected captain data for editing
          onSubmit={handleUpdatecaptain}  // Handle the form submission
          onCancel={handleCloseEdit}  // Close the form when cancel is clicked
        />
      </div>
    </div>
  </div>
)}


{showViewPanel && captainDetails && (
        <div className="col-span-6 transition-all duration-300">
          <ViewCaptain item={captainDetails} onClose={handleCloseView} />
        </div>
      )}
          {/* Create Panel */}
          {showCreatePanel && (
            <div className="col-span-6 transition-all duration-300">
              <div className="bg-white rounded-lg shadow-lg h-full">
                <div className="border-b">
                  <div className="flex justify-between items-center p-4">
                    <h2 className="text-xl font-semibold">Add New Captain</h2>
                    <button
                      onClick={() => setShowCreatePanel(false)}
                      className=" text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full w-8 h-8 "
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <CaptainForm
                    onSubmit={handleCreatecaptain}
                    onCancel={() => setShowCreatePanel(false)}
                  />
                </div>
              </div>
            </div>
          )}



{showDeleteModal && (
  <div
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
    onClick={(e) => {
      if (e.target === e.currentTarget) {
        setShowDeleteModal(false);
        setcaptainToDelete(null);
      }
    }}
  >
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            className="text-red-500 text-2xl mr-3"
          />
          <h3 className="text-lg font-semibold text-gray-900">
            Confirm Delete
          </h3>
        </div>
        <button
          onClick={() => {
            setShowDeleteModal(false);
            setcaptainToDelete(null);
          }}
          className="text-gray-400 hover:text-gray-500"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      <p className="text-gray-600 mb-6">
        Are you sure you want to delete <span className='font-bold'>{captainToDelete?.name} ?</span> This
        action cannot be undone.
      </p>

      <div className="flex justify-between space-x-3">
        <button
          type="button"
          onClick={() => {
            setShowDeleteModal(false);
            setcaptainToDelete(null);
          }}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
        >
          <FontAwesomeIcon icon={faTimes} className="mr-2" />
          Cancel
        </button>
        <button
          onClick={() => handleDelete(captainToDelete.id)}  // Calls handleDelete
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none"
        >
          <FontAwesomeIcon icon={faTrash} className="mr-2" />
          Delete
        </button>
      </div>
    </div>
  </div>
)}

         
        </div>
      </div>


       

      <Tooltip id="tooltip-view" />
      <Tooltip id="tooltip-edit" />
      <Tooltip id="tooltip-delete" />
      <Tooltip id="tooltip-back" />
      <Footer></Footer>
    </div>
  );
}

export default CaptainList;