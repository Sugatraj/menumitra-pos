import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

function ViewStaff({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="col-span-6 transition-all duration-300">
      <div className="bg-white rounded-lg shadow-lg h-full">
        {/* Header Section */}
        <div className="border-b">
          <div className="flex justify-between items-center p-4">
            <h2 className="text-xl font-semibold text-gray-900 capitalize"> {item.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full w-8 h-8"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-6">
          {item.photo && (
  <div className="col-span-2">
    <img src={item.photo} alt={item.name} className="w-40 h-40 rounded-md object-cover" />
  </div>
)}

            <div>
              <p className="text-base font-bold text-gray-900 capitalize">{item.role}</p>
              <p className="text-sm font-medium text-gray-400 capitalize">Role</p>

            </div>

            {item.dob && (
  <div>
    <p className="text-base font-bold text-gray-900 capitalize">{item.dob}</p>
    <p className="text-sm font-medium text-gray-400 capitalize">Date of Birth</p>

  </div>
)}


            <div>
    
              <p className="text-base font-bold text-gray-900 capitalize">{item.mobile}</p>
              <p className="text-sm font-medium text-gray-400 capitalize">Mobile</p>
            </div>

            <div>
           
              <p className="text-base font-bold text-gray-900 capitalize">{item.aadhar_number}</p>
              <p className="text-sm font-medium text-gray-400 capitalize">Aadhar Number</p>
            </div>

            <div>
   
              <p className="text-base font-bold text-gray-900 capitalize">{item.address}</p>
              <p className="text-sm font-medium text-gray-400 capitalize">Address</p>
            </div>
            {item.created_by && (
              <div>
                <p className="text-base font-bold capitalize text-gray-900">{item.created_by}</p>
                <p className="text-sm font-medium text-gray-400">Created by</p>
              </div>
            )}

            {item.updated_by  && (
              <div>
                <p className="text-base font-bold capitalize text-gray-900">{item.updated_by}</p>
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
           
          </div>

          
        </div>
      </div>
    </div>
  );
}

export default ViewStaff;
