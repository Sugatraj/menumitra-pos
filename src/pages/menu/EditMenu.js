import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
function EditMenu({ menuItem, onUpdate, onCancel }) {
  const [isSpecial, setIsSpecial] = useState(false);
  
    // Update state when `item` changes
    useEffect(() => {
      if (menuItem) {
        setIsSpecial(menuItem.is_special);
      }
    }, [menuItem]);
  
    if (!menuItem) return null;
  
    const toggleSpecialStatus = async (navigate) => {
      try {
        const accessToken = localStorage.getItem('access'); // Get token
    
        if (!accessToken) {
          console.warn('No access token found, redirecting to login');
          navigate('/login'); // Redirect if token is missing
          return;
        }
    
        const requestData = {
          outlet_id: menuItem.outlet_id.toString(),
          menu_id: menuItem.menu_id.toString(),
        };
    
        const response = await axios.post(
          'https://menusmitra.xyz/common_api/make_menu_special_non_special',
          requestData,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
    
        if (response.data.st === 1) {
          setIsSpecial((prev) => !prev); // Toggle the current state
          window.showToast("success", response.data.msg || "Menu status updated successfully");
        } else {
          window.showToast("error", response.data.msg || "Failed to update menu status");
        }
      } catch (error) {
        console.error('Error updating menu status:', error);
    
        // Handle 401 errors (unauthorized)
        if (error.response && error.response.status === 401) {
          console.warn('Token expired or invalid, redirecting to login...');
          localStorage.removeItem('access'); // Clear expired token
          navigate('/login'); // Redirect user to login screen
        }
    
        window.showToast("error", "Failed to update menu status");
      }
    };
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    halfPrice: '',
    fullPrice: '',
    description: '',
    ingredients: '',
    category: '',
    foodType: '',
    spicyLevel: '',
    rating: '',
    offer: '',
    images: [], // Single array for all images
  });

  const [categories, setCategories] = useState([]);
  const [spicyLevels, setSpicyLevels] = useState([]);
  const [ratingOptions, setRatingOptions] = useState([]);
  const [foodTypes, setFoodTypes] = useState([]);
  const outlet_id = localStorage.getItem('outlet_id');
  const user_id = localStorage.getItem('user_id');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const isValidMenuName = (name) => {
    const nameRegex = /^[a-zA-Z0-9\s]+$/; // Only letters, numbers and spaces
    return nameRegex.test(name);
  };

  const isValidOffer = (offer) => {
    const offerRegex = /^\d+$/; // Only numbers
    return offerRegex.test(offer) && parseInt(offer) >= 0; // Allow zero and positive numbers
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Menu name is required';
    } else if (!isValidMenuName(formData.name)) {
      newErrors.name = 'Menu name can only contain letters, numbers and spaces';
    }

    if (formData.offer === '' || formData.offer === null || formData.offer === undefined) {
      newErrors.offer = 'Offer is required';
    } else if (!isValidOffer(formData.offer)) {
      newErrors.offer = 'Offer can only contain numbers';
    }

    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.fullPrice) newErrors.fullPrice = 'Full price is required';
    if (!formData.foodType) newErrors.foodType = 'Food type is required';
    if (!formData.spicyLevel) newErrors.spicyLevel = 'Spicy level is required';
    if (!formData.rating) newErrors.rating = 'Rating is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateMenuName = (value) => {
    if (!value.trim()) {
      return 'Menu name is required';
    }
    
    const nameRegex = /^[a-zA-Z0-9\s]+$/;
    if (!nameRegex.test(value)) {
      return 'Menu name can only contain letters, numbers, and spaces';
    }
    
    if (value.length < 2) {
      return 'Menu name must be at least 2 characters long';
    }
    
    return '';
  };

  useEffect(() => {
    // Fetch Categories
    const fetchCategories = async () => {
      try {
        const accessToken = localStorage.getItem('access'); // Get access token

        if (!accessToken) {
          console.warn('No access token found, redirecting to login');
          navigate('/login'); // Redirect if token is missing
          return;
        }

        const response = await fetch('https://menusmitra.xyz/common_api/menu_categorys', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ outlet_id }),
        });

        const data = await response.json();

        if (data.st === 1) {
          const categoryList = Object.entries(data.categorys_list); // Ensure correct structure
          setCategories(categoryList);
        } else {
          console.error('Error fetching categories');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);

        // Handle 401 errors (unauthorized)
        if (error.response && error.response.status === 401) {
          console.warn('Token expired or invalid, redirecting to login...');
          localStorage.removeItem('access'); // Clear expired token
          navigate('/login'); // Redirect user to login screen
        }
      }
    };

    fetchCategories();
  }, [outlet_id, navigate]); // Include `navigate` in dependencies
  

  // Fetch Spicy Levels

  useEffect(() => {
    const fetchSpicyLevels = async () => {
      try {
        const accessToken = localStorage.getItem('access'); // Get access token

        if (!accessToken) {
          console.warn('No access token found, redirecting to login');
          navigate('/login'); // Redirect if token is missing
          return;
        }

        const response = await fetch('https://menusmitra.xyz/common_api/get_spicy_index_list', {
          method: 'GET', // Use POST if the API requires it
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const data = await response.json();

        if (data.st === 1) {
          const levels = Object.keys(data.spicy_index_list);
          setSpicyLevels(levels);
        } else {
          console.error('Error fetching spicy levels');
        }
      } catch (error) {
        console.error('Error fetching spicy levels:', error);

        // Handle 401 errors (unauthorized)
        if (error.response && error.response.status === 401) {
          console.warn('Token expired or invalid, redirecting to login...');
          localStorage.removeItem('access'); // Clear expired token
          navigate('/login'); // Redirect user to login screen
        }
      }
    };

    fetchSpicyLevels();
  }, [navigate]); // Include `navigate` in dependencies

  // Fetch Ratings

  useEffect(() => {
    const fetchRatingOptions = async () => {
      try {
        const accessToken = localStorage.getItem('access'); // Get access token

        if (!accessToken) {
          console.warn('No access token found, redirecting to login');
          navigate('/login'); // Redirect if token is missing
          return;
        }

        const response = await fetch('https://menusmitra.xyz/common_api/rating_list', {
          method: 'GET', // Use POST if required by the API
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const data = await response.json();

        if (data.st === 1) {
          setRatingOptions(Object.keys(data.rating_list));
        } else {
          console.error('Error fetching ratings');
        }
      } catch (error) {
        console.error('Error fetching ratings:', error);

        // Handle 401 errors (unauthorized)
        if (error.response && error.response.status === 401) {
          console.warn('Token expired or invalid, redirecting to login...');
          localStorage.removeItem('access'); // Clear expired token
          navigate('/login'); // Redirect user to login screen
        }
      }
    };

    fetchRatingOptions();
  }, [navigate]); // Include `navigate` in dependencies

  // Fetch Food Types
  useEffect(() => {
    const fetchFoodTypes = async () => {
      try {
        const accessToken = localStorage.getItem('access'); // Get access token

        if (!accessToken) {
          console.warn('No access token found, redirecting to login');
          navigate('/login'); // Redirect if token is missing
          return;
        }

        const response = await fetch('https://menusmitra.xyz/common_api/get_food_type_list', {
          method: 'GET', // Use POST if required by the API
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const data = await response.json();

        if (data.st === 1) {
          setFoodTypes(Object.keys(data.food_type_list));
        } else {
          console.error('Error fetching food types');
        }
      } catch (error) {
        console.error('Error fetching food types:', error);

        // Handle 401 errors (unauthorized)
        if (error.response && error.response.status === 401) {
          console.warn('Token expired or invalid, redirecting to login...');
          localStorage.removeItem('access'); // Clear expired token
          navigate('/login'); // Redirect user to login screen
        }
      }
    };

    fetchFoodTypes();
  }, [navigate]); // Include `navigate` in dependencies

  // Populate form with menuItem data
  useEffect(() => {
    if (menuItem) {
      setFormData({
        ...formData,
        id: menuItem.menu_id,
        name: menuItem.name,
        halfPrice: menuItem.half_price,
        fullPrice: menuItem.full_price,
        description: menuItem.description,
        ingredients: menuItem.ingredients || '',
        category: menuItem.category_name,
        foodType: menuItem.food_type,
        spicyLevel: menuItem.spicy_index,
        rating: menuItem.rating || '',
        offer: menuItem.offer,
        images: menuItem.images || [], // Store all images in single array
      });
    }
  }, [menuItem]);
  
  useEffect(() => {
    validateForm();
  }, [formData]);


  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  setIsSubmitting(true);

  try {
    const formDataToSend = new FormData();

    // Append basic form fields
    formDataToSend.append('menu_id', formData.id);
    formDataToSend.append('outlet_id', outlet_id);
    formDataToSend.append('user_id', user_id);
    formDataToSend.append('name', formData.name);
    formDataToSend.append('full_price', formData.fullPrice);
    formDataToSend.append('half_price', formData.halfPrice || 0);
    formDataToSend.append('food_type', formData.foodType);
    formDataToSend.append('menu_cat_id', categories.find(([categoryName, id]) => categoryName === formData.category)?.[1]);
    formDataToSend.append('spicy_index', formData.spicyLevel);
    formDataToSend.append('offer', formData.offer);
    formDataToSend.append('rating', formData.rating || '');
    formDataToSend.append('description', formData.description || '');
    formDataToSend.append('ingredients', formData.ingredients || '');

    // Append all images (existing URLs + new uploaded images)
    formData.images.forEach((image) => {
      if (typeof image === 'string') {
        // Existing image (URL)
        formDataToSend.append('images', image);
      } else if (image.file) {
        // New uploaded image (binary file)
        formDataToSend.append('images', image.file);
      }
    });

    // Send API request
    await onUpdate(formDataToSend);

    window.showToast("success", "Menu updated successfully");
  } catch (error) {
    console.error('Error updating menu:', error);
    window.showToast("error", "Failed to update menu");
  } finally {
    setIsSubmitting(false);
  }
};

  
  
  
  
  
  
  
  const handleImageChange = async (e) => {
    try {
      const files = Array.from(e.target.files);
      const existingImagesCount = formData.images.length;
      const totalImagesAfterAdding = existingImagesCount + files.length;
  
      // Check if the total number of images exceeds the limit
      if (totalImagesAfterAdding > 5) {
        window.showToast("error", `You can only upload ${5 - existingImagesCount} more images`);
        return;
      }
  
      // Process new files (binary images)
      const processedFiles = files.map(file => ({
        file: file, // Store the actual file
        uri: URL.createObjectURL(file), // URL for preview only
      }));
  
      // Append new images to the existing images
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...processedFiles]  // Keep existing and add new ones
      }));
  
      console.log("Updated images after change:", formData.images);
    } catch (error) {
      console.error("Error picking image:", error);
      window.showToast("error", "Failed to pick image");
    }
  };
  
  
  
  
  
  
  
  
  const removeImage = (index) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      // Clean up URL if it's a new image
      if (newImages[index]?.uri && !typeof newImages[index] === 'string') {
        URL.revokeObjectURL(newImages[index].uri);
      }
      newImages.splice(index, 1);
      return {
        ...prev,
        images: newImages
      };
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* First Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2"><span className="text-red-500">*</span> Menu Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => {
              // Remove special characters immediately on input
              const processedValue = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
              
              setFormData({ ...formData, name: processedValue });
              
              // Validate the processed value
              const error = validateMenuName(processedValue);
              if (error) {
                setErrors(prev => ({ ...prev, name: error }));
              } else if (errors.name) {
                const newErrors = { ...errors };
                delete newErrors.name;
                setErrors(newErrors);
              }
            }}
            className={`block w-full rounded-md border ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            } px-4 py-2 focus:border-blue-500 focus:ring-blue-500`}
            placeholder="Enter menu name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
        </div>
        <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    <span className="text-red-500">*</span> Category
  </label>
  <select
    required
    value={formData.category}
    onChange={(e) => {
      setFormData({ ...formData, category: e.target.value });
      if (errors.category) {
        const newErrors = { ...errors };
        delete newErrors.category;
        setErrors(newErrors);
      }
    }}
    className={`block w-full rounded-md border ${
      errors.category ? 'border-red-500' : 'border-gray-300'
    } px-4 py-3 bg-white`}
  >
    <option value="">Select category</option>
    {categories.map(([categoryName, categoryId]) => (
      <option key={categoryId} value={categoryName}>
        {categoryName}
      </option>
    ))}
  </select>
  {errors.category && (
    <p className="mt-1 text-sm text-red-500">{errors.category}</p>
  )}
</div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-2 gap-4">
      <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    <span className="text-red-500">*</span> Full Price
  </label>
  <input
    type="number"
    value={formData.fullPrice}
    onChange={(e) => {
      const newValue = e.target.value;

      // Ensure the value is non-negative
      if (newValue >= 0 || newValue === '') {
        setFormData({ ...formData, fullPrice: newValue });
      }

      // Remove error message when user starts typing
      if (errors.fullPrice) {
        const newErrors = { ...errors };
        delete newErrors.fullPrice;
        setErrors(newErrors);
      }
    }}
    className={`block w-full rounded-md border ${
      errors.fullPrice ? 'border-red-500' : 'border-gray-300'
    } px-4 py-2 focus:border-blue-500 focus:ring-blue-500`}
    placeholder="Enter full price"
  />
  {errors.fullPrice && (
    <p className="mt-1 text-sm text-red-500">{errors.fullPrice}</p>
  )}
</div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2"> Half Price</label>
          <input
  type="number"
  value={formData.halfPrice}
  onChange={(e) => {
    const value = e.target.value;
    // Prevent negative values
    if (value >= 0) {
      setFormData({ ...formData, halfPrice: value });
    }
  }}
  className="block w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
  placeholder="Enter half price"
/>

        </div>
      </div>

      {/* Third Row */}
      <div className="grid grid-cols-2 gap-4">
      <div>
            <label className="block text-sm font-medium text-gray-700 mb-2"><span className="text-red-500">*</span> Food Type</label>
            <select
              required
              value={formData.foodType}
              onChange={(e) => {
                setFormData({ ...formData, foodType: e.target.value });
                if (errors.foodType) {
                  const newErrors = { ...errors };
                  delete newErrors.foodType;
                  setErrors(newErrors);
                }
              }}
              className={`block w-full rounded-md border ${
                errors.foodType ? 'border-red-500' : 'border-gray-300'
              } px-4 py-3 bg-white`}
            >
              <option value="">Select Food Type</option>
              {foodTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
            {errors.foodType && (
              <p className="mt-1 text-sm text-red-500">{errors.foodType}</p>
            )}
          </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2"><span className="text-red-500">*</span> Spicy Level</label>
            <select
              required
              value={formData.spicyLevel}
              onChange={(e) => {
                setFormData({ ...formData, spicyLevel: e.target.value });
                if (errors.spicyLevel) {
                  const newErrors = { ...errors };
                  delete newErrors.spicyLevel;
                  setErrors(newErrors);
                }
              }}
              className={`block w-full rounded-md border ${
                errors.spicyLevel ? 'border-red-500' : 'border-gray-300'
              } px-4 py-3 bg-white`}
            >
              <option value="">Select Spicy Level</option>
              {spicyLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
            {errors.spicyLevel && (
              <p className="mt-1 text-sm text-red-500">{errors.spicyLevel}</p>
            )}
          </div>
      </div>

      {/* Fourth Row */}
      <div className="grid grid-cols-2 gap-4">
      <div>
  <label className="block text-sm font-medium text-gray-700 mb-2"> <span className="text-red-500">*</span> Rating</label>
  <select
    required
    value={formData.rating}
    onChange={(e) => {
      setFormData({ ...formData, rating: e.target.value });
      if (errors.rating) {
        const newErrors = { ...errors };
        delete newErrors.rating;
        setErrors(newErrors);
      }
    }}
    className={`block w-full rounded-md border ${
      errors.rating ? 'border-red-500' : 'border-gray-300'
    } px-4 py-3 bg-white`}
  >
    <option value="">Select Rating</option>
    {ratingOptions.map((rating) => (
      <option key={rating} value={rating}>
        {rating}
      </option>
    ))}
  </select>
  {errors.rating && (
    <p className="mt-1 text-sm text-red-500">{errors.rating}</p>
  )}
</div>

<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    <span className="text-red-500">*</span> Offer
  </label>
  <input
    type="number"
    value={formData.offer}
    onChange={(e) => {
      // Ensure the value is a non-negative number
      const newValue = e.target.value;
      if (newValue >= 0 || newValue === '') {
        setFormData({ ...formData, offer: newValue });
      }
    }}
    className="block w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
    placeholder="Enter offer details"
  />
</div>


      </div>

      {/* Description and Ingredients */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="block w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter description"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ingredients</label>
          <textarea
            value={formData.ingredients || ''}
            onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
            rows={3}
            className="block w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter ingredients"
          />
        </div>
      </div>
      <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
  Menu Images (Up to 5, Max 3 MB)
</label>
  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 transition-colors">
    <div className="space-y-1 text-center">
      {formData.images.length > 0 ? (
        <div className="grid grid-cols-3 gap-4">
          {formData.images.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={typeof image === 'string' ? image : image.uri}  // Handle both URL and binary
                alt={`Menu Image ${index + 1}`}
                className="h-32 w-32 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
              >
                <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
              </button>
            </div>
          ))}
          {formData.images.length < 5 && (
            <div className="flex items-center justify-center h-32 w-32 border-2 border-dashed border-gray-300 rounded-lg">
              <label className="cursor-pointer">
                <FontAwesomeIcon icon={faUpload} className="h-8 w-8 text-gray-400" />
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="sr-only"
                />
              </label>
            </div>
          )}
        </div>
      ) : (
        <>
          <FontAwesomeIcon icon={faUpload} className="mx-auto h-12 w-12 text-gray-400" />
          <div className="flex text-sm text-gray-600">
            <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
              <span>Upload files</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="sr-only"
              />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
        </>
      )}
    </div>
  </div>
</div>

{/* <div className="">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isSpecial}
                  onChange={toggleSpecialStatus}
                />
                <div
                  className={`relative w-11 h-6 ${
                    isSpecial ? 'bg-blue-600' : 'bg-gray-200'
                  }   rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600`}
                ></div>
                
              </label>
              <p className="text-base font-bold text-gray-900">Special Status:</p>

            </div> */}






      {/* Buttons */}
    <div className="flex justify-between space-x-3">
               <button
                 type="button"
                 onClick={onCancel}
                 disabled={isSubmitting}
                 className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none disabled:opacity-50"
               >
               <FontAwesomeIcon icon={faTimes} className="text-gray-500 mr-1" />  Cancel
               </button>
               <button
                 type="submit"
                 disabled={isSubmitting || Object.keys(errors).length > 0}
                 className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                   ${isSubmitting || Object.keys(errors).length > 0
                     ? 'bg-green-400 cursor-not-allowed'
                     : 'bg-green-600 hover:bg-green-700'
                   } focus:outline-none disabled:opacity-50`}
               >
                <FontAwesomeIcon icon={faSave} className="text-success-500 mr-1" /> 
                {isSubmitting ? 'Saving...' : 'Save'}
               </button>
             </div>
    </form>
  );
}

export default EditMenu;
