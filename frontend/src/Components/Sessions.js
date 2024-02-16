import React, { useState, useEffect } from 'react';
import SessionCard from "./SessionComponents/SessionCard";
import axios from 'axios';
import '../styles/SessionSearch.css';
import '../styles/Sessions.css';

import SessionSearch from './SessionComponents/SessionSearch';
import SessionsAnalytics from './SessionsAnalytics';

import CircularProgress from '@mui/material/CircularProgress';
import { useLocation } from 'react-router-dom';

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sqlBox, setSqlBox] = useState(`SELECT *\nFROM (\nSELECT session_id FROM rova_dev.llm\nUNION DISTINCT\nSELECT session_id FROM rova_dev.product\n)\nLIMIT 50\n`);
  const location = useLocation();
  const { category_name } = location.state || {}; // Get the passed state

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

  return (
    <div className="flex flex-col items-center h-screen">
      <div className='sessions-content flex'>
        <div className='left-col'>
          <SessionSearch setSessions={setSessions} setIsLoading={setIsLoading} setSqlBox={setSqlBox}/>
          {(!isLoading && Object.keys(sessions).length > 0) && (
            <div className='sessions-results'>
              <h1> {Object.keys(sessions).length} results </h1>
              {sessions.map(({ session_id, user_id, earliest_timestamp }, index) => (
                <SessionCard 
                  key={session_id} 
                  sessionId={session_id} // Pass the session count here
                  userId={user_id}
                  timestamp={earliest_timestamp}
                  index={index}
                  sessionList={sessions}
                />
              ))}
            </div>
          )}
          {isLoading && (
            <div className="flex justify-center items-center">
              <CircularProgress style={{ color: '#FFA189' }}/>
            </div>
          )}
          {!isLoading && Object.keys(sessions).length == 0 && (
            <div className="flex justify-center items-center">
              No Sessions Found. 
            </div>
          )}
        </div>
        <div className='right-col'>
          <SessionsAnalytics 
            category_name={category_name}
            setSessions={setSessions}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            sqlBox={sqlBox}
            handleSqlChange={handleSqlChange}
            handleSqlQuery={handleSqlQuery}
          />
        </div>
      </div>
    </div>
  );
};

export default Sessions;