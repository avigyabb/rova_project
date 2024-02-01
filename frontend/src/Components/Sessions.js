import React, { useState, useEffect } from 'react';
import UserCard from "./UserCard";
import Navbar from './Navbar';
import axios from 'axios';
import { createTheme, ThemeProvider, Chip } from '@mui/material';

const Sessions = () => {
  // Placeholder data - replace with your actual data fetching logic
  const [rsesh, setSesh] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {

    const fetchData = async () =>  {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:8000/get-sessions/');
        setSesh(response.data.sessions);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);
  
  // Effect to log `sesh` on updates CAN DELETE WHEN DONE
  useEffect(() => {
    if (rsesh !== undefined) {
      console.log(rsesh);
    }
  }, [rsesh]);

   // Conditional rendering based on isLoading
  if (isLoading) {
    return <div>Loading...</div>;
  }

  const customTheme = createTheme({
    typography: {
      fontFamily: 'PoppinsFont, sans-serif',
    },
  });

  return (
    <ThemeProvider theme={customTheme}>
    <Navbar/>
    <div className="container mx-auto p-4">
      {Object.entries(rsesh).map(([userId, userSessions]) => (
        <UserCard 
          key={userId} 
          user={{
            name: userId, // assuming userId is the name you want to display
            email: `${userId}@example.com`, // replace with real email
            updatedAt: 'Mar 31, 2020', // replace with real updated date
            country: 'Country', // replace with real country
            region: 'Region', // replace with real region
            // Add other user details here
          }}
          sessionCount={userSessions.length} // Pass the session count here
        />
      ))}
    </div>
    </ThemeProvider>
  );
};

export default Sessions;