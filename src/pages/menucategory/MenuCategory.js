import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash,faArrowLeft, faSearch, faPlus, faTimes, faEye, faExclamationTriangle, faGear } from '@fortawesome/free-solid-svg-icons';
import CategoryForm from './CategoryForm';
import ViewCategory from '../menucategory/ViewCategory';
import Footer from '../../components/Footer';
import { Tooltip } from 'react-tooltip';
import UpdateCategory from './UpdateCategory';
import { useNavigate, useLocation } from "react-router-dom";
function MenuCategory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [showViewPanel, setShowViewPanel] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showIcons, setShowIcons] = useState(false); // New state variable
  const outlet_id = localStorage.getItem('outlet_id');
  const user_id = localStorage.getItem('user_id');
const navigate = useNavigate();
  const closeAllPanels = () => {
    setShowViewPanel(false);
    setShowEditPanel(false);
    setShowCreatePanel(false);
  };
  useEffect(() => {
    fetchCategories();
  }, []);
  const access_token = localStorage.getItem('access');
  const fetchCategories = async () => {
    const response = await fetch('https://men4u.xyz/common_api/menu_category_listview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify({ outlet_id: outlet_id })
    });

    if (response.status === 401) {
      // Handle 401 error (Unauthorized)
      console.warn('Unauthorized - Token expired or invalid');
      localStorage.removeItem('access'); // Clear expired token
      navigate('/login'); // Redirect to login page
      return;
    }
    const data = await response.json();

    if (data.st === 1) {
      const fetchedCategories = data.menucat_details.map(item => ({
        id: item.menu_cat_id,
        name: item.category_name,
        itemCount: item.menu_count,
        image: null,
      }));

      setCategories(fetchedCategories);
    } else {
      console.error("Error fetching categories:", data.msg);
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete || !categoryToDelete.id) {
      console.error('Category to delete is invalid:', categoryToDelete);
      return;
    }

    try {
      const accessToken = localStorage.getItem('access'); // Get access token

      if (!accessToken) {
        console.warn('No access token found, redirecting to login');
        navigate('/login'); // Redirect if token is missing
        return;
      }
      const response = await fetch('https://men4u.xyz/common_api/menu_category_delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
         },
        body: JSON.stringify({
          outlet_id,
          menu_cat_id: categoryToDelete.id,
        }),
      });

      const data = await response.json();

      if (data.st === 1) {
        setCategories(categories.filter(category => category.id !== categoryToDelete.id));
        setShowDeleteModal(false);
        setCategoryToDelete(null);
      } else {
        console.error('Error deleting category:', data.msg);
        window.showToast("error", data.msg || "Item could not be deleted.");

      }
    } catch (error) {
      console.error('Error during delete request:', error);
      if (error.response && error.response.status === 401) {
        console.warn('Token expired or invalid, redirecting to login...');
        localStorage.removeItem('access'); // Clear expired token
        navigate('/login'); // Redirect user to login screen
      }
    }
  };
  const handleEdit = async (category) => {
    closeAllPanels();
    const outlet_id = localStorage.getItem('outlet_id');
    const menu_cat_id = category.id;

    const requestData = {
      outlet_id,
      menu_cat_id,
    };

    try {
      const accessToken = localStorage.getItem('access'); // Get access token

      if (!accessToken) {
        console.warn('No access token found, redirecting to login');
        navigate('/login'); // Redirect if token is missing
        return;
      }
      const response = await fetch('https://men4u.xyz/common_api/menu_category_view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      if (response.ok && data.st === 1) {
        setSelectedCategory({
          id: data.data.menu_cat_id,
          name: data.data.name,
          image: data.data.image,
        });
        setShowEditPanel(true);
      } else {
        console.error('Error fetching category details:', data.msg);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.warn('Token expired or invalid, redirecting to login...');
        localStorage.removeItem('access'); // Clear expired token
        navigate('/login'); // Redirect user to login screen
      }
    }
  };

  const handleView = async (category) => {
    closeAllPanels();
    const outlet_id = localStorage.getItem('outlet_id');
    const menu_cat_id = category.id;

    const requestData = {
      outlet_id,
      menu_cat_id,
    };

    try {
      const accessToken = localStorage.getItem('access'); // Get access token

      if (!accessToken) {
        console.warn('No access token found, redirecting to login');
        navigate('/login'); // Redirect if token is missing
        return;
      }
      const response = await fetch('https://men4u.xyz/common_api/menu_category_view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      if (response.ok && data.st === 1) {
        setSelectedCategory(data.data);
        setShowViewPanel(true);
      } else {
        console.error('Error fetching category details:', data.msg);
      }
    } catch (error) {
      console.error('Error:', error);
      if (error.response && error.response.status === 401) {
        console.warn('Token expired or invalid, redirecting to login...');
        localStorage.removeItem('access'); // Clear expired token
        navigate('/login'); // Redirect user to login screen
      }
    }
  };

  const handleCloseEdit = () => {
    setSelectedCategory(null);
    setShowEditPanel(false);
  };

  const handleUpdateCategory = async (updatedCategory) => {
    const { category_name, image } = updatedCategory;
    const outlet_id = localStorage.getItem('outlet_id');
    const menu_cat_id = selectedCategory?.id;

    const formData = new FormData();
    formData.append('outlet_id', outlet_id);
    formData.append('menu_cat_id', menu_cat_id);
    formData.append('category_name', category_name);
    formData.append('user_id', user_id);
    if (image) {
      formData.append('image', image);
    }

    try {
      const accessToken = localStorage.getItem('access'); // Get access token

      if (!accessToken) {
        console.warn('No access token found, redirecting to login');
        navigate('/login'); // Redirect if token is missing
        return;
      }
      const response = await fetch('https://men4u.xyz/common_api/menu_category_update', {
     
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${accessToken}`, // Add the Bearer token for authentication
      },
    });
      const data = await response.json();
      if (data.st === 1) {
        setCategories(categories.map(category =>
          category.id === updatedCategory.id ? updatedCategory : category
        ));
        window.showToast("success",  "Category updated successfully!");

        // window.showToast("success", data.msg || "category updated successfully!");

        setShowEditPanel(false);
        fetchCategories();
      } else {
        console.error('Error updating category:', data.msg);
        window.showToast("error", data.msg || "category created successfully!");

      }
    } catch (error) {
      console.error('Error during update request:', error);
      if (error.response && error.response.status === 401) {
        console.warn('Token expired or invalid, redirecting to login...');
        localStorage.removeItem('access'); // Clear expired token
        navigate('/login'); // Redirect user to login screen
      }
    }
  };
  const handleCreateCategory = async (newCategory) => {
    closeAllPanels();
    const { category_name, image } = newCategory;
    const outlet_id = localStorage.getItem('outlet_id');
    const formData = new FormData();
    formData.append('outlet_id', outlet_id);
    formData.append('category_name', category_name);
    formData.append('user_id', user_id);
    if (image) {
      formData.append('image', image);
    }

    try {
      const accessToken = localStorage.getItem('access'); // Get access token

      if (!accessToken) {
        console.warn('No access token found, redirecting to login');
        navigate('/login'); // Redirect if token is missing
        return;
      }
      const response = await fetch('https://men4u.xyz/common_api/menu_category_create', {
        method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${accessToken}`, // Add the Bearer token for authentication
      },
    });
      const data = await response.json();
      if (response.ok) {
        setCategories([...categories, { ...newCategory, id: Date.now(), itemCount: 0 }]);
        setShowCreatePanel(false);
        fetchCategories();
        window.showToast("success",  "Category created successfully!");

       // window.showToast("success", data.msg || "category created successfully!");
      } else {
        console.error('Error creating category:', data);
        window.showToast("error", data.msg || "");
      }
    } catch (error) {
      console.error('Error:', error);
      window.showToast('Error: ' + error.message, 'error');
      if (error.response && error.response.status === 401) {
        console.warn('Token expired or invalid, redirecting to login...');
        localStorage.removeItem('access'); // Clear expired token
        navigate('/login'); // Redirect user to login screen
      }
    }
  };

  const handleCreateClick = () => {
    closeAllPanels();
    setSelectedCategory(null);
    setShowCreatePanel(true);
  };

  console.log(categories);
  const filteredCategories = categories.filter(category => {
    console.log(category);
    return category.name && category.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleCloseView = () => {
    setSelectedCategory(null);
    setShowViewPanel(false);
  };
  const handleBackClick = () => {
    navigate(-1); // Navigate to the previous page
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
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
          <h1 className="text-2xl font-semibold text-gray-800 w-1/4">
            Categories
          </h1>
          </div>

          <div className="flex justify-center w-1/3">
            <div className="relative w-50">
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faSearch} className="text-gray-400 text-sm" />
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
              onClick={handleCreateClick}
              className="inline-flex items-center justify-center w-8 h-8 bg-sky-600 text-white rounded-full hover:bg-sky-700"
              >
              <FontAwesomeIcon icon={faPlus} />
             
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div
            className={`transition-all duration-300 ease-in-out ${showEditPanel || showCreatePanel || showViewPanel
                ? 'col-span-6'
                : 'col-span-12'
              }`}
          >
            <div
              className={`grid gap-4 ${showEditPanel || showCreatePanel || showViewPanel
                 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2' 
                : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4'
                }`}
            >
              {filteredCategories.map((category) => (
                <div key={category.id} className="bg-white border-r-4 border  border-purple-500 cursor-pointer rounded-lg shadow-md overflow-hidden shadow-lg"
                  onClick={() => handleView(category)}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        {category.name && (
                          <h3 className="text-lg font-semibold capitalize text-gray-900">{category.name}</h3>
                        )}
                      </div>
                      {showIcons && ( // Conditionally render icons
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(category)
                            }}
                            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full w-8 h-8"
                            data-tooltip-id="tooltip-edit"
                            data-tooltip-content="Update"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            onClick={(e) => {
                              setCategoryToDelete(category);
                              setShowDeleteModal(true);
                              e.stopPropagation();
                              console.log('Category to delete:', categoryToDelete);
                            }}
                            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full w-8 h-8"
                            data-tooltip-id="tooltip-delete"
                            data-tooltip-content="Delete"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      )}
                    </div>
                    {category.itemCount !== null && category.itemCount !== undefined && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-500">Total Menus: {category.itemCount}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {(showViewPanel || showEditPanel || showCreatePanel) && (
            <div className="col-span-6 transition-all duration-300">
              <div className="bg-white rounded-lg shadow-lg h-full">
              {!showViewPanel && (
                <div className="border-b">
                  <div className="flex justify-between items-center p-4">
                    <h2 className="text-xl font-semibold">
                      {showEditPanel
                        ? 'Edit Category'
                        : showEditPanel
                          ? 'Edit Category'
                          : 'Create Category'}
                    </h2>
                    <button
                     onClick={closeAllPanels}
                      className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full w-8 h-8"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                  
                </div>
              )}
                <div className="p-4">
                  {showViewPanel && (
                    <ViewCategory category={selectedCategory}  onClose={closeAllPanels} />
                  )}
                  {showEditPanel && (
                    <UpdateCategory
                      category={selectedCategory}
                      onSubmit={handleUpdateCategory}
                      onClose={closeAllPanels}
                    />
                  )}
                  {showCreatePanel && (
                    <CategoryForm
                      onSubmit={handleCreateCategory}
                      onClose={closeAllPanels}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {showDeleteModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowDeleteModal(false);
                setCategoryToDelete(null);
              }
            }}
          >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <FontAwesomeIcon
                      icon={faExclamationTriangle}
                      className="text-red-500 text-2xl mr-3"
                    />
                    <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setCategoryToDelete(null);
                    }}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <FontAwesomeIcon icon={faTimes} className="text-xl" />
                  </button>
                </div>

                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete category <span className='font-bold'>{categoryToDelete?.name}?</span> This action cannot be undone.
                </p>

                <div className="flex justify-between space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setCategoryToDelete(null);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                  >
                    <FontAwesomeIcon icon={faTimes} className="mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(categoryToDelete?.id)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                  >
                    <FontAwesomeIcon icon={faTrash} className="mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Tooltip id="tooltip-edit" />
      <Tooltip id="tooltip-delete" />
      <Tooltip id="tooltip-view" />
      <Tooltip id="tooltip-back" />
      <Footer />
    </div>
  );
}

export default MenuCategory;