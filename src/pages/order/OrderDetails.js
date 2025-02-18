import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faHotel,
  faClipboardList,
  faUtensils,
  faMapMarkerAlt,
  faCheckCircle,
  faArrowLeft,
  faHourglassHalf,
  faClipboardCheck,
  faTimes,
  faTimesCircle,
  faCar, faBox,
  faHandHoldingHeart,
  faConciergeBell,
  faShoppingCart,
  faMoneyCheckAlt,
  faStore,
  faChevronDown
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import OrderView from "./OrderView";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Tooltip } from 'react-tooltip';
function OrderDetails() {


  // Add a new state to track if dates are being modified
const [isDateModified, setIsDateModified] = useState(false);

// Modify the DatePicker components:


  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrderTypes, setSelectedOrderTypes] = useState("All");
  const [selectedOrderType, setSelectedOrderType] = useState("All");
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("today");
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState(new Date());
  const [selectedEndDate, setSelectedEndDate] = useState(new Date());
  const navigate = useNavigate();
  const outlet_id = localStorage.getItem("outlet_id");
  const [orders, setOrders] = useState([]);
  const [showViewPanel, setShowViewPanel] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null); // State to store order details
  const [loading, setLoading] = useState(false); // State for loading
  const [error, setError] = useState(null); // State for error
  const handleStatusUpdate = () => {
    // Refresh your order list here
   
    fetchOrders(selectedOrderType, selectedTimePeriod, selectedOrderTypes);
  } 


  const fetchOrders = (orderStatus = "All", timePeriod = "", orderType = "All") => {
    setLoading(true);
    setError(null);
  
    // Retrieve access token from localStorage
    const accessToken = localStorage.getItem("access");
  
    if (!accessToken) {
      console.error("No access token found");
      navigate("/login"); // Redirect if token is missing
      return;
    }
  
    const payload = {
      outlet_id: outlet_id,
      order_status: orderStatus !== "All" ? orderStatus : undefined,
      order_type: orderType !== "All" ? orderType : undefined,
    };
  
    // Add appropriate date parameters for custom date range
    if (timePeriod === 'custom') {
      payload.start_date = format(selectedStartDate, 'yyyy-MM-dd');
      payload.end_date = format(selectedEndDate, 'yyyy-MM-dd');
    } else {
      payload.time_period = timePeriod;
    }
  
    axios
      .post(
        "https://men4u.xyz/common_api/order_listview",
        payload,
        {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        }
      )
      .then((response) => {
        setLoading(false);
        if (response.data.st === 1) {
          // Check if lists exists and has data
          if (response.data.lists && response.data.lists.length > 0) {
            const ordersData = [];
            response.data.lists.forEach((dateGroup) => {
              if (dateGroup.data && dateGroup.data.length > 0) {
                ordersData.push({ date: dateGroup.date, data: dateGroup.data });
              }
            });
            setOrders(ordersData);
          } else {
            // If no orders found, set empty array
            setOrders([]);
          }
        } else {
          // If API returns error or no orders
          setOrders([]);
          window.showToast("info", response.data.msg || "No orders found");
        }
      })
      .catch((error) => {
        setLoading(false);
        // setError("Error fetching orders");
        // onClose={() => setShowViewPanel(false)}
        setShowViewPanel(false);
        setOrders([]); // Clear orders on error
        if (error.response && error.response.status === 401) {
          console.error("Unauthorized access, redirecting to login.");
          navigate("/login"); // Redirect if token is missing
        } else {
          console.error("Error fetching orders:", error);
        }
      });
  };
  

  useEffect(() => {
    // Function to fetch orders
    const fetchData = () => {
      fetchOrders(selectedOrderType, selectedTimePeriod, selectedOrderTypes);
    };
  
    // Fetch immediately on component mount
    fetchData();
  
    // Set interval to fetch data every 60 seconds
    const intervalId = setInterval(fetchData, 60000);
  
    // Cleanup function to clear interval when component unmounts or dependencies change
    return () => clearInterval(intervalId);
  
  }, [selectedOrderType, selectedTimePeriod, selectedOrderTypes]); 
  
  // Filter orders based on search term and selected order type
  const filteredOrders = orders
    .map((dateGroup) => ({
      date: dateGroup.date,
      orders: dateGroup.data.filter((item) => {
        const matchesSearchTerm = item.order_number.toString().includes(searchTerm);
        const matchesOrderType = selectedOrderType === "All" || item.order_status === selectedOrderType;
        return matchesSearchTerm && matchesOrderType;
      }),
    }))
    .filter((dateGroup) => dateGroup.orders.length > 0); // Exclude empty date groups

    const handleView = async (orderNumber) => {
      setShowViewPanel(true);
      setLoading(true);
      setError(null); // Clear previous error
    
      // Retrieve access token from localStorage
      const accessToken = localStorage.getItem("access");
    
      if (!accessToken) {
        console.error("No access token found");
        navigate("/login"); // Redirect if token is missing
        return;
      }
    
      try {
        const response = await axios.post(
          'https://men4u.xyz/common_api/order_view',
          {
            order_number: orderNumber,
          },
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`, // Add Authorization header with token
            },
          }
        );
    
        if (response.data.st === 1) {
          setOrderDetails(response.data.lists); // Set the order details
        } else {
          setError(response.data.msg || 'Failed to fetch order details');
        }
      } catch (error) {
        setError(error.message || 'Something went wrong');
        if (error.response && error.response.status === 401) {
          console.error("Unauthorized access, redirecting to login.");
          navigate("/login"); // Redirect if token is missing
        }
      } finally {
        setLoading(false);
      }
    };
    

    const calculateTimeRemaining = (orderTime) => {
      const orderDateTime = new Date(orderTime);
      const responseDeadline = new Date(orderDateTime.getTime() + 90000); // Add 90 seconds
      const now = new Date();
    
      const timeDiff = Math.floor((responseDeadline - now) / 1000); // Convert to seconds
    
      if (timeDiff <= 0) {
        return { expired: true, timeString: "Time Expired" };
      }
    
      return { expired: false, timeString: `${timeDiff} sec` };
    };
    
    const CountdownTimer = ({ orderTime, orderStatus }) => {
      const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining(orderTime));
    
      useEffect(() => {
        // Only run timer for 'placed' orders
        if (orderStatus !== "placed") return;
    
        const timer = setInterval(() => {
          const remaining = calculateTimeRemaining(orderTime);
          setTimeRemaining(remaining);
    
          if (remaining.expired) {
            clearInterval(timer);
          }
        }, 1000);
    
        return () => clearInterval(timer);
      }, [orderTime, orderStatus]);
    
      if (orderStatus !== "placed") return null;
    
      return (
        <div
          className={`text-sm font-medium ${
            timeRemaining.expired ? "text-red-500" : "text-green-500"
          }`}
        >
          {timeRemaining.expired ? (
            <span className="flex items-center">
              {/* <FontAwesomeIcon icon={faHourglassHalf} className="mr-1" />
              Time Expired */}
            </span>
          ) : (
            <span className="flex items-center">
              <FontAwesomeIcon icon={faHourglassHalf} className="mr-1" />
              {timeRemaining.timeString}
            </span>
          )}
        </div>
      );
    };
    
  const handleBackClick = () => {
    navigate(-1);
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center w-1/4">
                      <button
                        onClick={handleBackClick}
                        className="text-gray-500 w-8 h-8 rounded-full mr-3 hover:bg-gray-200"
                        data-tooltip-id="tooltip-back"
                        data-tooltip-content="Back"
                      >
                        <FontAwesomeIcon icon={faArrowLeft} />
                      </button>
          <h1 className="text-2xl font-semibold text-gray-800">Orders</h1>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search Order"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className=" pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Search by order number"
            />
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>


          <div className="w-1/4"></div>



        </div>
        <div className="flex justify-between ">
  <div className="flex">
    <div className="flex ">
      {/* Today and Yesterday buttons */}
      {[
        { value: 'today', label: 'Today' },
        { value: 'yesterday', label: 'Yesterday' },
      ].map((period) => (
        <button
          key={period.value}
          onClick={() => setSelectedTimePeriod(period.value)}
          className={`px-2 py-1 border ${
            selectedTimePeriod === period.value 
              ? 'border-blue-500 text-blue-500' : 'border-gray-300 text-gray-600'
          }`}
        
        >
          {period.label}
        </button>
      ))}

      {/* Dropdown for other options */}
      <div className="relative inline-block">
        <button
          onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
          className="px-4 py-2 border"
        >
          <span>{selectedTimePeriod === 'custom' 
            ? `${format(selectedStartDate, 'dd MMM yyyy')} - ${format(selectedEndDate, 'dd MMM yyyy')}`
            : selectedTimePeriod !== 'today' && selectedTimePeriod !== 'yesterday'
              ? selectedTimePeriod.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
              : 'Select Period'
          }</span>
          <FontAwesomeIcon icon={faChevronDown} className="w-4 h-4" />
        </button>

        {isDateDropdownOpen && (
          <div className="absolute z-10 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="p-2">
              {/* Predefined periods */}
              <div className="space-y-1 mb-2">
                {[
                  { value: 'this_week', label: 'This Week' },
                  { value: 'last_week', label: 'Last Week' },
                  { value: 'this_month', label: 'This Month' },
                  { value: 'last_month', label: 'Last Month' }
                ].map((period) => (
                  <button
                    key={period.value}
                    onClick={() => {
                      setSelectedTimePeriod(period.value);
                      setIsDateDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm rounded-md hover:bg-gray-100 ${
                      selectedTimePeriod === period.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 my-2"></div>

              {/* Custom date range picker */}
              <div className="p-2">
  <div className="flex flex-col space-y-2">
    {/* Start Date */}
    <label htmlFor="startDate" className="text-sm font-medium text-gray-700">
      Start Date
    </label>
   

    {/* End Date */}
  
  

   

    <DatePicker
  id="startDate"
  selected={selectedStartDate}
  onChange={(date) => {
    setSelectedStartDate(date);
    setIsDateModified(true);
  }}
  selectsStart
  startDate={selectedStartDate}
  endDate={selectedEndDate}
  maxDate={new Date()}
  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
  placeholderText="Start Date"
  dateFormat="dd MMM yyyy"
/>
<label htmlFor="endDate" className="text-sm font-medium text-gray-700">
      End Date
    </label>
<DatePicker
  id="endDate"
  selected={selectedEndDate}
  onChange={(date) => {
    setSelectedEndDate(date);
    setIsDateModified(true);
  }}
  selectsEnd
  startDate={selectedStartDate}
  endDate={selectedEndDate}
  minDate={selectedStartDate}
  maxDate={new Date()}
  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
  placeholderText="End Date"
  dateFormat="dd MMM yyyy"
/>

{/* Modify the Apply Custom Range button */}
<button
  onClick={() => {
    setSelectedTimePeriod('custom');
    setIsDateDropdownOpen(false);
    setIsDateModified(false); // Reset the modified flag
    fetchOrders('All', 'custom', selectedOrderTypes); // Explicitly fetch orders
  }}
  disabled={!isDateModified} // Disable if dates haven't been modified
  className={`w-full px-4 py-2 ${
    isDateModified 
      ? 'bg-blue-500 hover:bg-blue-600' 
      : 'bg-gray-300 cursor-not-allowed'
  } text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
>
  Apply Custom Range
</button>
  </div>
</div>

            </div>
          </div>
        )}
      </div>
    </div>
  </div>

  <div className="flex ">
  {[ 'All', 'parcel', 'drive-through', 'counter', 'dine-in'].map((type) => (
    <button
      key={type}
      onClick={() => setSelectedOrderTypes(type)}
      className={`px-2 py-1 border  ${
        selectedOrderTypes === type ? 'border-blue-500 text-blue-500' : 'border-gray-300 text-gray-600'
      }`}
    >
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </button>
  ))}
</div>

  <div className="flex ">
  {['All', 'cooking', 'placed', 'served', 'paid', 'cancelled'].map((status) => (
    <button
      key={status}
      onClick={() => setSelectedOrderType(status)}
      className={`px-2 py-1 border  ${
        selectedOrderType === status ? 'border-blue-500 text-blue-500' : 'border-gray-300 text-gray-600'
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </button>
  ))}
</div>

</div>


        <div className="grid grid-cols-12 gap-4">
          {/* Menu Items Grid */}
          <div className={`transition-all  duration-300 ease-in-out ${showViewPanel ? 'col-span-6' : 'col-span-12'}`}>
            <div className={`  ${showViewPanel
                ? 'grid-cols-1 sm:grid-cols-2  lg:grid-cols-2'
                : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4'
              }`}>  {filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 mt-6">
      <FontAwesomeIcon icon={faShoppingCart} className="text-gray-400 h-16 w-16" />
      <p className="mt-4 text-gray-600 text-lg font-medium">
        No orders found
      </p>
     
    </div>
              
              ) : (
                filteredOrders.map((dateGroup) => (
                  <div key={dateGroup.date}>
                    <h2 className="text-xl font-bold mb-3 mt-3 text-gray-800">{dateGroup.date}</h2>
                    <div className={` grid gap-4 ${showViewPanel
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2'
                : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4'}`}>
                      {dateGroup.orders.map((item) => (
                        <div
                          key={item.order_id}
                          className={`bg-white cursor-pointer rounded-lg shadow-md p-4 border  
                            ${{
                              cooking: 'border-r-4 border-yellow-500',
                              placed: 'border-r-4 border-blue-400',
                              served: 'border-r-4 border-green-400',
                              paid: 'border-r-4 border-purple-500',
                              cancelled: 'border-r-4 border-red-400',
                            }[item.order_status] || 'border-r-4 border-blue-400'}`}                           onClick={() => handleView(item.order_number)}
                        >
                          <div>
                            <div className="flex flex-wrap gap-4  items-center justify-between mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">#{item.order_number}</h3>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <p>{item.time}</p>
                              </div>
                            </div>
        
                            <div className="grid grid-cols-2   gap-y-2 text-sm text-gray-600">
                           
        
                              <div className="flex items-center space-x-2">
                                {/* Conditional rendering for Order Type */}
                                {item.order_type === "drive-through" && (
                                  <>
                                    <FontAwesomeIcon icon={faCar} className="text-gray-600" />
                                    <p>Drive-through</p>
                                  </>
                                )}
                                 {item.order_type === "counter" && (
                                  <>
                                    <FontAwesomeIcon icon={faStore} className="text-gray-600" />
                                    <p>Counter</p>
                                  </>
                                )}
                                {item.order_type === "parcel" && (
                                  <>
                                    <FontAwesomeIcon icon={faHandHoldingHeart} className="text-gray-600 " />
                                    <p>Parcel</p>
                                  </>
                                )}
                                {item.order_type === "dine-in" && (
                                  <>
                                    <FontAwesomeIcon icon={faUtensils} className="text-gray-600" />
                                    <p>Dine-in</p>
                                  </>
                                )}
                              </div>
     
                              <div className="text-end">
                              <div className="flex items-center justify-end space-x-2">
  {item.section_name && item.table_number ? (
    <>
      <p>
        {`${item.section_name} - ${item.table_number}`}
      </p>
      <FontAwesomeIcon
        icon={faMapMarkerAlt} // Icon for section and table
        className="text-gray-600"
      />
    </>
  ) : null}
</div>

</div>

        
                              <div className="flex items-center space-x-2">
                                <FontAwesomeIcon icon={faUtensils} className="text-gray-600" />
                                <p>{item.menu_count} Menu</p>
                              </div>
        
                              <div className="text-end">
                                <p className="text-md font-bold text-blue-600">
                                ₹{parseFloat(item.grand_total).toFixed(2)}{" "}

                                  {/* <span className="text-sm line-through text-gray-400">{item.total_bill_amount}</span> */}
                                </p>
                              </div>
                            </div>
                          </div>
        
                          <div className="flex items-center justify-between mt-4">
  <div className="flex items-center">
    <FontAwesomeIcon
      icon={
        {
          cooking: faUtensils,
          placed: faClipboardCheck,
          served: faConciergeBell,
          paid: faMoneyCheckAlt,
          cancelled: faTimesCircle,
        }[item.order_status]
      }
      className={
        {
          cooking: "text-yellow-500 mr-2",
          placed: "text-blue-500 mr-2",
          served: "text-green-500 mr-2",
          paid: "text-purple-500 mr-2",
          cancelled: "text-red-500 mr-2",
        }[item.order_status]
      }
    />
    <p
      className={`text-sm capitalize ${
        {
          cooking: "text-yellow-500",
          placed: "text-blue-500",
          served: "text-green-500",
          paid: "text-purple-500",
          cancelled: "text-red-500",
        }[item.order_status]
      }`}
    >
      {item.order_status}
    </p>
  </div>

  <CountdownTimer 
            orderTime={item.time} 
            orderStatus={item.order_status}
          />
        
        {item.order_status === "paid" && item.payment_method && (
  <button className="px-1 py-1 text-xs border capitalize rounded-sm text-gray-500 border-gray-500">
    {item.payment_method}
  </button>
)}

                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {showViewPanel && (
            <OrderView
              item={orderDetails}  // Ensure the correct prop name is passed
              onClose={() => setShowViewPanel(false)}
              // loading={loading}
              error={error}
              onStatusUpdate={handleStatusUpdate}
            />
          )}


        </div>
      </div>
      <Tooltip id="tooltip-back" />
      <Footer />
    </div>

  );
}

export default OrderDetails;


