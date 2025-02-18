import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

function ViewInventory({ item, onClose }) {
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
            

            {/* Category */}
            {item.category && (
              <div className="">
                <p className="text-base font-bold text-gray-900 capitalize">{item.category}</p>
                <p className="text-sm font-medium text-gray-400">Category</p>
              </div>
            )}

            {/* Supplier */}
            {item.supplier && (
              <div className="">
                <p className="text-base font-bold text-gray-900 capitalize">{item.supplier}</p>
                <p className="text-sm font-medium text-gray-400">Supplier</p>
              </div>
            )}

            {/* Price */}
            {item.unit_price && (
              <div className="">
                <p className="text-base font-bold text-gray-900">₹{item.unit_price}</p>
                <p className="text-sm font-medium text-gray-400">Price</p>
              </div>
            )}

            {/* Quantity */}
            {item.quantity && (
              <div className="">
                <p className="text-base font-bold text-gray-900">{item.quantity} {item.unit_of_measure}</p>
                <p className="text-sm font-medium text-gray-400">Quantity</p>
              </div>
            )}

            {/* In/Out */}
            {item.in_or_out && (
              <div className="">
                <p className="text-base capitalize font-bold text-gray-900">{item.in_or_out}</p>
                <p className="text-sm font-medium text-gray-400">In/Out</p>
              </div>
            )}

            {/* Brand */}
            {item.brand_name && (
              <div className="">
                <p className="text-base font-bold text-gray-900 capitalize">{item.brand_name}</p>
                <p className="text-sm font-medium text-gray-400">Brand</p>
              </div>
            )}

            {/* Tax */}
            {item.tax_rate && (
              <div className="">
                <p className="text-base font-bold text-gray-900">{item.tax_rate}%</p>
                <p className="text-sm font-medium text-gray-400">Tax</p>
              </div>
            )}

            {/* Reorder Level */}
            {item.reorder_level && (
              <div className="">
                <p className="text-base font-bold text-gray-900">{item.reorder_level}</p>
                <p className="text-sm font-medium text-gray-400">Reorder Level</p>
              </div>
            )}

            {/* Expiration Date */}
            {item.expiration_date && (
              <div className="">
                <p className="text-base font-bold text-gray-900">{item.expiration_date}</p>
                <p className="text-sm font-medium text-gray-400">Expiration Date</p>
              </div>
            )}

            {/* In Date */}
            {item.in_date && (
              <div className="">
                <p className="text-base font-bold text-gray-900">{item.in_date}</p>
                <p className="text-sm font-medium text-gray-400">In Date</p>
              </div>
            )}

            {/* Out Date */}
            {item.out_date && (
              <div className="">
                <p className="text-base font-bold text-gray-900">{item.out_date}</p>
                <p className="text-sm font-medium text-gray-400">Out Date</p>
              </div>
            )}

            {/* Description */}
            {item.description && (
              <div className="col-span-2">
                <p className="text-base font-bold text-gray-900">{item.description}</p>
                <p className="text-sm font-medium text-gray-400">Description</p>
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

export default ViewInventory;
