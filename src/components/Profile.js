import React, { useEffect, useState } from 'react';
import Footer from './Footer';
import Header from './Header';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSave, faEdit,faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from 'react-tooltip';
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [dob, setDob] = useState('');
  const [isEditMode, setIsEditMode] = useState(false); // State for side panel
  const user_id = localStorage.getItem('user_id');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    mobile_number: false,
    dob: false
  });
  
  const navigate = useNavigate();
  const handleBackClick = () => { 
      navigate(-1);
    }

  useEffect(() => {
    const fetchProfileData = async () => {
      // Retrieve access token
      const accessToken = localStorage.getItem("access");
  
      // If no token is found, redirect to login
      if (!accessToken) {
        console.error('No access token found');
        navigate("/login"); // Redirect if token is missing
        return;
      }
  
      try {
        const response = await fetch('https://menusmitra.xyz/common_api/view_profile_detail', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`, // Include token for authorization
          },
          body: JSON.stringify({ user_id: user_id }), // Send user_id as part of the request
        });
  
        if (response.status === 401) {
          // Unauthorized, possibly due to invalid/expired token
          console.error('Unauthorized access - redirecting to login');
          localStorage.removeItem('access');  // Optionally remove the expired token
          navigate("/login"); // Redirect if token is missing
          return;
        }
  
        const data = await response.json();
  
        if (data.st === 1) {
          setProfile(data.Data);
          setName(data.Data.name);
          setEmail(data.Data.email);
          setMobileNumber(data.Data.mobile_number);
  
          // Convert API date format to HTML date input format
          if (data.Data.dob) {
            const [day, month, year] = data.Data.dob.split(' ');
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const monthIndex = months.indexOf(month);
            const formattedDate = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${day}`;
            setDob(formattedDate);
          }
        } else {
          console.error('Failed to fetch profile data:', data.msg);
          window.showToast?.("error", data.msg || "Failed to fetch profile data");
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        window.showToast?.("error", "Error fetching profile. Please try again.");
      }
    };
  
    fetchProfileData();
  }, [user_id]);  // Re-fetch profile data if user_id changes
  

  const formatDateForAPI = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateMobileNumber = (number) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(number);
  };

  const validateField = (field, value) => {
    const newErrors = { ...errors };
    const trimmedValue = (value || "").trim(); // Fallback to an empty string if value is null or undefined
  
    switch (field) {
      case 'name':
        if (!trimmedValue) {
          newErrors.name = 'Name is required';
        } else if (trimmedValue.length < 2) {
          newErrors.name = 'Name must be at least 2 characters';
        } else {
          delete newErrors.name;
        }
        break;
  
      case 'email':
        if (!trimmedValue) {
          newErrors.email = 'Email is required';
        } else if (!validateEmail(trimmedValue)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;
  
      case 'mobile_number':
        if (!trimmedValue) {
          newErrors.mobile_number = 'Mobile number is required';
        } else if (!validateMobileNumber(trimmedValue)) {
          newErrors.mobile_number = 'Please enter a valid 10-digit mobile number';
        } else {
          delete newErrors.mobile_number;
        }
        break;
  
      case 'dob':
        if (!value) {
          newErrors.dob = 'Date of birth is required';
        } else {
          delete newErrors.dob;
        }
        break;
    }
  
    setErrors(newErrors);
  };
  

  const handleUpdate = async () => {
    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      mobile_number: true,
      dob: true
    });
  
    // Validate all fields
    validateField('name', name);
    validateField('email', email);
    validateField('mobile_number', mobileNumber);
    validateField('dob', dob);
  
    // Check if there are any errors
    if (Object.keys(errors).length > 0) {
      return;
    }
  
    // Retrieve access token from localStorage
    const accessToken = localStorage.getItem("access");
  
    if (!accessToken) {
      console.error("No access token found");
      navigate("/login"); // Redirect if token is missing
      return;
    }
  
    try {
      const formattedDob = formatDateForAPI(dob);
  
      const response = await fetch('https://menusmitra.xyz/common_api/update_profile_detail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`, // Add Authorization header with token
        },
        body: JSON.stringify({
          user_id: user_id,
          name,
          dob: formattedDob, // Send formatted date
          email,
          mobile_number: mobileNumber,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok && data.st === 1) {
        setProfile({ ...profile, name, email, mobile_number: mobileNumber, dob });
        setIsEditMode(false); // Close the side panel
        window.showToast?.("success", data.msg || "Profile updated successfully");
      } else {
        // Handle error response with a backend-provided message
        window.showToast?.("error", data.msg || "Failed to update profile");
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      window.showToast?.("error", "Something went wrong. Please try again later.");
      
      // Redirect to login on 401 error
      if (error.response && error.response.status === 401) {
        console.error("Unauthorized access, redirecting to login.");
        navigate("/login"); // Redirect if token is missing
      }
    }
  };
  

  const handleOutsideClick = (e) => {
    if (e.target.id === 'modal-background') {
      setIsModalOpen(false); // Close modal if clicked outside
    }
  };

  // Safe check to ensure profile is not null and has 'dob' field
  const formattedDob = profile ? new Date(profile.dob).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }) : '';

  const handleNameChange = (e) => {
    const value = e.target.value;
    // Only allow letters and spaces
    if (value === '' || /^[a-zA-Z\s]*$/.test(value)) {
      setName(value);
      if (touched.name) {
        validateField('name', value);
      }
    }
  };

  const handleMobileChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and handle the 6-9 start restriction
    if (value === '' || (/^[6-9]\d*$/.test(value) && value.length <= 10)) {
      setMobileNumber(value);
      if (touched.mobile_number) {
        validateField('mobile_number', value);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
    <Header />
  
    <div className="container mx-auto px-4 py-8 mb-40">
    <div className="flex items-center mb-3">
                      <button
                        onClick={handleBackClick}
                        className="text-gray-500 w-8 h-8 rounded-full mr-3 hover:bg-gray-200"
                        data-tooltip-id="tooltip-back"
                        data-tooltip-content="Back"
                        data-tooltip-place='bottom'
                      >
                        <FontAwesomeIcon icon={faArrowLeft} />
                      </button>
          <h1 className="text-2xl font-semibold text-gray-800 w-1/4">My Profile</h1>
          </div>      
      <div className="flex flex-wrap -mx-4">
        {/* Profile Section */}
        <div className={`w-full md:w-1/1 px-2 ${isEditMode ? 'md:w-1/2' : ''}`}>
          <div className="bg-white shadow-lg rounded-lg p-4 transition-all duration-300">
            <div className="flex justify-between items-center ">
              <h2 className="text-2xl font-semibold"></h2>
              <button
                className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                data-tooltip-id="tooltip-update"
                data-tooltip-content="Update"
                onClick={() => setIsEditMode(true)}
              >
                <FontAwesomeIcon icon={faEdit} className="text-md" />
              </button>
            </div>
  
            <div className={`grid  gap-4 ${isEditMode ? 'grid-cols-2':'grid-cols-4'}`}>
              <div>
               
                <span className="text-gray-700 font-medium capitalize">{profile?.name || 'Loading...'}</span>
                <span className="block text-gray-500">Name</span>
              </div>
           
              {profile?.email && (
  <div>
    <span className="text-gray-700 font-medium">{profile.email}</span>
    <span className="block text-gray-500">Email</span>
  </div>
)}

              
              <div>
                
                <span className="text-gray-700 font-medium">{profile?.mobile_number || 'Loading...'}</span>
                <span className="block text-gray-500">Mobile Number</span>
              </div>
              <div>
                <span className="text-gray-700 font-medium">{formattedDob || 'Loading...'}</span>
                <span className="block text-gray-500">Date of Birth</span>

              </div>
              {profile?.created_on && (
  <div>
    <span className="text-gray-700 font-medium">{profile.created_on}</span>
    <span className="block text-gray-500">Created on</span>
  </div>
)}
          {profile?.updated_on && (
  <div>
    <span className="text-gray-700 font-medium">{profile.updated_on}</span>
    <span className="block text-gray-500">Updated on</span>
  </div>
)}
          {profile?.created_by && (
  <div>
    <span className="text-gray-700 font-medium">{profile.created_by}</span>
    <span className="block text-gray-500">Created by</span>
  </div>
)}
          {profile?.updated_by && (
  <div>
    <span className="text-gray-700 font-medium">{profile.updated_by}</span>
    <span className="block text-gray-500">Updated by</span>
  </div>
)}
            </div>
          </div>
        </div>
  
        {/* Update Profile Side Panel */}
        {isEditMode && (
          <div className="w-full md:w-1/2 px-4">
            <div className="bg-white shadow-lg p-8 rounded-lg transition-all duration-300">
              <h3 className="text-xl font-semibold mb-4">Update Profile</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={handleNameChange}
                    onBlur={() => {
                      setTouched(prev => ({ ...prev, name: true }));
                      validateField('name', name);
                    }}
                    className={`mt-1 p-2 w-full border ${
                      touched.name && errors.name ? 'border-red-500' : 'border-gray-300'
                    } rounded-md`}
                  />
                  {touched.name && errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (touched.email) {
                        validateField('email', e.target.value);
                      }
                    }}
                    onBlur={() => {
                      setTouched(prev => ({ ...prev, email: true }));
                      validateField('email', email);
                    }}
                    className={`mt-1 p-2 w-full border ${
                      touched.email && errors.email ? 'border-red-500' : 'border-gray-300'
                    } rounded-md`}
                  />
                  {touched.email && errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={mobileNumber}
                    onChange={handleMobileChange}
                    onBlur={() => {
                      setTouched(prev => ({ ...prev, mobile_number: true }));
                      validateField('mobile_number', mobileNumber);
                    }}
                    className={`mt-1 p-2 w-full border ${
                      touched.mobile_number && errors.mobile_number ? 'border-red-500' : 'border-gray-300'
                    } rounded-md`}
                  />
                  {touched.mobile_number && errors.mobile_number && (
                    <p className="mt-1 text-sm text-red-500">{errors.mobile_number}</p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div className="flex justify-between">
                <button
                  onClick={() => setIsEditMode(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none "
                  >
                  <FontAwesomeIcon icon={faTimes} className="mr-2" />
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={Object.keys(errors).length > 0}
                  className={`px-4 py-2 text-white rounded-md ${
                    Object.keys(errors).length > 0
                      ? 'bg-green-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  <FontAwesomeIcon icon={faSave} className="mr-2" />
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  
    <Tooltip id="tooltip-update" />
    <Tooltip id="tooltip-back" />
    <Footer  />
  </div>

  );
};

export default Profile;
