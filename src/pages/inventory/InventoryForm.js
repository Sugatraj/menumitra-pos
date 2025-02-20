import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSave } from '@fortawesome/free-solid-svg-icons';

function InventoryForm({ item, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    supplier: '', // Store the selected supplier's ID
    unit_price: '',
    quantity: '',
    unit_of_measure: '',
    in_or_out: '',
    brand_name: '',
    tax_rate: '',
    reorder_level: '',
    expiration_date: '',
    in_date: '',
    out_date: '',
  });

  const [categories, setCategories] = useState([]);
  const [inOutOptions, setInOutOptions] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const outlet_id = localStorage.getItem('outlet_id');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isValid, setIsValid] = useState(false);

  // Validation functions
  const isValidName = (name) => {
    const nameRegex = /^[a-zA-Z\s]+$/;
    return nameRegex.test(name);
  };

  const isValidUnitMeasure = (unit) => {
    const unitRegex = /^[a-zA-Z\s]+$/;
    return !unit || unitRegex.test(unit); // Optional field
  };

  const isValidBrandName = (brand) => {
    const brandRegex = /^[a-zA-Z0-9\s]+$/;
    return !brand || brandRegex.test(brand); // Optional field
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validations
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (!isValidName(formData.name)) {
      newErrors.name = 'Name can only contain letters and spaces';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.supplier) {
      newErrors.supplier = 'Supplier is required';
    }

    if (!formData.unit_price) {
      newErrors.unit_price = 'Price is required';
    } else if (isNaN(formData.unit_price) || Number(formData.unit_price) <= 0) {
      newErrors.unit_price = 'Enter a valid price';
    }

    if (!formData.quantity) {
      newErrors.quantity = 'Quantity is required';
    } else if (isNaN(formData.quantity) || Number(formData.quantity) < 0) {
      newErrors.quantity = 'Enter a valid quantity';
    }

    // Make unit_of_measure mandatory
    if (!formData.unit_of_measure.trim()) {
      newErrors.unit_of_measure = 'Unit of measure is required';
    } else if (!isValidUnitMeasure(formData.unit_of_measure)) {
      newErrors.unit_of_measure = 'Unit can only contain letters';
    }

    if (!formData.in_or_out) {
      newErrors.in_or_out = 'In/Out is required';
    }

    if (!formData.tax_rate) {
      newErrors.tax_rate = 'Tax rate is required';
    } else if (isNaN(formData.tax_rate) || Number(formData.tax_rate) < 0) {
      newErrors.tax_rate = 'Enter a valid tax rate';
    }

    // Optional field validations
    if (formData.brand_name && !isValidBrandName(formData.brand_name)) {
      newErrors.brand_name = 'Brand name can only contain letters and numbers';
    }

    if (formData.reorder_level && (isNaN(formData.reorder_level) || Number(formData.reorder_level) < 0)) {
      newErrors.reorder_level = 'Enter a valid reorder level';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add validation on form data changes
  useEffect(() => {
    setIsValid(validateForm());
  }, [formData]);

  // Update handleChange to include validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Add validation while typing
    switch (name) {
      case 'name':
        finalValue = value.replace(/[^a-zA-Z\s]/g, '');
        break;
      case 'unit_of_measure':
        finalValue = value.replace(/[^a-zA-Z\s]/g, '');
        break;
      case 'brand_name':
        finalValue = value.replace(/[^a-zA-Z0-9\s]/g, '');
        break;
      default:
        break;
    }

    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  useEffect(() => {
    if (item) {
      // Format dates from API response format (DD Mon YYYY) to input format (YYYY-MM-DD)
      const formatDateForInput = (dateStr) => {
        if (!dateStr) return '';
        
        // Parse the date string from "DD Mon YYYY" format
        const [day, month, year] = dateStr.split(' ');
        const months = {
          'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
          'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
          'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
        };
        
        // Convert to YYYY-MM-DD format
        return `${year}-${months[month]}-${day.padStart(2, '0')}`;
      };

      setFormData({
        ...item,
        category: item.category_id?.toString(),
        expiration_date: formatDateForInput(item.expiration_date),
        in_date: formatDateForInput(item.in_date),
        out_date: formatDateForInput(item.out_date)
      });
    }
  }, [item]);

  useEffect(() => {
    const accessToken = localStorage.getItem("access"); // Retrieve access token

    // If no token exists, redirect to login page
    if (!accessToken) {
      navigate("/login"); // Redirect if token is missing
      return; // Exit early if there's no token
    }

    // Fetch the inventory categories list
    axios
      .get('https://menusmitra.xyz/common_api/inventory_category_listview', {
        headers: {
          'Authorization': `Bearer ${accessToken}`, // Add authorization header
        }
      })
      .then((response) => {
        if (response.data.st === 1) {
          // Transform the categories array into the desired format
          const categoryList = response.data.categories.map((category) => ({
            name: category.name,
            id: category.inventory_category_id.toString(), // Convert ID to string to match with form data
          }));
          setCategories(categoryList);
        } else {
          console.error('Failed to fetch categories:', response.data.msg);
        }
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          // Handle token expiration or invalid token
          console.error('Unauthorized. Redirecting to login...');
          localStorage.removeItem('access'); // Clear the invalid or expired token
          navigate("/login"); // Redirect if token is missing
        } else {
          console.error('Error fetching categories:', error);
        }
      });

    // Fetch the "In/Out" list
    axios
      .post('https://menusmitra.xyz/common_api/get_supplier_list', { outlet_id: outlet_id }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`, // Add authorization header
        }
      })
      .then((response) => {
        if (response.data.st === 1) {
          const suppliersList = Object.entries(response.data.suppliers_dict).map(
            ([name, id]) => ({ name, id })
          );
          setSuppliers(suppliersList);

          // Set default supplier if available
          if (item) {
            setFormData((prev) => ({ ...prev, supplier: item.supplier_id }));
          }
        }
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          // Handle token expiration or invalid token
          console.error('Unauthorized. Redirecting to login...');
          localStorage.removeItem('access'); // Clear the invalid or expired token
          navigate("/login"); // Redirect if token is missing
        } else {
          console.error('Error fetching suppliers:', error);
        }
      });

    // Fetch In/Out list
    axios
      .get('https://menusmitra.xyz/common_api/get_in_or_out_list', {
        headers: {
          'Authorization': `Bearer ${accessToken}`, // Add authorization header
        }
      })
      .then((response) => {
        if (response.data.st === 1) {
          const inOutList = Object.values(response.data.in_out_list);
          setInOutOptions(inOutList);
        }
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          // Handle token expiration or invalid token
          console.error('Unauthorized. Redirecting to login...');
          localStorage.removeItem('access'); // Clear the invalid or expired token
          navigate("/login"); // Redirect if token is missing
        } else {
          console.error('Error fetching In/Out list:', error);
        }
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const formatDateForApi = (dateStr) => {
      if (!dateStr) return '';
      
      // Parse the input date (YYYY-MM-DD)
      const [year, month, day] = dateStr.split('-');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      // Convert to "DD Mon YYYY" format
      return `${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`;
    };

    const requestData = {
      ...formData,
      category_id: formData.category,
      supplier_id: formData.supplier,
      expiration_date: formatDateForApi(formData.expiration_date),
      in_date: formatDateForApi(formData.in_date),
      out_date: formatDateForApi(formData.out_date)
    };

    onSubmit(requestData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span className="text-red-500">*</span> Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={handleChange}
            name="name"
            className={`block w-full rounded-md border ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            } px-4 py-3 focus:border-blue-500 focus:ring-blue-500`}
            placeholder="Enter Inventroy name"
          />
          {errors.name && touched.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span className="text-red-500">*</span> Category
          </label>
          <select
            value={formData.category}
            onChange={handleChange}
            name="category"
            className="block w-full rounded-md border border-gray-300 px-4 py-3 bg-white"
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.category && touched.category && (
            <p className="mt-1 text-sm text-red-500">{errors.category}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span className="text-red-500">*</span> Supplier
          </label>
          <select
            value={formData.supplier}
            onChange={handleChange}
            name="supplier"
            className="block w-full rounded-md border border-gray-300 px-4 py-3 bg-white"
          >
            <option value="">Select Supplier</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
          {errors.supplier && touched.supplier && (
            <p className="mt-1 text-sm text-red-500">{errors.supplier}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span className="text-red-500">*</span> Price
          </label>
          <input
            type="number"
            value={formData.unit_price}
            onChange={handleChange}
            name="unit_price"
            className="block w-full rounded-md border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter price"
          />
          {errors.unit_price && touched.unit_price && (
            <p className="mt-1 text-sm text-red-500">{errors.unit_price}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span className="text-red-500">*</span> Quantity
          </label>
          <input
  type="number"
  value={formData.quantity}
  onChange={handleChange}
  name="quantity"
  min="0" // Prevents using the decrement button for negative values
  onKeyDown={(e) => {
    if (e.key === "-" || e.key === "e") e.preventDefault(); // Prevent negative sign and exponential notation
  }}
  className="block w-full rounded-md border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
  placeholder="Enter quantity"
/>

          {errors.quantity && touched.quantity && (
            <p className="mt-1 text-sm text-red-500">{errors.quantity}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span className="text-red-500">*</span> Unit of Measure
          </label>
          <input
            type="text"
            value={formData.unit_of_measure}
            onChange={handleChange}
            name="unit_of_measure"
            className={`block w-full rounded-md border ${
              touched.unit_of_measure && errors.unit_of_measure 
                ? 'border-red-500' 
                : 'border-gray-300'
            } px-4 py-3 focus:border-blue-500 focus:ring-blue-500`}
            placeholder="Enter Unit Of Measure"
          />
          {touched.unit_of_measure && errors.unit_of_measure && (
            <p className="mt-1 text-sm text-red-500">{errors.unit_of_measure}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span className="text-red-500">*</span> In/Out
          </label>
          <select
            value={formData.in_or_out}
            onChange={handleChange}
            name="in_or_out"
            className="block w-full rounded-md border border-gray-300 px-4 py-3 bg-white"
          >
            <option value="">Select In/Out</option>
            {inOutOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.in_or_out && touched.in_or_out && (
            <p className="mt-1 text-sm text-red-500">{errors.in_or_out}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Brand Name
          </label>
          <input
            type="text"
            value={formData.brand_name}
            onChange={handleChange}
            name="brand_name"
            className="block w-full rounded-md border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter brand name"
          />
          {errors.brand_name && touched.brand_name && (
            <p className="mt-1 text-sm text-red-500">{errors.brand_name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span className="text-red-500">*</span> Tax (%)
          </label>
          <input
            type="number"
            value={formData.tax_rate}
            onChange={handleChange}
            name="tax_rate"
            className="block w-full rounded-md border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter tax rate"
            min="0" // Prevents using the decrement button for negative values
            onKeyDown={(e) => {
              if (e.key === "-" || e.key === "e") e.preventDefault(); // Prevent negative sign and exponential notation
            }}
          />
          {errors.tax_rate && touched.tax_rate && (
            <p className="mt-1 text-sm text-red-500">{errors.tax_rate}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reorder Level
          </label>
          <input
            type="number"
            value={formData.reorder_level}
            onChange={handleChange}
            name="reorder_level"
            className="block w-full rounded-md border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter reorder level"
          />
          {errors.reorder_level && touched.reorder_level && (
            <p className="mt-1 text-sm text-red-500">{errors.reorder_level}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expiration Date
          </label>
          <input
            type="date"
            value={formData.expiration_date || ''}
            onChange={handleChange}
            name="expiration_date"
            className="block w-full rounded-md border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.expiration_date && touched.expiration_date && (
            <p className="mt-1 text-sm text-red-500">{errors.expiration_date}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            In Date
          </label>
          <input
            type="date"
            value={formData.in_date || ''}
            onChange={handleChange}
            name="in_date"
            className="block w-full rounded-md border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.in_date && touched.in_date && (
            <p className="mt-1 text-sm text-red-500">{errors.in_date}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Out Date
          </label>
          <input
            type="date"
            value={formData.out_date || ''}
            onChange={handleChange}
            name="out_date"
            className="block w-full rounded-md border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.out_date && touched.out_date && (
            <p className="mt-1 text-sm text-red-500">{errors.out_date}</p>
          )}
        </div>

      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="block w-full rounded-md border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
          rows="4"
          placeholder="Enter description"
        ></textarea>
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
          disabled={!isValid}
          className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
            ${!isValid ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
        >
          <FontAwesomeIcon icon={faSave} className="text-success-500 mr-1" />
          {item ? 'Save' : 'Save'}
        </button>
      </div>
    </form>
  );
}

export default InventoryForm;