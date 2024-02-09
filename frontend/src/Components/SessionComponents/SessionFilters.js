// SessionSearch.js
import React from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import '../../styles/SessionSearch.css';

const SessionFilters = () => {

  return (
    <div className="filters">
    <div className="filter-category">
        <h3>Topics</h3>
        <FormControlLabel control={<Checkbox />} label="Topic 1" />
        <FormControlLabel control={<Checkbox />} label="Topic 2" />
        <FormControlLabel control={<Checkbox />} label="Topic 3" />
    </div>
    <div className="filter-category">
        <h3>KPIs</h3>
        <FormControlLabel control={<Checkbox />} label="KPI 1" />
        <FormControlLabel control={<Checkbox />} label="KPI 2" />
        <FormControlLabel control={<Checkbox />} label="KPI 3" />
    </div>
    <div className="filter-category">
        <h3>Users</h3>
        <FormControlLabel control={<Checkbox />} label="User 1" />
        <FormControlLabel control={<Checkbox />} label="User 2" />
        <FormControlLabel control={<Checkbox />} label="User 3" />
    </div>
    </div>
  );
};

export default SessionFilters;
