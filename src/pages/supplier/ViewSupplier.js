import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

function ViewSupplier({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="col-span-6 transition-all duration-300">
      <div className="bg-white rounded-lg shadow-lg h-full">
        {/* Header Section */}
        <div className="border-b">
          <div className="flex justify-between items-center p-4">
            <h2 className="text-xl font-semibold text-gray-900 capitalize">{item.name}</h2>
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
            {/* Status */}
            {item.supplier_status && (
              <div>
                <p className="text-base font-bold text-gray-900 capitalize">{item.supplier_status}</p>
                <p className="text-sm font-medium text-gray-400">Status</p>
              </div>
            )}

            {/* Credit Rating */}
            {item.credit_rating && (
              <div>
                <p className="text-base font-bold text-gray-900 capitalize">{item.credit_rating}</p>
                <p className="text-sm font-medium text-gray-400">Credit Rating</p>
              </div>
            )}

            {/* Credit Limit */}
            {item.credit_limit > 0 && (
  <div>
    <p className="text-base font-bold text-gray-900">₹{item.credit_limit}</p>
    <p className="text-sm font-medium text-gray-400">Credit Limit</p>
  </div>
)}


            {/* Location */}
            {item.location && (
              <div>
                <p className="text-base font-bold text-gray-900 capitalize">{item.location}</p>
                <p className="text-sm font-medium text-gray-400">Location</p>
              </div>
            )}

            {/* Owner Name */}
            {item.owner_name && (
              <div>
                <p className="text-base font-bold text-gray-900 capitalize">{item.owner_name}</p>
                <p className="text-sm font-medium text-gray-400">Owner Name</p>
              </div>
            )}

            {/* Website */}
            {item.website && (
              <div>
                <a
                  href={item.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base text-blue-500 font-bold underline"
                >
                  {item.website}
                </a>
                <p className="text-sm font-medium text-gray-400">Website</p>
              </div>
            )}

            {/* Mobile 1 */}
            {item.mobile_number1 && (
              <div>
                <p className="text-base font-bold text-gray-900">{item.mobile_number1}</p>
                <p className="text-sm font-medium text-gray-400">Mobile Number</p>
              </div>
            )}

            {/* Mobile 2 */}
            {item.mobile_number2 && (
              <div>
                <p className="text-base font-bold text-gray-900">{item.mobile_number2}</p>
                <p className="text-sm font-medium text-gray-400">Alternative Mobile Number</p>
              </div>
            )}

            {/* Address */}
            {item.address && (
              <div className="col-span-2">
                <p className="text-base font-bold text-gray-900 capitalize">{item.address}</p>
                <p className="text-sm font-medium text-gray-400">Address</p>
              </div>
            )}
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

export default ViewSupplier;
