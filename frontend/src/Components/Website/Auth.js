import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
    // Example credentials (Warning: This is not secure!)
    const credentials = {
    username: username,
    password: password
    };

    // Request interceptor to append username and password
    axios.interceptors.request.use(config => {
    // Append username and password to every request's parameters
    const params = new URLSearchParams(config.params || {});
    params.append('username', credentials.username);
    params.append('password', credentials.password);
    config.params = params;

    // For POST requests, you might want to add them to the body instead
    if (config.method === 'post') {
        const bodyFormData = new FormData();
        bodyFormData.append('username', credentials.username);
        bodyFormData.append('password', credentials.password);
        // Append existing form data if any
        if (config.data) {
        Object.keys(config.data).forEach(key => {
            bodyFormData.append(key, config.data[key]);
        });
        }
        config.data = bodyFormData;
    }

    return config;
    }, error => {
    return Promise.reject(error);
    });
    navigate(`${process.env.REACT_APP_AUTH_HEADER}/sessions`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-800" style={{backgroundColor: '#00161C'}}>
      <form onSubmit={handleLogin} className="w-full max-w-sm">
        <div className="mb-4">
          <label className="block text-white text-sm font-bold mb-2" htmlFor="username">
            Username
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="username"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label className="block text-white text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="password"
            type="password"
            placeholder="******************"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-red-500 text-xs italic">{error}</p>}
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit">
            Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default Auth;
