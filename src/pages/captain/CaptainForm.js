import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


import { faTimes, faSave,faImage, } from '@fortawesome/free-solid-svg-icons';
function CaptainForm({ item,captain, onSubmit, onCancel }) {
  const user_id = localStorage.getItem("user_id");
  const [formData, setFormData] = useState({
    name: '',
  

    mobile: '',
    aadhar_number: '',
    address: '',
    // phone: '',
    email: '',
    user_id:user_id,
  
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isValid, setIsValid] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);

  // Validation functions
  const isValidName = (name) => {
    const nameRegex = /^[a-zA-Z\s]+$/;
    return nameRegex.test(name);
  };

  const isValidMobile = (mobile) => {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(mobile);
  };

  const isValidAadhar = (aadhar) => {
    const aadharRegex = /^\d{12}$/;
    return aadharRegex.test(aadhar);
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const validateForm = (showAllErrors = false) => {
    const newErrors = {};
    
    if (showAllErrors || touched.name) {
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
      } else if (!isValidName(formData.name)) {
        newErrors.name = 'Name can only contain letters and spaces';
      }
    }

   


    if (showAllErrors || touched.mobile) {
      if (!formData.mobile) {
        newErrors.mobile = 'Mobile number is required';
      } else if (!isValidMobile(formData.mobile)) {
        newErrors.mobile = 'Enter valid 10-digit number starting with 6-9';
      }
    }

    if (showAllErrors || touched.aadhar_number) {
      if (!formData.aadhar_number) {
        newErrors.aadhar_number = 'Aadhar number is required';
      } else if (!isValidAadhar(formData.aadhar_number)) {
        newErrors.aadhar_number = 'Enter valid 12-digit Aadhar number';
      }
    }

    if (showAllErrors || touched.address) {
      if (!formData.address.trim()) {
        newErrors.address = 'Address is required';
      } else if (formData.address.length < 5) {
        newErrors.address = 'Address must be at least 5 characters long';
      }
    }

  

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      setIsValid(validateForm());
    }
  }, [formData, touched]);

  useEffect(() => {
    if (captain) {
      setFormData({
        name: captain.name || '',
      
        
        mobile: captain.mobile || '',
        aadhar_number: captain.aadhar_number || '',
        address: captain.address || '',
        captain_id: captain.user_id || '',
       
        user_id:user_id,
       
      });
    }
  }, [captain]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
  
    if (name === 'photo' || e.target.id === 'image-upload') {
      if (files && files[0]) {
        setSelectedFile(files[0]);
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData((prev) => ({
            ...prev,
            photo: files[0],
            imagePreview: reader.result,
          }));
        };
        reader.readAsDataURL(files[0]);
      }
    } else {
      setTouched((prev) => ({
        ...prev,
        [name]: true,
      }));
  
      let finalValue = value;
  
      switch (name) {
        case 'mobile':
          // Remove non-numeric characters and limit to 10 digits
          finalValue = value.replace(/\D/g, '').slice(0, 10);
  
          // Ensure the first digit is 6-9; otherwise, clear the value
          if (finalValue && !/^[6-9]/.test(finalValue)) {
            finalValue = ''; // Clear the input if invalid
          }
          break;
  
        case 'name':
          finalValue = value.replace(/[^a-zA-Z\s]/g, '');
          break;
  
        case 'aadhar_number':
          finalValue = value.replace(/\D/g, '').slice(0, 12);
          break;
  
     
        default:
          break;
      }
  
      setFormData((prev) => ({
        ...prev,
        [name]: finalValue,
      }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm(true)) {
      return;
    }
  
    try {
      // Prepare data object according to API format
      const requestData = {
        outlet_id: localStorage.getItem('outlet_id'),
        name: formData.name,
        mobile: formData.mobile,
        address: formData.address,
        aadhar_number: formData.aadhar_number
      };
  
      // If updating, add user_id
      if (captain?.user_id) {
        requestData.user_id = captain.user_id;
      }
  
      // Pass the formatted data to parent component
      onSubmit(requestData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };
  
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const getInputDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  };

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    
    try {
      // Parse the date string from "DD Mon YYYY" format
      const [day, month, year] = dateStr.split(' ');
      const months = {
        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
        'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
        'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
      };
      
      // Convert to YYYY-MM-DD format for input
      return `${year}-${months[month]}-${day.padStart(2, '0')}`;
    } catch (error) {
      // If the date is already in YYYY-MM-DD format or invalid
      return dateStr;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload */}
     

      {/* Name */}
      <div className="grid grid-cols-2 gap-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          <span className="text-red-500">*</span> Full Name
        </label>
        <input
          type="text"
          name="name"
          id="name"
          
          value={formData.name}
          onChange={handleChange}
          className={`block w-full rounded-md border ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            } px-4 py-3`}
          placeholder="Enter full name"
        />
        {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
      </div>

      

    

      {/* Mobile Number */}
      <div>
  <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
    <span className="text-red-500">*</span> Mobile Number
  </label>
  <input
    type="tel"
    name="mobile"
    id="mobile"
    value={formData.mobile}
    onChange={handleChange}
    className={`block w-full rounded-md border ${
      errors.mobile ? 'border-red-500' : 'border-gray-300'
    } px-4 py-3`}
    placeholder="Enter mobile number"
    pattern="[6-9][0-9]{9}" // Ensures the first digit is between 6 and 9, followed by 9 more digits
    title="Please enter a valid 10-digit mobile number starting with 6-9"
  />
  {errors.mobile && (
    <p className="mt-1 text-sm text-red-500">{errors.mobile}</p>
  )}
</div>


      {/* Aadhar Number */}
      <div>
        <label htmlFor="aadhar_number" className="block text-sm font-medium text-gray-700">
          <span className="text-red-500">*</span> Aadhar Number
        </label>
        <input
          type="text"
          name="aadhar_number"
          id="aadhar_number"
          
          value={formData.aadhar_number}
          onChange={handleChange}
          className={`block w-full rounded-md border ${
              errors.aadhar_number ? 'border-red-500' : 'border-gray-300'
            } px-4 py-3`}
          placeholder="Enter 12-digit Aadhar number"
          pattern="[0-9]{12}"
          title="Please enter a valid 12-digit Aadhar number"
        />
        {errors.aadhar_number && (
            <p className="mt-1 text-sm text-red-500">{errors.aadhar_number}</p>
          )}
      </div>

      {/* Address */}
      
      </div>
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
          <span className="text-red-500">*</span> Address
        </label>
        <textarea
          name="address"
          id="address"
          
          value={formData.address}
          onChange={handleChange}
          rows="3"
          className="block w-full rounded-md border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
          placeholder="Enter full address"
        />
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
             disabled={!isValid}
             className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
            ${!isValid ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}
          `}
           >
             <FontAwesomeIcon icon={faSave} className="text-success-500 mr-1" />   {item ? 'Save' : 'Save'}
           </button>
         </div>
    </form>
  );
}

export default CaptainForm;
