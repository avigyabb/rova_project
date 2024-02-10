import React, { useState, useEffect } from 'react';
import SessionCard from "./SessionComponents/SessionCard";
import axios from 'axios';
import '../styles/SessionSearch.css';
import '../styles/Sessions.css';

import SessionSearch from './SessionComponents/SessionSearch';
import SessionFiltersNew from './SessionComponents/SessionFiltersNew';
import CircularProgress from '@mui/material/CircularProgress';
import { TextField } from '@mui/material';

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sqlBox, setSqlBox] = useState(`SELECT *\nFROM (\nSELECT session_id FROM rova_dev.llm\nUNION DISTINCT\nSELECT session_id FROM rova_dev.product\n)\nLIMIT 50\n`);
  
  const [includedCategories, setIncludedCategories] = useState([]);
  const [excludedCategories, setExcludedCategories] = useState([]);  
  const [includedSignals, setIncludedSignals] = useState([]);
  const [excludedSignals, setExcludedSignals] = useState([]);
  const [engagementTime, setEngagementTime] = useState(0);

  useEffect(() => {

    const fetchData = async () =>  {
      setIsLoading(true);
      try {
        const params = {
          sql: sqlBox
        };
        console.log(process.env.REACT_APP_API_URL + 'get-sessions/'); // dont delete for now
        const response = await axios.get(process.env.REACT_APP_API_URL + 'get-sessions/', { params });
        setSessions(response.data.sessions);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSqlChange = (event) => {
    // Update the sqlQuery state with the new value from the textarea
    setSqlBox(event.target.value);
  };
  
  const handleSqlQuery = (event) => {
    // Listen for command + enter key press
    if (event.keyCode === 13 && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      
      setIsLoading(true);
  
      const fetchSqlResponse = async () => {
        try {
          const params = {
            sql: sqlBox
          };
          const response = await axios.get(process.env.REACT_APP_API_URL + 'get-sessions/', { params });
          setSessions(response.data.sessions);
          setIsLoading(false);
        } catch (error) {
          console.error(error);
        }
      };
  
      fetchSqlResponse();
    }
  };

  const engagementTimeOnChange = (event) => {
    setEngagementTime(event.target.value);
  }

  useEffect(() => {
    const applyFilters = async() => {
      try {
        const params = {
          included_categories : JSON.stringify(includedCategories),
          excluded_categories : JSON.stringify(excludedCategories),
          included_signals : JSON.stringify(includedSignals),
          excluded_signals : JSON.stringify(excludedSignals),
          engagement_time : engagementTime,
        }
        const response = await axios.get(process.env.REACT_APP_API_URL + "get-filtered-sessions/", {params});
        console.log(response.data.sessions)
        setSessions(response.data.sessions);
      } catch (error) {
        console.error(error);
      }
    }
    applyFilters();
  }, [includedCategories, excludedCategories, includedSignals, excludedSignals, engagementTime]);

  const optionsArray = [];
  const [optionsArrayData, setOptionsArrayData] = useState([]);

  useEffect(() => {
    const getOptions = async() => {
      try {
        const response = await axios.get(process.env.REACT_APP_API_URL + "get-options/");
        setOptionsArrayData(response.data.options);
      } catch (error) {
        console.error(error);
      }
    };
    getOptions();
  }, []);

  optionsArrayData.forEach((option) =>
    optionsArray.push(option[0])
  )

  return (
    <div className="flex flex-col items-center h-screen">
      <SessionSearch setSessions={setSessions} setIsLoading={setIsLoading} setSqlBox={setSqlBox}/>
        <div className='main-content flex'>
          <div className='sql-col'>
            <div className='sql-header' style={{background: '#00161C'}}> Filters </div>
            <div className='filters mb-6'> 
              <p className='mb-2'> Categories: </p>
              <div className='flex justify-between'>
                <SessionFiltersNew label="Categories Include:" setFilters = {setIncludedCategories} options = {optionsArray}/>
                <SessionFiltersNew label="Categories Exclude:" setFilters = {setExcludedCategories} options = {optionsArray}/>
              </div>
              <p className='mt-3 mb-2'> Signals: </p>
              <div className='flex justify-between'>
                <SessionFiltersNew label="Signals Include:" setFilters = {setIncludedSignals} options = {optionsArray}/>
                <SessionFiltersNew label="Signals Exclude:" setFilters = {setExcludedSignals} options = {optionsArray}/>
              </div>
              <p className='mt-3 mb-3'> Engagement: </p>
              <div>
                <TextField
                  id="outlined-number"
                  label="Days since last session"
                  type="number"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  onChange={engagementTimeOnChange}
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
          </div>
          { (!isLoading && Object.keys(sessions).length > 0) ? (
            <div className='sessions-list'>
              {sessions.map(({ session_id, user_id, earliest_timestamp }) => (
                <SessionCard 
                  key={session_id} 
                  sessionId={session_id} // Pass the session count here
                  userId={user_id}
                  timestamp={earliest_timestamp}
                />
              ))}
            </div>
          ) : (
            <div className="sessions-list flex justify-center items-center">
              <CircularProgress style={{ color: '#FFA189' }}/>
            </div>
          )}
        </div>
    </div>
  );
};

export default Sessions;