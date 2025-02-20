import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faPlus,
  faEdit,
  faTrash,
  faTimes,
  faSave,
  faGear,
  faExclamationTriangle,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import Header from '../../components/Header';
import { Tooltip } from 'react-tooltip';
import Footer from '../../components/Footer';
import axios from 'axios';
function RestaurantSections() {
  const outlet_id = localStorage.getItem('outlet_id');
const [showIcons, setShowIcons] = useState(false); 
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [newSection, setNewSection] = useState({ name: '' });
  const [isValid, setIsValid] = useState(false);
  const [errors, setErrors] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState(null);
  const [sectionData, setSectionData] = useState([]);
  const [touched, setTouched] = useState(false);
  const filteredSections = sectionData.filter((section) =>
    section.section_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const isValidSectionName = (name) => {
    const nameRegex = /^[a-zA-Z\s]+$/; // Only letters and spaces
    return nameRegex.test(name);
  };

  const validateForm = () => {
    const newErrors = {};
    
    // if (touched) {
    //   if (!newSection.name.trim()) {
    //     newErrors.name = 'Section name is required';
    //   } else if (!isValidSectionName(newSection.name)) {
    //     newErrors.name = 'Section name can only contain letters and spaces';
    //   }
    // }
    
    if (touched) {
      // Check if section name is required
      if (!newSection.name.trim()) {
        newErrors.name = 'Section name is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (touched) {
      setIsValid(validateForm());
    }
  }, [newSection.name, touched]);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const accessToken = localStorage.getItem('access'); // Get access token
  
      if (!accessToken) {
        console.warn('No access token found, redirecting to login');
        navigate('/login'); // Redirect if token is missing
        return;
      }
  
      const response = await axios.post(
        'https://menusmitra.xyz/common_api/section_listview',
        { outlet_id: outlet_id },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
  
      if (response.data.st === 1) {
        setSectionData(response.data.data);
      } else {
        console.error('Error fetching sections:', response.data.msg);
      }
    } catch (error) {
      console.error('API Error:', error);
      
      if (error.response && error.response.status === 401) {
        console.warn('Unauthorized - Token expired or invalid');
        localStorage.removeItem('access'); // Clear expired token
        navigate('/login'); // Redirect to login page
      }
    }
  };
  

  const handleAddSection = async () => {
    if (!validateForm()) {
      return;
    }
  
    try {
      const accessToken = localStorage.getItem('access'); // Get access token
  
      if (!accessToken) {
        console.warn('No access token found, redirecting to login');
        navigate('/login'); // Redirect if token is missing
        return;
      }
  
      const response = await axios.post(
        'https://menusmitra.xyz/common_api/section_create',
        {
          outlet_id: outlet_id,
          section_name: newSection.name,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
  
      if (response.data.st === 1) {
        setSections([...sections, { section_name: newSection.name }]); // Add new section to the list
        setShowModal(false);
        setNewSection({ name: '' });
        fetchSections();
      } else {
        console.error('Error creating section:', response.data.msg);
      }
    } catch (error) {
      console.error('API Error:', error);
  
      if (error.response && error.response.status === 401) {
        console.warn('Unauthorized - Token expired or invalid');
        localStorage.removeItem('access'); // Clear expired token
        navigate('/login'); // Redirect to login page
      }
    }
  };
  
  const handleEditSection = async (sectionId) => {
    try {
      const accessToken = localStorage.getItem('access'); // Get access token
  
      if (!accessToken) {
        console.warn('No access token found, redirecting to login');
        navigate('/login'); // Redirect if token is missing
        return;
      }
  
      const response = await axios.post(
        'https://menusmitra.xyz/common_api/section_view',
        {
          outlet_id: outlet_id,
          section_id: sectionId, // Pass sectionId here
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
  
      if (response.data.st === 1) {
        setSelectedSection({
          section_id: sectionId, // Set the selected section_id
          section_name: response.data.data.section_name,
        });
        setNewSection({ name: response.data.data.section_name });
        setShowModal(true);
      } else {
        console.error('Error fetching section details:', response.data.msg);
      }
    } catch (error) {
      console.error('API Error:', error);
  
      if (error.response && error.response.status === 401) {
        console.warn('Unauthorized - Token expired or invalid');
        localStorage.removeItem('access'); // Clear expired token
        navigate('/login'); // Redirect to login page
      }
    }
  };
  
  
  const handleEditClick = (sectionId) => {
    handleEditSection(sectionId); // Pass the section_id to the handleEditSection function
  };
  const handleUpdateSection = async () => {
    if (!selectedSection || !validateForm()) {
      return;
    }
  
    try {
      const accessToken = localStorage.getItem('access'); // Get access token
  
      if (!accessToken) {
        console.warn('No access token found, redirecting to login');
        navigate('/login'); // Redirect if token is missing
        return;
      }
  
      const response = await axios.post(
        'https://menusmitra.xyz/common_api/section_update',
        {
          outlet_id: outlet_id,
          section_id: selectedSection.section_id,
          section_name: newSection.name,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
  
      if (response.data.st === 1) {
        setSections(sections.map(section => 
          section.section_id === selectedSection.section_id
            ? { ...section, section_name: newSection.name }
            : section
        ));
        setShowModal(false);
        setNewSection({ name: '' });
        fetchSections();
      } else {
        console.error('Error updating section:', response.data.msg);
      }
    } catch (error) {
      console.error('API Error:', error);
  
      if (error.response && error.response.status === 401) {
        console.warn('Unauthorized - Token expired or invalid');
        localStorage.removeItem('access'); // Clear expired token
        navigate('/login'); // Redirect to login page
      }
    }
  };
  

  const handleDeleteClick = (section) => {
    setSectionToDelete(section); // Set the section to be deleted
    setShowDeleteModal(true);    // Show the delete confirmation modal
  };
  

  const handleConfirmDelete = async () => {
    if (!sectionToDelete) return;
  
    try {
      const accessToken = localStorage.getItem('access'); // Retrieve access token
  
      if (!accessToken) {
        console.warn('No access token found, redirecting to login');
        navigate('/login'); // Redirect if token is missing
        return;
      }
  
      const response = await axios.post(
        'https://menusmitra.xyz/common_api/section_delete',
        {
          outlet_id: outlet_id, // Adjust based on the actual restaurant ID
          section_id: sectionToDelete.section_id, // Pass the selected section ID
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
  
      if (response.data.st === 1) {
        // Successfully deleted, update UI
        setShowDeleteModal(false);
        setSectionToDelete(null); // Clear the section to be deleted
        fetchSections(); // Refresh section list
      } else {
        console.error('Error deleting section:', response.data.msg);
      }
    } catch (error) {
      console.error('API Error:', error);
  
      if (error.response && error.response.status === 401) {
        console.warn('Unauthorized - Token expired or invalid');
        localStorage.removeItem('access'); // Clear expired token
        navigate('/login'); // Redirect to login page
      }
    }
  };
  
  

  const handleCloseModal = () => {
    setShowModal(false);
    setNewSection({ name: '' });
    setTouched(false);
    setErrors({});
  };
  const handleBackClick = () => {
    navigate(-1); // Navigate to the previous page
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Restaurant Sections" />

      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
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
          Sections 
          </h1>
          </div>

          <div className="flex justify-center w-1/3">
            <div className="relative w-50">
              <input
                type="text"
                placeholder="Search sections..."
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
              onClick={() => {
                setShowModal(true);
                setSelectedSection(null);
              }}
              className="inline-flex items-center justify-center w-8 h-8 bg-sky-600 text-white rounded-full hover:bg-sky-700"
              >
              <FontAwesomeIcon icon={faPlus} />
             
            </button>
          </div>
        </div>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredSections.map((section) => (
    <div
      key={section.section_id}
      className={`bg-white border-r-4 border  border-green-500 rounded-lg shadow-md p-4 cursor-pointer transform transition-all duration-200 hover:scale-105 border ${
        section.total_occupied_table_count === 0 ? 'bg-red-50' : 'border-gray-200'
      }`}
      onClick={() => navigate('/sections', { state: { section } })}
    >
    <div className="flex justify-between items-center">
  <h3 className="text-lg font-semibold uppercase">
    {section.section_name}
  </h3>
  {showIcons && (
  <div className="flex space-x-2">
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleEditSection(section.section_id);
      }}
      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center"
      data-tooltip-id="tooltip-edit"
      data-tooltip-content="Update"
    >
      <FontAwesomeIcon icon={faEdit} />
    </button>
    {(section.occupied_table_count <= 0) && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteClick(section);
        }}
        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center"
        data-tooltip-id="tooltip-delete"
        data-tooltip-content="Delete"
      >
        <FontAwesomeIcon icon={faTrash} />
      </button>
    )}
  </div>
  )}
</div>

      <div className="flex space-x-4 mt-2">
  <p className="text-sm text-gray-600">
    Total: {section.table_count}
  </p>
  <p className="text-sm text-green-600">
    Available: {section.remaining_table_count}
  </p>
  <p className="text-sm text-red-600">
    Occupied: {section.occupied_table_count}
  </p>
</div>

    </div>
  ))}
</div>

{showModal && (
  <div
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
    onClick={(e) => {
      if (e.target === e.currentTarget) {
        handleCloseModal();
      }
    }}
  >
    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {selectedSection ? 'Edit Section' : 'Add  Section'}
          </h3>
          <button
            onClick={handleCloseModal}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} className="text-xl" />
          </button>
        </div>
        <form onSubmit={(e) => {
          e.preventDefault();
          selectedSection ? handleUpdateSection() : handleAddSection();
        }}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              <span className="text-red-500">*</span> Section Name
            </label>
            <input
              type="text"
              required
              value={newSection.name}
              onChange={(e) => {
                setNewSection({ ...newSection, name: e.target.value });
                if (!touched) setTouched(true);
                if (errors.name) {
                  const newErrors = { ...errors };
                  delete newErrors.name;
                  setErrors(newErrors);
                }
              }}
              onBlur={() => setTouched(true)}
              placeholder='Section Name'
              className={`mt-1 block w-full border ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm py-2 px-3`}
            />
            {touched && errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="mt-6 flex justify-between space-x-3">
            <button
              type="button"
              onClick={handleCloseModal}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              <FontAwesomeIcon icon={faTimes} className="mr-2" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || errors.name}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none ${
                !isValid || errors.name
                  ? 'bg-green-400 cursor-not-allowed'
                  : selectedSection
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              <FontAwesomeIcon
                icon={selectedSection ? faSave : faSave}
                className="mr-2"
              />
              {selectedSection ? 'Save' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}



{showDeleteModal && (
  <div
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
    onClick={(e) => {
      if (e.target === e.currentTarget) {
        setShowDeleteModal(false);
        setSectionToDelete(null);
      }
    }}
  >
    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 text-2xl mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">
              Confirm Delete
            </h3>
          </div>
          <button
            onClick={() => {
              setShowDeleteModal(false);
              setSectionToDelete(null);
            }}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} className="text-xl" />
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Are you sure you want to delete section <span className='font-bold'>{sectionToDelete?.section_name} ?</span> This action cannot be undone.
        </p>

        <div className="flex justify-between space-x-3">
          <button
            type="button"
            onClick={() => {
              setShowDeleteModal(false);
              setSectionToDelete(null);
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            <FontAwesomeIcon icon={faTimes} className="mr-2" />
            Cancel
          </button>
          <button
            onClick={handleConfirmDelete} // Perform delete on confirm
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
      <Tooltip id="tooltip-back" />
      <Footer />
    </div>
  );
}

export default RestaurantSections;
