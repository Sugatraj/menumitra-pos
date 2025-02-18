import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios to make API requests
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes,faSave } from '@fortawesome/free-solid-svg-icons';

function EditSupplier({ item, onSubmit, onCancel }) {
  const outlet_id = localStorage.getItem('outlet_id');
  const [formData, setFormData] = useState({
    name: '',
    supplier_status: '',
    credit_rating: '',
    credit_limit: '',
    location: '',
    owner_name: '',
    website: '',
    mobile_number1: '',
    mobile_number2: '',
    address: '',
  });

  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [creditRatingChoices, setCreditRatingChoices] = useState({});
  const [supplierStatusChoices, setSupplierStatusChoices] = useState({});
  const [touched, setTouched] = useState({});

  // Validation rules
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
      // case 'owner_name':
        if (!value.trim()) return 'This field is required';
        if (!/^[a-zA-Z\s]+$/.test(value)) {
          return 'Only alphabets and spaces allowed';
        }
        if (value.trim().length < 2) {
          return 'Must be at least 2 characters';
        }
        return '';
  
      case 'mobile_number1':
      case 'mobile_number2':
        if (name === 'mobile_number1' && !value) {
          return 'Mobile number is required';
        }
        if (value) {
          if (!/^[6-9]\d{9}$/.test(value)) {
            return 'Mobile number must start with 6-9 and have 10 digits';
          }
        }
        return '';
  
      case 'credit_limit':
        if (value === '') {
          return '';
        }
        if (isNaN(value) || Number(value) < 0) {
          return 'Please enter a valid positive number';
        }
        return '';
  
        case 'website':
          if (
            value &&
            !/^(https?:\/\/)?(www\.)?[a-z0-9-]+(\.[a-z]{2,6})+([\/\w .-]*)*\/?$/i.test(value)
          ) {
            return 'Please enter a valid website URL';
          }
        
        
        return '';
  
        // case 'location':
        //   // Location should not contain digits or special characters
        //   if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
        //     return 'Location should only contain letters and spaces';
        //   }
        //   // If the value is empty after trimming, show a "required" error
        //   return value.trim() ? '' : 'This field is required';
        
        case 'address':
          // Address must be between 5 and 200 characters
          if (value.trim().length < 5) {
            return 'Address must be at least 5 characters long';
          }
          if (value.trim().length > 200) {
            return 'Address cannot exceed 200 characters';
          }
          return value.trim() ? '' : 'This field is required';
        
      default:
        return '';
    }
  };
  

  // Validate entire form
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Validate required fields
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.supplier_status) newErrors.supplier_status = 'Status is required';
    if (!formData.credit_rating) newErrors.credit_rating = 'Credit rating is required';
    if (!formData.credit_limit) newErrors.credit_limit = 'Credit limit is required';
//if (!formData.location) newErrors.location = 'Location is required';
   // if (!formData.owner_name) newErrors.owner_name = 'Owner name is required';
    if (!formData.mobile_number1) newErrors.mobile_number1 = 'Mobile number is required';
    if (!formData.address) newErrors.address = 'Address is required';

    // Validate field formats
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setIsFormValid(isValid && Object.keys(newErrors).length === 0);
    return isValid;
  };

  // Handle input changes with validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    // Apply input restrictions based on field
    switch (name) {
      case 'name':
      case 'owner_name':
        // Only allow letters and spaces, remove any other characters immediately
        finalValue = value.replace(/[^a-zA-Z\s]/g, '');
        break;
      
      case 'mobile_number1':
      case 'mobile_number2':
        // Only allow numbers and handle the 6-9 start restriction
        const numbersOnly = value.replace(/\D/g, '');
        if (numbersOnly.length > 0) {
          const firstDigit = parseInt(numbersOnly[0]);
          if (firstDigit >= 6 && firstDigit <= 9) {
            finalValue = numbersOnly.slice(0, 10);
          } else {
            // If first digit is not 6-9, don't update the value
            finalValue = formData[name];
          }
        } else {
          finalValue = numbersOnly;
        }
        break;

      case 'credit_limit':
        finalValue = value.replace(/[^\d]/g, '');
        break;
      
      default:
        finalValue = value;
        break;
    }

    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));

    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    const fieldError = validateField(name, finalValue);
    setErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));
  };

  // Add blur handler to mark fields as touched
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  useEffect(() => {
    const accessToken = localStorage.getItem("access"); // Retrieve access token
  
    // Check if token exists, else redirect to login
    if (!accessToken) {
      navigate("/login"); // Redirect if token is missing

      return;
    }
  
    // Fetch credit rating choices
    axios
      .get('https://men4u.xyz/common_api/supplier_credit_rating_choices', {
        headers: {
          'Authorization': `Bearer ${accessToken}`, // Add Authorization header with token
        },
      })
      .then(response => {
        if (response.data.st === 1) {
          setCreditRatingChoices(response.data.credit_rating_choices);
        } else {
          console.error("Failed to fetch credit rating choices:", response.data.msg);
        }
      })
      .catch(error => {
        // If the error is a 401, redirect to login
        if (error.response && error.response.status === 401) {
          navigate("/login"); // Redirect if token is missing

        } else {
          console.error("Error fetching credit rating choices:", error);
        }
      });
  
    // Fetch supplier status choices
    axios
      .get('https://men4u.xyz/common_api/supplier_status_choices', {
        headers: {
          'Authorization': `Bearer ${accessToken}`, // Add Authorization header with token
        },
      })
      .then(response => {
        if (response.data.st === 1) {
          setSupplierStatusChoices(response.data.supplier_status_choices);
        } else {
          console.error("Failed to fetch supplier status choices:", response.data.msg);
        }
      })
      .catch(error => {
        // If the error is a 401, redirect to login
        if (error.response && error.response.status === 401) {
          navigate("/login"); // Redirect if token is missing

        } else {
          console.error("Error fetching supplier status choices:", error);
        }
      });
  
    // Set form data if item exists
    if (item) {
      setFormData(item);
    }
  }, [item]);
  

  // Validate form when data changes
  useEffect(() => {
    validateForm();
  }, [formData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const submissionData = {
        ...formData,
        credit_limit: formData.credit_limit === '' ? 0 : Number(formData.credit_limit)
      };
      onSubmit(submissionData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span className="text-red-500">*</span> Name
          </label>
          <input
            type="text"
            required
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={`block capitalize w-full rounded-md border ${
              touched.name && errors.name ? 'border-red-500' : 'border-gray-300'
            } px-4 py-3 focus:border-blue-500 focus:ring-blue-500`}
            placeholder="Enter supplier name"
          />
          {touched.name && errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span className="text-red-500">*</span> Status
          </label>
          <select
            name="supplier_status"
            value={formData.supplier_status}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={`block w-full rounded-md border ${
              touched.supplier_status && errors.supplier_status ? 'border-red-500' : 'border-gray-300'
            } px-4 py-3 bg-white`}
          >
            <option value="">Select Status</option>
            {Object.keys(supplierStatusChoices).map((key) => (
              <option key={key} value={key}>
                {supplierStatusChoices[key].charAt(0).toUpperCase() + supplierStatusChoices[key].slice(1)}
              </option>
            ))}
          </select>
          {touched.supplier_status && errors.supplier_status && (
            <p className="text-red-500 text-xs mt-1">{errors.supplier_status}</p>
          )}
        </div>

        {/* Credit Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span className="text-red-500">*</span> Credit Rating
          </label>
          <select
            value={formData.credit_rating}
            onChange={(e) => setFormData({ ...formData, credit_rating: e.target.value })}
            className="block w-full rounded-md border border-gray-300 px-4 py-3 bg-white"
          >
            {Object.keys(creditRatingChoices).map((key) => (
              <option key={key} value={key}>
                {creditRatingChoices[key].charAt(0).toUpperCase() + creditRatingChoices[key].slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Credit Limit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span className="text-red-500">*</span> Credit Limit
          </label>
          <input
            type="number"
            name="credit_limit"
            min="0"
            value={formData.credit_limit}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={`block w-full rounded-md border ${
              touched.credit_limit && errors.credit_limit ? 'border-red-500' : 'border-gray-300'
            } px-4 py-3 focus:border-blue-500 focus:ring-blue-500`}
            placeholder="Enter credit limit"
          />
          {touched.credit_limit && errors.credit_limit && (
            <p className="text-red-500 text-xs mt-1">{errors.credit_limit}</p>
          )}
        </div>

        {/* Location */}
        <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
  Location
  </label>
  <input
    type="text"
    value={formData.location}
    onChange={(e) => {
      const sanitizedValue = e.target.value.replace(/[^a-zA-Z\s]/g, ''); // Remove digits and special characters
      setFormData({ ...formData, location: sanitizedValue });
    }}
    className="block w-full capitalize rounded-md border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
    placeholder="Enter location"
  />
</div>


        {/* Owner Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
             Owner Name
          </label>
          <input
            type="text"
            name="owner_name"
            value={formData.owner_name}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={`block w-full rounded-md capitalize border ${
              touched.owner_name && errors.owner_name ? 'border-red-500' : 'border-gray-300'
            } px-4 py-3 focus:border-blue-500 focus:ring-blue-500`}
            placeholder="Enter owner name"
          />
          {touched.owner_name && errors.owner_name && (
            <p className="text-red-500 text-xs mt-1">{errors.owner_name}</p>
          )}
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
        Website
          </label>
          <input
            type="text"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            className="block w-full  rounded-md border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter website URL"
          />
        </div>

        {/* Mobile 1 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span className="text-red-500">*</span> Mobile Number
          </label>
          <input
            type="text"
            required
            name="mobile_number1"
            maxLength={10}
            value={formData.mobile_number1}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onKeyPress={(e) => {
              // Prevent typing if first digit is 0-5
              if (formData.mobile_number1.length === 0 && ['0','1','2','3','4','5'].includes(e.key)) {
                e.preventDefault();
              }
            }}
            className={`block w-full rounded-md border ${
              touched.mobile_number1 && errors.mobile_number1 ? 'border-red-500' : 'border-gray-300'
            } px-4 py-3 focus:border-blue-500 focus:ring-blue-500`}
            placeholder="Enter mobile number"
          />
          {touched.mobile_number1 && errors.mobile_number1 && (
            <p className="text-red-500 text-xs mt-1">{errors.mobile_number1}</p>
          )}
        </div>

        {/* Mobile 2 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Alternative Mobile Number
          </label>
          <input
            type="text"
            name="mobile_number2"
            maxLength={10}
            value={formData.mobile_number2}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onKeyPress={(e) => {
              // Prevent typing if first digit is 0-5
              if (formData.mobile_number2.length === 0 && ['0','1','2','3','4','5'].includes(e.key)) {
                e.preventDefault();
              }
            }}
            className={`block w-full rounded-md border ${
              touched.mobile_number2 && errors.mobile_number2 ? 'border-red-500' : 'border-gray-300'
            } px-4 py-3 focus:border-blue-500 focus:ring-blue-500`}
            placeholder="Enter mobile number"
          />
          {touched.mobile_number2 && errors.mobile_number2 && (
            <p className="text-red-500 text-xs mt-1">{errors.mobile_number2}</p>
          )}
        </div>
      </div>

      {/* Address */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
        <span className="text-red-500">*</span> Address
        </label>
        <textarea
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="block w-full capitalize rounded-md border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
          rows="4"
          placeholder="Enter address"
        ></textarea>
      </div>

      {/* Form Buttons */}
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
          disabled={!isFormValid}
          className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            isFormValid ? 'bg-green-600 hover:bg-green-700' : 'bg-green-400 cursor-not-allowed'
          } focus:outline-none`}
        >
         <FontAwesomeIcon icon={faSave} className="text-success-500 mr-1" />   {item ? 'Save' : 'Save'}
        </button>
      </div>
    </form>
  );
}

export default EditSupplier;
