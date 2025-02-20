import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { Tooltip } from 'react-tooltip';

const ReportLock = ({ onSuccess }) => {
    const [showPopup, setShowPopup] = useState(true);
    const [mobileNumber, setMobileNumber] = useState('');
    const [otp, setOtp] = useState(['', '', '', '']); // State to hold each OTP digit
    const [showOtpField, setShowOtpField] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const navigate = useNavigate();

    const otpRefs = useRef([]); // Reference for OTP input fields

    useEffect(() => {
        if (showOtpField) {
            otpRefs.current[0]?.focus(); // Autofocus on the first OTP field when OTP section is shown
        }
    }, [showOtpField]);

    const handleBackClick = () => {
        setShowOtpField(false);
        setOtp(['', '', '', '']); // Clear OTP inputs when navigating back
        navigate(-1);
    };

    const handleMobileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
    
        if (parseInt(mobileNumber[0]) >= 0 && parseInt(mobileNumber[0]) <= 5) {
            setError('Mobile number cannot start with a digit between 0 and 5');
            setLoading(false);
            window.showToast?.('error', 'Mobile number cannot start with a digit between 0 and 5');
            return;
        }
    
        try {
            const response = await axios.post('https://menusmitra.xyz/common_api/user_login', {
                mobile: mobileNumber,
                outlet_id: localStorage.getItem('outlet_id'),
                role: 'manager',
            });
    
            if (response.data.st === 1) {
                setShowOtpField(true);
                setError('');
                window.showToast?.('success', 'OTP sent successfully');
            } else {
                setError(response.data.msg || 'Failed to send OTP');
                window.showToast?.('error', response.data.msg);
            }
        } catch (err) {
            const errorMessage = err.response ? err.response.data.msg : 'Failed to send OTP. Please try again.';
            setError(errorMessage);
            window.showToast?.('error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleOtpVerify = async (e) => {
        e.preventDefault();
        const otpFull = otp.join(''); // Combine the OTP digits into one string

        const generateRandomSessionId = (length) => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let sessionId = '';
            for (let i = 0; i < length; i++) {
                sessionId += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return sessionId;
        };

        const deviceSessId = generateRandomSessionId(20);
        setIsVerifyingOtp(true);
        setLoading(true);

        try {
            const response = await axios.post('https://menusmitra.xyz/pos_outlet/verify_otp', {
                mobile: mobileNumber,
                otp: otpFull,
                device_sessid: deviceSessId,
                fcm_token: localStorage.getItem('fcm_token'),
            });

            if (response.data.st === 1) {
                setShowPopup(false);
                localStorage.setItem('report_access', 'true');
                onSuccess();
                window.showToast?.('success', 'OTP verified successfully');
            } else if (response.data.st === 2) {
                window.showToast?.('error', response.data.msg || 'Access denied');
                setTimeout(() => {
                    navigate('/operation');
                }, 3000);
            } else {
                setError(response.data.msg || 'Invalid OTP');
                window.showToast?.('error', response.data.msg || 'Invalid OTP');
            }
        } catch (err) {
            setError('Invalid OTP. Please try again.');
            window.showToast?.('error', 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (e, index) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 1); // Only one digit allowed
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
    
        // Move focus to the next OTP field when a digit is entered
        if (value && otpRefs.current[index + 1]) {
            otpRefs.current[index + 1].focus();
        }
    };
    
    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index]) {
            // If the backspace is pressed and the current OTP field is empty, move focus to the previous field
            if (otpRefs.current[index - 1]) {
                otpRefs.current[index - 1].focus();
            }
        }
    };
    

    if (!showPopup) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
                <div className="flex items-center mb-6">
                    <button
                        onClick={handleBackClick}
                        data-tooltip-id="tooltip-back"
                        data-tooltip-content="Back"
                        className="text-gray-500 w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                    <h2 className="text-2xl font-semibold text-center flex-1">Authentication Required</h2>
                </div>

                {!showOtpField ? (
                    <form onSubmit={handleMobileSubmit} className="space-y-4">
                        <input
                            type="tel"
                            placeholder="Enter Mobile Number"
                            value={mobileNumber}
                            autoFocus
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                if (value.length === 1 && parseInt(value[0]) >= 0 && parseInt(value[0]) <= 5) return;
                                setMobileNumber(value);
                            }}
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            pattern="[0-9]{10}"
                            required
                        />
                        <button 
                            type="submit"
                            disabled={loading || mobileNumber.length !== 10}
                            className={`w-full py-2 px-4 rounded-md text-white ${loading || mobileNumber.length !== 10 ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {loading ? 'Sending...' : 'Send OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleOtpVerify} className="space-y-4 text-center">
                        <div className="flex  justify-center space-x-12">
                            {[...Array(4)].map((_, index) => (
                              <input
                              key={index}
                              type="text"
                              value={otp[index] || ''}
                              onChange={(e) => handleOtpChange(e, index)}
                              onKeyDown={(e) => handleKeyDown(e, index)} // Listen for the Backspace key
                              maxLength={1}
                              ref={(el) => otpRefs.current[index] = el} // Attach ref to each input
                              className="w-12 h-12 text-center border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                          />
                            ))}
                        </div>

                        <button 
                            type="submit"
                            disabled={loading || otp.length < 4 || otp.some(digit => !digit)}
                            className={`w-full py-2 px-4 rounded-md text-white ${loading || otp.length < 4 || otp.some(digit => !digit) ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                    </form>
                )}

                <Tooltip id="tooltip-back" />
            </div>
        </div>
    );
};

export default ReportLock;
