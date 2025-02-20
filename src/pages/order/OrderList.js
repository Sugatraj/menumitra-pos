import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faPrint,
  faPaperPlane,
  faArrowLeft,
  faUtensils,
  faShoppingCart,
  faPlus,
  faMinus,
  faGooglePay,
  faAmazon,
  faCcPaypal,
  faPhoneAlt,
  faBowlFood,
 
  faCarrot,
  faSave,
  faTimes,
  faFileAlt,
  faCheck,
  FaPrint,
  faTrash,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import Header from '../../components/Header';
import { Tooltip } from 'react-tooltip';
import Footer from '../../components/Footer';
import axios from 'axios';
import phonepe from "../../assets/upi/phonepe.jpg"
import googlepay from "../../assets/upi/googlepay.jpg"
import upi from "../../assets/upi/upi.jpg"
import amazonpe from "../../assets/upi/amazonpe.png"
import paytm from "../../assets/upi/paytm.jpg"
import QRCode from 'qrcode';
import { useNavigate } from 'react-router-dom';
function OrderList() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    section_name,
    section_id,
    table_number,
    is_occupied,
    table_id,
    order_id,
    grand_total = 0,
    order_number = '',
    order_type
  } = location.state || {};
  // const { order_type } = location.state || {};
  // Initialize states
  const [orderNumber, setOrderNumber] = useState(order_number);
  const [isOccupied, setIsOccupied] = useState(is_occupied || false);
  const [cartItems, setCartItems] = useState([]);

  const outlet_name = localStorage.getItem("outlet_name");

  // Other state declarations
  const [selectedTable, setSelectedTable] = useState('T1');
  const [searchQuery, setSearchQuery] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestContact, setGuestContact] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menus, setMenus] = useState([]); // For storing menu items from API

  // Add order type state
  const [orderType, setOrderType] = useState(order_type);

  // Add new state for price type
  const [priceTypes, setPriceTypes] = useState({}); // Store price type (half/full) for each menu item

  // Add state for order details
  const [orderDetails, setOrderDetails] = useState({

    total_bill_amount: 0,

    total_bill_with_discount: 0,

    service_charges_percent: 0,

    service_charges_amount: 0,

    gst_percent: 0,

    gst_amount: 0,

    discount_percent: 0,

    discount_amount: 0,

    grand_total: 0

  });

  // Add these state variables at the top with other states
  const [isProcessingKot, setIsProcessingKot] = useState(false);
  const [isProcessingPrint, setIsProcessingPrint] = useState(false);
  const [isProcessingSave, setIsProcessingSave] = useState(false);
  const [isProcessingSettle, setIsProcessingSettle] = useState(false);

  const outlet_id = localStorage.getItem('outlet_id');
  const user_id = localStorage.getItem('user_id');

  // Add this with your other state declarations at the top
  const [order_details, setOrder_details] = useState(null);

  // Add this state for tracking which menu item's dropdown is open
  const [selectedMenuForPortion, setSelectedMenuForPortion] = useState(null);

  // Add this state for the modal
  const [portionModal, setPortionModal] = useState({
    isOpen: false,
    menuItem: null
  });

  // Add state to track new menu items
  const [newMenuItems, setNewMenuItems] = useState([]);

  useEffect(() => {
    if (order_id) {
      fetchOrderMenuDetails();
    }
    fetchMenuData();
  }, [order_id]);

  const fetchMenuData = async () => {
    const accessToken = localStorage.getItem("access");  // Retrieve access token
  
    if (!accessToken) {
      console.error("No access token found");
      navigate("/login"); // Redirect if token is missing
      return;
    }
  
    setLoading(true);  // Start loading before making the request
  
    try {
      const response = await fetch('https://menusmitra.xyz/common_api/get_all_menu_list_by_category', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,  // Send the access token for authorization
        },
        body: JSON.stringify({
          outlet_id: outlet_id
        }),
      });
  
      if (response.status === 401) {
        console.error("Unauthorized access. Redirecting to login.");
        navigate("/login"); // Redirect if token is missing
        return;
      }
  
      const data = await response.json();
  
      if (data.st === 1) {
        const transformedCategories = data.data.category.map(cat => ({
          id: cat.menu_cat_id,
          name: cat.category_name,
          icon: getCategoryIcon(cat.category_name),
          color: getCategoryColor(cat.category_name),
          items: data.data.menus.filter(menu => menu.menu_cat_id === cat.menu_cat_id)
        }));
  
        setMenus(data.data.menus);  // Set menus directly from the response
        setCategories(transformedCategories);
        setSelectedCategory(transformedCategories[0]?.name || '');
      } else {
        console.error('Error fetching menu data:', data.msg || 'Unknown error');
        window.showToast?.('error', data.msg || 'Failed to fetch menu data');
      }
    } catch (error) {
      console.error('Error fetching menu data:', error);
      window.showToast?.('error', 'Failed to fetch menu data');
    } finally {
      setLoading(false);  // Ensure loading is set to false after the operation
    }
  };
  

  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      'South': faUtensils,
      'Chinese': faBowlFood,
      'Dg': faCarrot,
      // Add more mappings as needed
    };
    return iconMap[categoryName] || faUtensils;
  };

  const getCategoryColor = (categoryName) => {
    const colorMap = {
      'South': 'from-yellow-400 to-orange-500',
      'Chinese': 'from-red-500 to-red-700',
      'Dg': 'from-green-500 to-emerald-600',
      // Add more mappings as needed
    };
    return colorMap[categoryName] || 'from-gray-400 to-gray-600';
  };

  const calculateItemTotal = (item) => {
    const basePrice = item.price || 0;
    const quantity = item.quantity || 0;
    const offer = item.offer || 0;

    // Calculate menu discount amount
    const menuDiscountAmount = (basePrice * (offer / 100));
    const priceAfterDiscount = basePrice - menuDiscountAmount;

    return priceAfterDiscount * quantity;
  };

  const calculateOrderTotals = (items) => {
    // Calculate initial totals with proper number conversion
    const total_bill_amount = items.reduce((acc, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return acc + (price * quantity);
    }, 0);

    // Calculate total discount with proper number conversion
    const discount_amount = items.reduce((acc, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      const offer = Number(item.offer) || 0;
      const itemDiscount = (price * quantity * offer) / 100;
      return acc + itemDiscount;
    }, 0);

    // Calculate total after discount
    const total_bill_with_discount = total_bill_amount - discount_amount;

    // Get service charge and GST percentages from localStorage
    const service_charges_percent = Number(localStorage.getItem('service_charges')) || 0;
    const gst_percent = Number(localStorage.getItem('gst')) || 0;

    // Calculate service charges and GST
    const service_charges_amount = (total_bill_with_discount * service_charges_percent) / 100;
    const gst_amount = (total_bill_with_discount * gst_percent) / 100;

    // Calculate grand total
    const grand_total = total_bill_with_discount + service_charges_amount + gst_amount;

    // Calculate discount percentage
    const discount_percent = total_bill_amount > 0
      ? Number(((discount_amount / total_bill_amount) * 100).toFixed(2))
      : 0;

    return {
      total_bill_amount: Number(total_bill_amount.toFixed(2)),
      total_bill_with_discount: Number(total_bill_with_discount.toFixed(2)),
      service_charges_percent: Number(service_charges_percent.toFixed(2)),
      service_charges_amount: Number(service_charges_amount.toFixed(2)),
      gst_percent: Number(gst_percent.toFixed(2)),
      gst_amount: Number(gst_amount.toFixed(2)),
      discount_percent: Number(discount_percent.toFixed(2)),
      discount_amount: Number(discount_amount.toFixed(2)),
      grand_total: Number(grand_total.toFixed(2))
    };
  };

  const updateQuantity = (cartId, change) => {
    setCartItems(prevItems => {
      const updatedItems = prevItems.map(item => {
        if (item.cartId === cartId) {
          // Calculate new quantity with limits
          const newQuantity = Math.min(20, Math.max(1, item.quantity + change));

          // Only update if within limits
          if ((change > 0 && item.quantity < 20) || (change < 0 && item.quantity > 1)) {
            return {
              ...item,
              quantity: newQuantity,
              menu_sub_total: newQuantity * item.price
            };
          }
        }
        return item;
      });

      // Calculate new totals
      const newTotals = calculateOrderTotals(updatedItems);
      setOrderDetails(newTotals);
      return updatedItems;
    });
  };

  const handleMenuClick = (menuItem) => {
    if (Number(menuItem.half_price) === 0) {
      // If no half price, add directly to cart with full portion
      handleAddToCart(menuItem, 'full');
    } else {
      // Show modal for portion selection
      setPortionModal({
        isOpen: true,
        menuItem: menuItem
      });
    }
  };

  const handleAddToCart = (menuItem, portionType) => {
    const price = portionType === 'half' ? Number(menuItem.half_price) : Number(menuItem.full_price);

    const existingItemIndex = cartItems.findIndex(item => 
      item.id === menuItem.menu_id && 
      item.half_or_full === portionType
    );

    if (existingItemIndex !== -1) {
      setCartItems(prevItems => {
        const updatedItems = [...prevItems];
        const existingItem = updatedItems[existingItemIndex];
        
        if (existingItem.quantity < 20) {
          existingItem.quantity += 1;
          existingItem.menu_sub_total = existingItem.quantity * existingItem.price;
        }
        
        const newTotals = calculateOrderTotals(updatedItems);
        setOrderDetails(newTotals);
        return updatedItems;
      });
    } else {
      const newItem = {
        id: menuItem.menu_id,
        name: menuItem.menu_name,
        half_or_full: portionType,
        price: price,
        quantity: 1,
        offer: Number(menuItem.offer) || 0,
        half_price: Number(menuItem.half_price) || 0,
        full_price: Number(menuItem.full_price) || 0,
        cartId: `${menuItem.menu_id}-${portionType}`,
        isNewItem: true // Mark as new item
      };

      const updatedItems = [...cartItems, newItem];
      setCartItems(updatedItems);
      setNewMenuItems(prev => [...prev, newItem]); // Track new items
      
      const newTotals = calculateOrderTotals(updatedItems);
      setOrderDetails(newTotals);
    }

    setSelectedMenuForPortion(null);
  };

  const removeItem = (cartId) => {
    setCartItems(prevItems => {
      const updatedItems = prevItems.filter(item => item.cartId !== cartId);
      const newTotals = calculateOrderTotals(updatedItems);
      setOrderDetails(newTotals);
      return updatedItems;
    });
    
    // Also remove from newMenuItems if it exists there
    setNewMenuItems(prev => prev.filter(item => item.cartId !== cartId));
  };

  const clearCart = () => {
    setCartItems([]);
    // Reset order details when cart is cleared
    setOrderDetails({
      total_bill_amount: 0,
      total_bill_with_discount: 0,
      service_charges_percent: Number(localStorage.getItem('service_charges')) || 0,
      service_charges_amount: 0,
      gst_percent: Number(localStorage.getItem('gst')) || 0,
      gst_amount: 0,
      discount_percent: 0,
      discount_amount: 0,
      grand_total: 0
    });
  };

  const handleKOTSubmit = async () => {
    try {

      const accessToken = localStorage.getItem("access");  // Retrieve access token
  
      if (!accessToken) {
        console.error("No access token found");
        navigate("/login"); // Redirect if token is missing
        return;
      }
      const orderItems = cartItems.map(item => ({
        menu_id: item.id.toString(),
        quantity: item.quantity,
        comment: item.comment || "",
        half_or_full: item.half_or_full,
        price: item.price
      }));

      const orderData = {
        user_id: user_id,
        action: "print",
        outlet_id: outlet_id,
        order_type: orderType,
        order_items: orderItems,
        order_status: "placed",
        ...(orderType === 'dine-in' && {
          tables: [table_number.toString()],
          section_id: section_id
        })
      };

      // Send the request to create the order
      const response = await axios.post('https://menusmitra.xyz/common_api/create_order', orderData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,  // Send the access token for authorization
        }
      });
  
      console.log('API Response:', response.data); // Log the API response for debugging

      // Check if the response is successful (st = 1)
      if (response.data.st === 1) {
        // setOrderNumber(response.data.order_number);
        // setIsOccupied(orderType === 'dine-in');
        // window.showToast("success", "Order placed successfully");
        setOrderNumber(response.data.order_number);
        setIsOccupied(orderType === 'dine-in');
        // window.showToast("success", "Order placed successfully");

        // Fetch order details using order number
        fetchOrderDetailsPrint(response.data.order_number);


        // Refresh the order details if needed
        if (response.data.order_id) {
          fetchOrderDetails();
        }
      } else {

        // If "st" is not 1, display an error message with the response message
        window.showToast("error", response.data.msg || "Failed to place order");
      }
    } catch (error) {
      console.error('Error creating order:', error);
      window.showToast("error", "Failed to place order");
      if (error.response && error.response.status === 401) {
        console.error("Unauthorized, redirecting to login...");
        navigate("/login"); // Redirect if token is missing
      } else {
        window.showToast("error", "Failed to place order");
      }
    }
  };
  const handlePrintSubmit = async () => {
    try {
      const accessToken = localStorage.getItem("access"); // Retrieve access token
  
      if (!accessToken) {
        console.error("No access token found");
        navigate("/login"); // Redirect if token is missing
        return;
      }
  
      const orderItems = cartItems.map(item => ({
        menu_id: item.id.toString(),
        quantity: item.quantity,
        comment: item.comment || "",
        half_or_full: item.half_or_full,
        price: item.price
      }));
  
      const orderData = {
        user_id: user_id,
        action: "print",
        outlet_id: outlet_id,
        order_type: orderType,
        order_items: orderItems,
        order_status: "placed",
        ...(orderType === 'dine-in' && {
          tables: [table_number.toString()],
          section_id: section_id
        })
      };
  
      // Send the request to create the order
      const response = await axios.post('https://menusmitra.xyz/common_api/create_order', orderData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`, // Send the access token for authorization
        }
      });
  
      console.log('API Response:', response.data); // Log the API response for debugging
  
      // Check if the response is successful (st = 1)
      if (response.data.st === 1) {
        setOrderNumber(response.data.order_number);
        setIsOccupied(orderType === 'dine-in');
  
        // Fetch order details using order number
        fetchOrderDetailsPrintPrint(response.data.order_number);
  
        // Refresh the order details if needed
        if (response.data.order_id) {
          fetchOrderDetails();
        }
  
        // Call the update order status API when st = 1
        await updateOrderStatus(response.data.order_id);
  
      } else {
        // If "st" is not 1, display an error message with the response message
        window.showToast("error", response.data.msg || "Failed to place order");
      }
    } catch (error) {
      console.error('Error creating order:', error);
      window.showToast("error", "Failed to place order");
      if (error.response && error.response.status === 401) {
        console.error("Unauthorized, redirecting to login...");
        navigate("/login"); // Redirect if token is missing
      }
    }
  };
  
  // Function to update the order status
  const updateOrderStatus = async (orderId) => {
    try {
      const accessToken = localStorage.getItem("access"); // Retrieve access token
  
      if (!accessToken) {
        console.error("No access token found");
        navigate("/login"); // Redirect if token is missing
        return;
      }
  
      const updateData = {
        outlet_id: outlet_id.toString(),
        order_id: orderId.toString(),
        order_status: "paid",
        user_id: user_id
      };
  
      const response = await axios.post('https://menusmitra.xyz/common_api/update_order_status', updateData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      });
  
      console.log('Update Order Status Response:', response.data);
  
      if (response.data.st === 1) {
        clearCart();
        window.showToast("success", "Order status updated successfully");
       
      } else {
        window.showToast("error", response.data.msg || "Failed to update order status");
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      window.showToast("error", "Failed to update order status");
    }
  };
  

  const handleKOTSubmitSave = async () => {
    try {
      const accessToken = localStorage.getItem("access");  // Retrieve access token
  
      if (!accessToken) {
        console.error("No access token found");
        navigate("/login"); // Redirect if token is missing
        return;
      }
      const orderItems = cartItems.map(item => ({
        menu_id: item.id.toString(),
        quantity: item.quantity,
        comment: item.comment || "",
        half_or_full: item.half_or_full,
        price: item.price
      }));

      const orderData = {
        user_id: user_id,
        outlet_id: outlet_id,
        action: "save",
        order_type: orderType,
        order_items: orderItems,
        order_status: "placed",
        ...(orderType === 'dine-in' && {
          tables: [table_number.toString()],
          section_id: section_id
        })
      };

      // Send the request to create the order
      const response = await axios.post('https://menusmitra.xyz/common_api/create_order', orderData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,  // Send the access token for authorization
        }
      });
      console.log('API Response:', response.data); // Log the API response for debugging

      // Check if the response is successful (st = 1)
      if (response.data.st === 1) {
        // setOrderNumber(response.data.order_number);
        // setIsOccupied(orderType === 'dine-in');
        // window.showToast("success", "Order placed successfully");
        setOrderNumber(response.data.order_number);
        setIsOccupied(orderType === 'dine-in');
        window.showToast("success", "Order placed successfully");

      


        // Refresh the order details if needed
        if (response.data.order_id) {
          fetchOrderDetails();
        }
      } else {

        // If "st" is not 1, display an error message with the response message
        window.showToast("error", response.data.msg || "Failed to place order");
      }
    } catch (error) {
      console.error('Error creating order:', error);
      window.showToast("error", "Failed to place order");
      if (error.response && error.response.status === 401) {
        console.error("Unauthorized, redirecting to login...");
        navigate("/login"); // Redirect if token is missing
      } else {
        window.showToast("error", "Failed to place order");
      }
    }
  };

  const fetchOrderDetailsPrint = async (orderNumber) => {
    try {
      const accessToken = localStorage.getItem("access");  // Retrieve access token
  
      if (!accessToken) {
        console.error("No access token found");
        navigate("/login"); // Redirect if token is missing
        return;
      }
  
      const viewResponse = await axios.post('https://menusmitra.xyz/common_api/order_view', 
        { order_number: orderNumber },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,  // Send the access token for authorization
          }
        }
      );
  
      if (viewResponse.data.st === 1) {
        printOrderDetails(viewResponse.data.lists);
      } else {
        window.showToast("error", viewResponse.data.msg || "Failed to fetch order details");
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
  
      // Check for 401 Unauthorized error and redirect to login page
      if (error.response && error.response.status === 401) {
        console.error("Unauthorized, redirecting to login...");
        navigate("/login"); // Redirect if token is missing
      } else {
        window.showToast("error", "Failed to fetch order details");
      }
    }
  };
  
  

  // const printOrderDetails = async (orderData) => {
  //   const { order_details, menu_details } = orderData;
  //   const outlet_upi = localStorage.getItem("outlet_upi") || "Outlet UPI";
  //   const outlet_name = localStorage.getItem("outlet_name") || "Outlet Name";
  //   const outlet_address = localStorage.getItem("outlet_address") || "Outlet Address";
  //   const website_url = localStorage.getItem("website_url") || "https://menumitra.com";
  //   const orderItemsHTML = menu_details.map(item => `
  //     <tr style="color: #000;">
  //       <td style="padding: 4px 0; color: #000; font-weight: bold;">${item.menu_name}</td>
  //       <td style="padding: 4px 0; text-align: center; font-weight: bold;">${item.quantity}</td>
  //       <td style="padding: 4px 0; text-align: center; font-weight: bold;">₹${item.price.toFixed(2)}</td>
  //       <td style="padding: 4px 0; text-align: center; font-weight: bold;">₹${item.menu_sub_total.toFixed(2)}</td>
  //     </tr>
  //   `).join('');
  
  //   const tableSection =
  //   Array.isArray(order_details.table_number) &&
  //   order_details.table_number.length > 0 &&
  //   order_details.section !== null &&
  //   order_details.section !== undefined
  //     ? `
  //        <div style="display: flex; justify-content: space-between; font-weight: bold;">
  //          <span>Table: ${order_details.section || '-'} - ${order_details.table_number.join(', ')}</span>
  //        </div>
  //      `
  //     : '';
  
  //   const typeSection =
  //     (!order_details.section || !Array.isArray(order_details.table_number) || order_details.table_number.length === 0)
  //       ? `
  //          <div style="display: flex; justify-content: space-between; font-weight: bold;">
  //            <span>Type: ${order_details.order_type || '-'}</span>
  //          </div>
  //        `
  //       : '';
  
  //   const upiId = outlet_upi;
  //   const price = order_details.grand_total.toFixed(2); // Total price
  
  //   try {
  //     const upiLink = `upi://pay?pa=${upiId}&pn=Merchant&am=${price}&tid=${order_details.order_number}`;
  //     const qrCodeDataUrl = await QRCode.toDataURL(upiLink); // Use async/await for the QR code generation
  
  //     const printContent = `
  //       <div style="width: 100%; color: black;">
  //         <div style="text-align: center; margin-bottom: 10px;">
  //           <h2 style="margin: 0; font-size: 16px; text-transform: capitalize;">${outlet_name}</h2>
  //           <h3 style="margin: 4px 0; font-size: 12px; text-transform: capitalize;">${outlet_address}</h3>
  //         </div>
  
  //         <div style="margin-bottom: 10px; font-size: 10px; color: black;">
  //           <div style="display: flex; justify-content: space-between; color: #000; font-weight: bold;">
  //             <span>Order: #${order_details.order_number}</span>
  //           </div>
  //           ${tableSection}
  //           ${typeSection}
    
  //           <div style="display: flex; justify-content: space-between; font-weight: bold;">
  //             <span>DateTime: ${order_details.datetime}</span>
  //           </div>
  //         </div>
    
  //         <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
  //           <thead>
  //             <tr style="border-top: 1px dotted #000; border-bottom: 1px dotted #000;">
  //               <th style="padding: 4px 0; text-align: left; font-weight: bold;">Item</th>
  //               <th style="padding: 4px 0; text-align: center; font-weight: bold;">Qty</th>
  //               <th style="padding: 4px 0; text-align: right; font-weight: bold;">Rate</th>
  //               <th style="padding: 4px 0; text-align: center; font-weight: bold;">Amt</th>
  //             </tr>
  //           </thead>
  //           <tbody>
  //             ${orderItemsHTML}
  //           </tbody>
  //         </table>
    
  //         <div style="margin-top: 10px; font-size: 10px; text-align: right;">
  //           <div style="border-top: 1px dotted #000; padding-top: 4px;">
  //             <div style="display: flex; justify-content: space-between; margin: 4px 0; font-weight: bold;">
  //               <span>Subtotal:</span>
  //               <span>₹${order_details.total_bill_amount.toFixed(2)}</span>
  //             </div>
  //             <div style="display: flex; justify-content: space-between; margin: 4px 0; font-weight: bold;">
  //               <span>Discount(${order_details.discount_percent}%):</span>
  //               <span>-₹${order_details.discount_amount.toFixed(2)}</span>
  //             </div>
  //             <div style="display: flex; justify-content: space-between; margin: 4px 0; font-weight: bold;">
  //               <span>Service Charges(${order_details.service_charges_percent}%):</span>
  //               <span>+₹${order_details.service_charges_amount.toFixed(2)}</span>
  //             </div>
  //             <div style="display: flex; justify-content: space-between; margin: 4px 0; font-weight: bold;">
  //               <span>GST(${order_details.gst_percent}%):</span>
  //               <span>+₹${order_details.gst_amount.toFixed(2)}</span>
  //             </div>
  //             <div style="display: flex; justify-content: space-between; margin: 4px 0; font-weight: bold; font-size: 12px; border-top: 1px dotted #000; padding-top: 4px; border-bottom: 1px dotted #000; padding-bottom: 4px;">
  //               <span>Total:</span>
  //               <span>₹${order_details.grand_total.toFixed(2)}</span>
  //             </div>
  //           </div>
  //         </div>
  
  //         <div style="text-align: center; margin-top: 10px;">
  //           <div style="margin-top: 0; display: flex; justify-content: space-around; align-items: center;">
  //             <img src="${phonepe}" alt="PhonePe" style="width: 30px; height: auto;" />
  //             <img src="${googlepay}" alt="GooglePay" style="width: 30px; height: auto;" />
  //             <img src="${paytm}" alt="Paytm" style="width: 30px; height: auto;" />
  //             <img src="${amazonpe}" alt="AmazonPay" style="width: 30px; height: auto;" />
  //             <img src="${upi}" alt="UPI" style="width: 30px; height: auto;" />
  //           </div>
  
  //           <img src="${qrCodeDataUrl}" alt="QR Code for Payment" style="width: 100px; height: 100px; margin-top: 0;" />
  //           <p style="font-size: 10px; font-weight: bold; margin-top: 0;">Scan to Pay ₹${price}</p>
  //         </div>
  
  //         <div style="margin-top: 10px; text-align: center; font-size: 10px;">
  //           <p style="margin: 0; font-weight: bold;"><a href="${website_url}" style="color: #000; text-decoration: none;">${website_url}</a></p>
  //         </div>
  //       </div>
  //     `;
  
  //     const printWindow = window.open('', '', 'height=600,width=400');
  //     printWindow.document.write(`
  //       <html>
  //     <head>
  //   <style>
  //     @page {
  //       size: 2in 3in; /* Explicitly set page size to 2in width and 3in height */
  //       margin: 0; /* Remove all margins */
  //     }
  //     body {
  //       margin: 0;
  //       padding: 0;
  //       width: 100%;
  //       font-family: 'Courier New', monospace;
  //       box-sizing: border-box;
  //     }
  //     html {
  //       margin: 0;
  //       padding: 0;
  //     }
  //     .print-content {
  //       width: 100%;
  //       box-sizing: border-box;
  //       margin-left: 0 !important;
  //       padding-left: 0 !important;
  //     }
  //     table {
  //       width: 100%;
  //       border-collapse: collapse;
  //     }
  //     th, td {
  //       padding: 3px;
  //       font-size: 10px; /* Reduced font size for fitting content */
  //     }
  //   </style>
  // </head>
  
  //         <body>${printContent}</body>
  //       </html>
  //     `);
      
  //     printWindow.document.close();
  
  //     // Wait for a brief moment to ensure content is fully loaded before printing
  //     setTimeout(() => {
  //       printWindow.print();
  //     }, 500);  // Adjust the timeout if needed
  //   } catch (error) {
  //     console.error('Error generating QR code:', error);
  //   }
  // };
  

  const printOrderDetails = async (orderData) => {
    const { order_details, menu_details } = orderData;
    const outlet_upi = localStorage.getItem("outlet_upi") || "Outlet UPI";
    const outlet_name = localStorage.getItem("outlet_name") || "Outlet Name";
    const outlet_address = localStorage.getItem("outlet_address") || "Outlet Address";
    const website_url = localStorage.getItem("website_url") || "https://menumitra.com";
    const image = localStorage.getItem("image");
  
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
  
  const fetchOrderDetailsPrintPrint = async (orderNumber) => {
    try {
      const accessToken = localStorage.getItem("access");  // Retrieve access token
  
      if (!accessToken) {
        console.error("No access token found");
        navigate("/login"); // Redirect if token is missing
        return;
      }
  
      const viewResponsePrint = await axios.post('https://menusmitra.xyz/common_api/order_view', 
        { order_number: orderNumber },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,  // Send the access token for authorization
          }
        }
      );
  
      if (viewResponsePrint.data.st === 1) {
        printOrderDetailsPrint(viewResponsePrint.data.lists);
      } else {
        window.showToast("error", viewResponsePrint.data.msg || "Failed to fetch order details");
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
  
      // Check for 401 Unauthorized error and redirect to login page
      if (error.response && error.response.status === 401) {
        console.error("Unauthorized, redirecting to login...");
        navigate("/login"); // Redirect if token is missing
      } else {
        window.showToast("error", "Failed to fetch order details");
      }
    }
  };
  

  const printOrderDetailsPrint = async (orderData) => {
    const { order_details, menu_details } = orderData;
    const outlet_upi = localStorage.getItem("outlet_upi") || "Outlet UPI";
    const outlet_name = localStorage.getItem("outlet_name") || "Outlet Name";
    const outlet_address = localStorage.getItem("outlet_address") || "Outlet Address";
    const website_url = localStorage.getItem("website_url") || "https://menumitra.com";
    const orderItemsHTML = menu_details.map(item => `
      <tr style="color: #000;">
        <td style="padding: 4px 0; color: #000; font-weight: bold; text-align: left">${item.menu_name}</td>
        <td style="padding: 6px; text-align: center; font-weight: bold; text-align: right">${item.quantity}</td>
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
  
    try {
  
      const printContent = `
        <div style="width: 280px; margin: 0; padding: 0; color: black;">
          <div style="text-align: center; margin-bottom: 10px;">
                      <h2 style="margin-top: 1; font-size: 20px; text-transform: capitalize;">***KOT***</h2>
  
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
                <th style="padding: 5px 0; text-align: right; font-weight: bold;">Qty</th>
              </tr>
            </thead>
            <tbody>
              ${orderItemsHTML}
            </tbody>
          </table>
  
          <div style="display: flex; justify-content: left; align-items: center; text-align: center; margin: 4px; font-weight: bold; font-size: 16px; border-top: 1px dotted #000; padding-top: 4px; border-bottom: 1px dotted #000; padding-bottom: 4px;">
            <span style="flex: 1; text-align: left;">Total Items:</span>
            <span style="flex: 1; text-align: right;">${menu_details.reduce((total, item) => total + item.quantity, 0)}</span>
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
      }, 500);
  
      // Monitor if the print window is closed and navigate home
      // const checkWindowClosed = setInterval(() => {
      //   if (printWindow.closed) {
      //     clearInterval(checkWindowClosed);
      //     navigate('/home'); // Use navigate to go to the home screen route
      //   }
      // }, 1000);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };
  

// const printOrderDetailsPrint = async (orderData) => {
//   const { order_details, menu_details } = orderData;
//   const outlet_upi = localStorage.getItem("outlet_upi") || "Outlet UPI";
//   const outlet_name = localStorage.getItem("outlet_name") || "Outlet Name";
//   const outlet_address = localStorage.getItem("outlet_address") || "Outlet Address";
//   const website_url = localStorage.getItem("website_url") || "https://menumitra.com";

//   const orderItemsHTML = menu_details.map(item => `
//     <tr style="font-size: 10px; font-weight: bold;">
//       <td style="text-align: left; padding: 2px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 70%; max-width: 150px;">
//         ${item.menu_name}
//       </td>
//       <td style="text-align: center; padding: 2px 0; width: 30%; max-width: 50px;">
//         ${item.quantity}
//       </td>
//     </tr>
//   `).join('');
  

//   const tableSection = order_details.table_number?.length > 0 && order_details.section
//     ? `<div style="font-size: 10px; font-weight: bold;">Table: ${order_details.section} - ${order_details.table_number.join(', ')}</div>`
//     : '';

//   const typeSection = !order_details.section || !order_details.table_number?.length
//     ? `<div style="font-size: 10px; font-weight: bold;">Type: ${order_details.order_type || '-'}</div>`
//     : '';

//   try {
//     const printContent = `
//       <div style="width: 100%; font-family: 'Courier New', monospace; padding: 5px;">
//         <div style="text-align: center; margin-bottom: 5px;">
//                   <h2 style="margin-top: 3; font-size: 12px; font-weight: bold;">***KOT***</h2>

//           <h2 style="margin: 0; font-size: 12px; font-weight: bold;">${outlet_name}</h2>
//           <h3 style="margin: 2px 0; font-size: 8px;">${outlet_address}</h3>
//         </div>

//         <div style="font-size: 10px; margin-bottom: 5px; border-bottom: 1px solid black; padding-bottom: 3px;">
//           <div><b>Order:</b> #${order_details.order_number}</div>
//           ${tableSection}
//           ${typeSection}
//           <div><b>DateTime:</b> ${order_details.datetime}</div>
//         </div>

//         <table style="width: 100%; font-size: 10px; border-collapse: collapse;">
//           <thead>
//             <tr style="border-bottom: 1px solid black;">
//               <th style="text-align: left; padding-bottom: 3px;">Item</th>
//               <th style="text-align: center; padding-bottom: 3px;">Qty</th>
//             </tr>
//           </thead>
//           <tbody>
//             ${orderItemsHTML}
//           </tbody>
//         </table>

//         <div style="display: flex; justify-content: left; align-items: center; text-align: center; margin: 3px; font-weight: bold; font-size: 12px; border-top: 1px dotted #000; padding-top: 3px; border-bottom: 1px dotted #000; padding-bottom: 3px;">
//           <span style="flex: 1; text-align: left;">Total Items:</span>
//           <span style="flex: 1; text-align: center;">${menu_details.reduce((total, item) => total + item.quantity, 0)}</span>
//         </div>
//       </div>
//     `;

//     const printWindow = window.open('', '', 'height=600,width=400');
//     printWindow.document.write(`
//       <html>
//         <head>
//           <style>
//             @page {
//               size: 2in 3in; /* Explicitly set page size to 2in width and 3in height */
//               margin: 0; /* Remove all margins */
//             }
//             body {
//               margin: 0;
//               padding: 0;
//               width: 100%;
//               font-family: 'Courier New', monospace;
//               box-sizing: border-box;
//             }
//             html {
//               margin: 0;
//               padding: 0;
//             }
//             .print-content {
//               width: 100%;
//               box-sizing: border-box;
//               margin-left: 0 !important;
//               padding-left: 0 !important;
//             }
//             table {
//               width: 100%;
//               border-collapse: collapse;
//             }
//             th, td {
//               padding: 3px;
//             }
//           </style>
//         </head>
//         <body>
//           <div class="print-content">${printContent}</div>
//         </body>
//       </html>
//     `);

//     printWindow.document.close();
//     setTimeout(() => printWindow.print(), 500);
//   } catch (error) {
//     console.error('Error generating print:', error);
//   }
// };

















  const handleUpdateOrderSave = async () => {
    if (!order_id) {
      window.showToast("error", "Order ID is missing");
      return;
    }

    try {
      const accessToken = localStorage.getItem("access");  // Retrieve access token
  
      if (!accessToken) {
        console.error("No access token found");
        navigate("/login"); // Redirect if token is missing
        return;
      }
      const orderItems = cartItems.map(item => ({
        menu_id: item.id.toString(),
        quantity: item.quantity,
        comment: item.comment || "",
        half_or_full: item.half_or_full,
        price: item.price
      }));

      const updateOrderData = {
        order_id: order_id,
        user_id: user_id,
        outlet_id: outlet_id,
        tables: [table_number],
        section_id: section_id,
        order_type: "dine-in",
        order_items: orderItems
      };

      const response = await axios.post(
        'https://menusmitra.xyz/common_api/update_order', 
        updateOrderData,  // The body of the request
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`  // Include the access token in the header
          }
        }
      );
      
      if (response.data.st === 1) {
        window.showToast("success", response.data.msg || "Order updated successfully");
     
      } else {
        window.showToast("error", response.data.msg || "Failed to update order");
      }
    } catch (error) {
      console.error('Error updating order:', error);
      window.showToast("error", "Failed to update order");
      if (error.response && error.response.status === 401) {
        console.error("Unauthorized, redirecting to login...");
        navigate("/login"); // Redirect if token is missing
      } else {
        window.showToast("error", "Failed to settle order");
      }
    }
  };
  const handleSettleSubmit = async () => {
    try {
      const accessToken = localStorage.getItem("access"); // Retrieve access token
  
      if (!accessToken) {
        console.error("No access token found");
        navigate("/login"); // Redirect if token is missing
        return;
      }
  
      if (order_id) {
        // Step 1: Update Order
        const orderItems = cartItems.map(item => ({
          menu_id: item.id.toString(),
          quantity: item.quantity,
          comment: item.comment || "",
          half_or_full: item.half_or_full,
          price: item.price
        }));
  
        const updateOrderData = {
          order_id: order_id,
          user_id: user_id,
          outlet_id: outlet_id,
          tables: [table_number],
          section_id: section_id,
          order_type: "dine-in",
          order_items: orderItems
        };
  
        const updateOrderResponse = await axios.post('https://menusmitra.xyz/common_api/update_order', updateOrderData, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
  
        if (updateOrderResponse.data.st === 1) {
          // Step 2: Update Order Status
          const updateOrderStatusResponse = await axios.post('https://menusmitra.xyz/common_api/update_order_status', {
            outlet_id: outlet_id,
            order_id: order_id.toString(),
            order_status: "paid",
            user_id: user_id,
          }, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          });
  
          if (updateOrderStatusResponse.data.st === 1) {
            clearCart();
            window.showToast("success", "Order updated and settled successfully");
          } else {
            window.showToast("error", updateOrderStatusResponse.data.msg || "Failed to update order status");
          }
        } else {
          window.showToast("error", updateOrderResponse.data.msg || "Failed to update order");
        }
      } else {
        // Step 3: Create a new order
        const orderItems = cartItems.map(item => ({
          menu_id: item.id.toString(),
          quantity: item.quantity,
          comment: item.comment || "",
          half_or_full: item.half_or_full,
          price: item.price
        }));
  
        const orderData = {
          user_id: user_id,
          outlet_id: outlet_id,
          order_type: orderType,
          order_items: orderItems,
          order_status: "paid",
          action: "settle",
          ...(orderType === 'dine-in' ? {
            tables: [table_number.toString()],
            section_id: section_id
          } : {
            customer_name: guestName,
            customer_mobile: guestContact
          })
        };
  
        const createOrderResponse = await axios.post('https://menusmitra.xyz/common_api/create_order', orderData, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
  
        if (createOrderResponse.data.st === 1) {
          clearCart();
          window.showToast("success", "Order created and settled successfully");
        } else {
          window.showToast("error", createOrderResponse.data.msg || "Failed to create order");
        }
      }
    } catch (error) {
      console.error('Error settling order:', error);
      window.showToast("error", "Failed to settle order");
  
      if (error.response?.status === 401) {
        console.error("Unauthorized, redirecting to login...");
        navigate("/login");
      }
    }
  };
  

  const handleUpdateOrder = async () => {
    if (!order_id) {
      window.showToast("error", "Order ID is missing");
      return;
    }

    try {
      const accessToken = localStorage.getItem("access");  // Retrieve access token
  
      if (!accessToken) {
        console.error("No access token found");
        navigate("/login"); // Redirect if token is missing
        return;
      }
      const orderItems = cartItems.map(item => ({
        menu_id: item.id.toString(),
        quantity: item.quantity,
        comment: item.comment || "",
        half_or_full: item.half_or_full,
        price: item.price
      }));

      const updateOrderData = {
        order_id: order_id,
        user_id: user_id,
        outlet_id: outlet_id,
        tables: [table_number],
        section_id: section_id,
        order_type: "dine-in",
        order_items: orderItems
      };

      const response = await axios.post('https://menusmitra.xyz/common_api/update_order', updateOrderData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`  // Add the access token in the request header
        }
      });
      if (response.data.st === 1) {
        // window.showToast("success", response.data.msg || "Order updated successfully");
        fetchOrderDetailsPrint(orderNumber);
      } else {
        window.showToast("error", response.data.msg || "Failed to update order");
      }
    } catch (error) {
      console.error('Error updating order:', error);
      window.showToast("error", "Failed to update order");
      if (error.response && error.response.status === 401) {
        console.error("Unauthorized, redirecting to login...");
        navigate("/login"); // Redirect if token is missing
      } else {
        window.showToast("error", "Failed to update order");
      }
    }
  };

  const handleUpdateOrderPrint = async () => {
    if (!order_id) {
      window.showToast("error", "Order ID is missing");
      return;
    }
  
    try {
      const accessToken = localStorage.getItem("access");  // Retrieve access token
  
      if (!accessToken) {
        console.error("No access token found");
        navigate("/login"); // Redirect if token is missing
        return;
      }
  
      const orderItems = cartItems.map(item => ({
        menu_id: item.id.toString(),
        quantity: item.quantity,
        comment: item.comment || "",
        half_or_full: item.half_or_full,
        price: item.price
      }));
  
      const updateOrderData = {
        order_id: order_id,
        user_id: user_id,
        outlet_id: outlet_id,
        tables: [table_number],
        section_id: section_id,
        order_type: "dine-in",
        order_items: orderItems
      };
  
      // First API call to update the order
      const response = await axios.post('https://menusmitra.xyz/common_api/update_order', updateOrderData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`  // Add the access token in the request header
        }
      });
  
      if (response.data.st === 1) {
        // If the order is updated successfully, show success message
        window.showToast("success", response.data.msg || "Order updated successfully");
  
        // Now, trigger the second API to update the order status
        const updateOrderStatusData = {
          outlet_id: outlet_id,
          order_id: order_id.toString(),
          order_status: "paid",  // Assuming the status to be "paid"
          user_id: user_id
        };
  
        const statusResponse = await axios.post('https://menusmitra.xyz/common_api/update_order_status', updateOrderStatusData, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
  
        if (statusResponse.data.st === 1) {
          window.showToast("success", "Order status updated successfully");
          fetchOrderDetailsPrintPrint(orderNumber);
        } else {
          window.showToast("error", statusResponse.data.msg || "Failed to update order status");
        }
      } else {
        window.showToast("error", response.data.msg || "Failed to update order");
      }
    } catch (error) {
      console.error('Error updating order:', error);
      window.showToast("error", "Failed to update order");
      if (error.response && error.response.status === 401) {
        console.error("Unauthorized, redirecting to login...");
        navigate("/login"); // Redirect if token is missing
      } else {
        window.showToast("error", "Failed to update order");
      }
    }
  };
  
  const handleSaveOrKot = async () => {
    if (order_id) {

      await handleUpdateOrder();
    } else {

      await handleKOTSubmit();
    }
  };

  const handleSaveOrPrint = async () => {
    if (order_id) {

      await handleUpdateOrderPrint();
    } else {

      await handlePrintSubmit();
    }
  };

  const handleSaveOrKotSave = async () => {
    if (order_id) {

      await handleUpdateOrderSave();
    } else {

      await handleKOTSubmitSave();
    }
  };
  // Add function to fetch order details
  const fetchOrderDetails = async () => {
    try {
      const accessToken = localStorage.getItem("access");  // Retrieve access token
  
      if (!accessToken) {
        console.error("No access token found");
        navigate("/login"); // Redirect if token is missing
        return;
      }
      const response = await axios.post('https://menusmitra.xyz/common_api/get_all_menu_list_by_category', {
        outlet_id: outlet_id,
        order_id: order_id
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,  // Add the access token in the Authorization header
        },
      });

      if (response.data.st === 1) {
        // Transform the order items to match cart structure
        const orderItems = response.data.data.map(item => ({
          id: item.menu_id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          priceType: item.half_or_full,
          total_price: item.total_price
        }));

        setCartItems(orderItems);
        setOrderDetails(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  // Add new function to fetch order menu details
  const fetchOrderMenuDetails = async () => {
    try {
      const accessToken = localStorage.getItem("access");  // Retrieve access token
  
      if (!accessToken) {
        console.error("No access token found");
        navigate("/login"); // Redirect if token is missing
        return;
      }
      const response = await fetch('https://menusmitra.xyz/common_api/order_view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,  // Add the access token in the Authorization header
        },
        body: JSON.stringify({
          order_number: orderNumber
        })
      });

      const data = await response.json();

      if (data.st === 1) {
        const orderData = data.lists.order_details;
        setOrder_details(orderData);
        const menuItems = data.lists.menu_details;

        // Transform menu items to match cart format
        const transformedItems = menuItems.map(item => ({
          id: item.menu_id,
          name: item.menu_name,
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 0,
          offer: Number(item.offer) || 0,
          comment: item.comment,
          half_or_full: item.half_or_full, // Preserve the half_or_full value from API
          menu_sub_total: Number(item.menu_sub_total) || 0,
          cartId: `${item.menu_id}-${Date.now()}-${item.half_or_full}`, // Include half_or_full in cartId
          isNewItem: false // Mark as not new
        }));

        setCartItems(transformedItems);
        setOrderDetails({
          ...orderData,
          total_bill_amount: Number(orderData.total_bill_amount) || 0,
          total_bill_with_discount: Number(orderData.total_bill_with_discount) || 0,
          service_charges_percent: Number(orderData.service_charges_percent) || 0,
          service_charges_amount: Number(orderData.service_charges_amount) || 0,
          gst_percent: Number(orderData.gst_percent) || 0,
          gst_amount: Number(orderData.gst_amount) || 0,
          discount_percent: Number(orderData.discount_percent) || 0,
          discount_amount: Number(orderData.discount_amount) || 0,
          grand_total: Number(orderData.grand_total) || 0
        });
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      if (error.response && error.response.status === 401) {
        console.error("Unauthorized, redirecting to login...");
        navigate("/login"); // Redirect if token is missing
      } else {
        window.showToast("error", "Failed to fetch order details");
      }
    }
  };

  const handlePrint = async () => {
    if (cartItems.length === 0) return;

    setIsProcessingPrint(true);
    try {
      // Your KOT API call here
      await handleSaveOrPrint('print');
    } catch (error) {
      console.error('Print Error:', error);
    } finally {
      setIsProcessingPrint(false);
    }
  };

  // Update the handler functions
  const handleKot = async () => {
    if (cartItems.length === 0) return;

    setIsProcessingKot(true);
    try {
      // Your KOT API call here
      await handleSaveOrKot('kot');
    } catch (error) {
      console.error('KOT Error:', error);
    } finally {
      setIsProcessingKot(false);
    }
  };

  const handleSave = async () => {
    if (cartItems.length === 0) return;

    setIsProcessingSave(true);
    try {
      // Your Save API call here
      await handleSaveOrKotSave('save');
    } catch (error) {
      console.error('Save Error:', error);
    } finally {
      setIsProcessingSave(false);
    }
  };

  const handleSettle = async () => {
    if (cartItems.length === 0) return;

    setIsProcessingSettle(true);
    try {
      // Your Settle API call here
      await handleSettleSubmit();
    } catch (error) {
      console.error('Settle Error:', error);
    } finally {
      setIsProcessingSettle(false);
    }
  };

  // Add handleCloseModal function
  const handleCloseModal = () => {
    setPortionModal({
      isOpen: false,
      menuItem: null
    });
  };

  // Add this function to handle outside clicks
  const handleModalOutsideClick = (e) => {
    // Check if the click is on the backdrop (outside the modal)
    if (e.target.classList.contains('modal-backdrop')) {
      handleCloseModal();
    }
  };
const handleBackClick = () => {
  navigate(-1);
}
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* <div className="container mx-auto px-4 py-2 "> */}
      <div className="container mx-auto px-4 py-3 mb-40">
      <div className="flex items-center w-1/4 mb-4">
                                <button
                                  onClick={handleBackClick}
                                  className="text-gray-500 w-8 h-8 rounded-full mr-3 hover:bg-gray-200"
                                  data-tooltip-id="tooltip-back"
                                  data-tooltip-content="Back"
                                  data-tooltip-place="bottom"
                                >
                                  <FontAwesomeIcon icon={faArrowLeft} />
                                </button>
                    <h1 className="text-2xl font-semibold text-gray-800">Orders Details</h1>
                    </div>
        <div className="grid grid-cols-12 gap-4">
          
          {/* Left Sidebar - Categories */}
          <div className="col-span-2 rounded-lg bg-white shadow-lg overflow-hidden">
            {/* Order Type and Table Info */}

            <div className="p-2 border-b border-gray-200 bg-white ">
              {/* First Row: Section Name and Table Number */}
              {orderType === 'dine-in' && table_number && (
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  {/* Section Name */}
                  <span className="text-sm uppercase font-semibold text-gray-700 tracking-wide">
                    {section_name}

                  </span>

                  {/* Table Number */}
                  <div
                    className={`px-2 py-0.5 rounded-lg text-sm font-medium shadow-sm transition 
                      ${is_occupied ? 'border-2 border-dashed border-red-500 bg-red-100' : 'border-2 border-dashed border-green-500'}`}
                  >
                    <h2>{table_number}</h2>
                  </div>
                </div>
              )}
              {orderType !== 'dine-in' && (
                <div className="text-center border-b border-gray-200 pb-2">
                  <span
                    className={`text-sm uppercase font-semibold text-gray-700 tracking-wide px-3 py-1 rounded-md 
        ${orderType === 'drive-through' ? 'bg-blue-100 text-blue-800' :
                        orderType === 'parcel' ? 'bg-green-100 text-green-800' :
                          orderType === 'counter' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'}`}
                  >
                    {orderType === 'drive-through' ? '🚗 Drive-Through' :
                      orderType === 'parcel' ? '📦 Parcel' :
                        orderType === 'counter' ? '🍔 Counter' : 'Order Type'}
                  </span>

                  {/* Table Number */}
                </div>
              )}

              {/* Second Row: Order Status and Number */}
              {orderNumber && (
                <div className="mt-2  flex items-center justify-between">
                  {/* Order Number */}
                  <div className="flex items-center space-x-2 ">

                    <span className="font-bold text-base text-gray-800">#{orderNumber}</span>
                  </div>

                  {/* Order Status Badge */}
                  {order_details?.order_status && (
                    <div className={`
                      px-3 py-1 rounded-full text-xs font-medium capitalize
                      ${order_details.order_status === 'placed' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                        order_details.order_status === 'cooking' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                          order_details.order_status === 'served' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                            order_details.order_status === 'paid' ? 'bg-green-100 text-green-800 border border-green-200' :
                              'bg-gray-100 text-gray-800 border border-gray-200'}
                    `}>
                      {order_details.order_status === 'placed' ? '🔔' :
                        order_details.order_status === 'cooking' ? '👨‍🍳' :
                          order_details.order_status === 'served' ? '🍽️' :
                            order_details.order_status === 'paid' ? '💰' : '⚪'}
                      {order_details.order_status}
                    </div>
                  )}
                </div>
              )}


            </div>
            {/* Categories List */}
            <div className="p-2 ">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`w-full mb-3 p-3 rounded-xl flex items-center space-x-3  
          ${selectedCategory === category.name
                      ? 'bg-white shadow-md border-l-4 border-black-400'
                      : 'bg-transparent hover:bg-white border-2 hover:shadow-sm '}`
                  }
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center 
          ${selectedCategory === category.name
                      ? 'bg-black-50'
                      : 'bg-gray-100'}`
                  }>
                    <FontAwesomeIcon
                      icon={category.icon}
                      className={`text-lg ${selectedCategory === category.name ? 'text-black-400' : 'text-gray-400'}`}
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <div className={`font-medium ${selectedCategory === category.name ? 'text-black-400' : 'text-gray-600'}`}>
                      {category.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {category.items.length} Menu
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>


          <div className="col-span-6 bg-white p-2  rounded-lg shadow-lg">

            <div className="mb-2">
            <div className="relative mb-3">
  <input
    type="text"
    placeholder="Search menu"
    className="w-full pl-10 pr-10 py-1 rounded border border-gray-200 focus:outline-none text-sm "
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />
  <FontAwesomeIcon
    icon={faSearch}
    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300"
  />
  {searchQuery && (
    <FontAwesomeIcon
      icon={faTimes}
      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
      onClick={() => setSearchQuery("")} // Clear search
    />
  )}
</div>

<hr />

{/* Menu Items Grid */}
<div className="grid grid-cols-4 gap-2 p-1">
  {searchQuery
    ? // If searching, display all matching items across categories
      categories
        .flatMap(cat => cat.items) // Merge all category items
        .filter(item =>
          item.menu_name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .map(item => (
          <div
            key={item.menu_id}
            onClick={() => handleMenuClick(item)}
            className={`group border-b-4 bg-white-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative cursor-pointer
              ${item.menu_food_type === 'veg' ? 'border-green-500' :
                item.menu_food_type === 'nonveg' ? 'border-red-500' :
                item.menu_food_type === 'egg' ? 'border-gray-300' :
                'border-green-300'
              }`}
          >
            <div className="flex items-center justify-center h-full w-full p-2">
              <h3 className="text-md font-bold text-gray-800 group-hover:text-blue-600 transition-colors capitalize text-center">
                {item.menu_name}
              </h3>
            </div>
          </div>
        ))
    : // Otherwise, show category-wise menu
      categories
        .filter(cat => cat.name === selectedCategory)
        .flatMap(cat => cat.items)
        .map(item => (
          <div
            key={item.menu_id}
            onClick={() => handleMenuClick(item)}
            className={`group border-b-4 bg-white-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative cursor-pointer
              ${item.menu_food_type === 'veg' ? 'border-green-500' :
                item.menu_food_type === 'nonveg' ? 'border-red-500' :
                item.menu_food_type === 'egg' ? 'border-gray-300' :
                'border-green-300'
              }`}
          >
            <div className="flex items-center justify-center h-full w-full p-2">
              <h3 className="text-md font-bold text-gray-800 group-hover:text-blue-600 transition-colors capitalize text-center">
                {item.menu_name}
              </h3>
            </div>
          </div>
        ))}
</div>

          </div>
          </div>


          <div className="col-span-4 bg-white border-l rounded-lg shadow-lg flex flex-col">
            {/* Guest Information */}
            {/* <div className="p-2 border-b flex items-center space-x-2">
            
              <input
                type="text"
                placeholder=" Name"
                className="w-1/2 px-3 py-1 rounded border border-gray-200 focus:outline-none text-sm"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
              />
              <input
                type="text"
                placeholder=" Mobile no."
                className="w-1/2 px-3 py-1 rounded border border-gray-200 focus:outline-none text-sm"
                value={guestContact}
                onChange={(e) => setGuestContact(e.target.value)}
              />

              <button
                className="p-1.5 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                onClick={() => {
                  console.log('Saving guest information:', { guestName, guestContact });
                }}
                data-tooltip-id="tooltip-save"
                data-tooltip-content="Save"
              >
                <FontAwesomeIcon icon={faSave} className="text-base" />
              </button>
            </div> */}

            {/* Order Items */}
            <div className="flex-1 overflow-auto overflow-y-auto">
              <div className="p-2">
                <table className="w-full">
                  <thead className='border-b border-gray-200'>
                    <tr className="text-xs text-gray-600">
                      <th className="text-left font-medium pb-2">Items ({cartItems.length})</th>
                      <th className="text-right font-medium pb-2 pr-4 w-20">Type</th>
                      <th className="text-right font-medium pb-2 pr-4 w-20">Price</th>
                      <th className="text-center font-medium pb-2 w-24">Qty</th>
                      <th className="text-right font-medium pb-2 w-20">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map(item => (
                      <tr key={item.cartId}>
                        <td className="py-2">
                          <div className="flex items-center">
                            {(item.isNewItem || !['cooking', 'served', 'paid'].includes(order_details?.order_status)) && (
                              <div
                                className="w-5 h-4 bg-red-500 rounded flex items-center justify-center text-white text-xs mr-2 flex-shrink-0 cursor-pointer hover:bg-red-600"
                                onClick={() => removeItem(item.cartId)}
                                data-tooltip-id="tooltip-remove"
                                data-tooltip-content="Remove item"
                              >
                                <FontAwesomeIcon icon={faMinus} className="text-xs" />
                              </div>
                            )}
                            <span className="text-sm capitalize truncate overflow-hidden">
                              {item.name}
                            </span>
                          </div>
                        </td>

                        <td className="text-right">

                          <div className="text-center capitalize">{item.half_or_full}</div>




                        </td>
                        <td className="text-center">₹{item.price}</td>
                        <td className="text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              className={`w-6 h-6 flex items-center justify-center bg-gray-300 text-white rounded-full transition duration-150 
                                ${item.quantity <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-400'}`}
                              onClick={() => updateQuantity(item.cartId, -1)}
                              disabled={item.quantity <= 1}
                            >
                              <FontAwesomeIcon icon={faMinus} className="text-sm" />
                            </button>
                            <span className="text-base font-medium w-5 text-center">{item.quantity}</span>
                            <button
                              className={`w-6 h-6 flex items-center justify-center bg-gray-300 text-white rounded-full transition duration-150 
                                ${item.quantity >= 20 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-400'}`}
                              onClick={() => updateQuantity(item.cartId, 1)}
                              disabled={item.quantity >= 20}
                            >
                              <FontAwesomeIcon icon={faPlus} className="text-sm" />
                            </button>
                          </div>
                        </td>
                        <td className="text-right text-sm">₹{(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>


            {/* Bottom Section */}
            <div className="border-t border-gray-300">
              <div className="p-2">
                <div className="border-b border-gray-300 pb-2 mb-2">
                  <div className="flex mb-0">

                    <div className="flex-1 px-1">
                      <span className="font-bold text-[12px] text-gray-800">
                        ₹{orderDetails.total_bill_amount?.toFixed(2) || '0.00'}
                      </span>
                      <span className="text-gray-600 text-[10px] block">Total</span>
                    </div>
                    {/* {(orderDetails.discount_amount > 0 || orderDetails.discount_percent > 0) && ( */}
  <div className="flex-1 px-1">
    <span className="font-bold text-[12px] text-red-500">
      -₹{orderDetails.discount_amount?.toFixed(2) || '0.00'}
    </span>
    <span className="text-gray-600 text-[10px] block">
      Discount<span className="text-gray-600 text-[8px]"> ({orderDetails.discount_percent}%)</span>
    </span>
  </div>
{/* )} */}

                    <div className="flex-1 px-1">
                      <span className="font-bold text-[12px] text-gray-800">
                        +₹{orderDetails.service_charges_amount?.toFixed(2) || '0.00'}
                      </span>
                      <span className="text-gray-600 text-[10px] block">
                        Service<span className="text-gray-600 text-[8px] "> ({orderDetails.service_charges_percent}%)</span>
                      </span>
                    </div>




                    <div className="flex-1 px-1">
                      <span className="font-bold text-[12px] text-gray-800">
                        +₹{orderDetails.gst_amount?.toFixed(2) || '0.00'}
                      </span>
                      <span className="text-gray-600 text-[10px] block">
                        GST<span className="text-gray-600 text-[8px] "> ({orderDetails.gst_percent}%)</span>
                      </span>
                    </div>

                    <div className="flex-1 px-2 border-l text-end">
                      <span className="font-bold text-[12px] text-green-500">
                        ₹{orderDetails.grand_total?.toFixed(2) || '0.00'}
                      </span>
                      <span className="text-gray-600 text-[10px] pl-2 block">Grand Total</span>
                    </div>
                  </div>
                </div>







                {/* Section with buttons */}
                <div className="flex gap-2">
                  {/* <button
                    className="p-1.5 bg-red-500 text-white rounded text-xs font-medium w-8 disabled:opacity-50"
                    data-tooltip-id="tooltip-clear"
                    data-tooltip-content="Clear"
                    onClick={clearCart}
                    disabled={cartItems.length === 0 || isProcessingKot || isProcessingSave || isProcessingSettle}
                  >
                    <FontAwesomeIcon icon={faTimes} className="text-xs" />
                  </button> */}
  <button
                    className="p-1.5 bg-green-500 text-white rounded text-xs font-medium w-8 disabled:opacity-50"
                    data-tooltip-id="tooltip-save"
                    data-tooltip-content="Save"
                    onClick={handleSave}
                    disabled={cartItems.length === 0 || isProcessingSave}
                  >
                    {isProcessingSave ? (
                      <FontAwesomeIcon icon={faSpinner} spin className="mr-1" />
                    ) : (
                      <FontAwesomeIcon icon={faSave} className="mr-1" />
                    )}
                    
                  </button>
                  <button
                    className="flex-1 px-2 py-1.5 bg-gray-700 text-white rounded text-xs font-medium w-24 disabled:opacity-50"
                    data-tooltip-id="tooltip-print"
                    data-tooltip-content="Print"
                    onClick={handleKot}
                    disabled={cartItems.length === 0 || isProcessingKot}
                  >
                    {isProcessingKot ? (
                      <FontAwesomeIcon icon={faSpinner} spin className="mr-1" />
                    ) : (
                      <FontAwesomeIcon icon={faPrint} className="mr-1" />
                    )}
                    Print
                  </button>

                
                  <button
  className="flex-1 px-2 py-1.5 bg-purple-500 text-white rounded text-xs font-medium w-24 disabled:opacity-50"
  data-tooltip-id="tooltip-kot"
  data-tooltip-content="KOT"
  disabled={cartItems.length === 0 || isProcessingPrint}
  onClick={handlePrint}
>
  {isProcessingPrint ? (
    <FontAwesomeIcon icon={faSpinner} spin className="mr-1" />
  ) : (
    <FontAwesomeIcon icon={faPaperPlane} className="mr-1" />
  )}
  Kot
</button>



                  <button
                    className="flex-1 px-2 py-1.5 bg-blue-500 text-white rounded text-xs font-medium w-24 disabled:opacity-50"
                    data-tooltip-id="tooltip-settle"
                    data-tooltip-content="Settle"
                    onClick={handleSettle}
                    disabled={cartItems.length === 0 || isProcessingSettle}
                  >
                    {isProcessingSettle ? (
                      <FontAwesomeIcon icon={faSpinner} spin className="mr-1" />
                    ) : (
                      <FontAwesomeIcon icon={faCheck} className="mr-1" />
                    )}
                    Settle
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
      <Tooltip id="tooltip-clear" />
      <Tooltip id="tooltip-save" />
      <Tooltip id="tooltip-print" />
      <Tooltip id="tooltip-kot" />
      <Tooltip id="tooltip-settle" />
      <Tooltip id="tooltip-remove" />
      <Tooltip id="tooltip-back" />
      <Footer />

      {/* Portion Selection Modal */}
      {portionModal.isOpen && portionModal.menuItem && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center modal-backdrop"
          onClick={handleModalOutsideClick}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-80 overflow-hidden"
            onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from closing it
          >
            {/* Modal Header */}
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">
                  {portionModal.menuItem.menu_name}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-3">
              <button
                onClick={() => {
                  handleAddToCart(portionModal.menuItem, 'full');
                  handleCloseModal();
                }}
                className="w-full p-3 text-left rounded-lg hover:bg-gray-50 flex justify-between items-center border"
              >
                <span className="font-medium">Full </span>
                <span className="text-green-600 font-semibold">
                  ₹{portionModal.menuItem.full_price}
                </span>
              </button>

              <button
                onClick={() => {
                  handleAddToCart(portionModal.menuItem, 'half');
                  handleCloseModal();
                }}
                className="w-full p-3 text-left rounded-lg hover:bg-gray-50 flex justify-between items-center border"
              >
                <span className="font-medium">Half </span>
                <span className="text-green-600 font-semibold">
                  ₹{portionModal.menuItem.half_price}
                </span>
              </button>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t bg-gray-50">
              <button
                onClick={handleCloseModal}
                className="w-full py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>

  );
}

export default OrderList;
