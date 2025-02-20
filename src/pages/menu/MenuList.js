import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faGear,faArrowLeft,faTrash, faPlus, faTimes, faSearch, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import ViewMenu from './ViewMenu';
import { Tooltip } from 'react-tooltip';
import Header from '../../components/Header';
import EditMenu from './EditMenu';
import CreateMenu from './CreateMenu';
import MenuCard from './MenuCard';
import Footer from '../../components/Footer';
import { useNavigate, useLocation } from "react-router-dom";
function MenuList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const navigate = useNavigate();
  const [showViewPanel, setShowViewPanel] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const outlet_id = localStorage.getItem('outlet_id');
 const [showIcons, setShowIcons] = useState(false); 
  useEffect(() => {
    fetchMenuItems();
  }, []);
  const access_token = localStorage.getItem('access');
  const refresh = localStorage.getItem('refresh');

  const fetchMenuItems = async () => {
    try {
      const accessToken = localStorage.getItem('access'); // Ensure token is fetched correctly

      if (!accessToken) {
        console.warn('No access token found, redirecting to login');
        navigate('/login'); // Redirect if no token is available
        return;
      }
      const response = await axios.post(
        'https://menusmitra.xyz/common_api/menu_listview',
        { outlet_id: outlet_id },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (response.data.st === 1) {
        const transformedItems = response.data.lists.map(item => ({
          id: item.menu_id,
          name: item.name,
          image: item.image || 'https://via.placeholder.com/150',
          halfPrice: item.half_price,
          fullPrice: item.full_price,
          category: item.category_name,
          foodType: item.food_type,
          spicyLevel: item.spicy_index,
          rating: item.rating,
        }));
        setMenuItems(transformedItems);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
      if (error.response && error.response.status === 401) {
        console.warn('Token expired or invalid, redirecting to login...');
        localStorage.removeItem('access_token'); // Clear expired token
        navigate('/login'); // Redirect user to login screen
      }
    }
  };

  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    try {
      const accessToken = localStorage.getItem('access'); // Get token

      if (!accessToken) {
        console.warn('No access token found, redirecting to login');
        navigate('/login'); // Redirect if token is missing
        return;
      }
      // Prepare the data for the delete request
      const deleteData = {
        outlet_id: outlet_id,  // Assuming `outlet_id` is available in your component state
        menu_id: id  // The ID of the menu item to delete
      };
  
      // Hit the delete API
      const response = await axios.post(
        'https://menusmitra.xyz/common_api/menu_delete',
        deleteData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      // Check if the response is successful
      if (response.data.st === 1) {
        // If the deletion was successful, update the state to remove the deleted item
        setMenuItems(menuItems.filter(item => item.id !== id));
      } else {
        // Handle failure (e.g., show an error message)
        console.error('Failed to delete menu item:', response.data.msg);
        window.showToast("error", response.data.msg || "Item could not be deleted.");

      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      if (error.response && error.response.status === 401) {
        console.warn('Token expired or invalid, redirecting to login...');
        localStorage.removeItem('access_token'); // Clear expired token
        navigate('/login'); // Redirect user to login screen
      }
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };
  

  const handleEdit =async (item) => {
    // Close other panels first
    setShowCreatePanel(false);
    setShowViewPanel(false);
    
    setSelectedMenuItem(item);
    setShowEditPanel(true);
    try {
      const accessToken = localStorage.getItem('access'); // Get token

      if (!accessToken) {
        console.warn('No access token found, redirecting to login');
        navigate('/login'); // Redirect if token is missing
        return;
      }
      
      const response = await fetch('https://menusmitra.xyz/common_api/menu_view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`
          
         },
        body: JSON.stringify({
          outlet_id: outlet_id, 
          menu_id: item.id, // This is where you use menu_id
        }),
      });
  
      const data = await response.json();
      if (data.st === 1) {
        setSelectedMenuItem(data.data);
      } else {
        alert('Failed to load menu details');
      }
    } catch (error) {
      console.error('Error fetching menu details:', error);
      if (error.response && error.response.status === 401) {
        console.warn('Token expired or invalid, redirecting to login...');
        localStorage.removeItem('access_token'); // Clear expired token
        navigate('/login'); // Redirect user to login screen
      }
    }
  };

  const handleCloseEdit = () => {
    setSelectedMenuItem(null);
    setShowEditPanel(false);
  };

  const handleUpdateMenuItem = async (formData, navigate) => {
    try {
      const accessToken = localStorage.getItem('access'); // Get token
  
      if (!accessToken) {
        console.warn('No access token found, redirecting to login');
        navigate('/login'); // Redirect if token is missing
        return;
      }
  
      const response = await fetch('https://menusmitra.xyz/common_api/menu_update', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
  
      const data = await response.json();
  
      if (data.st === 1) {
        window.showToast("success", "Menu updated successfully!");
  
        setShowEditPanel(false);
        fetchMenuItems(); // Refresh the menu list
      } else {
        window.showToast("error", data.msg || "Error updating menu item");
        console.error('Error updating menu:', data.msg);
      }
    } catch (error) {
      console.error('Error updating menu item:', error);
  
      // Handle 401 errors (unauthorized)
      if (error.response && error.response.status === 401) {
        console.warn('Token expired or invalid, redirecting to login...');
        localStorage.removeItem('access_token'); // Clear expired token
        navigate('/login'); // Redirect user to login screen
      }
    }
  };
  
  

  const handleCloseCreate = () => {
    setShowCreatePanel(false);
  };

  const handleCreateMenuItem = (newItem) => {
    setMenuItems([...menuItems, { ...newItem, id: Date.now() }]);
    handleCloseCreate();
    fetchMenuItems();
  };


  const handleView = async (item) => {
    // Close other panels first
    setShowCreatePanel(false);
    setShowEditPanel(false);
    
    setSelectedMenuItem(item);
    setShowViewPanel(true);

    try {
      const accessToken = localStorage.getItem('access'); // Get token

      if (!accessToken) {
        console.warn('No access token found, redirecting to login');
        navigate('/login'); // Redirect if token is missing
        return;
      }
      const response = await fetch('https://menusmitra.xyz/common_api/menu_view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`
         },
        body: JSON.stringify({
          outlet_id: outlet_id,
          menu_id: item.id,
        }),
      });

      const data = await response.json();
      if (data.st === 1) {
        setSelectedMenuItem(data.data);
      } else {
        alert('Failed to load menu details');
      }
    } catch (error) {
      console.error('Error fetching menu details:', error);
      alert('Failed to load menu details');
    if (error.response && error.response.status === 401) {
        console.warn('Token expired or invalid, redirecting to login...');
        localStorage.removeItem('access_token'); // Clear expired token
        navigate('/login'); // Redirect user to login screen
      }
    }
  };

  const handleCloseView = () => {
    setSelectedMenuItem(null);
    setShowViewPanel(false);
  };

  const handleCreateClick = () => {
    // Close other panels first
    setShowEditPanel(false);
    setShowViewPanel(false);
    setSelectedMenuItem(null);
    setShowCreatePanel(true);
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
  {/* Left Section: Back Button & Title */}
  <div className="flex items-center w-1/4">
    <button
      onClick={handleBackClick}
      className="text-gray-500 w-8 h-8 rounded-full mr-3 hover:bg-gray-200"
      data-tooltip-id="tooltip-back"
      data-tooltip-content="Back"
    >
      <FontAwesomeIcon icon={faArrowLeft} />
    </button>
    <h1 className="text-2xl font-semibold text-gray-800">Menu</h1>
  </div>

  {/* Center Section: Search Input */}
  <div className="flex justify-center">
    <div className="relative w-50">
      <input
        type="text"
        placeholder="Search menu..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FontAwesomeIcon icon={faSearch} className="text-gray-400 text-sm" />
      </div>
    </div>
  </div>

  {/* Right Section: Settings & Create Button */}
  <div className="flex justify-end w-1/4">
    <button
      className={`text-gray-500 w-8 h-8 rounded-full mr-3 ${
        showIcons ? 'bg-black text-white' : ''
      }`}
      data-tooltip-id="tooltip-settings"
      data-tooltip-content="Settings"
      onClick={() => setShowIcons(!showIcons)}
    >
      <FontAwesomeIcon icon={faGear} className="text-md" />
    </button>

    <button
      onClick={handleCreateClick}
      className="inline-flex items-center justify-center w-8 h-8 bg-sky-600 text-white rounded-full hover:bg-sky-700"
    >
      <FontAwesomeIcon icon={faPlus} />
    </button>
  </div>
</div>

        {/* Main Content Area */}
        <div className="grid grid-cols-12 gap-4">
          {/* Menu Items Grid */}
          <div className={`transition-all duration-300 ease-in-out ${showEditPanel || showViewPanel || showCreatePanel ? 'col-span-6' : 'col-span-12'}`}>
            <div className={`grid gap-4 ${
              showEditPanel || showCreatePanel || showViewPanel
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2' 
                : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4'
            }`}>
              {filteredMenuItems.map((item) => (
                <MenuCard
                  key={item.id}
                  item={item} 
                  onEdit={handleEdit}
                  onDelete={() => {
                    setItemToDelete(item);
                    setShowDeleteModal(true);
                  }}
                  onView={() => handleView(item)} 
                  showIcons={showIcons} 
                  
                />
              ))}
            </div>
          </div>

         

          {/* Create Panel */}
          {showCreatePanel && (
            <div className="col-span-6 transition-all duration-300">
              <div className="bg-white rounded-lg shadow-lg h-full">
                <div className="border-b">
                  <div className="flex justify-between items-center p-4">
                    <h2 className="text-xl font-semibold">Create Menu </h2>
                    <button
                      onClick={handleCloseCreate}
                      className=" text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center "
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <CreateMenu
                    onSubmit={handleCreateMenuItem}
                    onCancel={handleCloseCreate}
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
                    <h2 className="text-xl font-semibold">Edit Menu </h2>
                    <button
                      onClick={handleCloseEdit}
                      className=" text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center "
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <EditMenu
                    menuItem={selectedMenuItem}
                    onUpdate={handleUpdateMenuItem}
                    onCancel={handleCloseEdit}
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
              setItemToDelete(null);
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 text-2xl mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirm Delete
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setItemToDelete(null);
                }}
                className="text-gray-500 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-100 hover:text-gray-700 transition-colors duration-200"
                >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <span className='font-bold capitalize'>{itemToDelete?.name} ?</span> This action cannot be undone.
            </p>
       

            <div className="flex justify-between space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setItemToDelete(null);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                  >
                    <FontAwesomeIcon icon={faTimes} className="mr-2" />
                    Cancel
                  </button>
                  <button
                onClick={() => handleDelete(itemToDelete.id)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                  >
                    <FontAwesomeIcon icon={faTrash} className="mr-2" />
                    Delete
                  </button>
                </div>
          </div>
        </div>
      )}



{showViewPanel && (
  <div className="col-span-6 transition-all duration-300">
    <ViewMenu 
      item={selectedMenuItem} 
      onClose={handleCloseView} 
    />
  </div>
)}


        </div>
      </div>
      <Tooltip id="tooltip-back" />
      <Footer/>
    </div>
  );
}

export default MenuList;
