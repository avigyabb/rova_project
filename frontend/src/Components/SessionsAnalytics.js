import SessionFiltersNew from './SessionComponents/SessionFiltersNew';
import { CircularProgress } from '@mui/material';
import { TextField } from '@mui/material';
import React, { useState, useEffect } from 'react';
import axios from 'axios';


const SessionsAnalytics = ({ category_name, setSessions, isLoading, setIsLoading, sqlBox, handleSqlChange, handleSqlQuery }) => {
  const [engagementTime, setEngagementTime] = useState(0);
  const [signalOptionsArrayData, setSignalOptionsArrayData] = useState([]);
  const [categoryOptionsArrayData, setCategoryOptionsArrayData] = useState([]);
  const [includedCategories, setIncludedCategories] = useState(category_name ? [category_name] : []);
  const [excludedCategories, setExcludedCategories] = useState([]);
  const [includedSignals, setIncludedSignals] = useState([]);
  const [excludedSignals, setExcludedSignals] = useState([]);

  useEffect(() => {
    const applyFilters = async() => {
      setIsLoading(true);
      try {
        const params = {
          included_categories : JSON.stringify(includedCategories),
          excluded_categories : JSON.stringify(excludedCategories),
          included_signals : JSON.stringify(includedSignals),
          excluded_signals : JSON.stringify(excludedSignals),
          engagement_time : engagementTime,
        }
        console.log(process.env.REACT_APP_API_URL);
        const response = await axios.get(process.env.REACT_APP_API_URL + "get-filtered-sessions/", {params});
        console.log(response.data.sessions)
        setSessions(response.data.sessions);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    applyFilters();
  }, [includedCategories, excludedCategories, includedSignals, excludedSignals, engagementTime]);

  useEffect(() => {
    const getCategoryOptions = async() => {
      try {
        const response = await axios.get(process.env.REACT_APP_API_URL + "categories/get-user-categories/")
        console.log(response)
      if (response.data) {
        console.log(response.data);
        setCategoryOptionsArrayData(response.data.map((category) => [category.fields.name][0]))
      }
      } catch (error) {
        console.error(error);
      }
    };
    getCategoryOptions();
  }, []);

  useEffect(() => {
    const getSignalOptions = async() => {
      try {
        const response = await axios.get(process.env.REACT_APP_API_URL + "get-options/");
        if (response.data.options) {
          setSignalOptionsArrayData(response.data.options);
        }
      } catch (error) {
        console.error(error);
      }
    };
    getSignalOptions();
  }, []);


  const engagementTimeOnKeyPress = (event) => {
    if (event.key === 'Enter') {
      setEngagementTime(event.target.value);
    }
  }

  const engagementTimeOnBlur = (event) => {
    setEngagementTime(event.target.value);
  }  

  return (
    <>
    <div className='sql-header' style={{background: '#00161C'}}> Filters </div>
      <div className='filters mb-6'> 
        <p className='mb-2'> Topics: </p>
        <div className='flex justify-between'>
          <SessionFiltersNew label="Topics Include:" setFilters = {setIncludedCategories} options = {categoryOptionsArrayData} isLoading = {isLoading} filters = {includedCategories}/>
          <SessionFiltersNew label="Topics Exclude:" setFilters = {setExcludedCategories} options = {categoryOptionsArrayData} isLoading = {isLoading} filters = {excludedCategories}/>
        </div>
        <p className='mt-3 mb-2'> Events: </p>
        <div className='flex justify-between'>
          <SessionFiltersNew label="Events Include:" setFilters = {setIncludedSignals} options = {signalOptionsArrayData} isLoading = {isLoading} filters = {includedSignals}/>
          <SessionFiltersNew label="Events Exclude:" setFilters = {setExcludedSignals} options = {signalOptionsArrayData} isLoading = {isLoading} filters = {excludedSignals}/>
        </div>
        <p className='mt-3 mb-4'> Engagement: </p>
        <div>
          <TextField
            id="outlined-number"
            label="Days since last session"
            type="number"
            InputLabelProps={{
              shrink: true,
            }}
            disabled={isLoading}
            onKeyPress={engagementTimeOnKeyPress}
            onBlur={engagementTimeOnBlur}
          />
        </div>
      </div>
      <div className='sql-header'> sql (cmd + enter to run) </div>
      {sqlBox ? (
        <textarea
          className="sql-response"
          value={sqlBox}
          placeholder="Write your SQL query here..."
          spellCheck="false"
          onChange={handleSqlChange}
          onKeyDown={handleSqlQuery}
        />
      ) : (
        <div className="sql-response flex justify-center items-center">
          <CircularProgress style={{ color: '#FFA189' }}/>
        </div>
      )}
    </>
  )
}

export default SessionsAnalytics