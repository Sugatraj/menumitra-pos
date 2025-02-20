import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList,
  faTags,
  faTable,
  faUsers,
  faShoppingCart,
  faWarehouse,
  faTruck,
  faFileAlt,
  faPrint,
  faUserTie,
  faCrown,
  faUtensils,
  faThList,
  faLayerGroup,
  faList,
  faUserCheck
} from '@fortawesome/free-solid-svg-icons';

function Operations() {
  const navigate = useNavigate();

  const navigateTo = (path) => {
    navigate(path);
  };

  const cards = [
    {
      title: 'Menu',
      icon: faUtensils, // Changed the icon to faUtensils for food
      textColor: 'text-blue-600',
      path: '/menu',
    },
    {
      title: 'Menu Categories',
      icon: faList, // Changed the icon to faList for categories
      textColor: 'text-purple-600',
      path: '/menu_categories',
    },
    
    {
      title: 'Sections',
      icon: faTable,
      // color: 'border-green-600',
      textColor: 'text-green-600',
      path: '/restaurant_sections',
    },
    {
      title: 'Orders',
      icon: faShoppingCart,
      // color: 'border-red-600',
      textColor: 'text-red-600',
      path: '/order_list',
    },
    {
      title: 'Staff',
      icon: faUsers,
      // color: 'border-orange-600',
      textColor: 'text-orange-600',
      path: '/staff',
    },
  
    {
      title: 'Waiter',
      icon: faUserTie,
      // color: 'border-green-500',
      textColor: 'text-green-500',
      path: '/waiter',
    },
    {
      title: 'Chef',
      icon: faUserCheck, // Updated to a chef hat icon
     // color: 'border-red-700', // Distinct bold red border
      textColor: 'text-red-700', // Matching text color
      path: '/chef',
    },
    {
      title: 'Captain',
      icon: faCrown,
     // color: 'border-yellow-500',
      textColor: 'text-yellow-500',
      path: '/captain',
    },
    {
      title: 'Inventory',
      icon: faWarehouse,
     // color: 'border-pink-600',
      textColor: 'text-pink-600',
      path: '/inventory',
    },
    {
      title: 'Supplier',
      icon: faTruck,
     // color: 'border-blue-600',
      textColor: 'text-blue-600',
      path: '/supplier',
    },
    {
      title: 'Reports',
      icon: faFileAlt,
     // color: 'border-cyan-600',
      textColor: 'text-cyan-600',
      path: '/reports',
    },
  ];

  return (
    <div>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 flex-grow">
        {/* <div className=" min-h-screen">
      {/* Header */}
      {/* <Header /> */}

      {/* Main Content - Ensures it takes remaining space */}
      {/* <main className="flex-grow max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">  */}
          <div className="px-4 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-800">Operations</h1>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              {cards.map((card, index) => (
                <div
                  key={index}
                  onClick={() => navigateTo(card.path)}
                  className={`bg-white rounded-lg shadow-md overflow-hidden p-6 cursor-pointer hover:shadow-2xl transform transition duration-200 hover:scale-105 flex flex-col items-center justify-center space-y-4 ${card.color}`}
                >
                  <FontAwesomeIcon icon={card.icon} className={`${card.textColor} text-4xl`} />
                  <h3 className="text-lg font-semibold text-gray-800">{card.title}</h3>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default Operations;
