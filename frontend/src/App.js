import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { createTheme, ThemeProvider } from '@mui/material';
import Navbar from './Components/Navbar';
import Charts from "./Components/Charts";
import Flows from "./Components/Flows";
import EventsTrace from "./Components/EventsTrace";
import Sessions from "./Components/Sessions";
import Paths from './Components/Paths';
import Hero from './Components/Website/Hero';

const customTheme = createTheme({
  typography: {
    fontFamily: 'PoppinsFont, sans-serif',
  },
});

const AppContent = () => {
  const location = useLocation();
  const shouldShowNavbar = location.pathname.startsWith(process.env.REACT_APP_AUTH_HEADER);

  return (
    <ThemeProvider theme={customTheme}>
      <div>
        {shouldShowNavbar && <Navbar />}
        <Routes>
          <Route exact path={`${process.env.REACT_APP_AUTH_HEADER}`} element={<Flows />} />
          <Route path={`${process.env.REACT_APP_AUTH_HEADER}/charts`} element={<Charts />} />
          <Route path={`${process.env.REACT_APP_AUTH_HEADER}/trace/:userId`} element={<EventsTrace/>}/>
          <Route path={`${process.env.REACT_APP_AUTH_HEADER}/sessions`} element={<Sessions />} />
          <Route path={`${process.env.REACT_APP_AUTH_HEADER}/paths`} element={<Paths/>} />
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
