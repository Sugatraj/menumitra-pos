import React, { useState } from 'react';
import Footer from '../../components/Footer';
import Header from '../../components/Header';

const Settings = () => {
  const [emailFrequency, setEmailFrequency] = useState('No Email');

  const handleFrequencyChange = (event) => {
    setEmailFrequency(event.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Settings</h1>
        
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Email</h2>
            <p className="text-sm text-gray-600">user@example.com</p>
          </div>
          
          <div className="flex justify-between items-center">
            <label htmlFor="email-frequency" className="text-gray-700 font-medium">
              Email Frequency
            </label>
            <select
              id="email-frequency"
              value={emailFrequency}
              onChange={handleFrequencyChange}
              className="py-2 px-4 border border-gray-300 rounded-md text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="No Email">No Email</option>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Settings;
