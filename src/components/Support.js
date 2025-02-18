import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
 
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from "react-router-dom";
import { Tooltip } from 'react-tooltip';
function Support() {
    const navigate = useNavigate();
const handleBackClick = () => { 
    navigate(-1);
  }
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <Header />
      
      
      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="flex items-center w-1/4">
                      <button
                        onClick={handleBackClick}
                        className="text-gray-500 w-8 h-8 rounded-full mr-3 hover:bg-gray-200"
                        data-tooltip-id="tooltip-back"
                        data-tooltip-content="Back"
                        data-tooltip-place='bottom'
                      >
                        <FontAwesomeIcon icon={faArrowLeft} />
                      </button>
          <h1 className="text-2xl font-semibold text-gray-800 w-1/4">Support</h1>
          </div>
        <div className="flex justify-center ">
          {/* Direct message display */}
          <div className="p-8 max-w-lg w-full ">
            <h3 className="text-3xl font-bold text-center text-blue-600 mb-6">24/7 Support</h3>
            <p className="text-center mt-4 text-xl text-gray-700 mb-6">
              For any inquiries or assistance, feel free to reach out to our support team. 
              We are available 24/7 to assist you with any questions or concerns. 
              Our team is always here to help, and we guarantee quick and efficient responses.
            </p>
            <p className="text-center text-xl text-gray-700 mb-6">
              Call us at: <span className="text-blue-500">
              7776827177
              </span>
            </p>
            <p className="text-center text-xl text-gray-700">
              Or email us at: <span className="text-blue-500">
                <a href="mailto:menumitra.info@gmail.com">menumitra.info@gmail.com</a>
              </span>
            </p>
          </div>
        </div>
      </main>
      <Tooltip id="tooltip-back" />
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Support;
