import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';

function UpdateCategory({ category, item, onSubmit, onCancel, onClose }) {
  const [formData, setFormData] = useState({
    category_name: '',
    image: null,
    imagePreview: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (category) {
      setFormData({
        category_name: category.name,
        image: null, // Reset image for uploading a new one
        imagePreview: category.image, // Existing image URL
      });
    }
  }, [category]);

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
  
  const validate = () => {
    const errors = {};
    const categoryNameRegex = /^[A-Za-z\s]+$/;  // Allows only letters and spaces
  
    if (!formData.category_name) {
      errors.category_name = 'Category name is required';
    } else if (!categoryNameRegex.test(formData.category_name)) {
      errors.category_name = 'Category name can only contain letters and spaces';
    }
  
    return errors;
  };
  
  

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsSubmitting(true);
    onSubmit({
      category_name: formData.category_name,
      image: formData.image, // Actual file object
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prevState) => ({
          ...prevState,
          image: file, // New image file
          imagePreview: reader.result, // Preview URL
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
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
  required
  value={formData.category_name}
  onChange={handleCategoryNameChange} // Use the new change handler
  className="block w-full rounded-md border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
  placeholder="Enter category"
/>

          {errors.category_name && (
            <p className="text-red-500 text-xs mt-1">{errors.category_name}</p>
          )}
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
           Category Image
        </label>
        <div
          className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer"
          onClick={() => document.getElementById('image-upload').click()} // Trigger file input click
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
                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
              >
                {/* <span>Upload a file</span> */}
              </label>
              <input
                id="image-upload"
                name="image-upload"
                type="file"
                className="sr-only"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>
        {errors.image && (
          <p className="text-red-500 text-xs mt-1">{errors.image}</p>
        )}
      </div>

      <div className="flex justify-between space-x-3">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
                  <FontAwesomeIcon icon={faTimes} className="text-gray-500 mr-1" />  Cancel
               
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none"
          disabled={isSubmitting}
        >
          <FontAwesomeIcon icon={faSave} className="text-success-500 mr-1" /> {item ? 'Save ' : 'Save'}
        </button>
      </div>
    </form>
  );
}

export default UpdateCategory;