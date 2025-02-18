import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload,faTimes,faSave } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
function CreateMenu({ onSubmit, onCancel }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    fullPrice: "",
    halfPrice: "",
    description: "",
    ingredients: "",
    category: "",
    foodType: "",
    spicyLevel: "",
    offer: "",
    images: [], // Changed to array for multiple images
    imagePreviews: [], // Array of preview URLs
    rating: "",
  });


  const user_id = localStorage.getItem('user_id');
  // Add validation state
  const [errors, setErrors] = useState({
    name: '',
    fullPrice: '',
    halfPrice: '',
    offer: ''
  });

  // Validation functions
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

  const validatePrice = (value, fieldName) => {
    if (value && (isNaN(value) || value < 0)) {
      return `${fieldName} must be a valid positive number`;
    }
    return '';
  };

  const validateOffer = (value) => {
    const offerRegex = /^\d+$/;
    if (value && !offerRegex.test(value)) {
      return 'Offer must contain only numbers';
    }
    return '';
  };

  const validateImage = (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];

    if (!validTypes.includes(file.type)) {
      window.showToast("error", "Only JPG, JPEG & PNG files are allowed");
      return false;
    }

    if (file.size > maxSize) {
      window.showToast("error", "File size should be less than 5MB");
      return false;
    }

    return true;
  };

  // Modified onChange handlers with validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let error = '';
    let processedValue = value;

    switch (name) {
      case 'name':
        // Remove special characters immediately on input
        processedValue = value.replace(/[^a-zA-Z0-9\s]/g, '');
        error = validateMenuName(processedValue);
        break;
      case 'fullPrice':
      case 'halfPrice':
        error = validatePrice(value, name === 'fullPrice' ? 'Full price' : 'Half price');
        break;
      case 'offer':
        error = validateOffer(value);
        break;
      default:
        break;
    }

    setErrors(prev => ({
      ...prev,
      [name]: error
    }));

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const [categories, setCategories] = useState([]);
  const [spicyLevels, setSpicyLevels] = useState([]);
  const [ratingOptions, setRatingOptions] = useState([]);
  const [foodTypes, setFoodTypes] = useState([]);
  const outlet_id = localStorage.getItem('outlet_id');
  // Fetch categories from the API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const accessToken = localStorage.getItem('access'); // Get access token

        if (!accessToken) {
          console.warn('No access token found, redirecting to login');
          navigate('/login'); // Redirect if token is missing
          return;
        }
        const response = await fetch('https://men4u.xyz/common_api/menu_categorys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
           },
          body: JSON.stringify({ outlet_id: outlet_id })
        });
        const data = await response.json();
        if (data.st === 1) {
          const categoryList = Object.entries(data.categorys_list); // Convert object to an array of [name, id] pairs
          setCategories(categoryList); // Store both name and id
        } else {
          console.error('Error fetching categories');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        if (error.response && error.response.status === 401) {
          console.warn('Token expired or invalid, redirecting to login...');
          localStorage.removeItem('access'); // Clear expired token
          navigate('/login'); // Redirect user to login screen
        }
      }
    };

    

    fetchCategories();
  }, []);

  // Fetch spicy levels from the API
  useEffect(() => {
    const fetchSpicyLevels = async () => {
      try {
        const accessToken = localStorage.getItem('access'); // Get access token

        if (!accessToken) {
          console.warn('No access token found, redirecting to login');
          navigate('/login'); // Redirect if token is missing
          return;
        }

        const response = await fetch('https://men4u.xyz/common_api/get_spicy_index_list', {
          method: 'GET', // Use POST if the API requires it
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });        const data = await response.json();
        if (data.st === 1) {
          const levels = Object.keys(data.spicy_index_list); // Extract the spicy levels
          setSpicyLevels(levels);
        } else {
          console.error('Error fetching spicy levels');
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          console.warn('Token expired or invalid, redirecting to login...');
          localStorage.removeItem('access'); // Clear expired token
          navigate('/login'); // Redirect user to login screen
        }
      }
    };

    fetchSpicyLevels();
  }, []);

  // Fetch ratings from the API
  useEffect(() => {
    const fetchRatingOptions = async () => {
      try {
        const accessToken = localStorage.getItem('access'); // Get access token

        if (!accessToken) {
          console.warn('No access token found, redirecting to login');
          navigate('/login'); // Redirect if token is missing
          return;
        }

        const response = await fetch('https://men4u.xyz/common_api/rating_list', {
          method: 'GET', // Use POST if required by the API
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });        const data = await response.json();
        if (data.st === 1) {
          setRatingOptions(Object.keys(data.rating_list)); // Extract ratings
        } else {
          console.error('Error fetching ratings');
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          console.warn('Token expired or invalid, redirecting to login...');
          localStorage.removeItem('access'); // Clear expired token
          navigate('/login'); // Redirect user to login screen
        }
      }
    };

    fetchRatingOptions();
  }, []);

  // Fetch food types from the API
  useEffect(() => {
    const fetchFoodTypes = async () => {
      try {
        const accessToken = localStorage.getItem('access'); // Get access token

        if (!accessToken) {
          console.warn('No access token found, redirecting to login');
          navigate('/login'); // Redirect if token is missing
          return;
        }

        const response = await fetch('https://men4u.xyz/common_api/get_food_type_list', {
          method: 'GET', // Use POST if required by the API
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });
                const data = await response.json();
        if (data.st === 1) {
          setFoodTypes(Object.keys(data.food_type_list)); // Extract food types
        } else {
          console.error('Error fetching food types');
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          console.warn('Token expired or invalid, redirecting to login...');
          localStorage.removeItem('access'); // Clear expired token
          navigate('/login'); // Redirect user to login screen
        }
      }
    };

    fetchFoodTypes();
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).filter(validateImage);
    
    if (formData.images.length + files.length > 5) {
      window.showToast("error", "You can only upload up to 5 images");
      return;
    }

    const newPreviews = files.map(file => URL.createObjectURL(file));
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files],
      imagePreviews: [...prev.imagePreviews, ...newPreviews]
    }));
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(formData.imagePreviews[index]); // Clean up preview URL
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imagePreviews: prev.imagePreviews.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields before submission
    const nameError = validateMenuName(formData.name);
    const fullPriceError = validatePrice(formData.fullPrice, 'Full price');
    const halfPriceError = formData.halfPrice ? validatePrice(formData.halfPrice, 'Half price') : '';
    const offerError = validateOffer(formData.offer);

    setErrors({
      name: nameError,
      fullPrice: fullPriceError,
      halfPrice: halfPriceError,
      offer: offerError
    });

    if (nameError || fullPriceError || halfPriceError || offerError) {
      window.showToast("error", "Please fix the errors before submitting");
      return;
    }

    if (!formData.category) {
      window.showToast("error", "Please select a category");
      return;
    }

    if (!formData.foodType) {
      window.showToast("error", "Please select a food type");
      return;
    }

    if (!formData.spicyLevel) {
      window.showToast("error", "Please select a spicy level");
      return;
    }

    // if (!formData.rating) {
    //   window.showToast("error", "Please select a rating");
    //   return;
    // }
  
    const selectedCategory = categories.find((category) => category[0] === formData.category);
    const categoryId = selectedCategory ? selectedCategory[1] : null;
  
    // Create FormData object for multipart/form-data
    const formDataToSend = new FormData();
    formDataToSend.append('outlet_id', outlet_id);
    formDataToSend.append('user_id', user_id);
    formDataToSend.append('menu_cat_id', categoryId);
    formDataToSend.append('name', formData.name);
    formDataToSend.append('food_type', formData.foodType);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('spicy_index', formData.spicyLevel);
    formDataToSend.append('full_price', formData.fullPrice);
    formDataToSend.append('half_price', formData.halfPrice || 0);
    formDataToSend.append('ingredients', formData.ingredients);
    formDataToSend.append('offer', formData.offer);
    formDataToSend.append('rating', formData.rating);

    // Append images with the exact format expected by the API
    formData.images.forEach((image) => {
      formDataToSend.append('images', image); // Changed from 'images[]' to 'images'
    });
  
    try {
     
      const accessToken = localStorage.getItem('access'); // Get access token

      if (!accessToken) {
        console.warn('No access token found, redirecting to login');
        navigate('/login'); // Redirect if token is missing
        return;
      }

      const response = await fetch("https://men4u.xyz/common_api/menu_create", {
        method: "POST",
        body: formDataToSend,
        headers: {
          Authorization: `Bearer ${accessToken}`, // Add the Bearer token for authentication
        },
      });
  
      
      const data = await response.json();
      
      if (data.st === 1) {
        window.showToast("success", "Menu created successfully!");
        onSubmit(formData);
      } else {
        window.showToast("error", data.msg || "Failed to create menu item");
      }
    } catch (error) {
      console.error("Error creating menu item:", error);
      window.showToast("error", "An error occurred while creating the menu item");
      if (error.response && error.response.status === 401) {
        console.warn('Token expired or invalid, redirecting to login...');
        localStorage.removeItem('access'); // Clear expired token
        navigate('/login'); // Redirect user to login screen
      }
    }
  };

  // Add function to check if form is valid
  const isFormValid = () => {
    return (
      formData.name &&
      formData.fullPrice &&
      formData.category &&
      formData.foodType &&
      formData.spicyLevel &&
      formData.offer &&
      // formData.rating &&
      !errors.name &&
      !errors.fullPrice &&
      !errors.halfPrice &&
      !errors.offer
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {/* First Column */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2"><span className="text-red-500">*</span> Menu Name</label>
            <input
              type="text"
              name="name"
            
              value={formData.name}
              onChange={handleInputChange}
              className={`block w-full rounded-md border ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              } px-4 py-3 focus:border-blue-500 focus:ring-blue-500`}
              placeholder="Enter menu name"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2"><span className="text-red-500">*</span> Full Price (₹)</label>
            <input
              type="number"
              name="fullPrice"
             
              min="0"
             
              value={formData.fullPrice}
              onChange={handleInputChange}
              className={`block w-full rounded-md border ${
                errors.fullPrice ? 'border-red-500' : 'border-gray-300'
              } px-4 py-3 focus:border-blue-500 focus:ring-blue-500`}
              placeholder="Enter full price"
            />
            {errors.fullPrice && (
              <p className="mt-1 text-xs text-red-500">{errors.fullPrice}</p>
            )}
          </div>
         
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2"><span className="text-red-500">*</span> Spicy Level</label>
            <select
              
              value={formData.spicyLevel}
              onChange={(e) => setFormData({ ...formData, spicyLevel: e.target.value })}
              className="block w-full rounded-md border border-gray-300 px-4 py-3 bg-white"
            >
              <option value="">Select Spicy Level</option>
              {spicyLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
          <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    <span className="text-red-500">*</span> Category
  </label>
  <select
    
    value={formData.category}
    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
    className="block w-full rounded-md border border-gray-300 px-4 py-3 bg-white"
  >
    <option value="">Select category</option>
    {categories.map(([categoryName, categoryId]) => (
      <option key={categoryId} value={categoryName}>
        {categoryName}
      </option>
    ))}
  </select>
</div>

        </div>

        {/* Second Column */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2"><span className="text-red-500">*</span> Food Type</label>
            <select
            
              value={formData.foodType}
              onChange={(e) => setFormData({ ...formData, foodType: e.target.value })}
              className="block w-full rounded-md border border-gray-300 px-4 py-3 bg-white"
            >
              <option value="">Select Food Type</option>
              {foodTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2"> Half Price (₹)</label>
            <input
              type="number"
              name="halfPrice"
              min="0"
             
              value={formData.halfPrice}
              onChange={handleInputChange}
              className={`block w-full rounded-md border ${
                errors.halfPrice ? 'border-red-500' : 'border-gray-300'
              } px-4 py-3 focus:border-blue-500 focus:ring-blue-500`}
              placeholder="Enter half price (optional)"
            />
            {errors.halfPrice && (
              <p className="mt-1 text-xs text-red-500">{errors.halfPrice}</p>
            )}
          </div>

          <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    <span className="text-red-500">*</span> Offer
  </label>
  <input
    type="number"
    name="offer"
    value={formData.offer}
    onChange={(e) => {
      const value = e.target.value;

      // Only update if the value is non-negative
      if (value >= 0 || value === '') {
        handleInputChange(e);  // Call your original handleInputChange function
      }
    }}
    className={`block w-full rounded-md border ${
      errors.offer ? 'border-red-500' : 'border-gray-300'
    } px-4 py-3 focus:border-blue-500 focus:ring-blue-500`}
    placeholder="Enter offer"
  />
  {errors.offer && (
    <p className="mt-1 text-xs text-red-500">{errors.offer}</p>
  )}
</div>


          <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
  <select
   
    value={formData.rating}
    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
    className="block w-full rounded-md border border-gray-300 px-4 py-3 bg-white"
  >
    <option value="">Select Rating</option>
    {ratingOptions.map((rating) => (
      <option key={rating} value={rating}>
        {rating}
      </option>
    ))}
  </select>
</div>

        </div>
      </div>

      {/* Image Upload */}
   

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2"> Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="block w-full rounded-md border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter menu description"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2"> Ingredients</label>
          <textarea
            value={formData.ingredients}
            onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
            rows={4}
            className="block w-full rounded-md border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter ingredients"
          />
        </div>
      </div>
      <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
  Menu Images (Up to 5, Max 5 MB)
</label>
        <div className="mt-1 flex flex-wrap gap-4">
          {/* Image previews */}
          {formData.imagePreviews.map((preview, index) => (
            <div key={index} className="relative">
              <img 
                src={preview} 
                alt={`Preview ${index + 1}`} 
                className="h-40 w-40 object-cover rounded-md"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute h-8 w-8 top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
              </button>
            </div>
          ))}
          
          {/* Upload button */}
          {formData.images.length < 5 && (
            <label className="h-40 w-40 flex items-center justify-center border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-gray-400">
              <div className="space-y-1 text-center">
                <FontAwesomeIcon icon={faUpload} className="h-12 w-12 text-gray-500" />
                <p className="text-xs text-gray-500">Click to upload</p>
                <p className="text-xs text-gray-500">({5 - formData.images.length} remaining)</p>
              </div>
              <input
                type="file"
                onChange={handleImageChange}
                accept="image/*"
                className="sr-only"
                multiple
              />
            </label>
          )}
        </div>
      </div>

        <div className="flex justify-between space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none "
              >
              <FontAwesomeIcon icon={faTimes} className="text-gray-500 mr-1" />  Cancel
              </button>
              <button
                type="submit"
                disabled={!isFormValid()}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
                  ${isFormValid() 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-green-400 cursor-not-allowed'} 
                  focus:outline-none`}
              >
               <FontAwesomeIcon icon={faSave} className="text-success-500 mr-1" />   Save
              </button>
            </div>
    </form>
  );
}

export default CreateMenu;
