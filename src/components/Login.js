import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMobile, faSpinner } from '@fortawesome/free-solid-svg-icons';
import Footer from './Footer';
import MenuMitra from "../assets/menumitra.png";
import { messaging, getFCMToken, onMessageListener } from '../firebase-config';
import { getToken } from 'firebase/messaging';
import { VAPID_KEY } from '../config';
import { UpdateService } from '../services/UpdateService';
import UpdateDialog from '../components/UpdateDialog';

function Login() {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [showOtpField, setShowOtpField] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(15); // Timer state
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const navigate = useNavigate();
  const otpRefs = useRef([]);


  const generateFCMToken = async () => {
    try {
      const isElectron = window && window.process && window.process.type;
      
      if (!isElectron) {
        // Web browser environment
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const token = await getFCMToken();
          console.log("FCM Token:", token);
          return token;
        }
        console.log("Notification permission denied");
        return null;
      } else {
        // Electron environment
        const token = await getFCMToken();
        return token;
      }
    } catch (error) {
      console.warn("Error generating FCM token:", error);
      const token = await getFCMToken();
      return token;
    }
  };

  // Timer countdown effect
  useEffect(() => {
    let interval;
    if (timer > 0 && showOtpField) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    } else if (timer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer, showOtpField]);

  // Add useEffect for message handling
  useEffect(() => {
    // Only set up message listener in web environment
    const isElectron = window && window.process && window.process.type;
    
    if (!isElectron && 'Notification' in window) {
      onMessageListener()
        .then(payload => {
          if (payload) {
            console.log('Received foreground message:', payload);
            // Handle the message as needed
          }
        })
        .catch(err => console.log('Failed to receive message:', err));
    }
  }, []);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError('Mobile number must start with 6-9 and be 10 digits long');
      return;
    }
    setIsSendingOtp(true);
    const updateResult = await UpdateService.checkForUpdates();
    if (updateResult.hasUpdate) {
      setUpdateInfo({
        isOpen: true,
        currentVersion: updateResult.currentVersion,
        serverVersion: updateResult.serverVersion
      });
      return; // Prevent login if update is required
    }
    try {
      const response = await fetch('https://men4u.xyz/common_api/user_login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, role: 'manager' }),
      });

      const data = await response.json();
      if (data.st === 1) {
        setShowOtpField(true);
        setError('');
        setTimer(15);
        window.showToast("success",  "OTP has been sent to your mobile number");
      } else {
        setError(data.msg || 'Failed to send OTP');
        window.showToast("error", data.msg || "Failed to send OTP");
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      window.showToast("error", 'Something went wrong. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');

    if (otpValue.length !== 4) {
      setError('Please enter a valid 4-digit OTP');
      return;
    }

    const generateRandomSessionId = (length) => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let sessionId = "";
      for (let i = 0; i < length; i++) {
        sessionId += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return sessionId;
    };

    const deviceSessId = generateRandomSessionId(20);
    setIsVerifyingOtp(true);
    
    try {
      const fcmToken = await generateFCMToken();
      localStorage.setItem('fcm_token', fcmToken);
      const response = await fetch('https://men4u.xyz/pos_outlet/verify_otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile,
          otp: otpValue,
          device_sessid: deviceSessId,
          fcm_token: fcmToken,
        }),
      });

      const data = await response.json();
      if (data.st === 1) {
        const { 
          owner_name, 
          user_id, 
          outlet_upi, 
          gst, 
          image,
          service_charges, 
          outlet_name, 
          outlet_id, 
          hotel_status, 
          outlet_address, 
          is_open, 
          completed_orders, 
          active_orders, 
          today_total_revenue ,
          access,
          refresh
        } = data.owner_data;

        // Store all data in localStorage
localStorage.setItem('access',access)
console.log('access',access);
localStorage.setItem('refresh',refresh)
        localStorage.setItem('owner_name', owner_name);
        localStorage.setItem('user_id', user_id);
        localStorage.setItem('outlet_name', outlet_name);
        localStorage.setItem('outlet_id', outlet_id);
        localStorage.setItem('hotel_status', hotel_status);
        localStorage.setItem('is_open', is_open);
        localStorage.setItem('gst', gst);
        localStorage.setItem('image', image);
        localStorage.setItem('service_charges', service_charges);
        localStorage.setItem('outlet_upi', outlet_upi);
        localStorage.setItem('outlet_address', outlet_address);
        localStorage.setItem('completed_orders', completed_orders);
        localStorage.setItem('active_orders', active_orders);
        localStorage.setItem('today_total_revenue', today_total_revenue);

        setError('');
        
        // Add a small delay before navigation to ensure localStorage is set
        setTimeout(() => {
          navigate('/home');
        }, 100);
        
      } else {
        setError(data.msg || 'Invalid OTP');
        window.showToast("error", data.msg || 'Invalid OTP');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('Something went wrong. Please try again.');
      window.showToast("error", 'Something went wrong. Please try again.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    setTimer(15); // Reset timer
    setIsSendingOtp(true);
    try {
      const response = await fetch('https://men4u.xyz/common_api/resend_otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, role: 'manager' }),
      });

      const data = await response.json();
      if (data.st === 1) {
        setError('');
        window.showToast("success", data.msg || "OTP has been sent to your mobile number");
      } else {
        setError(data.msg || 'Failed to send OTP');
        window.showToast("error", data.msg || "Failed to send OTP");
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      window.showToast("error", 'Something went wrong. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Allow only digits
    if (value === '' || /^[6-9]\d*$/.test(value)) {
      if (value.length <= 10) {
        setMobile(value);
        setError('');
      }
    }
  };

  const handleOtpChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length === 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setError('');
      if (index < 3) {
        otpRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      if (!newOtp[index] && index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
      newOtp[index] = '';
      setOtp(newOtp);
    }
  };

  const isMobileValid = /^[6-9]\d{9}$/.test(mobile);
  const isOtpComplete = otp.join('').length === 4;


  const [updateInfo, setUpdateInfo] = useState({ isOpen: false, currentVersion: '', serverVersion: '' });

  // Add version check effect
  useEffect(() => {
    checkForUpdates();
  }, []);
  const checkForUpdates = async () => {
    try {
      const result = await UpdateService.checkForUpdates();
      if (result.error) {
        console.warn('Update check warning:', result.error);
        return;
      }
      if (result.hasUpdate) {
        setUpdateInfo({
          isOpen: true,
          currentVersion: result.currentVersion || '1.0.0',
          serverVersion: result.serverVersion || 'New Version'
        });
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  };

  return (
    <>
     
      <div className="min-h-screen bg-gray-50 flex items-center justify-center ">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="text-center mb-3 flex items-center justify-center">
                <img src={MenuMitra} alt="MenuMitra Logo" className="w-10 h-10 mr-2" /> {/* Adjust logo size */}
                <h1 className="text-2xl font-bold text-gray-800 ">MenuMitra</h1>
              </div>
              <p className="text-gray-600">Sign in to continue to your account</p>
            </div>

            <form onSubmit={showOtpField ? handleVerifyOtp : handleSendOtp} className="space-y-6">
            <div className="space-y-4">
  <div>
    <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
      <span className="text-red-500">*</span> Mobile Number
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <FontAwesomeIcon icon={faMobile} className="text-gray-400" />
      </div>
      <input
        id="mobile"
        name="mobile"
        type="tel"
        required
        autoFocus={!showOtpField} // Auto-focus when OTP is not shown
        className={`block w-full pl-11 pr-4 py-3 border rounded-lg transition-all text-gray-900 placeholder-gray-500 focus:outline-none ${
          error && !showOtpField
            ? 'border-red-500 focus:ring-1 focus:ring-red-500' // Show red border for mobile if there's an error
            : mobile.length === 10
            ? 'border-gray-500 focus:ring-1 focus:ring-green-500' // Show green for 10 digits
            : 'border-gray-300 focus:ring-1 focus:ring-black' // Default state
        }`}
        placeholder="Enter your mobile number"
        value={mobile}
        onChange={handleMobileChange}
        disabled={showOtpField}
      />
    </div>
  </div>
  {/* Error message for mobile number */}
  {error && !showOtpField && <div className="text-red-500 text-center mb-4">{error}</div>}

  {/* OTP field */}
  {showOtpField && (
    <div className="animate-fadeIn">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        <span className="text-red-500">*</span> OTP
      </label>
      <div className="flex justify-between gap-2">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (otpRefs.current[index] = el)}
            type="text"
            className={`w-12 h-12 text-center border rounded-lg text-xl focus:outline-none focus:ring-1 ${
              error
                ? 'border-red-500 focus:ring-1 focus:ring-red-500' // Show red border if OTP has an error
                : 'border-gray-300 focus:ring-1 focus:ring-green-500' // Show green for valid OTP
            }`}            maxLength="1"
            value={digit}
            onChange={(e) => handleOtpChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            autoFocus={showOtpField && index === 0 && otp[0] === ''} // Auto-focus first input if it's empty
          />
        ))}
      </div>
      {/* Error message for OTP */}
      {error && <div className="text-red-500 text-center mt-2">{error}</div>}

      <p className="mt-2 text-sm text-gray-600">
        Didn't receive OTP?{' '}
        {timer > 0 ? (
          <span>{`Resend OTP in ${timer}s`}</span>
        ) : (
          <button
            type="button"
            onClick={handleResendOtp}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Resend OTP
          </button>
        )}
      </p>
    </div>
  )}
</div>


              <button
                type="submit"
                className={`w-full py-2 rounded-lg font-medium text-white flex items-center justify-center
    ${showOtpField
                    ? (isOtpComplete ? 'bg-sky-400 hover:bg-sky-600' : 'bg-sky-200 cursor-not-allowed')
                    : (isMobileValid ? 'bg-sky-400 hover:bg-sky-600' : 'bg-sky-200 cursor-not-allowed')
                  }`}
                disabled={
                  showOtpField
                    ? (!isOtpComplete || isVerifyingOtp)
                    : (!isMobileValid || isSendingOtp)
                }
              >
                {showOtpField ? (
                  isVerifyingOtp ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                      Verifying...
                    </>
                  ) : (
                    'Verify OTP'
                  )
                ) : (
                  isSendingOtp ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                      Sending...
                    </>
                  ) : (
                    'Send OTP'
                  )
                )}
              </button>


            </form>
          </div>
        </div>
      </div>
      <UpdateDialog 
        isOpen={updateInfo.isOpen}
        onClose={() => setUpdateInfo({ ...updateInfo, isOpen: false })}
        currentVersion={updateInfo.currentVersion}
        serverVersion={updateInfo.serverVersion}
      />
      <Footer />
    </>
  );
}

export default Login;
