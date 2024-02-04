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

const SessionSearch = ( ) => {

  const [queryResponse, setQueryResponse] = useState("");
  const [queryLoading, setQueryLoading] = useState(false);
    
  // Update handleSearch to store the entered query in state
  const handleSearch = (event) => {
    if (event.key === 'Enter') {
      setQueryLoading(true);
      setQueryResponse("");
      const fetchQueryResponse = async () => {
        try {
          const params = {
            query: event.target.value
          };
          const response = await axios.get('http://localhost:8000/get-processed-query/', { params });
          setQueryResponse(response.data.processed_query);
          setQueryLoading(false);
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
                <IconButton>
                  <FilterListIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <div className='sql-header'> sql </div>
        {queryResponse ? (
          <textarea
          className="sql-response"
          value={queryResponse}
          placeholder="Write your SQL query here..."
          spellCheck="false"
        />
        ) : queryLoading ? (
          <div className="sql-response flex justify-center items-center">
           <CircularProgress style={{ color: '#FFA189' }}/>
          </div>
        ) : (
          <textarea
            className="sql-response"
            value="SELECT * FROM sessions;"
            placeholder="Write your SQL query here..."
            spellCheck="false"
          />
        )}
    </div>
  );
};

export default SessionSearch;
