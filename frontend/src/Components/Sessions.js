import React, { useState, useEffect } from 'react';
import UserCard from "./UserCard";
import axios from 'axios';
import { createTheme } from '@mui/material';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';
import FilterListIcon from '@mui/icons-material/FilterList';
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

    // Add the search handler here (optional)
    const handleSearch = (event) => {
      // Implement search functionality
      console.log(event.target.value);
    };

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
    <div className="container mx-auto p-4">
      <div className="search-and-filter mb-4">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search sessions..."
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton>
                  <FilterListIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </div>
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
  );
};

export default Sessions;