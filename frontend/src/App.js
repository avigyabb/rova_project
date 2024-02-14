import React,{ useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { createTheme, ThemeProvider } from '@mui/material';
import Navbar from './Components/Navbar';
import Charts from "./Components/Charts";
import Flows from "./Components/Flows";
import EventsTrace from "./Components/EventsTrace";
import Sessions from "./Components/Sessions";
import Paths from './Components/Paths';
import Hero from './Components/Website/Hero';
import Login from './Components/Website/Login';
<<<<<<< Updated upstream
import axios from "axios";
=======
import axios from  'axios';
>>>>>>> Stashed changes

const customTheme = createTheme({
  typography: {
    fontFamily: 'PoppinsFont, sans-serif',
  },
});

const credentials = {
<<<<<<< Updated upstream
  username: 'skadaba',
  password: 'harvesttothemoon'
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
=======
  username: localStorage.getItem('username'),
  password: localStorage.getItem('password'),
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

>>>>>>> Stashed changes

const AppContent = () => {
  
  const location = useLocation();
  const shouldShowNavbar = location.pathname.startsWith(process.env.REACT_APP_AUTH_HEADER);
  
  return (
    <ThemeProvider theme={customTheme}>
      <div style={{ height: '100vh' }}>
        {shouldShowNavbar && <Navbar />}
        <Routes>
          <Route exact path={`${process.env.REACT_APP_AUTH_HEADER}`} element={<Flows />} />
          <Route path={`${process.env.REACT_APP_AUTH_HEADER}/charts`} element={<Charts />} />
          <Route path={`${process.env.REACT_APP_AUTH_HEADER}/trace/:userId`} element={<EventsTrace/>}/>
          <Route path={`${process.env.REACT_APP_AUTH_HEADER}/sessions`} element={<Sessions />} />
          <Route path={`${process.env.REACT_APP_AUTH_HEADER}/paths`} element={<Paths/>} />
          <Route path={`/login`} element={<Login />} />
          <Route path={`/`} element={<Hero />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
