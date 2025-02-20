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
  faArrowLeft,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import StaffForm from "./StaffForm";
import ViewStaff from "./ViewStaff";
import { Tooltip } from "react-tooltip";
import Footer from "../../components/Footer";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import StaffUpdate from "./StaffUpdate";

function StaffList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [showViewPanel, setShowViewPanel] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate=useNavigate();
  const [error, setError] = useState(null);
  const [staffDetails, setStaffDetails] = useState(null); // State to store staff details
 const [showIcons, setShowIcons] = useState(false); 
  const outlet_id = localStorage.getItem('outlet_id');

  const user_id = localStorage.getItem("user_id");

  const fetchStaffList = async () => {
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
        "https://menusmitra.xyz/common_api/staff_listview",
        { outlet_id: outlet_id },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Attach token in headers
          },
        }
      );
  
      if (response.data.st === 1) {
        const staffData = response.data.lists.map((staff) => ({
          id: staff.staff_id,
          name: staff.name,
          role: staff.role,
          dob: staff.dob,
          mobile: staff.mobile,
          aadhar_number: staff.aadhar_number,
          address: staff.address,
          photo: staff.photo,
        }));
        setStaffList(staffData);
        console.log(staffData); // Log the staff data
      } else {
        throw new Error(response.data.msg || "Failed to fetch staff data.");
      }
    } catch (err) {
      console.error("API Error:", err);
  
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
  
  
    fetchStaffList();
  }, []);
  

  const filteredStaff = staffList.filter((staff) => {
    const searchTermLower = searchTerm.toLowerCase().trim();
    
    return (
      (staff.name && staff.name.toLowerCase().includes(searchTermLower)) ||
      (staff.role && staff.role.toLowerCase().includes(searchTermLower)) ||
      (staff.mobile && staff.mobile.toString().includes(searchTermLower)) ||
      (staff.aadhar_number && staff.aadhar_number.toString().includes(searchTermLower))
    );
  });


  

  const handleDelete = async (staffId) => {
    try {
      const accessToken = localStorage.getItem("access"); // Retrieve access token
  
      if (!accessToken) {
        console.warn("No access token found, redirecting to login");
        navigate("/login"); // Redirect if token is missing
        return;
      }
  
      const response = await axios.post(
        "https://menusmitra.xyz/common_api/staff_delete",
        {
          outlet_id: outlet_id,
          staff_id: staffId,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Attach token in headers
          },
        }
      );
  
      if (response.status === 200 && response.data.st === 1) {
        // Update the staff list after deletion
        setStaffList((prevStaffList) => prevStaffList.filter((staff) => staff.id !== staffId));
  
        // Hide the modal and clear the staffToDelete
        setShowDeleteModal(false);
        setStaffToDelete(null);
  
        // Optionally, show a success message
        console.log("Staff deleted successfully");
      } else {
        console.error("Error deleting staff:", response.data.msg);
      }
    } catch (error) {
      console.error("API Error:", error);
  
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
  
  



  const handleEdit = async (staff) => {
    // Close other panels first
    setShowCreatePanel(false);
    setShowViewPanel(false);
  
    try {
      const accessToken = localStorage.getItem("access"); // Retrieve access token
  
      if (!accessToken) {
        console.warn("No access token found, redirecting to login");
        navigate("/login"); // Redirect if token is missing
        return;
      }
  
      // Fetch detailed staff data from view API
      const response = await axios.post(
        "https://menusmitra.xyz/common_api/staff_view",
        {
          outlet_id: outlet_id,
          staff_id: staff.id,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Attach token in headers
          },
        }
      );
  
      if (response.data.st === 1) {
        // Format the data for the form
        const staffData = {
          ...response.data.data,
          staff_id: response.data.data.staff_id,
          imagePreview: response.data.data.photo, // Set the image preview
        };
  
        setSelectedStaff(staffData);
        setShowEditPanel(true);
      } else {
        console.error("Failed to fetch staff details:", response.data.msg);
      }
    } catch (error) {
      console.error("Error fetching staff details:", error);
  
      if (error.response && error.response.status === 401) {
        console.warn("Unauthorized - Token expired or invalid");
        localStorage.removeItem("access"); // Clear expired token
        navigate("/login"); // Redirect to login page
      }
    }
  };
  

  const handleCloseEdit = () => {
    setSelectedStaff(null);
    setShowEditPanel(false);
  };

  const handleCreateStaff = async (formData) => {
    try {
      const accessToken = localStorage.getItem("access"); // Retrieve access token
  
      if (!accessToken) {
        console.warn("No access token found, redirecting to login");
        navigate("/login"); // Redirect if token is missing
        return;
      }
  
      const response = await axios.post(
        "https://menusmitra.xyz/common_api/staff_create",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${accessToken}`, // Attach token in headers
          },
        }
      );
  
      if (response.data.st === 1) {
        fetchStaffList(); // Refresh staff list
        setShowCreatePanel(false); // Close the create panel
        window.showToast?.("success", "Staff created successfully");
      } else {
        console.error("API Error:", response.data.msg);
        window.showToast?.("error", response.data.msg || "Failed to create staff");
      }
    } catch (error) {
      console.error("Error:", error);
  
      if (error.response && error.response.status === 401) {
        console.warn("Unauthorized - Token expired or invalid");
        localStorage.removeItem("access"); // Clear expired token
        navigate("/login"); // Redirect to login page
      } else {
        window.showToast?.("error", "Something went wrong. Please try again later.");
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

  const handleView = async (staff) => {
    // Close other panels first
    setShowCreatePanel(false);
    setShowEditPanel(false);
  
    setSelectedStaff(staff);
    setShowViewPanel(true);
  
    try {
      const accessToken = localStorage.getItem("access"); // Retrieve access token
  
      if (!accessToken) {
        console.warn("No access token found, redirecting to login");
        navigate("/login"); // Redirect if token is missing
        return;
      }
  
      // Fetch detailed staff data
      const response = await axios.post(
        "https://menusmitra.xyz/common_api/staff_view",
        {
          outlet_id: outlet_id, // Replace with actual restaurant ID
          staff_id: staff.id, // Pass the staff's ID
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Attach token in headers
          },
        }
      );
  
      if (response.data.st === 1) {
        setStaffDetails(response.data.data); // Set the retrieved staff details
      } else {
        setError(response.data.msg || "Failed to fetch staff details.");
      }
    } catch (err) {
      console.error("Error fetching staff details:", err);
  
      if (err.response && err.response.status === 401) {
        console.warn("Unauthorized - Token expired or invalid");
        localStorage.removeItem("access"); // Clear expired token
        navigate("/login"); // Redirect to login page
      } else {
        setError("An error occurred while fetching staff details.");
      }
    }
  };
  

  const handleCloseView = () => {
    setSelectedStaff(null);
    setShowViewPanel(false);
    setStaffDetails(null); // Clear staff details when closing the view
  };
  const handleUpdateStaff = async (formData) => {
    try {
      // Ensure staff_id is included
      if (!formData.get("staff_id")) {
        console.error("Staff ID is required for update");
        window.showToast?.("error", "Staff ID is required for update");
        return;
      }
  
      const accessToken = localStorage.getItem("access"); // Retrieve access token
  
      if (!accessToken) {
        console.warn("No access token found, redirecting to login");
        navigate("/login"); // Redirect if token is missing
        return;
      }
  
      const response = await axios.post(
        "https://menusmitra.xyz/common_api/staff_update",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${accessToken}`, // Attach token in headers
          },
        }
      );
  
      if (response.data.st === 1) {
        fetchStaffList(); // Refresh the staff list
        setShowEditPanel(false); // Close the edit panel
        window.showToast?.("success", "Staff updated successfully");
      } else {
        console.error("API Error:", response.data.msg);
        window.showToast?.("error", response.data.msg || "Failed to update staff");
      }
    } catch (error) {
      console.error("Error updating staff:", error);
  
      if (error.response) {
        if (error.response.status === 401) {
          console.warn("Unauthorized - Token expired or invalid");
          localStorage.removeItem("access"); // Clear expired token
          navigate("/login"); // Redirect to login page
        } else {
          window.showToast?.("error", error.response.data.msg || "Something went wrong.");
        }
      } else {
        window.showToast?.("error", "Network error. Please try again later.");
      }
    }
  };
  
  

  const handleCreateClick = () => {
    // Close other panels first
    setShowEditPanel(false);
    setShowViewPanel(false);
    setSelectedStaff(null);
    setShowCreatePanel(true);
  };
  
  const handleSubmit = async (formData) => {
    try {
      const response = await axios.post(
        'your-api-endpoint',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data', // Important for file upload
          },
        }
      );
      
      if (response.data.st === 1) {
        // Handle success
        fetchStaffList();
        setShowCreatePanel(false);
      } else {
        // Handle error
        console.error('API Error:', response.data.msg);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const handleBackClick = () => {
    navigate(-1); // Navigate to the previous page
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
          <h1 className="text-2xl font-semibold text-gray-800 w-1/4">Staff</h1>
</div>
          <div className="flex justify-center w-1/3">
            <div className="relative w-50">
              <input
                type="text"
                placeholder="Search staff..."
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
          {filteredStaff.map((staff) => (
            <div
              key={staff.id}
              className="bg-white border-r-4 border  border-orange-500 cursor-pointer rounded-lg shadow-md overflow-hidden relative"
              onClick={() => handleView(staff)}
            >
              {/* Icons at the Top */}
              {showIcons && (
              <div className="absolute top-2 right-2 flex space-x-2">
            
                <button
                   onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering handleView
                    handleEdit(staff);   // Trigger Update
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
                      setStaffToDelete(staff);  // Store staff to delete
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
                  {/* Staff Image */}
                  <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100">
                  {staff.photo ? (
  <img
    src={staff.photo}
    alt={staff.name}
    className="w-full h-full object-cover"
  />
) : (
  <div className="flex items-center justify-center w-full h-full text-white bg-orange-400 rounded-full">
    <span className="text-2xl font-semibold">{staff.name.charAt(0).toUpperCase()}</span>
  </div>
)}

                  </div>

                  {/* Staff Details */}
                  <div className="flex-1 pl-4">
                    <h3 className="text-lg font-semibold capitalize text-gray-900">
                      {staff.name}
                    </h3>
                    <p className="text-sm text-blue-600 capitalize font-medium">
                      {staff.role}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                     
                      {staff.mobile}
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
          <h2 className="text-xl font-semibold">Edit Staff</h2>
          <button
            onClick={handleCloseEdit}
            className=" text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full w-8 h-8 "
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      </div>
      <div className="p-4">
        <StaffUpdate
          staff={selectedStaff}  // Pass selected staff data for editing
          onSubmit={handleUpdateStaff}  // Handle the form submission
          onCancel={handleCloseEdit}  // Close the form when cancel is clicked
        />
      </div>
    </div>
  </div>
)}


{showViewPanel && staffDetails && (
        <div className="col-span-6 transition-all duration-300">
          <ViewStaff item={staffDetails} onClose={handleCloseView} />
        </div>
      )}
          {/* Create Panel */}
          {showCreatePanel && (
            <div className="col-span-6 transition-all duration-300">
              <div className="bg-white rounded-lg shadow-lg h-full">
                <div className="border-b">
                  <div className="flex justify-between items-center p-4">
                    <h2 className="text-xl font-semibold">Add New Staff</h2>
                    <button
                      onClick={() => setShowCreatePanel(false)}
                      className=" text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full w-8 h-8 "
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <StaffForm
                    onSubmit={handleCreateStaff}
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
        setStaffToDelete(null);
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
            setStaffToDelete(null);
          }}
          className="text-gray-400 hover:text-gray-500"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      <p className="text-gray-600 mb-6">
        Are you sure you want to delete <span className='font-bold'>{staffToDelete?.name} ?</span> This
        action cannot be undone.
      </p>

      <div className="flex justify-between space-x-3">
        <button
          type="button"
          onClick={() => {
            setShowDeleteModal(false);
            setStaffToDelete(null);
          }}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
        >
          <FontAwesomeIcon icon={faTimes} className="mr-2" />
          Cancel
        </button>
        <button
          onClick={() => handleDelete(staffToDelete.id)}  // Calls handleDelete
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

export default StaffList;