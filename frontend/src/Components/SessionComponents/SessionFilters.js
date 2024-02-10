// SessionFilters.js
import React from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import '../../styles/SessionSearch.css';

const SessionFilters = ({ selectedFilters, setSelectedFilters }) => {
  
  const handleFilterChange = (filterCategory, filterValue) => {
    const updatedFilters = {
      ...selectedFilters,
      [filterCategory]: {
        ...selectedFilters[filterCategory],
        [filterValue]: !selectedFilters[filterCategory][filterValue]
      }
    };
    setSelectedFilters(updatedFilters);
  };

  return (
    <div className="filters">
      {Object.keys(selectedFilters).map(category => (
        <div className="filter-category" key={category}>
          <h3>{category}</h3>
          {Object.keys(selectedFilters[category]).map(filterValue => (
            <FormControlLabel
              key={filterValue}
              control={<Checkbox checked={selectedFilters[category][filterValue]} onChange={() => handleFilterChange(category, filterValue)} />}
              label={filterValue}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default SessionFilters;
