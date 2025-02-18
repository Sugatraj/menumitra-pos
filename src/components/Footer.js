import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faInstagram,
  faYoutube,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { faBolt } from "@fortawesome/free-solid-svg-icons";

function Footer() {
  return (
    <footer className="border-t bg-gradient-to-r from-cyan-500 via-cyan-500 to-cyan-500 w-full">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-white text-sm">© Copyright. All Rights Reserved.</div>

          <div className="flex items-center space-x-6">
            <a href="https://www.facebook.com/people/Menu-Mitra/61565082412478/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-200 transition-colors">
              <FontAwesomeIcon icon={faFacebook} className="text-xl" />
            </a>
            <a href="https://www.instagram.com/menumitra/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-200 transition-colors">
              <FontAwesomeIcon icon={faInstagram} className="text-xl" />
            </a>
            <a href="https://www.youtube.com/@menumitra" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-200 transition-colors">
              <FontAwesomeIcon icon={faYoutube} className="text-xl" />
            </a>
            <a href="https://x.com/i/flow/login?redirect_after_login=%2FMenuMitra" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-200 transition-colors">
              <FontAwesomeIcon icon={faXTwitter} className="text-xl" />
            </a>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-white flex items-center">
              <FontAwesomeIcon icon={faBolt} className="mr-1" />
              Powered by
            </span>
            <a href="https://shekruweb.com/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-200 font-medium transition-colors">
              Shekru Labs India Pvt. Ltd.
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
