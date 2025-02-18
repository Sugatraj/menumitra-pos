import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faEye  } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from 'react-tooltip';

const MenuCard = ({ item, onEdit, showIcons,onDelete, onView }) => {
  return (
    <div className="bg-white cursor-pointer border-r-4 border  border-blue-700 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200 relative"
    onClick={() => onView(item)}
    >
      {/* <div className="relative w-full h-36">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
      </div> */}

      <div className="p-4 pb-12">
        <h3 className="text-lg font-semibold capitalize text-gray-800 mb-2">{item.name}</h3>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-white p-4 flex justify-between text-gray-600">
      {item.halfPrice ? (
  <div>
    <span className="font-medium">H:</span> ₹{item.halfPrice}
  </div>
) : null}



        <div>
          <span className="font-medium">F:</span> ₹{item.fullPrice}
        </div>
      </div>

      <div className="absolute top-1 right-2 p-2 space-x-2 flex">
        {/* <button
          onClick={() => onView(item)}
          className="p-3 text-gray-500 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-100 hover:text-gray-700 transition-colors duration-200"
          data-tooltip-id={`tooltip-${item.id}-view`}
          data-tooltip-content="View"
        >
          <FontAwesomeIcon icon={faEye} />
        </button> */}
          {showIcons && (
            <>
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering handleEdit 
            onEdit(item)}}
          
          className="p-3 text-gray-500 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-100 hover:text-gray-700 transition-colors duration-200"
          data-tooltip-id={`tooltip-${item.id}-edit`}
          data-tooltip-content="Update"
        >
          <FontAwesomeIcon icon={faEdit} />
        </button>
        <button
         onClick={(e) => {
          e.stopPropagation(); // Prevent triggering handleEdit 
          onDelete(item.id)}
        }
          className="p-3 text-gray-500 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-100 hover:text-gray-700 transition-colors duration-200"
          data-tooltip-id={`tooltip-${item.id}-delete`}
          data-tooltip-content="Delete"
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
        </>
          )}
      </div>
    </div>
  );
};

// Global Tooltip Component
const MenuCardWrapper = (props) => (
  <>
    <MenuCard {...props} />
    <Tooltip id={`tooltip-${props.item.id}-view`} />
    <Tooltip id={`tooltip-${props.item.id}-edit`} />
    <Tooltip id={`tooltip-${props.item.id}-delete`} />
  </>
);

export default MenuCardWrapper;
















