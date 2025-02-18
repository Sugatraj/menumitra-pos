import React, { useState, useEffect, use } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSpinner, faToggleOn, faToggleOff ,faPrint} from '@fortawesome/free-solid-svg-icons';
import phonepe from "../../assets/upi/phonepe.jpg"
import googlepay from "../../assets/upi/googlepay.jpg"
import upi from "../../assets/upi/upi.jpg"
import amazonpe from "../../assets/upi/amazonpe.png"
import paytm from "../../assets/upi/paytm.jpg"
import QRCode from 'qrcode';
function OrderView({ item, onClose, loading, error, onStatusUpdate }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const outlet_id = localStorage.getItem('outlet_id');
  const timeline = [

    { name: "John Doe", role: "Admin", order: "Order Create", datetime: "2025-01-17 10:30 AM" },
    { name: "Jane Smith", role: "Manager", order: "Order Update", datetime: "2025-01-17 11:00 AM" },
    { name: "Alice Johnson", role: "Staff", order: "Order Update", datetime: "2025-01-17 11:30 AM" },
    { name: "Alice Johnson", role: "Staff", order: "Order Update", datetime: "2025-01-17 11:30 AM" },

  ];


  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!item) return null;

  const { order_details, menu_details, invoice_url } = item;

  // Function to get next status
  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'placed': 'cooking',
      'cooking': 'served',
      'served': 'paid'
    };
    return statusFlow[currentStatus] || currentStatus;
  };

  // Function to handle status change
  const handleStatusChange = async () => {
    const nextStatus = getNextStatus(order_details.order_status);

    // Don't proceed if already in final status (paid)
    if (order_details.order_status === 'paid') return;

    setIsUpdating(true);

    // Retrieve access token from localStorage
    const accessToken = localStorage.getItem("access");

    if (!accessToken) {
      console.error("No access token found");
      navigate("/login"); // Redirect if token is missing
      return;
    }

    try {
      const response = await fetch('https://men4u.xyz/common_api/update_order_status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`, // Add Authorization header with token
        },
        body: JSON.stringify({
          outlet_id: outlet_id,
          order_id: order_details.order_id,
          order_status: nextStatus,
          user_id: localStorage.getItem('user_id'),
        })
      });

      const data = await response.json();
      if (data.st === 1) {
        // Update the local order status
        order_details.order_status = nextStatus;
        window.showToast("success", `Order status updated to ${nextStatus}`);
        // Pass success to StatusToggle
        if (onStatusUpdate) onStatusUpdate();
        return true;
      } else {
        window.showToast("error", data.msg || "Failed to update status");
        return false;
      }
    } catch (error) {
      console.error('Error updating status:', error);
      window.showToast("error", "Failed to update status");
      if (error.response && error.response.status === 401) {
        console.error("Unauthorized access, redirecting to login.");
        navigate("/login"); // Redirect if token is missing
      }
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Get status button styles
  const printOrderDetails = async (orderData) => {
    const { order_details, menu_details } = orderData;
    const outlet_upi = localStorage.getItem("outlet_upi") || "Outlet UPI";
    const outlet_name = localStorage.getItem("outlet_name") || "Outlet Name";
    const outlet_address = localStorage.getItem("outlet_address") || "Outlet Address";
    const website_url = localStorage.getItem("website_url") || "https://menumitra.com";
    const orderItemsHTML = menu_details.map(item => `
      <tr style="color: #000;">
        <td style="padding: 4px 0; color: #000; font-weight: bold;">${item.menu_name}</td>
        <td style="padding: 4px 0; text-align: center; font-weight: bold;">${item.quantity}</td>
        <td style="padding: 4px 0; text-align: right; font-weight: bold;">₹${item.price.toFixed(2)}</td>
        <td style="padding: 4px 0; text-align: right; font-weight: bold;">₹${item.menu_sub_total.toFixed(2)}</td>
      </tr>
    `).join('');
  
    const tableSection =
    Array.isArray(order_details.table_number) &&
    order_details.table_number.length > 0 &&
    order_details.section !== null &&
    order_details.section !== undefined
      ? `
         <div style="display: flex; justify-content: space-between; font-weight: bold;">
           <span>Table: ${order_details.section || '-'} - ${order_details.table_number.join(', ')}</span>
         </div>
       `
      : '';
  
    const typeSection =
      (!order_details.section || !Array.isArray(order_details.table_number) || order_details.table_number.length === 0)
        ? `
           <div style="display: flex; justify-content: space-between; font-weight: bold;">
             <span>Type: ${order_details.order_type || '-'}</span>
           </div>
         `
        : '';
  
    const upiId = outlet_upi;
    const price = order_details.grand_total.toFixed(2); // Total price
  
    try {
      const upiLink = `upi://pay?pa=${upiId}&pn=Merchant&am=${price}&tid=${order_details.order_number}`;
      const qrCodeDataUrl = await QRCode.toDataURL(upiLink); // Use async/await for the QR code generation
  
      const printContent = `
        <div style="width: 280px; margin: 0; padding: 0; color: black;">
          <div style="text-align: center; margin-bottom: 10px;">
            <h2 style="margin: 0; font-size: 20px; text-transform: capitalize;">${outlet_name}</h2>
            <h2 style="margin: 4px 0; font-size: 14px; text-transform: capitalize;">${outlet_address}</h2>
          </div>
  
          <div style="margin-bottom: 10px; font-size: 12px; color: black;">
            <div style="display: flex; justify-content: space-between; color: #000; font-weight: bold;">
              <span>Order: #${order_details.order_number}</span>
            </div>
            ${tableSection}
            ${typeSection}
    
            <div style="display: flex; justify-content: space-between; font-weight: bold;">
              <span>DateTime: ${order_details.datetime}</span>
            </div>
          </div>
    
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="border-top: 1px dotted #000; border-bottom: 1px dotted #000;">
                <th style="padding: 4px 0; text-align: left; font-weight: bold;">Item</th>
                <th style="padding: 4px 0; text-align: center; font-weight: bold;">Qty</th>
                <th style="padding: 4px 0; text-align: right; font-weight: bold;">Rate</th>
                <th style="padding: 4px 0; text-align: right; font-weight: bold;">Amt</th>
              </tr>
            </thead>
            <tbody>
              ${orderItemsHTML}
            </tbody>
          </table>
    
          <div style="margin-top: 10px; font-size: 12px; text-align: right;">
            <div style="border-top: 1px dotted #000; padding-top: 4px;">
              <div style="display: flex; justify-content: space-between; margin: 4px 0; font-weight: bold;">
                <span>Subtotal:</span>
                <span>₹${order_details.total_bill_amount.toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin: 4px 0; font-weight: bold;">
                <span>Discount(${order_details.discount_percent}%):</span>
                <span>-₹${order_details.discount_amount.toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin: 4px 0; font-weight: bold;">
                <span>Service Charges(${order_details.service_charges_percent}%):</span>
                <span>+₹${order_details.service_charges_amount.toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin: 4px 0; font-weight: bold;">
                <span>GST(${order_details.gst_percent}%):</span>
                <span>+₹${order_details.gst_amount.toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin: 4px 0; font-weight: bold; font-size: 16px; border-top: 1px dotted #000; padding-top: 4px; border-bottom: 1px dotted #000; padding-bottom: 4px;">
                <span>Total:</span>
                <span>₹${order_details.grand_total.toFixed(2)}</span>
              </div>
            </div>
          </div>
  
          <div style="text-align: center; margin-top: 0; margin-bottom: 0; margin:0">
            <div style="margin-top: 0; display: flex; justify-content: space-around; align-items: center;">
              <img src="${phonepe}" alt="PhonePe" style="width: 40px; height: auto; margin-top: 10px; margin-right:5px; " />
              <img src="${googlepay}" alt="GooglePay" style="width: 40px; height: auto; margin-top: 10px; margin-right:5px;" />
              <img src="${paytm}" alt="Paytm" style="width: 40px; height: auto; margin-top: 10px; margin-right:5px; " />
              <img src="${amazonpe}" alt="AmazonPay" style="width: 40px; height: auto; margin-top: 10px; margin-right:5px; " />
              <img src="${upi}" alt="UPI" style="width: 40px; height: auto; margin-top: 10px; margin-right:5px; " />
            </div>
  
            <img src="${qrCodeDataUrl}" alt="QR Code for Payment" style="width: 150px; height: 150px; margin-top: 0; margin:0; margin-bottom: 0;"  />
            <p style="font-size: 12px; font-weight: bold; margin-top: 0; margin:0" >
              Scan to Pay ₹${price}
            </p>
          </div>
  
          <div style="margin-top: 0; text-align: center; font-size: 12px; margin-top: 5px;">
            <p style="margin: 0; font-weight: bold;"><a href="${website_url}" style="color: #000; text-decoration: none;">${website_url}</a></p>
          </div>
            <div style="margin-top: 0; text-align: center; font-size: 12px; margin-top: 5px;">
            <p style="margin: 0; font-weight: bold;">Thank You Visit Again</p>
          </div>
        </div>
      `;
  
      const printWindow = window.open('', '', 'height=600,width=400');
      printWindow.document.write(`
        <html>
          <head>
            <style>
              @page {
                size: 80mm auto;
                margin: 20px;
              }
              body {
                margin: 10px;
                padding: 0;
              }
              body,*,html {
                color: #000;
                font-family: 'Calibri', monospace;
              }
            </style>
          </head>
          <body>${printContent}</body>
        </html>
      `);
      
      printWindow.document.close();
  
      // Wait for a brief moment to ensure content is fully loaded before printing
      setTimeout(() => {
        printWindow.print();
      }, 500);  // Adjust the timeout if needed
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const StatusToggle = ({ currentStatus, onStatusChange, isUpdating }) => {
    const statusOrder = ['placed', 'cooking', 'served', 'paid'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const nextStatus = statusOrder[currentIndex + 1];
    const [isChecked, setIsChecked] = useState(false);

    // Calculate initial time left based on order datetime
    // const calculateInitialTimeLeft = () => {
    //   if (currentStatus !== 'placed' || !order_details?.datetime) return 0;

    //   const orderDate = new Date(order_details.datetime.replace(/-/g, '/'));
    //   const now = new Date();
    //   const diffInSeconds = Math.floor((now - orderDate) / 1000);
    //   const timeLeft = Math.max(0, 90 - diffInSeconds);

    //   return timeLeft;
    // };

    const calculateInitialTimeLeft = () => {
      if (currentStatus !== 'placed' || !order_details?.datetime) return 0;

      // Parse the datetime string directly without changing the format
      const orderDate = new Date(order_details.datetime.replace(/-/g, '/')); // Converts "23-Jan-2025 10:12:48 AM" to a valid Date object
      const now = new Date();

      // Calculate the difference in seconds
      const diffInSeconds = Math.floor((now - orderDate) / 1000);

      // Ensure the time left is not negative
      const timeLeft = Math.max(0, 90 - diffInSeconds);

      return timeLeft;
    };


    const [timeLeft, setTimeLeft] = useState(calculateInitialTimeLeft());
    const [canCancel, setCanCancel] = useState(currentStatus === 'placed' && timeLeft > 0);

    // Timer effect for placed orders
    useEffect(() => {
      let timer;
      if (currentStatus === 'placed' && timeLeft > 0) {
        timer = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              setCanCancel(false);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
      return () => clearInterval(timer);
    }, [currentStatus, timeLeft]);

    const handleChange = async (e) => {
      const success = await onStatusChange();
      if (success) {
        setIsChecked(true);
      } else {
        e.target.checked = false;
      }
    };

    const handleCancel = async () => {
      // Retrieve access token from localStorage
      const accessToken = localStorage.getItem("access");

      if (!accessToken) {
        console.error("No access token found");
        navigate("/login"); // Redirect if token is missing
        return;
      }

      try {
        const response = await fetch('https://men4u.xyz/common_api/update_order_status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`, // Add Authorization header with token
          },
          body: JSON.stringify({
            outlet_id: outlet_id,
            order_id: order_details.order_id,
            order_status: 'cancelled',
            user_id: localStorage.getItem('user_id'),
          })
        });

        const data = await response.json();
        if (data.st === 1) {
          window.showToast("success", "Order cancelled successfully");
          order_details.order_status = 'cancelled';
          if (onStatusUpdate) onStatusUpdate();
        } else {
          window.showToast("error", data.msg || "Failed to cancel order");
        }
      } catch (error) {
        console.error('Error cancelling order:', error);
        window.showToast("error", "Failed to cancel order");
        if (error.response && error.response.status === 401) {
          console.error("Unauthorized access, redirecting to login.");
          navigate("/login"); // Redirect if token is missing
        }
      }
    };


 


    return (
      <div className="col-span-2 flex justify-end">
        {/* Only show the toggle if the current status is not 'placed' or the order is not being updated */}
        {(currentStatus !== 'placed' && currentStatus !== 'paid' && currentStatus !== 'cancelled') && (
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              onChange={handleChange}
              checked={isChecked}
              disabled={isUpdating}
            />
            <div className={`relative w-11 h-6 bg-gray-200 
              peer-focus:outline-none peer-focus:ring-4 
              ring-gray-300
              rounded-full peer 
              peer-checked:bg-blue-600
              after:content-[''] after:absolute after:top-[2px] after:start-[2px] 
              after:bg-white after:border-gray-300 after:border after:rounded-full 
              after:h-5 after:w-5 after:transition-all 
              peer-checked:after:translate-x-full
              ${currentStatus === 'placed' && timeLeft > 0 ? 'opacity-50' : ''}`}></div>
            <div className="flex flex-col ms-3">
              <span className={`text-sm font-medium ${isChecked ? 'text-blue-600' : 'text-gray-600'}`}>
                {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
              </span>
              {currentStatus === 'placed' && timeLeft > 0 && (
                <span className="text-xs text-orange-500">
                  Auto-cooking in {timeLeft}s
                </span>
              )}
              {!isUpdating && nextStatus && timeLeft === 0 && (
                <span className="text-xs text-gray-400">
                  Click to mark as {nextStatus}
                </span>
              )}
              {isUpdating && (
                <span className="text-xs text-blue-500 flex items-center">
                  <FontAwesomeIcon icon={faSpinner} spin className="mr-1" />
                  Updating...
                </span>
              )}
            </div>
          </label>
        )}

        {/* Cancel Order Button - Always visible for 'placed' status */}
        {currentStatus === 'placed' && timeLeft > 0 && (
          <div className="flex items-center space-x-3">
            <button
              onClick={handleCancel}
              className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded-full hover:bg-red-50"
            >
              {`Cancel Order in ${timeLeft}s`}
            </button>
          </div>
        )}
      </div>
    );
  };







  return (
    <div className="col-span-6 mt-12 transition-all duration-300">
      <div className="bg-white rounded-lg shadow-lg ">
        {/* Header Section */}
        <div className="border-b">
          <div className="flex justify-between items-center p-4">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">
                #{order_details.order_number}
              </h2>
            </div>
            <div className="flex items-center justify-center flex-grow">
              <StatusToggle
                currentStatus={order_details.order_status}
                onStatusChange={handleStatusChange}
                isUpdating={isUpdating}
              />
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full w-10 h-10 
        flex items-center justify-center transition-all duration-200 hover:shadow-md"
            >
              <FontAwesomeIcon icon={faTimes} className="text-lg" />
            </button>
          </div>
        </div>


        {/* Content Section */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Order Number */}

            {/* Table Number */}

            {order_details.table_number && Array.isArray(order_details.table_number) && order_details.table_number.length > 0 && (
              <div>
                <p className="text-base font-bold text-gray-900 capitalize">{order_details.table_number}</p>
                <p className="text-sm font-medium text-gray-400">Table Number</p>
              </div>
            )}


            {/* Order Status */}
            <div>
              <p className="text-base font-bold text-gray-900 capitalize">{order_details.order_status}</p>
              <p className="text-sm font-medium text-gray-400">Order Status</p>
            </div>

            {/* Total Bill */}


            {/* Service Charges */}

            <div>
              <p className="text-base font-bold text-gray-900 capitalize">{order_details.menu_count}</p>
              <p className="text-sm font-medium text-gray-400">Menu Count </p>
            </div>

            {/* GST Amount */}




            {/* DateTime */}
            <div>
              <p className="text-base font-bold text-gray-900 capitalize">{order_details.datetime}</p>
              <p className="text-sm font-medium text-gray-400">Date & Time</p>
            </div>

            {/* Menu Details */}
            <div className="col-span-2">
              {menu_details.map((menuItem) => (
                <div key={menuItem.menu_id} className="bg-gray-100 p-4 mb-4 rounded-lg shadow-sm">
                  <div className="flex justify-between items-center">
                    {/* Menu Name */}
                    <div>
                      <p className="text-lg font-semibold text-gray-900 capitalize">{menuItem.menu_name}
                        {/* <span className='text-xs text-gray-500'> ({menuItem.half_or_full})</span> */}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 flex justify-between items-center">



                    <div className=" text-center">
                      <p className="text-sm capitalize "> {menuItem.half_or_full}: ₹{menuItem.price}</p>
                    </div>
                    <div className="">
                      <p className="text-sm ">{`x${menuItem.quantity}`}</p>
                    </div>

                    {/* Subtotal (Green, Bold) */}
                    <div className=" text-right">
                      <p className="text-sm ">Subtotal: <span className='text-base font-bold'>₹{menuItem.menu_sub_total}</span></p>
                    </div>
                  </div>
                </div>
              ))}

            </div>

            <div className="bg-white py-2 px-4 rounded-lg shadow-md col-span-2">
              {/* Total */}
              <div className="flex justify-between items-center border-b pb-1">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-sm font-bold text-gray-900">₹{order_details.total_bill_amount?.toFixed(2)}</p>
              </div>

              {/* Detailed Breakdown */}
              <div className="mt-1 space-y-1">


                {/* Service Charges */}
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-gray-400">Discount ({order_details.discount_percent}%)</p>
                  <p className="text-sm font-bold text-red-500">-₹{order_details.discount_amount?.toFixed(2)}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-gray-400">Total after discount</p>
                  <p className="text-sm font-bold text-gray-600">+₹{order_details.total_bill_with_discount?.toFixed(2)}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-gray-400">Service Charges ({order_details.service_charges_percent}%)</p>
                  <p className="text-sm font-bold text-gray-600">+₹{order_details.service_charges_amount?.toFixed(2)}</p>
                </div>

                {/* GST */}
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-gray-400">GST ({order_details.gst_percent}%)</p>
                  <p className="text-sm font-bold text-gray-600">+₹{order_details.gst_amount?.toFixed(2)}</p>
                </div>

                {/* Discount */}


              </div>

              {/* Grand Total */}
              <div className="mt-1 border-t  flex justify-between items-center">
                <p className="text-md font-bold text-gray-900">Grand Total</p>
                <p className="text-md font-bold text-gray-900">₹{order_details.grand_total?.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex justify-between items-center col-span-2">
      

              <button
                onClick={() => printOrderDetails(item)}
                className="text-sm text-blue-500 bg-gray-500 text-white px-4 py-2 rounded-md hover:text-white-700"
              >
             <FontAwesomeIcon icon={faPrint} /> Print
              </button>

                      {/* <button
    onClick={handleOpenModal}
    className="text-sm text-blue-500 underline hover:text-blue-700"
  >
    View Timeline
  </button> */}

              {invoice_url && (
                <a
                  href={invoice_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base text-blue-500 underline"
                >
                  Invoice
                </a>
              )}
            </div>

            {isModalOpen && (
              <div className="fixed inset-0 z-50 bg-gray-800 bg-opacity-50 flex justify-center items-center">
                <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
                  {/* Header */}
                  <div className="flex justify-between items-center border-b px-4 py-3">
                    <h3 className="text-lg font-semibold text-gray-900">Order Timeline - #7087979</h3>
                    <button
                      onClick={handleCloseModal}
                      className="text-gray-500 hover:text-gray-700 rounded-full w-8 h-8 flex items-center justify-center"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                  {/* Content */}
                  <div className="p-4">
                    {timeline && timeline.length > 0 ? (
                      <ul className="relative">
                        {timeline.map((item, index) => (
                          <li key={index} className="flex items-start space-x-4">
                            {/* Dot and Line */}
                            <div className="relative flex flex-col items-center">
                              <span
                                className={`w-4 h-4 rounded-full ${index === timeline.length - 1 ? 'bg-blue-500' : 'bg-blue-500'
                                  }`}
                              ></span>
                              {index < timeline.length - 1 && (
                                <span className="w-0.5 h-8 bg-gray-300"></span>
                              )}
                            </div>
                            {/* Content */}
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {item.name} ({item.role})
                              </p>
                              <p className="text-sm text-gray-500">{item.order}</p>

                              <p className="text-sm text-gray-500">{item.datetime}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No timeline data available.</p>
                    )}
                  </div>
                </div>
              </div>
            )}




          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderView;
