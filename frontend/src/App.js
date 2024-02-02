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
          <Route exact path="/" element={<Flows />} />
          <Route path="/charts" element={<Charts />} />
          <Route path="/trace/:userId" element={<EventsTrace/>}/>
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/paths" element={<Paths/>} />
          <Route path='/hello-world' element={<HelloWorld />} />
        </Routes>
        </ThemeProvider>
      </div>
    </Router>
    </>
  );
}

export default App;