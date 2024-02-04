// SessionSearch.js
import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';
import FilterListIcon from '@mui/icons-material/FilterList';

const SessionSearch = ( ) => {
    
    const handleSearch = (event) => {
        // Implement search functionality
        console.log(event.target.value);
    };

  return (
    <div className="search-and-filter mb-4">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Show me sessions where ..."
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
  );
};

export default SessionSearch;
