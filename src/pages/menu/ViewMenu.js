import React, { useState,useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faFire } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

import { useNavigate } from 'react-router-dom';
function ViewMenu({ item, onClose }) {
  const [isSpecial, setIsSpecial] = useState(false);
const navigate = useNavigate();


  // Update state when `item` changes
  useEffect(() => {
    if (item) {
      setIsSpecial(item.is_special);
    }
  }, [item]);

  if (!item) return null;

  const toggleSpecialStatus = async (navigate) => {
    try {
      const accessToken = localStorage.getItem('access'); // Get token
  
      if (!accessToken) {
        console.warn('No access token found, redirecting to login');
        navigate('/login'); // Redirect if token is missing
        return;
      }
  
      const requestData = {
        outlet_id: item.outlet_id.toString(),
        menu_id: item.menu_id.toString(),
      };
  
      const response = await axios.post(
        'https://men4u.xyz/common_api/make_menu_special_non_special',
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
  
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? item.images.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === item.images.length - 1 ? 0 : prevIndex + 1));
  };
  return (
    <div className="col-span-6 transition-all duration-300">
      <div className="bg-white rounded-lg shadow-lg h-full">
        {/* Header Section */}
        <div className="border-b">
          <div className="flex justify-between items-center p-4">
            <h2 className="text-xl font-semibold capitalize text-gray-900">{item.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-6">
          {item.images && item.images.length > 0 && (
  <div className="relative col-span-2 flex flex-wrap justify-start space-x-1">
    {/* Previous Button */}
    <button
      onClick={goToPrevious}
      className="absolute left-0 top-1/2 transform -translate-y-1/2 p-3 bg-gray-700 text-white rounded-full"
      aria-label="Previous Image"
    >
      &#10094;
    </button>

    {/* Slider Wrapper */}
    <div className="w-full overflow-hidden">
      <div
        className="flex transition-transform duration-500"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {item.images.map((imgUrl, index) => (
          <div key={index} className="w-full flex-shrink-0 p-2">
            <img
              src={imgUrl}
              alt={`${item.name} - Image ${index + 1}`}
              className="w-full h-60 object-cover rounded-md shadow-md"
            />
          </div>
        ))}
      </div>
    </div>

    {/* Next Button */}
    <button
      onClick={goToNext}
      className="absolute right-0 top-1/2 transform -translate-y-1/2 p-3 bg-gray-700 text-white rounded-full"
      aria-label="Next Image"
    >
      &#10095;
    </button>
  </div>
)}


            {item.category_name && (
              <div>
                <p className="text-base font-bold text-gray-900 capitalize">{item.category_name}</p>
                <p className="text-sm font-medium text-gray-400">Category</p>
              </div>
            )}

            {item.food_type && (
              <div>
                <span
                  className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                    item.food_type === 'veg'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  } capitalize`}
                >
                  {item.food_type}
                </span>
                <p className="text-sm font-medium text-gray-400">Food Type</p>
              </div>
            )}

            {item.spicy_index > 0 && (
              <div>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: item.spicy_index }).map((_, index) => (
                    <FontAwesomeIcon key={index} icon={faFire} className="text-red-500" />
                  ))}
                </div>
                <p className="text-sm font-medium text-gray-400">Spicy Level</p>
              </div>
            )}

            {item.full_price > 0 && (
              <div>
                <p className="text-base font-bold text-gray-900">₹{item.full_price}</p>
                <p className="text-sm font-medium text-gray-400">Full Price</p>
              </div>
            )}

            {item.half_price > 0 && (
              <div>
                <p className="text-base font-bold text-gray-900">₹{item.half_price}</p>
                <p className="text-sm font-medium text-gray-400">Half Price</p>
              </div>
            )}

            {item.rating > 0 && (
              <div>
                <p className="text-base font-bold text-gray-900">{item.rating}</p>
                <p className="text-sm font-medium text-gray-400">Rating</p>
              </div>
            )}

            {item.offer > 0 && (
              <div>
                <p className="text-base font-bold text-gray-900 capitalize">{item.offer}% Off</p>
                <p className="text-sm font-medium text-gray-400">Offer</p>
              </div>
            )}
             <div className="">
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

            </div>
            {item.created_by && (
              <div>
                <p className="text-base font-bold text-gray-900 capitalize">{item.created_by}</p>
                <p className="text-sm font-medium text-gray-400">Created by</p>
              </div>
            )}

            {item.updated_by  && (
              <div>
                <p className="text-base font-bold text-gray-900 capitalize">{item.updated_by}</p>
                <p className="text-sm font-medium text-gray-400">Updated by</p>
              </div>
            )}
            {item.created_on  && (
              <div>
                <p className="text-base font-bold text-gray-900">{item.created_on}</p>
                <p className="text-sm font-medium text-gray-400">Created on</p>
              </div>
            )}

            {item.updated_on && (
              <div>
                <p className="text-base font-bold text-gray-900">{item.updated_on}</p>
                <p className="text-sm font-medium text-gray-400">Updated on</p>
              </div>
            )}

            {item.ingredients && (
              <div className="col-span-2">
                <p className="text-base font-medium text-gray-900 capitalize">{item.ingredients}</p>
                <p className="text-sm font-medium text-gray-400">Ingredients</p>
              </div>
            )}

            {item.description && (
              <div className="col-span-2">
                <p className="text-base font-medium text-gray-900 capitalize">{item.description}</p>
                <p className="text-sm font-medium text-gray-400">Description</p>
              </div>
            )}
 

           
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewMenu;
