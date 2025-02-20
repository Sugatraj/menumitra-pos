import React, { useState,useEffect } from 'react';
import Header from '../../components/Header';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faSearch,faGear, faPlus,faPhone,faArrowLeft, faTimes,faEye, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from 'react-tooltip';
import SupplierForm from './SupplierForm';
import EditSupplier from './EditSupplier';
import ViewSupplier from './ViewSupplier';
import Footer from '../../components/Footer';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
function SupplierList() {
  const navigate = useNavigate();
  const [showIcons, setShowIcons] = useState(false); 
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [showViewPanel, setShowViewPanel] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [inventoryToDelete, setInventoryToDelete] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [supplierDetails, setSupplierDetails] = useState(null);
  const outlet_id = localStorage.getItem('outlet_id');
const user_id = localStorage.getItem('user_id');
  useEffect(() => {
    
  
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem("access"); // Retrieve access token
  
      if (!accessToken) {
        navigate("/login");         return;
      }
  
      const response = await axios.post('https://menusmitra.xyz/common_api/supplier_listview', {
        outlet_id: outlet_id,
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`, // Add Authorization header with token
        }
      });
  
      if (response.data.st === 1) {
        setInventory(
          response.data.data.map((item) => ({
            id: item.supplier_id,
            name: item.name,
            supplier_code: item.supplier_code,
            mobile1: item.mobile_number1,
            supplier_status: item.supplier_status,
          }))
        );
      } else {
        throw new Error(response.data.msg || 'Failed to fetch suppliers');
      }
    } catch (error) {
      // Check for 401 Unauthorized error
      if (error.response && error.response.status === 401) {
        navigate("/login");       } else {
        setError(error.message || 'Something went wrong');
        console.error("Error fetching suppliers:", error);
      }
    } finally {
      setLoading(false);
    }
  };
  

  {error && <div className="text-red-600 mb-4">{error}</div>}
  {loading && <div className="text-center text-gray-500">Loading suppliers...</div>}



 
  // const handleView = (item) => {
  //   setSelectedInventory(item);
  //   setShowViewPanel(true);
  // };


 


  const handleDelete = async (id) => {
    if (!id) {
      setError('Invalid item selected for deletion.');
      return;
    }
  
    try {
      setLoading(true); // Optionally, show a loading indicator
      const accessToken = localStorage.getItem("access"); // Retrieve access token
  
      if (!accessToken) {
        navigate("/login");         return;
      }
  
      const response = await axios.post('https://menusmitra.xyz/common_api/supplier_delete', {
        supplier_id: id,
        outlet_id: outlet_id,
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`, // Add Authorization header with token
        },
      });
  
      if (response.data.st === 1) {
        // Successfully deleted on the server
        setInventory(inventory.filter((item) => item.id !== id));
        setShowDeleteModal(false);
        setInventoryToDelete(null);
      } else {
        throw new Error(response.data.msg || 'Failed to delete the supplier');
      }
    } catch (error) {
      // Check for 401 Unauthorized error
      if (error.response && error.response.status === 401) {
        navigate("/login");       } else {
        setError(error.message || 'Something went wrong');
        console.error("Error deleting supplier:", error);
      }
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };
  
  

  const handleView = async (item) => {
    // Close other panels first
    setShowCreatePanel(false);
    setShowEditPanel(false);
    
    setSelectedInventory(item);
    setShowViewPanel(true);
  
    try {
      const accessToken = localStorage.getItem("access"); // Retrieve access token
  
      if (!accessToken) {
        console.error("No access token found");
        navigate("/login");         return;
      }
  
      console.log("Access Token:", accessToken); // Log token to verify it's set correctly
  
      setLoading(true);
      const response = await axios.post('https://menusmitra.xyz/common_api/supplier_view', {
        supplier_id: item.id,
        outlet_id: outlet_id,
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`, // Add Authorization header with token
        },
      });
  
      console.log("API response:", response.data); // Log the API response to inspect the result
  
      if (response.data.st === 1) {
        setSupplierDetails(response.data.data);
      } else {
        setError(response.data.msg || 'Failed to fetch supplier details');
      }
    } catch (error) {
      console.error("Error viewing supplier details:", error);
      setError(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };
  

  const handleEdit = async (id) => {
    // Close other panels first
    setShowCreatePanel(false);
    setShowViewPanel(false);
  
    try {
      const accessToken = localStorage.getItem("access"); // Retrieve access token
  
      if (!accessToken) {
        navigate("/login");         return;
      }
  
      const response = await axios.post('https://menusmitra.xyz/common_api/supplier_view', {
        supplier_id: id,
        outlet_id: outlet_id,
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`, // Add Authorization header with token
        },
      });
  
      if (response.data.st === 1) {
        setSelectedInventory(response.data.data);
        setShowEditPanel(true);
      } else {
        throw new Error('Failed to fetch supplier details');
      }
    } catch (error) {
      // Check for 401 Unauthorized error
      if (error.response && error.response.status === 401) {
        navigate("/login");       } else {
        setError(error.message || 'Something went wrong while fetching supplier details');
        console.error("Error fetching supplier details:", error);
      }
    }
  };
  

  const handleUpdate = async (updatedItem) => {
    try {
      console.log("Updated item:", updatedItem); // Log the updatedItem to check the id
  
      const accessToken = localStorage.getItem("access"); // Retrieve access token
  
      if (!accessToken) {
        navigate("/login");         return;
      }
  
      const response = await axios.post('https://menusmitra.xyz/common_api/supplier_update', {
        user_id: user_id,
        supplier_id: updatedItem.supplier_id, // Ensure this is being passed correctly
        outlet_id: outlet_id,
        name: updatedItem.name,
        supplier_status: updatedItem.supplier_status,
        credit_rating: updatedItem.credit_rating,
        credit_limit: updatedItem.credit_limit,
        location: updatedItem.location,
        owner_name: updatedItem.owner_name,
        website: updatedItem.website,
        mobile_number1: updatedItem.mobile_number1,
        mobile_number2: updatedItem.mobile_number2,
        address: updatedItem.address,
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`, // Add Authorization header with token
        },
      });
  
      if (response.data.st === 1) {
        fetchSuppliers(); // Refresh the supplier list
        setInventory(
          inventory.map((item) =>
            item.id === updatedItem.id ? updatedItem : item
          )
        );
        setShowEditPanel(false); // Close the Edit panel
        window.showToast?.("success", response.data.msg || "Supplier updated successfully");
      } else {
        throw new Error(response.data.msg || "Failed to update supplier");
      }
    } catch (error) {
      // Check for 401 Unauthorized error
      if (error.response && error.response.status === 401) {
        navigate("/login");       } else {
        console.error("Error updating supplier:", error);
        window.showToast?.("error", error.message || "Something went wrong while updating supplier");
      }
    }
  };
  
  
  

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleCreate = async (newItem) => {
    try {
      const accessToken = localStorage.getItem("access"); // Retrieve access token
  
      if (!accessToken) {
        navigate("/login");         return;
      }
  
      const response = await axios.post(
        'https://menusmitra.xyz/common_api/supplier_create', 
        {
          outlet_id: outlet_id, // Ensure you are passing outlet_id as needed
          name: newItem.name,
          user_id: user_id,
          supplier_status: "active", // Assuming "active" is default
          credit_rating: newItem.credit_rating,
          credit_limit: newItem.credit_limit,
          location: newItem.location,
          owner_name: newItem.owner_name,
          website: newItem.website,
          mobile_number1: newItem.mobile_number1,
          mobile_number2: newItem.mobile_number2,
          address: newItem.address,
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`, // Add Authorization header with token
          },
        }
      );
  
      if (response.data.st === 1) {
        fetchSuppliers(); // Refresh the supplier list
        setShowCreatePanel(false); // Close the Create panel
        // Display success toast
        window.showToast?.("success", response.data.msg || "Supplier created successfully");
      } else {
        // Handle API failure case with a toast
        throw new Error(response.data.msg || "Failed to create supplier");
      }
    } catch (error) {
      console.error("Error creating supplier:", error);
      // Display error toast
      window.showToast?.("error", error.message || "Something went wrong while creating supplier");
    }
  };
  
  
  

  const handleCreateClick = () => {
    // Close other panels first
    setShowEditPanel(false);
    setShowViewPanel(false);
    setSelectedInventory(null);
    setShowCreatePanel(true);
  };
  const handleBackClick = () => {
    navigate(-1);
  }
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
          <h1 className="text-2xl font-semibold text-gray-800">Supplier</h1>
          </div>
          <div className="flex justify-center w-1/3">
          <div className="relative w-50">            <input
              type="text"
              placeholder="Search Supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
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
            <FontAwesomeIcon icon={faPlus} className="" />
            
          </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-12 gap-4">
  {/* Inventory List */}
  <div
    className={`transition-all duration-300 ease-in-out ${
      showEditPanel || showCreatePanel || showViewPanel ? 'col-span-6' : 'col-span-12'
    }`}
  >
    <div
      className={`grid gap-4 ${
        showEditPanel || showCreatePanel || showViewPanel
          ? 'grid-cols-1 sm:grid-cols-2'
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      }`}
      
    >
         {filteredInventory.map((item) => (
        <div key={item.id} className="bg-white border-r-4 border  border-cyan-500 rounded-lg shadow-md p-5"
        onClick={() => handleView(item)}
        >
        <div className="flex justify-between items-start">
  <div>
    <h3 className="text-lg font-semibold capitalize text-gray-900">{item.name}</h3>

    {/* Mobile Number and Status in the Same Row */}
    <div className="flex items-center space-x-4 mt-2">
      <p className="text-sm text-gray-600">{item.mobile1}</p>
    
      <span   className={`inline-block capitalize text-xs font-medium px-2.5 py-0.5 rounded ${
          item.supplier_status === 'active'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
        {item.supplier_status}
      </span>
     
    </div>
  </div>

  {/* Action Buttons */}
  {showIcons && (
    <div className="flex space-x-2">
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent triggering handleView
          handleEdit(item.id); // Trigger Update
        }}
        className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full w-8 h-8"
        data-tooltip-id="tooltip-edit"
        data-tooltip-content="Update"
      >
        <FontAwesomeIcon icon={faEdit} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent triggering handleView
          setInventoryToDelete(item);
          setShowDeleteModal(true);
        }}
        data-tooltip-id="tooltip-delete"
        data-tooltip-content="Delete"
        className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full w-8 h-8"
      >
        <FontAwesomeIcon icon={faTrash} />
      </button>
    </div>
  )}
</div>

        </div>
      ))}
    </div>
  </div>

  {/* Create Panel */}
  {showCreatePanel && (
    <div className="col-span-6 transition-all duration-300">
      <div className="bg-white rounded-lg shadow-lg h-full">
        <div className="border-b">
          <div className="flex justify-between items-center p-4">
            <h2 className="text-xl font-semibold">Create Supplier</h2>
            <button
              onClick={() => setShowCreatePanel(false)}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full w-8 h-8"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>
        <div className="p-4">
          <SupplierForm onSubmit={handleCreate} onCancel={() => setShowCreatePanel(false)} />
        </div>
      </div>
    </div>
  )}

{showEditPanel && selectedInventory && (
        <div className="col-span-6 transition-all duration-300">
          <div className="bg-white rounded-lg shadow-lg h-full">
            <div className="border-b">
              <div className="flex justify-between items-center p-4">
                <h2 className="text-xl font-semibold">Update Supplier</h2>
                <button
                  onClick={() => setShowEditPanel(false)}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full w-8 h-8"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            </div>
            <div className="p-4">
              <EditSupplier
                item={selectedInventory}
                onSubmit={handleUpdate}
                onCancel={() => setShowEditPanel(false)}
              />
            </div>
          </div>
        </div>
      )}


{showViewPanel && <ViewSupplier item={supplierDetails} onClose={() => setShowViewPanel(false)} />}


</div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDeleteModal(false);
            }
          }}
          >
            <div className="bg-white cursor-pointer rounded-lg shadow-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Confirm Delete</h3>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <span className='font-bold capitalize'>{inventoryToDelete?.name} ? </span>
              </p>
            

              <div className="flex justify-between space-x-3">
          <button
            type="button"
            onClick={() => setShowDeleteModal(false)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            <FontAwesomeIcon icon={faTimes} className="mr-2" />
            Cancel
          </button>
          <button
         onClick={() => handleDelete(inventoryToDelete.id)}// <-- Replaced sectionToDelete with categoryToDelete
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
      <Tooltip id="tooltip-view" />
      <Tooltip id="tooltip-edit" />
      <Tooltip id="tooltip-delete" />
        <Tooltip id="tooltip-back" />
      <Footer/>
    </div>
  );
}

export default SupplierList;
