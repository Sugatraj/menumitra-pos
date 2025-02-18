import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

function ViewCategory({ category, onClose }) {
  if (!category) return null;

  return (
    <div className="">
      {/* Header Section with Close Button */}
      <div className="border-b">
        <div className="flex justify-between items-center ">
          <h2 className="text-xl capitalize font-semibold">{category.name}</h2>
          {/* Close Button */}
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className=" space-y-4">
        {/* Category Image */}
        {category.image && (
          <div className="flex justify-start mt-4">
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-60 object-cover rounded-lg shadow-md"
            />
          </div>
        )}
      
      <div className="grid grid-cols-2 gap-6">
  {/* Left Side: Created by, Updated by */}
 
    {category.created_by && (
      <div className='mt-3'>
        <p className="text-base font-bold text-gray-900 capitalize ">{category.created_by}</p>
        <p className="text-sm font-medium text-gray-400">Created by</p>
      </div>
    )}

    {category.updated_by && (
      <div className='mt-3'>
        <p className="text-base font-bold text-gray-900 capitalize">{category.updated_by}</p>
        <p className="text-sm font-medium text-gray-400">Updated by</p>
      </div>
    )}




    {category.created_on && (
      <div>
        <p className="text-base font-bold text-gray-900">{category.created_on}</p>
        <p className="text-sm font-medium text-gray-400">Created on</p>
      </div>
    )}

    {category.updated_on && (
      <div>
        <p className="text-base font-bold text-gray-900">{category.updated_on}</p>
        <p className="text-sm font-medium text-gray-400">Updated on</p>
      </div>
    )}

</div>


        {/* Menu List */}
        <div>
       
          <div className="space-y-2">
            {category.menu_list && category.menu_list.length > 0 ? (
              category.menu_list.map((item, index) => (
                <div className='bg-gray-100 p-4 mb-4 mt-4 rounded-lg shadow-sm'>
                <div key={index} className="flex justify-between  ">
                  <div>
                    <h4 className="font-medium capitalize">{item.menu_name}</h4>
                    <p className="text-sm text-gray-500 capitalize">{item.food_type}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm text-gray-600">
                      Half Price: ₹{item.half_price}
                    </span>
                    <span className="text-sm text-gray-600">
                      Full Price: ₹{item.full_price}
                    </span>
                  </div>
                </div>
                </div>
              ))
            ) : (
              <p>No menu items available</p>
            )}
          </div>


          
        </div>
      </div>
    </div>
  );
}

export default ViewCategory;
