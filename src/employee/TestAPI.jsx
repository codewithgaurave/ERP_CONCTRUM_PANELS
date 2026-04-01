import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const TestAPI = () => {
  const [results, setResults] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    testAPIs();
  }, []);

  const testAPIs = async () => {
    const token = localStorage.getItem('hrms-token');
    const baseURL = import.meta.env.VITE_BASE_API;
    
    console.log('Testing APIs with token:', token);
    console.log('Base URL:', baseURL);
    console.log('User:', user);

    const tests = {
      assets: `${baseURL}/api/assets/employee/${user?._id}`,
      assetRequests: `${baseURL}/api/asset-requests/my-requests`,
      payroll: `${baseURL}/api/payroll`,
      notices: `${baseURL}/api/notices`
    };

    const testResults = {};

    for (const [name, url] of Object.entries(tests)) {
      try {
        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        testResults[name] = { status: response.status, data };
      } catch (error) {
        testResults[name] = { error: error.message };
      }
    }

    setResults(testResults);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">API Test Results</h1>
      <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
        {JSON.stringify(results, null, 2)}
      </pre>
    </div>
  );
};

export default TestAPI;