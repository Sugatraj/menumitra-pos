import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';

function CategoryForm({ item, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    category_name: '',
    image: [],
    imagePreview: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Validation function for category name
  const isValidCategoryName = (name) => {
    const nameRegex = /^[a-zA-Z\s]+$/; // Only letters and spaces
    return nameRegex.test(name);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.category_name.trim()) {
      newErrors.category_name = 'Category name is required';
    } else if (!isValidCategoryName(formData.category_name)) {
      newErrors.category_name = 'Category name can only contain letters and spaces';
    }

    if (!formData.image) {
      newErrors.image = 'Image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (item) {
      setFormData({
        ...item,
        imagePreview: item.image,
      });
    }
  }, [item]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    
    } catch (error) {
      // Handle error if needed
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          image: file,
          imagePreview: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategoryNameChange = (e) => {
    // Allow only letters and spaces
    const categoryNameRegex = /^[A-Za-z\s]*$/;
    const value = e.target.value;
  
    if (categoryNameRegex.test(value) || value === '') {
      setFormData((prevState) => ({
        ...prevState,
        category_name: value,
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span className="text-red-500">*</span> Category
          </label>
          <input
            type="text"
            value={formData.category_name}
            onChange={handleCategoryNameChange} // Use the new change handler
            className={`block w-full rounded-md border ${
              errors.category_name ? 'border-red-500' : 'border-gray-300'
            } px-4 py-3 focus:border-blue-500 focus:ring-blue-500`}
            placeholder="Enter category name "
          />
          {errors.category_name && (
            <p className="mt-1 text-sm text-red-500">{errors.category_name}</p>
          )}
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
         Category Image
        </label>
        <div 
          className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md"
          onClick={() => document.getElementById('image-upload').click()}
        >
          <div className="space-y-1 text-center">
            {formData.imagePreview ? (
              <img
                src={formData.imagePreview}
                alt="Preview"
                className="mx-auto h-32 w-32 object-cover rounded-md"
              />
            ) : (
              <FontAwesomeIcon icon={faUpload} className="mx-auto h-12 w-12 text-gray-400" />
            )}
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="image-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
              >
                <span>Upload a file</span>
                <input
                  id="image-upload"
                  name="image-upload"
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-between space-x-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faTimes} className="text-gray-500 mr-1" /> 
          Cancel
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

export default CategoryForm;
