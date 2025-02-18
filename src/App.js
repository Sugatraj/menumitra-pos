import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Home from './pages/Home';
import RestaurantSections from './pages/table/RestaurantSections';
import MenuCategory from './pages/menucategory/MenuCategory';
import MenuList from './pages/menu/MenuList';
import CreateMenu from './pages/menu/CreateMenu';
import EditMenu from './pages/menu/EditMenu';
import SectionDetail from './pages/table/SectionDetail';
import StaffList from './pages/staff/StaffList';
import OrderList from './pages/order/OrderList';
import Operations from './pages/Operations';
import InventoryList from './pages/inventory/InventoryList';
import SupplierList from './pages/supplier/SupplierList';
import Profile from './components/Profile';
import OrderDetails from './pages/order/OrderDetails';
import NetworkDetector from './dinosaurGame/NetworkDetector';
import Settings from './pages/settings/Settings';
import { ThemeProvider } from './context/ThemeContext';
import Reports from './pages/reports/Reports';
import OrderReport from './pages/reports/OrderReport';
import InventoryReport from './pages/reports/InventoryReport';
import StaffReport from './pages/reports/StaffReport';
import CaptainList from './pages/captain/CaptainList';
import WaiterList from './pages/waiter/WaiterList';
import { messaging } from './firebase-config';
import { getToken } from 'firebase/messaging';
import { VAPID_KEY } from './config';
import ChefList from './pages/chef/ChefList';
import Support from './components/Support';



function App() {


  // const [fcmToken, setFcmToken] = useState(null);
  // const BEARER_TOKEN = "ya29.a0AXeO80SFq8nJtSIvzwC2kSl5hxOnp8WNrXxLikOi-fYSCf27pzfQ4_GBxT-xzVeoIIsVnQmdTiNpxWa-mAFsO3YaDap0yfuENzM2SRe02crTSfkQV5ga9HTxEuU5zRznzxbX2KAFlrEmSPSQDON8MlvV5mLQYCHofvAJEghpaCgYKAbYSARESFQHGX2MiQo_N-7s-Tq58N9jy6mnCRw0175";
  // useEffect(() => {
  //   const setupFCM = async () => {
  //     try {
  //       const permission = await Notification.requestPermission();
  //       if (permission === "granted") {
  //         const token = await getToken(messaging, {
  //           vapidKey: VAPID_KEY
  //         });
  //         setFcmToken(token);
  //         localStorage.setItem("fcmToken", token);
  //         console.log("FCM Token:", token);
  //       }
  //     } catch (error) {
  //       console.error("Error setting up FCM:", error);
  //     }
  //   };

  //   if ('serviceWorker' in navigator) {
  //     navigator.serviceWorker
  //       .register('/firebase-messaging-sw.js')
  //       .then(function(registration) {
  //         console.log('Service Worker registered successfully');
  //         setupFCM();
  //       })
  //       .catch(function(err) {
  //         console.error('Service Worker registration failed:', err);
  //       });
  //   }

  //   // const unsubscribe = onMessage(messaging, (payload) => {
  //   //   window.showToast('Received foreground message:', payload);
  //   //   new Notification(payload.notification.title, {
  //   //     body: payload.notification.body,
  //   //   });
  //   // });

  //   return () => unsubscribe();
  // }, []);

  // const sendTestNotification = async () => {
  //   const token = localStorage.getItem("fcmToken");
  //   if (!token) {
  //     alert("FCM token not found!");
  //     return;
  //   }

  //   try {
  //     const response = await axios.post(
  //       'https://fcm.googleapis.com/v1/projects/menumitra-83831/messages:send',
  //       {
  //         message: {
  //           token: token,
  //           notification: {
  //             title: "Test Notification",
  //             body: "This is a test notification from MenuMitra"
  //           }
  //         }
  //       },
  //       {
  //         headers: {
  //           'Authorization': `Bearer ${BEARER_TOKEN}`,
  //           'Content-Type': 'application/json',
  //         }
  //       }
  //     );

  //     window.showToast('Notification sent successfully:', response.data);
  //   } catch (error) {
  //     console.error('Error sending notification:', error?.response?.data || error.message);
  //     window.showToast('Error sending notification: ' + (error?.response?.data?.error?.message || error.message));
  //   }
  // };


  return (
    <ThemeProvider>
      <Router>
        {/* <NetworkDetector> */}
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/support" element={<Support />} />
            <Route path="/home" element={<Home />} />
            <Route path="/operation" element={<Operations />} />
            <Route path="/restaurant_sections" element={<RestaurantSections />} />
            <Route path="/sections" element={<SectionDetail />} />
            <Route path="/menu_categories" element={<MenuCategory />} />
            <Route path="/menu" element={<MenuList />} />
            <Route path="/menu/create" element={<CreateMenu />} />
            <Route path="/menu/edit/:id" element={<EditMenu />} />
            <Route path="/staff" element={<StaffList />} />
            <Route path="/order_create_list" element={<OrderList />} />
            <Route path="/order_list" element={<OrderDetails />} />
            <Route path="/inventory" element={<InventoryList />} />
            <Route path="/supplier" element={<SupplierList />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/setting" element={<Settings />} />
            <Route path="/captain" element={<CaptainList />} />
            <Route path="/waiter" element={<WaiterList />} />
            <Route path="/chef" element={<ChefList />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/order_report" element={<OrderReport />} />

            <Route path="/inventory_report" element={<InventoryReport />} />
            <Route path="/staff_report" element={<StaffReport />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        {/* </NetworkDetector> */}
      </Router>
    </ThemeProvider>
  );
}

export default App;
