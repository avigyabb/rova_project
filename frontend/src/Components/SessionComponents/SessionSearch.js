// SessionSearch.js
import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';
import FilterListIcon from '@mui/icons-material/FilterList';
import axios from 'axios';

const SessionSearch = ( ) => {

  const [queryResponse, setQueryResponse] = useState("");
    
    // Update handleSearch to store the entered query in state
  const handleSearch = (event) => {
    
    if (event.key === 'Enter') {
      const fetchQueryResponse = async () => {
        try {
          const params = {
            query: event.target.value
          };
          const response = await axios.get('http://localhost:8000/get-processed-query/', { params });
          setQueryResponse(response.data.processed_query);
        } catch (error) {
          console.error(error);
        }
      };
      fetchQueryResponse();
      console.log(event.target.value);
      console.log(queryResponse);
    }
  };

  // Display the entered query below the search bar
  return (
    <div className="search-and-filter mb-4">
        <TextField
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
                <IconButton>
                  <FilterListIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        {queryResponse && <p>Query Response: {queryResponse}</p>}
    </div>
  );
};

export default SessionSearch;
