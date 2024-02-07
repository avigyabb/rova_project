import './App.css';
import React from "react"
import {BrowserRouter as Router, Routes, Route} from "react-router-dom"
import Charts from "./Components/Charts"
import Flows from "./Components/Flows"
import EventsTrace from "./Components/EventsTrace"
import Sessions from "./Components/Sessions"
import Paths from './Components/Paths';
import HelloWorld from "./HelloWorld"
import Navbar from './Components/Navbar';
import { createTheme, ThemeProvider, Chip } from '@mui/material';

const customTheme = createTheme({
  typography: {
    fontFamily: 'PoppinsFont, sans-serif',
  },
});

function App() {
  return (
    <>
    <Router>
      <div>
        <ThemeProvider theme={customTheme}>
        <Navbar/>
        <Routes>
          <Route exact path={`${process.env.REACT_APP_AUTH_HEADER}`} element={<Flows />} />
          <Route path={`${process.env.REACT_APP_AUTH_HEADER}/charts`} element={<Charts />} />
          <Route path={`${process.env.REACT_APP_AUTH_HEADER}/trace/:userId`} element={<EventsTrace/>}/>
          <Route path={`${process.env.REACT_APP_AUTH_HEADER}/sessions`} element={<Sessions />} />
          <Route path={`${process.env.REACT_APP_AUTH_HEADER}/paths`} element={<Paths/>} />
        </Routes>
        </ThemeProvider>
      </div>
    </Router>
    </>
  );
}

export default App;