import React, { useState,useEffect } from "react";
import Header from "../../components/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faSearch,
  faSave,
  faPlus,
  faTimes,
  faEye,
  faExclamationTriangle,
  faGear,
  faArrowLeft 
} from "@fortawesome/free-solid-svg-icons";
import InventoryForm from "./InventoryForm";
import { Tooltip } from "react-tooltip";
import ViewInventory from "./ViewInventory";
import Footer from "../../components/Footer";
import axios from "axios"; // Import axios for making API requests
import { useNavigate } from "react-router-dom";
function InventoryList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [inventory, setInventory] = useState([]);
const navigate = useNavigate();
 const [showIcons, setShowIcons] = useState(false); 
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [showViewPanel, setShowViewPanel] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [inventoryToDelete, setInventoryToDelete] = useState(null);
  const outlet_id = localStorage.getItem('outlet_id');
  const user_id = localStorage.getItem('user_id');
  const [categoryError, setCategoryError] = useState('');

  const isValidCategoryName = (name) => {
    const nameRegex = /^[a-zA-Z\s]+$/;
    return nameRegex.test(name);
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value.replace(/[^a-zA-Z\s]/g, ''); // Only allow letters and spaces
    setNewCategory(value);
    
    if (value && !isValidCategoryName(value)) {
      setCategoryError('Category name can only contain letters and spaces');
    } else {
      setCategoryError('');
    }
  };

  const fetchInventory = () => {
    const accessToken = localStorage.getItem("access"); // Retrieve access token
  
    // If no token exists, redirect to login page (or handle error as needed)
    if (!accessToken) {
      navigate("/login"); // Redirect if token is missing
      return;
    }
  
    axios
      .post("https://men4u.xyz/common_api/inventory_listview", 
        { outlet_id: outlet_id },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`, // Add authorization header
          },
        }
      )
      .then((response) => {
        console.log("Fetched inventory:", response.data);
        if (response.data.st === 1) {
          setInventory(response.data.lists); // Update inventory with the fetched list
        } else {
          console.error("Failed to fetch inventory:", response.data.msg);
        }
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          // Handle token expiration or invalid token
          console.error('Unauthorized. Redirecting to login...');
          localStorage.removeItem('access'); // Clear the invalid or expired token
          navigate("/login"); // Redirect if token is missing
        } else {
          console.error("Error fetching inventory:", error);
        }
      });
  };
  

  // Call fetchInventory on component mount
  useEffect(() => {
    fetchInventory();
  }, []);
  


  const filteredInventory = inventory.filter((item) => 
    item && item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  

  const formatDate = (date) => {
    if (!date) return ""; // Return empty string if date is falsy (null, undefined, or empty string)
  
    const options = { year: 'numeric', month: 'short', day: '2-digit' };
    return new Date(date).toLocaleDateString('en-GB', options); // 'en-GB' locale for "DD Mon YYYY" format
  };
  
  
  const handleCreate = (newItem) => {
    const accessToken = localStorage.getItem("access"); // Retrieve access token
  
    // If no token exists, redirect to login page
    if (!accessToken) {
      navigate("/login"); // Redirect if token is missing
      return;
    }
  
    const data = {
      supplier_id: newItem.supplier_id || 13,
      outlet_id: outlet_id,
      name: newItem.name,
      description: newItem.description,
      category_id: newItem.category_id,
      unit_price: newItem.unit_price,
      quantity: newItem.quantity,
      unit_of_measure: newItem.unit_of_measure,
      reorder_level: newItem.reorder_level,
      expiration_date: formatDate(newItem.expiration_date), // Format expiration_date
      brand_name: newItem.brand_name,
      tax_rate: newItem.tax_rate,
      in_or_out: newItem.in_or_out,
      in_date: formatDate(newItem.in_date), // Format in_date
      out_date: formatDate(newItem.out_date), // Format out_date
      user_id: user_id,
    };
  
    axios
      .post("https://men4u.xyz/common_api/inventory_create", data, {
        headers: {
          'Authorization': `Bearer ${accessToken}`, // Add Authorization header with token
        },
      })
      .then((response) => {
        if (response.data.st === 1) {
          setInventory([...inventory, response.data.data]);
          setShowCreatePanel(false);
          fetchInventory();
          window.showToast?.("success", response.data.msg || "Inventory created successfully");
        } else {
          console.error("Failed to create inventory:", response.data.msg);
          window.showToast?.("error", response.data.msg || "Failed to create inventory");
        }
      })
      .catch((error) => {
        console.error("Error creating inventory:", error);
        if (error.response && error.response.status === 401) {
          // Handle token expiration or invalid token
          console.error('Unauthorized. Redirecting to login...');
          localStorage.removeItem('access'); // Clear the invalid or expired token
          navigate("/login"); // Redirect if token is missing
        } else {
          window.showToast?.("error", "Something went wrong. Please try again later.");
        }
      });
  };
  
  
  

 
  const handleEdit = (item) => {
    const accessToken = localStorage.getItem("access"); // Retrieve access token
  
    // If no token exists, redirect to login page
    if (!accessToken) {
      navigate("/login"); // Redirect if token is missing
      return;
    }
  
    // Close other panels first
    setShowCreatePanel(false);
    setShowViewPanel(false);
    
    setSelectedInventory(item);
  
    axios
      .post("https://men4u.xyz/common_api/inventory_view", {
        outlet_id: outlet_id,
        inventory_id: item.inventory_id,
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`, // Add Authorization header with token
        },
      })
      .then((response) => {
        if (response.data.st === 1) {
          // Set the detailed data for the selected inventory
          setSelectedInventory(response.data.data);
          setShowEditPanel(true);
        } else {
          console.error("Failed to fetch inventory details:", response.data.msg);
        }
      })
      .catch((error) => {
        console.error("Error fetching inventory details:", error);
        if (error.response && error.response.status === 401) {
          // Handle token expiration or invalid token
          console.error('Unauthorized. Redirecting to login...');
          localStorage.removeItem('access'); // Clear the invalid or expired token
          navigate("/login"); // Redirect if token is missing
        }
      });
  };
  

  const handleUpdate = (updatedItem) => {
    const accessToken = localStorage.getItem("access"); // Retrieve access token
  
    // If no token exists, redirect to login page
    if (!accessToken) {
      navigate("/login"); // Redirect if token is missing
      return;
    }
  
    // Make API call to update inventory
    axios
      .post("https://men4u.xyz/common_api/inventory_update", {
        inventory_id: updatedItem.inventory_id,
        supplier_id: updatedItem.supplier_id,
        outlet_id: updatedItem.outlet_id,
        name: updatedItem.name,
        description: updatedItem.description,
        category_id: updatedItem.category_id,
        unit_price: updatedItem.unit_price,
        quantity: updatedItem.quantity,
        unit_of_measure: updatedItem.unit_of_measure,
        reorder_level: updatedItem.reorder_level,
        expiration_date: updatedItem.expiration_date,
        brand_name: updatedItem.brand_name,
        tax_rate: updatedItem.tax_rate,
        in_or_out: updatedItem.in_or_out,
        in_date: updatedItem.in_date,
        out_date: updatedItem.out_date,
        user_id: user_id,
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`, // Add Authorization header with token
        },
      })
      .then((response) => {
        if (response.data.st === 1) {
          // Update the inventory state with the updated data
          setInventory(
            inventory.map((item) =>
              item.inventory_id === updatedItem.inventory_id ? updatedItem : item
            )
          );
          setShowEditPanel(false);
          window.showToast?.("success", response.data.msg || "Inventory updated successfully");
        } else {
          console.error("Failed to update inventory:", response.data.msg);
          window.showToast?.("error", response.data.msg || "Failed to update inventory");
        }
      })
      .catch((error) => {
        console.error("Error updating inventory:", error);
        if (error.response && error.response.status === 401) {
          // Handle token expiration or invalid token
          console.error('Unauthorized. Redirecting to login...');
          localStorage.removeItem('access'); // Clear the invalid or expired token
          navigate("/login"); // Redirect if token is missing
        } else {
          window.showToast?.("error", "Something went wrong. Please try again later.");
        }
      });
  };
  
  
  const handleView = (item) => {
    const accessToken = localStorage.getItem("access"); // Retrieve access token
  
    if (!accessToken) {
      navigate("/login"); // Redirect if token is missing
      return;
    }
  
    // Close other panels first
    setShowCreatePanel(false);
    setShowEditPanel(false);
  
    setSelectedInventory(item);
  
    axios
      .post(
        "https://men4u.xyz/common_api/inventory_view",
        {
          outlet_id: outlet_id,
          inventory_id: item.inventory_id,
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`, // Add Authorization header with token
          },
        }
      )
      .then((response) => {
        if (response.data.st === 1) {
          // Set the detailed data for the selected inventory
          setSelectedInventory(response.data.data);
          setShowViewPanel(true);
        } else {
          console.error("Failed to fetch inventory details:", response.data.msg);
        }
      })
      .catch((error) => {
        console.error("Error fetching inventory details:", error);
      });
  };
  


  const handleDelete = async () => {
    const accessToken = localStorage.getItem("access"); // Retrieve access token
  
    if (!accessToken) {
      navigate("/login"); // Redirect if token is missing
      return;
    }
  
    if (!inventoryToDelete?.inventory_id) {
      console.error('Inventory ID is missing');
      return;
    }
  
    try {
      const response = await axios.post(
        'https://men4u.xyz/common_api/inventory_delete',
        {
          inventory_id: inventoryToDelete.inventory_id,
          outlet_id: outlet_id,
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`, // Add Authorization header with token
          },
        }
      );
  
      if (response.data.st === 1) {
        setInventory(inventory.filter((item) => item.inventory_id !== inventoryToDelete.inventory_id));
        setShowDeleteModal(false);
        setInventoryToDelete(null);
      } else {
        console.error('Failed to delete inventory item:', response.data.msg || 'Unknown error');
      }
    } catch (error) {
      console.error('Error deleting inventory item:', error.response?.data || error.message);
    }
  };
  
  
  
  

  
  const handleSaveCategory = async () => {
    const accessToken = localStorage.getItem("access"); // Retrieve access token
  
    if (!accessToken) {
      navigate("/login"); // Redirect if token is missing
      return;
    }
  
    if (newCategory) {
      try {
        const response = await axios.post(
          'https://men4u.xyz/common_api/inventory_category_create',
          {
            name: newCategory,
          },
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`, // Add Authorization header with token
            },
          }
        );
  
        if (response.data.st === 1) {
          setShowCategoryModal(false); // Close the modal
          setNewCategory(""); // Clear the input field
          window.showToast?.("success", response.data.msg || "Category created successfully");
        } else {
          console.error('Failed to create category:', response.data.msg || 'Unknown error');
          window.showToast?.("error", response.data.msg || "Failed to create category");
        }
      } catch (error) {
        console.error('Error creating category:', error.response?.data || error.message);
        window.showToast?.("error", "Something went wrong. Please try again later.");
      }
    } else {
      window.showToast?.("error", "Category name cannot be empty");
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
          <h1 className="text-2xl font-semibold text-gray-800">Inventory</h1>
          </div>
         
          <div className="flex justify-center w-1/3">
            <div className="relative w-50">
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
          </div>
          </div>
          <div className="flex justify-end w-1/4">
          {showIcons && (
        <button
          onClick={(e) => {
            e.stopPropagation(); // Stop the click from propagating to the parent div
            setShowCategoryModal(true); // Show the category modal
          }}
           data-tooltip-id="tooltip-settings"
                      data-tooltip-content="Create Inventory Category"
          className="inline-flex items-center justify-center me-5  w-8 h-8 bg-sky-600 text-white rounded-full hover:bg-sky-700"
          >
          <FontAwesomeIcon icon={faPlus} />
        </button>
      )} 
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
          {/* Inventory List */}
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
                  {filteredInventory.map((item) => (
                <div
                  key={item.inventory_id}
                  className="bg-white border-r-4 border  border-pink-500 rounded-lg shadow-md p-3"
                  onClick={() => handleView(item)}
                >
                <div className="flex justify-between items-start">
  <div>
    {/* Name and Add Icon */}
    <div className="flex items-center justify-between">
      <h3 className="text-lg capitalize font-semibold text-gray-900">
        {item.name}
      </h3>
     
    </div>

    {/* Quantity and Brand Name Section */}
    <div className="flex justify-between items-center mt-2">
      {/* Quantity and Unit of Measure */}
      <div className="flex-1">
        <p className="text-sm text-gray-600">
          <span className="font-semibold capitalize">Qty:</span> {item.quantity}{" "}
          <span className="capitalize">{item.unit_of_measure}</span>
        </p>
      </div>

      {/* Brand Name Badge */}
      {item.brand_name && (
        <span className="inline-block capitalize bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded ml-2">
          {item.brand_name}
        </span>
      )}
    </div>
  </div>

  {/* Action Buttons */}
  {showIcons && (
    <div className="flex space-x-2">
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent triggering handleView
          handleEdit(item); // Trigger Update
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

          {showCreatePanel && (
        <div className="col-span-6 transition-all duration-300">
          <div className="bg-white rounded-lg shadow-lg h-full">
            <div className="border-b">
              <div className="flex justify-between items-center p-4">
                <h2 className="text-xl font-semibold">Create Inventory</h2>
                <button
                  onClick={() => setShowCreatePanel(false)}
                  className=" text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full w-8 h-8 "
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            </div>
            <div className="p-4">
              <InventoryForm
                onSubmit={handleCreate}
                onCancel={() => setShowCreatePanel(false)}
              />
            </div>
          </div>
        </div>
      )}

          {/* Edit Panel */}
          {showEditPanel && (
            <div className="col-span-6 transition-all duration-300">
              <div className="bg-white rounded-lg shadow-lg h-full">
                <div className="border-b">
                  <div className="flex justify-between items-center p-4">
                    <h2 className="text-xl font-semibold">Update Inventory</h2>
                    <button
                      onClick={() => setShowEditPanel(false)}
                      className=" text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full w-8 h-8 "
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <InventoryForm
                    item={selectedInventory}
                    onSubmit={handleUpdate}
                    onCancel={() => setShowEditPanel(false)}
                  />
                </div>
              </div>
            </div>
          )}

{showViewPanel && (
        <ViewInventory
          item={selectedInventory}
          onClose={() => setShowViewPanel(false)}
        />
      )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
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
                Are you sure you want to delete <span className="font-bold capitalize">{inventoryToDelete?.name} ?</span>
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
                  onClick={() => handleDelete(inventoryToDelete.id)} // <-- Replaced sectionToDelete with categoryToDelete
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                >
                  <FontAwesomeIcon icon={faTrash} className="mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {showCategoryModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowCategoryModal(false);
              }
            }}
          >
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Add Category</h3>
                <button onClick={() => setShowCategoryModal(false)}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500">*</span> Category
              </label>
              <input
                type="text"
                value={newCategory}
                onChange={handleCategoryChange}
                className={`w-full px-4 py-2 border rounded-lg ${
                  categoryError ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter category name"
              />
              {categoryError && (
                <p className="mt-1 text-sm text-red-500">{categoryError}</p>
              )}

              <div className="mt-6 flex justify-between space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  <FontAwesomeIcon icon={faTimes} className="mr-2" />
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSaveCategory}
                  disabled={!newCategory.trim() || categoryError}
                  className={`px-4 py-2 rounded-lg ${
                    !newCategory.trim() || categoryError
                      ? 'bg-green-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  } text-white`}
                >
                  <FontAwesomeIcon icon={faSave} className="mr-2" />
                  Save
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
      <Footer />
    </div>
  );
}

export default InventoryList;







