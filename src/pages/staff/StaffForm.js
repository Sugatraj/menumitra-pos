import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


import { faTimes, faSave,faImage, } from '@fortawesome/free-solid-svg-icons';
function StaffForm({ item,staff, onSubmit, onCancel }) {
  const user_id = localStorage.getItem("user_id");
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    dob: '',
    mobile: '',
    aadhar_number: '',
    address: '',
    phone: '',
    email: '',
    user_id:user_id,
    photo: '',
    imagePreview: null
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isValid, setIsValid] = useState(false);
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

    if (showAllErrors || touched.role) {
      if (!formData.role) {
        newErrors.role = 'Role is required';
      }
    }

    if (showAllErrors || touched.dob) {
      if (!formData.dob) {
        newErrors.dob = 'Date of birth is required';
      } else {
        const dobDate = new Date(formData.dob);
        const today = new Date();
        const age = today.getFullYear() - dobDate.getFullYear();
        if (age < 18) {
          newErrors.dob = 'Must be at least 18 years old';
        } else if (age > 70) {
          newErrors.dob = 'Age cannot be more than 70 years';
        }
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
      } else if (formData.address.length > 100) {
        newErrors.address = 'Address cannot be more than 100 characters';
      }
    }

    // Remove photo validation
    // if (showAllErrors || touched.photo) {
    //   if (!formData.photo) {
    //     newErrors.photo = 'Photo is required';
    //   }
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      setIsValid(validateForm());
    }
  }, [formData, touched]);

  useEffect(() => {
    if (staff) {
      setFormData({
        name: staff.name || '',
        role: staff.role || '',
        dob: staff.dob || '',
        mobile: staff.mobile || '',
        aadhar_number: staff.aadhar_number || '',
        address: staff.address || '',
        staff_id: staff.staff_id || '',
        photo: staff.photo || '',
        user_id:user_id,
        imagePreview: staff.photo || null
      });
    }
  }, [staff]);

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
  
        case 'dob':
          const date = new Date(value);
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          finalValue = `${String(date.getDate()).padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()}`;
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
    
    try {
      const formDataToSend = new FormData();
      
      // Add all form fields except imagePreview
      Object.keys(formData).forEach(key => {
        if (key !== 'imagePreview') {
          if (key === 'photo' && selectedFile) {
            formDataToSend.append('photo', selectedFile);
          } else if (key !== 'photo') {
            formDataToSend.append(key, formData[key]);
          }
        }
      });

      // Add staff_id if it exists (for update)
      if (staff?.staff_id) {
        formDataToSend.append('staff_id', staff.staff_id);
      }

      // Format date before sending
      if (formData.dob) {
        const formattedDate = formatDate(formData.dob);
        formDataToSend.set('dob', formattedDate);
      }

      // Add outlet_id
      const outlet_id = localStorage.getItem('outlet_id');
      if (outlet_id) {
        formDataToSend.append('outlet_id', outlet_id);
      }

      onSubmit(formDataToSend);
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
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Staff Photo
        </label>
        {/* Remove the error message for photo */}
        <div className="flex items-center space-x-4">
          <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300">
            {formData.imagePreview ? (
              <img
                src={formData.imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              
              <div className="flex items-center justify-center w-full h-full text-gray-400">
                <FontAwesomeIcon icon={faImage} size="2x" />
              </div>
            )}
          </div>
          <div>
            <input
              type="file"
              id="image-upload"
              name="photo"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              Choose Photo
            </label>
            {!formData.imagePreview && (
              <p className="text-xs text-gray-500 mt-1">No image chosen</p>
            )}
          </div>
        </div>
      </div>

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

      {/* Role */}
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
          <span className="text-red-500">*</span> Role
        </label>
        <select
          name="role"
          id="role"
        
          value={formData.role}
          onChange={handleChange}
          className="block w-full rounded-md border border-gray-300 px-4 py-3 bg-white"
        >
          <option value="">Select role</option>
         
          <option value="receptionist">Receptionist</option>
       
          <option value="cleaner">Cleaner</option>
       
       
        </select>
      </div>

      {/* Date of Birth */}
      <div>
        <label htmlFor="dob" className="block text-sm font-medium text-gray-700">
          <span className="text-red-500">*</span> Date of Birth
        </label>
        <div className="relative">
        
          <input
            type="date"
            name="dob"
            id="dob"
            value={formatDateForInput(formData.dob)}
            onChange={handleChange}
            className="block w-full rounded-md border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
            max={new Date().toISOString().split('T')[0]}
          />
         
        </div>
        {errors.dob && (
          <p className="mt-1 text-sm text-red-500">{errors.dob}</p>
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
    onChange={(e) => {
      handleChange(e); // Handle input change
      if (!formData.address.trim()) {
        setTouched({ ...touched, address: true });
      }
    }}
    onBlur={() => setTouched({ ...touched, address: true })}  // Trigger touched on blur
    rows="3"
    className="block w-full rounded-md border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
    placeholder="Enter full address"
  />
  {touched.address && errors.address && (
    <p className="mt-1 text-sm text-red-500">{errors.address}</p>
  )}
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

export default StaffForm;
