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

const SessionSearch = ({ setSessionIds, setIsLoading }) => {

  const [queryResponse, setQueryResponse] = useState(`
    SELECT *
    FROM (
        SELECT session_id FROM buster_dev.llm
        UNION DISTINCT
        SELECT session_id FROM buster_dev.product
    )
    LIMIT 50
  `);
    
  // Update handleSearch to store the entered query in state
  const handleSearch = (event) => {
    if (event.key === 'Enter') {
      setQueryResponse("");
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
    }
  };

  const handleSqlChange = (event) => {
    // Update the sqlQuery state with the new value from the textarea
    setQueryResponse(event.target.value);
  };
  
  const handleSqlQuery = (event) => {
    if (event.key === 'Enter') {
      setIsLoading(true);
      const fetchSqlResponse = async () => {
        try {
          const params = {
            sql: queryResponse
          };
          const response = await axios.get('http://localhost:8000/get-sessions/', { params });
          console.log(response);
          setSessionIds(response.data.sessions);
          setIsLoading(false);
        } catch (error) {
          console.error(error);
        }
      };
      fetchSqlResponse();
    }
  }

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

        <div className='sql-header'> sql (cmd + enter to run) </div>
        {queryResponse ? (
          <textarea
            className="sql-response"
            value={queryResponse}
            placeholder="Write your SQL query here..."
            spellCheck="false"
            onChange={handleSqlChange}
            onKeyPress={handleSqlQuery}
          />
        ) : (
          <div className="sql-response flex justify-center items-center">
            <CircularProgress style={{ color: '#FFA189' }}/>
          </div>
        )}
    </div>
  );
};

export default SessionSearch;
