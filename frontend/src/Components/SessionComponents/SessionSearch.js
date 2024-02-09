// SessionSearch.js
import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';
import FilterListIcon from '@mui/icons-material/FilterList';
import axios from 'axios';
import { CircularProgress } from '@mui/material';
import '../../styles/SessionSearch.css';
import SessionFilters from './SessionFilters';

const SessionSearch = ({ setSessions, setIsLoading, setSqlBox }) => {

  const [showFilters, setShowFilters] = useState(false); // State variable for showing/hiding filters

  // Function to toggle the display of filters
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
    
  // Update handleSearch to store the entered query in state
  const handleSearch = (event) => {
    if (event.key === 'Enter') {
      setSqlBox("");
      const fetchQueryResponse = async () => {
        try {
          const params = {
            query: event.target.value
          };
          const response = await axios.get(process.env.REACT_APP_API_URL + 'get-processed-query/', { params });
          setSqlBox(response.data.processed_query);
        } catch (error) {
          console.error(error);
        }
      };
      fetchQueryResponse();
    }
  };
  
  // Display the entered query below the search bar
  return (
    <div className="search mb-4">
        <TextField
          style={{ borderRadius: '0px', zIndex: 100 }}
          fullWidth
          variant="outlined"
          placeholder="Show me sessions where ..."
          onKeyPress={handleSearch} // Listen for Enter key press
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={toggleFilters}>
                  <FilterListIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        {showFilters && <SessionFilters />}
    </div>
  );
};

export default SessionSearch;
